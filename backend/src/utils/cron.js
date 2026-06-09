/**
 * cron.js — Automated event status transitions
 *
 * Runs every 5 minutes:
 *  • PUBLISHED  → OPEN     when regDeadline passes
 *  • OPEN       → ONGOING  when eventDate arrives
 *  • ONGOING    → COMPLETED when eventDate + 24h passes (safety net)
 *
 * Add to index.js:  require('./utils/cron');
 * Add to package:   npm install node-cron
 */

const cron = require('node-cron');
const prisma = require('./prisma');

const log = (msg) => console.log(`[CRON ${new Date().toISOString()}] ${msg}`);

async function transitionEventStatuses() {
  const now = new Date();

  try {
    // 1. PUBLISHED → OPEN: registration deadline has passed
    const toOpen = await prisma.event.updateMany({
      where: {
        status: 'PUBLISHED',
        regDeadline: { lte: now },
      },
      data: { status: 'OPEN' },
    });
    if (toOpen.count > 0) log(`${toOpen.count} event(s) → OPEN`);

    // 2. OPEN / PUBLISHED → ONGOING: event date has arrived
    const toOngoing = await prisma.event.updateMany({
      where: {
        status: { in: ['OPEN', 'PUBLISHED'] },
        eventDate: { lte: now },
      },
      data: { status: 'ONGOING' },
    });
    if (toOngoing.count > 0) log(`${toOngoing.count} event(s) → ONGOING`);

    // 3. ONGOING → COMPLETED: 24 h after event date (safety net if admin forgot)
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const toCompleted = await prisma.event.updateMany({
      where: {
        status: 'ONGOING',
        eventDate: { lte: cutoff },
      },
      data: { status: 'COMPLETED' },
    });
    if (toCompleted.count > 0) log(`${toCompleted.count} event(s) → COMPLETED`);

  } catch (err) {
    console.error('[CRON ERROR]', err.message);
  }
}

// Send 24-hour event reminder notifications
async function sendEventReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  try {
    // Find events happening within the next 24-25 hours
    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: { in: ['OPEN', 'ONGOING'] },
        eventDate: { gte: in24h, lte: in25h },
      },
      include: {
        registrations: { select: { studentId: true } },
      },
    });

    for (const event of upcomingEvents) {
      const studentIds = event.registrations.map((r) => r.studentId);
      if (studentIds.length === 0) continue;

      await prisma.notification.createMany({
        data: studentIds.map((studentId) => ({
          type: 'EVENT_REMINDER',
          title: 'Event tomorrow!',
          message: `"${event.title}" starts in less than 24 hours. Get ready!`,
          data: { eventId: event.id },
          userId: studentId,
        })),
        skipDuplicates: true,
      });

      log(`Sent reminders for "${event.title}" to ${studentIds.length} students`);
    }
  } catch (err) {
    console.error('[CRON REMINDER ERROR]', err.message);
  }
}

// Run on startup immediately
transitionEventStatuses();

// Then every 5 minutes
cron.schedule('*/5 * * * *', transitionEventStatuses);

// Reminder check every hour
cron.schedule('0 * * * *', sendEventReminders);

log('Cron scheduler started (status transitions every 5 min, reminders every hour)');

module.exports = { transitionEventStatuses, sendEventReminders };

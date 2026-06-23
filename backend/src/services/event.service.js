const prisma = require('../utils/prisma');

class EventService {

  async create(data, userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) {
      const err = new Error('You must create a school before posting events.');
      err.statusCode = 404; throw err;
    }
    return prisma.event.create({
      data: {
        ...data,
        schoolId: school.id,
        eventDate: new Date(data.eventDate),
        regDeadline: data.regDeadline ? new Date(data.regDeadline) : null,
        subjectTags: data.subjectTags || [],
      },
      include: { school: { select: { id: true, name: true, location: true } } },
    });
  }

  async getAll(filters = {}, user = null) {
    const where = {};
    if (filters.category) where.category = filters.category;

    // Visibility Logic:
    // 1. If a specific status is requested, use it, but ADMIN/SCHOOL owner check still applies for DRAFT
    // 2. If NO status is requested, default to NOT showing DRAFT for public views.

    if (filters.status) {
      if (filters.status === 'DRAFT') {
        // Only school admins or global admins can search for DRAFT
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SCHOOL')) {
          where.status = { not: 'DRAFT' }; // Fallback to non-draft
        } else {
          where.status = 'DRAFT';
          // If SCHOOL, only show their own drafts
          if (user.role === 'SCHOOL') where.school = { adminId: user.id };
        }
      } else {
        where.status = filters.status;
      }
    } else {
      // DEFAULT: Hide DRAFT events from everyone except the owning school or ADMIN
      if (!user || user.role !== 'ADMIN') {
        const publicStates = ['PUBLISHED', 'OPEN', 'ONGOING', 'COMPLETED'];
        if (user?.role === 'SCHOOL') {
          // School sees public states OR their own drafts
          where.OR = [
            { status: { in: publicStates } },
            { AND: [{ status: 'DRAFT' }, { school: { adminId: user.id } }] }
          ];
        } else {
          where.status = { in: publicStates };
        }
      }
    }

    if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

    return prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        school: { select: { id: true, name: true, location: true, adminId: true } },
        _count: { select: { registrations: true } },
      },
    });
  }

  async getById(id) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            location: true,
            adminId: true,
            admin: { select: { id: true, name: true, email: true } }
          }
        },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    return event;
  }

  async update(id, data, userId) {
    const event = await prisma.event.findUnique({ where: { id }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.school.adminId !== userId) {
      const err = new Error('You can only update your own events.'); err.statusCode = 403; throw err;
    }
    return prisma.event.update({
      where: { id },
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        regDeadline: data.regDeadline ? new Date(data.regDeadline) : undefined,
      },
    });
  }

  async register(eventId, studentId, teamName, teamMembers = []) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    // Allow OPEN status, or PUBLISHED when there's no regDeadline (event opened directly for registration)
    const canRegister = event.status === 'OPEN' || (event.status === 'PUBLISHED' && !event.regDeadline);
    if (!canRegister) {
      const err = new Error('This event is not open for registration.'); err.statusCode = 400; throw err;
    }
    if (event.regDeadline && new Date() > new Date(event.regDeadline)) {
      const err = new Error('Registration deadline has passed.'); err.statusCode = 400; throw err;
    }
    if (event.teamSize > 1 && teamMembers.length > (event.teamSize - 1)) {
      const err = new Error(`Maximum team size is ${event.teamSize}.`); err.statusCode = 400; throw err;
    }
    const existing = await prisma.registration.findUnique({
      where: { eventId_studentId: { eventId, studentId } },
    });
    if (existing) { const err = new Error('You are already registered for this event.'); err.statusCode = 409; throw err; }
    return prisma.registration.create({
      data: { eventId, studentId, teamName: teamName || null, teamMembers },
    });
  }

  async getRegistrations(eventId, userId) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.school.adminId !== userId) {
      const err = new Error('Access denied.'); err.statusCode = 403; throw err;
    }
    return prisma.registration.findMany({
      where: { eventId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { registeredAt: 'asc' },
    });
  }

  async getMyRegistrations(studentId) {
    return prisma.registration.findMany({
      where: { studentId },
      include: { event: { include: { school: { select: { name: true } } } } },
      orderBy: { registeredAt: 'desc' },
    });
  }

  // Organizer submits scores for each participant — [{registrationId, score}]
  async submitResults(eventId, userId, results) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.school.adminId !== userId) {
      const err = new Error('Access denied.'); err.statusCode = 403; throw err;
    }
    // Sort results by score descending, assign ranks
    const sorted = [...results].sort((a, b) => b.score - a.score);

    // Fetch registrations to map registrationId -> studentId
    const registrationDetails = await prisma.registration.findMany({
      where: { id: { in: results.map(r => r.registrationId) } },
      select: { id: true, studentId: true }
    });

    const regToStudentMap = {};
    registrationDetails.forEach(rd => {
      regToStudentMap[rd.id] = rd.studentId;
    });

    const updates = sorted.map((r, idx) =>
      prisma.registration.update({
        where: { id: r.registrationId },
        data: { score: r.score, rank: idx + 1, status: 'COMPLETED' },
      })
    );
    await prisma.$transaction(updates);

    // Sync to Leaderboard table for the global leaderboard view
    for (let i = 0; i < sorted.length; i++) {
      const r = sorted[i];
      const studentId = regToStudentMap[r.registrationId];
      if (!studentId) continue;

      const existingLeaderboard = await prisma.leaderboard.findFirst({
        where: { eventId, studentId }
      });

      if (existingLeaderboard) {
        await prisma.leaderboard.update({
          where: { id: existingLeaderboard.id },
          data: {
            score: r.score,
            rank: i + 1,
            category: event.category
          }
        });
      } else {
        await prisma.leaderboard.create({
          data: {
            score: r.score,
            rank: i + 1,
            category: event.category,
            studentId,
            schoolId: event.schoolId,
            eventId
          }
        });
      }
    }

    // Mark event as COMPLETED
    await prisma.event.update({ where: { id: eventId }, data: { status: 'COMPLETED' } });
    return this.getLeaderboard(eventId);
  }

  // Get ranked leaderboard for an event
  async getLeaderboard(eventId) {
    return prisma.registration.findMany({
      where: { eventId, rank: { not: null } },
      orderBy: { rank: 'asc' },
      include: { student: { select: { id: true, name: true, email: true } } },
    });
  }

  // Organizer publishes answer key — [{question, answer, explanation}]
  async updateAnswerKey(eventId, userId, answerKey) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.school.adminId !== userId) {
      const err = new Error('Access denied.'); err.statusCode = 403; throw err;
    }
    return prisma.event.update({ where: { id: eventId }, data: { answerKey } });
  }

  async delete(id, userId) {
    const event = await prisma.event.findUnique({ where: { id }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (event.school.adminId !== userId && user?.role !== 'ADMIN') {
      const err = new Error('You can only delete your own events.'); err.statusCode = 403; throw err;
    }

    // Delete registrations and leaderboard entries associated with this event first
    await prisma.registration.deleteMany({ where: { eventId: id } });
    await prisma.leaderboard.deleteMany({ where: { eventId: id } });

    return prisma.event.delete({ where: { id } });
  }
}

module.exports = new EventService();
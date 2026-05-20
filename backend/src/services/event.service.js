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

  async getAll(filters = {}) {
    const where = {};
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };
    return prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        school: { select: { id: true, name: true, location: true } },
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
    if (event.status !== 'OPEN') {
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
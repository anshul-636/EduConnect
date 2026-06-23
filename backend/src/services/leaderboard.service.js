const prisma = require('../utils/prisma');

class LeaderboardService {

  async setScore(data, userId, userRole) {
    const event = await prisma.event.findUnique({ where: { id: data.eventId }, include: { school: true } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.school.adminId !== userId && userRole !== 'ADMIN') {
      const err = new Error('Access denied.'); err.statusCode = 403; throw err;
    }
    const school = event.school;

    const existing = await prisma.leaderboard.findFirst({
      where: { eventId: data.eventId, studentId: data.studentId },
    });

    if (existing) {
      return prisma.leaderboard.update({
        where: { id: existing.id },
        data: { score: parseFloat(data.score), rank: parseInt(data.rank), category: data.category },
        include: { student: { select: { id: true, name: true, email: true } }, school: { select: { id: true, name: true } } },
      });
    }

    return prisma.leaderboard.create({
      data: {
        score: parseFloat(data.score),
        rank: parseInt(data.rank),
        category: data.category || null,
        studentId: data.studentId,
        schoolId: school.id,
        eventId: data.eventId,
      },
      include: { student: { select: { id: true, name: true, email: true } }, school: { select: { id: true, name: true } } },
    });
  }

  async getAll(filters = {}) {
    const where = {};
    if (filters.category) where.category = filters.category;
    if (filters.schoolId) where.schoolId = filters.schoolId;
    return prisma.leaderboard.findMany({
      where,
      orderBy: [{ score: 'desc' }, { rank: 'asc' }],
      take: parseInt(filters.limit) || 50,
      include: {
        student: { select: { id: true, name: true, email: true } },
        school: { select: { id: true, name: true } },
        event: { select: { id: true, title: true, category: true } },
      },
    });
  }

  async getByEvent(eventId) {
    return prisma.leaderboard.findMany({
      where: { eventId },
      orderBy: { score: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        school: { select: { id: true, name: true } },
      },
    });
  }

  async getMyRank(studentId) {
    return prisma.leaderboard.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
      include: { event: { select: { id: true, title: true, category: true } } },
    });
  }
}

module.exports = new LeaderboardService();
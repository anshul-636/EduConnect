/**
 * dashboard.service.js
 *
 * Powers the GET /api/v1/dashboard/summary endpoint.
 * Returns role-specific counts and recent activity so dashboards
 * can show real numbers instead of hardcoded placeholders.
 */

const prisma = require('../utils/prisma');

class DashboardService {

  async getStudentSummary(userId) {
    const [
      registeredEvents,
      completedEvents,
      uploadedResources,
      certificates,
      leaderboardEntry,
      recentActivity,
      unreadNotifications,
    ] = await Promise.all([
      prisma.registration.count({ where: { studentId: userId } }),
      prisma.registration.count({
        where: {
          studentId: userId,
          event: { status: 'COMPLETED' },
        },
      }),
      prisma.resource.count({ where: { uploadedBy: userId } }),
      prisma.certificate.count({ where: { studentId: userId } }),

      // Best rank across all events
      prisma.leaderboard.findFirst({
        where: { studentId: userId },
        orderBy: { rank: 'asc' },
        select: { rank: true, event: { select: { title: true } } },
      }),

      // Recent events the student is registered for
      prisma.registration.findMany({
        where: { studentId: userId },
        orderBy: { registeredAt: 'desc' },
        take: 5,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
              status: true,
              category: true,
            },
          },
        },
      }),

      // Unread notification count
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    // Score trend — last 10 completed events with scores
    const scoreTrend = await prisma.registration.findMany({
      where: {
        studentId: userId,
        score: { not: null },
        event: { status: 'COMPLETED' },
      },
      orderBy: { registeredAt: 'asc' },
      take: 10,
      select: {
        score: true,
        event: { select: { title: true, eventDate: true, category: true } },
      },
    });

    return {
      role: 'STUDENT',
      stats: {
        registeredEvents,
        completedEvents,
        uploadedResources,
        certificates,
        bestRank: leaderboardEntry?.rank || null,
        bestRankEvent: leaderboardEntry?.event?.title || null,
        unreadNotifications,
      },
      recentActivity: recentActivity.map((r) => r.event),
      scoreTrend,
    };
  }

  async getTeacherSummary(userId) {
    const [uploadedResources, totalViews, totalUpvotes, unreadNotifications] =
      await Promise.all([
        prisma.resource.count({ where: { uploadedBy: userId } }),
        prisma.resource.aggregate({
          where: { uploadedBy: userId },
          _sum: { viewCount: true },
        }),
        prisma.resource.aggregate({
          where: { uploadedBy: userId },
          _sum: { upvotes: true },
        }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

    const topResources = await prisma.resource.findMany({
      where: { uploadedBy: userId },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { id: true, title: true, viewCount: true, upvotes: true, type: true },
    });

    return {
      role: 'TEACHER',
      stats: {
        uploadedResources,
        totalViews: totalViews._sum.viewCount || 0,
        totalUpvotes: totalUpvotes._sum.upvotes || 0,
        unreadNotifications,
      },
      topResources,
    };
  }

  async getSchoolSummary(userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) {
      return { role: 'SCHOOL', stats: {}, events: [], recentRegistrations: [] };
    }

    const schoolId = school.id;

    const [
      totalStudents,
      totalTeachers,
      totalEvents,
      activeEvents,
      totalResources,
      totalRegistrations,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({ where: { schoolId, role: 'STUDENT' } }),
      prisma.user.count({ where: { schoolId, role: 'TEACHER' } }),
      prisma.event.count({ where: { schoolId } }),
      prisma.event.count({
        where: { schoolId, status: { in: ['OPEN', 'ONGOING', 'PUBLISHED'] } },
      }),
      prisma.resource.count({ where: { schoolId } }),
      prisma.registration.count({
        where: { event: { schoolId } },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    // Recent events
    const recentEvents = await prisma.event.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        eventDate: true,
        category: true,
        _count: { select: { registrations: true } },
      },
    });

    // Monthly participation trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const participationTrend = await prisma.registration.findMany({
      where: {
        event: { schoolId },
        registeredAt: { gte: sixMonthsAgo },
      },
      select: { registeredAt: true },
    });

    // Aggregate by month
    const monthlyMap = {};
    participationTrend.forEach((r) => {
      const key = `${r.registeredAt.getFullYear()}-${String(
        r.registeredAt.getMonth() + 1
      ).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });
    const trend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      role: 'SCHOOL',
      schoolName: school.name,
      stats: {
        totalStudents,
        totalTeachers,
        totalEvents,
        activeEvents,
        totalResources,
        totalRegistrations,
        unreadNotifications,
      },
      recentEvents,
      participationTrend: trend,
    };
  }

  async getAdminSummary() {
    const [totalSchools, totalUsers, totalEvents, totalResources] =
      await Promise.all([
        prisma.school.count(),
        prisma.user.count(),
        prisma.event.count(),
        prisma.resource.count(),
      ]);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const recentSchools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        _count: { select: { members: true, events: true } },
      },
    });

    return {
      role: 'ADMIN',
      stats: {
        totalSchools,
        totalUsers,
        totalEvents,
        totalResources,
      },
      usersByRole: Object.fromEntries(
        usersByRole.map((r) => [r.role, r._count.role])
      ),
      eventsByStatus: Object.fromEntries(
        eventsByStatus.map((r) => [r.status, r._count.status])
      ),
      recentSchools,
    };
  }
}

module.exports = new DashboardService();

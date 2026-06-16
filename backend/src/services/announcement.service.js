const prisma = require('../utils/prisma');
const notificationService = require('./notification.service');

class AnnouncementService {
  async create(data, authorId) {
    const school = await prisma.school.findFirst({
      where: { OR: [{ adminId: authorId }, { members: { some: { id: authorId } } }] },
    });
    if (!school) { const e = new Error('School not found'); e.statusCode = 404; throw e; }

    const announcement = await prisma.announcement.create({
      data: {
        title:      data.title,
        content:    data.content,
        targetRole: data.targetRole || 'ALL',
        schoolId:   school.id,
        authorId,
        classId:    data.classId || null,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
        class:  { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
      },
    });

    // Notify all relevant school members
    const roleFilter = data.targetRole === 'ALL' ? {} : { role: data.targetRole };
    const members = await prisma.user.findMany({
      where: { schoolId: school.id, ...roleFilter, id: { not: authorId } },
      select: { id: true },
    });
    if (members.length > 0) {
      await notificationService.bulkCreate(
        members.map(m => ({
          userId:  m.id,
          type:    'ANNOUNCEMENT',
          title:   announcement.title,
          message: announcement.content.slice(0, 100) + (announcement.content.length > 100 ? '…' : ''),
          data:    { announcementId: announcement.id },
        }))
      );
    }
    return announcement;
  }

  async getAll(schoolId, filters = {}) {
    const where = {};
    if (schoolId) where.schoolId = schoolId;
    if (filters.classId) where.classId = filters.classId;
    if (filters.targetRole && filters.targetRole !== 'ALL') {
      where.OR = [{ targetRole: filters.targetRole }, { targetRole: 'ALL' }];
    }
    const page  = Math.max(1, parseInt(filters.page)  || 1);
    const limit = Math.min(50, parseInt(filters.limit) || 20);
    const skip  = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: {
          author: { select: { id: true, name: true, role: true } },
          class:  { select: { id: true, name: true } },
        },
      }),
      prisma.announcement.count({ where }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async delete(id, userId) {
    const a = await prisma.announcement.findUnique({ where: { id } });
    if (!a) { const e = new Error('Not found'); e.statusCode = 404; throw e; }
    if (a.authorId !== userId) { const e = new Error('Forbidden'); e.statusCode = 403; throw e; }
    return prisma.announcement.delete({ where: { id } });
  }
}

module.exports = new AnnouncementService();

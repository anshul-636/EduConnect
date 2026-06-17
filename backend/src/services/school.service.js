const prisma = require('../utils/prisma');

class SchoolService {

  async create(data, userId) {
    // Check if this user already has a school
    const existing = await prisma.school.findUnique({ where: { adminId: userId } });
    if (existing) {
      const err = new Error('You already have a school registered.');
      err.statusCode = 409; throw err;
    }
    const school = await prisma.school.create({
      data: { ...data, adminId: userId },
    });
    // Link user to this school
    await prisma.user.update({ where: { id: userId }, data: { schoolId: school.id } });
    return school;
  }

  async getAll() {
    return prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, events: true, resources: true } },
      },
    });
  }

  async getById(id) {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, events: true, resources: true } },
      },
    });
    if (!school) {
      const err = new Error('School not found.'); err.statusCode = 404; throw err;
    }
    return school;
  }

  async update(id, data, userId) {
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      const err = new Error('School not found.'); err.statusCode = 404; throw err;
    }
    if (school.adminId !== userId) {
      const err = new Error('You can only update your own school.'); err.statusCode = 403; throw err;
    }
    return prisma.school.update({ where: { id }, data });
  }

  async getMembers(requester, { role, search, schoolId: queryStringSchoolId }) {
    let schoolId = requester.schoolId;
    if (requester.role === 'ADMIN') {
      schoolId = queryStringSchoolId || requester.schoolId;
    }
    if (!schoolId) {
      const err = new Error('No school is associated with this account.');
      err.statusCode = 400; throw err;
    }

    const where = { schoolId };
    if (role) where.role = role;
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  async getMySchool(userId) {
    const school = await prisma.school.findUnique({
      where: { adminId: userId },
      include: {
        _count: { select: { members: true, events: true, resources: true } },
      },
    });
    if (!school) {
      const err = new Error('You have not created a school yet.'); err.statusCode = 404; throw err;
    }
    return school;
  }

  async delete(id, userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') {
      const err = new Error('Only admins can delete schools.'); err.statusCode = 403; throw err;
    }
    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) { const err = new Error('School not found.'); err.statusCode = 404; throw err; }

    // Deleting a school requires removing/updating related entities first:
    // Update all users who are members of this school to set schoolId to null
    await prisma.user.updateMany({ where: { schoolId: id }, data: { schoolId: null } });

    // Delete registrations, leaderboard, resources, events linked to the school
    const events = await prisma.event.findMany({ where: { schoolId: id }, select: { id: true } });
    const eventIds = events.map(e => e.id);
    await prisma.registration.deleteMany({ where: { eventId: { in: eventIds } } });
    await prisma.leaderboard.deleteMany({ where: { eventId: { in: eventIds } } });
    await prisma.event.deleteMany({ where: { schoolId: id } });
    await prisma.resource.deleteMany({ where: { uploadedBy: school.adminId } });

    // Set admin's schoolId to null so the user doesn't have a deleted school link
    await prisma.user.update({ where: { id: school.adminId }, data: { schoolId: null } });

    return prisma.school.delete({ where: { id } });
  }
}

module.exports = new SchoolService();
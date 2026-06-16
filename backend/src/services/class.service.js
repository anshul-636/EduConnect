const prisma = require('../utils/prisma');

class ClassService {
  async create(data, userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) { const e = new Error('School not found'); e.statusCode = 404; throw e; }

    return prisma.class.create({
      data: {
        name: data.name,
        grade: data.grade,
        section: data.section,
        year: data.year || new Date().getFullYear(),
        schoolId: school.id,
        teacherId: data.teacherId || null,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, assignments: true } },
      },
    });
  }

  async getAll(schoolId, filters = {}) {
    const where = { schoolId };
    if (filters.grade) where.grade = filters.grade;
    if (filters.year) where.year = parseInt(filters.year);

    return prisma.class.findMany({
      where,
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, assignments: true, attendances: true } },
      },
    });
  }

  async getById(id) {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        school: { select: { id: true, name: true } },
        enrollments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { enrolledAt: 'asc' },
        },
        timetableSlots: {
          include: { teacher: { select: { id: true, name: true } } },
          orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
        },
        _count: { select: { assignments: true, attendances: true } },
      },
    });
    if (!cls) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }
    return cls;
  }

  async update(id, data, userId) {
    return prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        grade: data.grade,
        section: data.section,
        teacherId: data.teacherId || null,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });
  }

  async delete(id) {
    return prisma.class.delete({ where: { id } });
  }

  async enroll(classId, studentId) {
    const existing = await prisma.classEnrollment.findUnique({
      where: { userId_classId: { userId: studentId, classId } },
    });
    if (existing) { const e = new Error('Student already enrolled'); e.statusCode = 409; throw e; }
    return prisma.classEnrollment.create({
      data: { userId: studentId, classId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async unenroll(classId, studentId) {
    return prisma.classEnrollment.delete({
      where: { userId_classId: { userId: studentId, classId } },
    });
  }

  // ── Timetable ───────────────────────────────────────────────────────────────

  async addTimetableSlot(classId, data) {
    return prisma.timetableSlot.create({
      data: {
        classId,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subject,
        roomNo: data.roomNo || null,
        teacherId: data.teacherId,
      },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  async updateTimetableSlot(slotId, data) {
    return prisma.timetableSlot.update({
      where: { id: slotId },
      data: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subject,
        roomNo: data.roomNo || null,
        teacherId: data.teacherId,
      },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  async deleteTimetableSlot(slotId) {
    return prisma.timetableSlot.delete({ where: { id: slotId } });
  }

  async getTimetableForTeacher(teacherId) {
    return prisma.timetableSlot.findMany({
      where: { teacherId },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
      include: {
        class: { select: { id: true, name: true, grade: true, section: true } },
      },
    });
  }
}

module.exports = new ClassService();

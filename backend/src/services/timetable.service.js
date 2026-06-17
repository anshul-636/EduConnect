const prisma = require('../utils/prisma');

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

class TimetableService {

  async getForClass(classId) {
    const slots = await prisma.timetableSlot.findMany({
      where: { classId },
      include: { teacher: { select: { id: true, name: true } } },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' },
      ],
    });
    // Group by day for convenience
    const grouped = {};
    DAYS.forEach(d => { grouped[d] = []; });
    slots.forEach(s => {
      if (grouped[s.day]) grouped[s.day].push(s);
    });
    return { slots, grouped };
  }

  async getForTeacher(teacherId) {
    return prisma.timetableSlot.findMany({
      where: { teacherId },
      include: {
        class: { select: { id: true, name: true, grade: true, section: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(data, requesterId, requesterRole) {
    await this._assertAccess(data.classId, requesterId, requesterRole);
    if (!DAYS.includes(data.day)) {
      const e = new Error(`day must be one of: ${DAYS.join(', ')}`);
      e.statusCode = 400; throw e;
    }
    return prisma.timetableSlot.create({
      data: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subject,
        roomNo: data.roomNo || null,
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, grade: true, section: true } },
      },
    });
  }

  async _assertAccess(classId, requesterId, requesterRole) {
    if (requesterRole === 'SCHOOL' || requesterRole === 'ADMIN') return;
    if (requesterRole === 'TEACHER') {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (!cls) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }
      if (cls.teacherId !== requesterId) {
        const e = new Error('Forbidden: you are not the teacher for this class');
        e.statusCode = 403; throw e;
      }
      return;
    }
    const e = new Error('Forbidden'); e.statusCode = 403; throw e;
  }

  async update(id, data, requesterId, requesterRole) {
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) { const e = new Error('Slot not found'); e.statusCode = 404; throw e; }
    await this._assertAccess(slot.classId, requesterId, requesterRole);
    return prisma.timetableSlot.update({
      where: { id },
      data: {
        day: data.day || slot.day,
        startTime: data.startTime || slot.startTime,
        endTime: data.endTime || slot.endTime,
        subject: data.subject || slot.subject,
        roomNo: data.roomNo !== undefined ? data.roomNo : slot.roomNo,
        teacherId: data.teacherId || slot.teacherId,
      },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  async delete(id, requesterId, requesterRole) {
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) { const e = new Error('Slot not found'); e.statusCode = 404; throw e; }
    await this._assertAccess(slot.classId, requesterId, requesterRole);
    return prisma.timetableSlot.delete({ where: { id } });
  }
}

module.exports = new TimetableService();
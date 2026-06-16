const prisma = require('../utils/prisma');

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

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
    // Only SCHOOL admins and TEACHERs may create slots
    if (!['SCHOOL', 'ADMIN'].includes(requesterRole)) {
      const e = new Error('Forbidden'); e.statusCode = 403; throw e;
    }
    if (!DAYS.includes(data.day)) {
      const e = new Error(`day must be one of: ${DAYS.join(', ')}`);
      e.statusCode = 400; throw e;
    }
    return prisma.timetableSlot.create({
      data: {
        day:       data.day,
        startTime: data.startTime,
        endTime:   data.endTime,
        subject:   data.subject,
        roomNo:    data.roomNo || null,
        classId:   data.classId,
        teacherId: data.teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class:   { select: { id: true, name: true, grade: true, section: true } },
      },
    });
  }

  async update(id, data, requesterId, requesterRole) {
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) { const e = new Error('Slot not found'); e.statusCode = 404; throw e; }
    if (!['SCHOOL', 'ADMIN'].includes(requesterRole)) {
      const e = new Error('Forbidden'); e.statusCode = 403; throw e;
    }
    return prisma.timetableSlot.update({
      where: { id },
      data: {
        day:       data.day       || slot.day,
        startTime: data.startTime || slot.startTime,
        endTime:   data.endTime   || slot.endTime,
        subject:   data.subject   || slot.subject,
        roomNo:    data.roomNo !== undefined ? data.roomNo : slot.roomNo,
        teacherId: data.teacherId || slot.teacherId,
      },
      include: { teacher: { select: { id: true, name: true } } },
    });
  }

  async delete(id, requesterId, requesterRole) {
    if (!['SCHOOL', 'ADMIN'].includes(requesterRole)) {
      const e = new Error('Forbidden'); e.statusCode = 403; throw e;
    }
    const slot = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!slot) { const e = new Error('Slot not found'); e.statusCode = 404; throw e; }
    return prisma.timetableSlot.delete({ where: { id } });
  }
}

module.exports = new TimetableService();
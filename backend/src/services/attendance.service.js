const prisma = require('../utils/prisma');

class AttendanceService {
  async markBulk(classId, date, records, teacherId) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const ops = records.map(r =>
      prisma.attendance.upsert({
        where: { date_classId_studentId: { date: d, classId, studentId: r.studentId } },
        create: { date: d, classId, studentId: r.studentId, teacherId, status: r.status, note: r.note || null },
        update: { status: r.status, note: r.note || null, teacherId },
      })
    );
    return prisma.$transaction(ops);
  }

  async getByDate(classId, date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const [enrollments, existing] = await Promise.all([
      prisma.classEnrollment.findMany({
        where: { classId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: 'asc' } },
      }),
      prisma.attendance.findMany({ where: { classId, date: d } }),
    ]);
    const map = {};
    existing.forEach(a => { map[a.studentId] = a; });
    return enrollments.map(e => ({
      student:    e.user,
      attendance: map[e.userId] || null,
      status:     map[e.userId]?.status || 'NOT_MARKED',
    }));
  }

  async getMonthly(classId, year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end   = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const records = await prisma.attendance.findMany({
      where: { classId, date: { gte: start, lte: end } },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' },
    });
    const studentMap = {};
    records.forEach(r => {
      if (!studentMap[r.studentId]) {
        studentMap[r.studentId] = { student: r.student, PRESENT: 0, ABSENT: 0, LATE: 0, total: 0 };
      }
      studentMap[r.studentId][r.status] = (studentMap[r.studentId][r.status] || 0) + 1;
      studentMap[r.studentId].total++;
    });
    return {
      records,
      summary: Object.values(studentMap).map(s => ({
        ...s,
        percentage: s.total > 0 ? Math.round((s.PRESENT / s.total) * 100) : 0,
      })),
    };
  }

  async getStudentReport(studentId, classId) {
    const records = await prisma.attendance.findMany({
      where: { studentId, classId },
      orderBy: { date: 'desc' },
    });
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    records.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    const total = records.length;
    const percentage = total > 0 ? Math.round((counts.PRESENT / total) * 100) : 0;
    return { records, counts, total, percentage };
  }
}

module.exports = new AttendanceService();

const prisma = require('../utils/prisma');
const notificationService = require('./notification.service');

class AssignmentService {
  async create(data, teacherId) {
    const assignment = await prisma.assignment.create({
      data: {
        title:       data.title,
        description: data.description || null,
        instructions:data.instructions || null,
        dueDate:     new Date(data.dueDate),
        maxScore:    parseFloat(data.maxScore) || 100,
        allowLate:   data.allowLate === true || data.allowLate === 'true',
        classId:     data.classId,
        teacherId,
        resourceId:  data.resourceId || null,
      },
      include: {
        class:   { select: { id: true, name: true, grade: true, section: true } },
        teacher: { select: { id: true, name: true } },
        _count:  { select: { submissions: true } },
      },
    });
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId: data.classId }, select: { userId: true },
    });
    if (enrollments.length > 0) {
      await notificationService.bulkCreate(enrollments.map(e => ({
        userId:  e.userId,
        type:    'ASSIGNMENT_CREATED',
        title:   `New assignment: ${assignment.title}`,
        message: `Due ${new Date(data.dueDate).toLocaleDateString()}`,
        data:    { assignmentId: assignment.id },
      })));
    }
    return assignment;
  }

  async getForClass(classId, userId, role) {
    return prisma.assignment.findMany({
      where: { classId },
      orderBy: { dueDate: 'asc' },
      include: {
        teacher:     { select: { id: true, name: true } },
        _count:      { select: { submissions: true } },
        submissions: role === 'STUDENT'
          ? { where: { studentId: userId }, select: { id: true, status: true, score: true, submittedAt: true } }
          : true,
      },
    });
  }

  async getById(id, userId, role) {
    const a = await prisma.assignment.findUnique({
      where: { id },
      include: {
        class:    { select: { id: true, name: true, grade: true, section: true } },
        teacher:  { select: { id: true, name: true, email: true } },
        resource: { select: { id: true, title: true, type: true, fileUrl: true } },
        submissions: role === 'STUDENT'
          ? { where: { studentId: userId }, include: { student: { select: { id: true, name: true } } } }
          : { include: { student: { select: { id: true, name: true, email: true } } }, orderBy: { submittedAt: 'asc' } },
        _count: { select: { submissions: true } },
      },
    });
    if (!a) { const e = new Error('Assignment not found'); e.statusCode = 404; throw e; }
    return a;
  }

  async getForTeacher(teacherId) {
    return prisma.assignment.findMany({
      where: {
        OR: [
          { teacherId: teacherId },
          { class: { teacherId: teacherId } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        class:  { select: { id: true, name: true, grade: true, section: true } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async getForStudent(studentId) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { userId: studentId }, select: { classId: true },
    });
    const classIds = enrollments.map(e => e.classId);
    const assignments = await prisma.assignment.findMany({
      where: { classId: { in: classIds } },
      orderBy: { dueDate: 'asc' },
      include: {
        class:       { select: { id: true, name: true, grade: true, section: true } },
        teacher:     { select: { id: true, name: true } },
        submissions: { where: { studentId }, select: { id: true, status: true, score: true, submittedAt: true, feedback: true } },
      },
    });
    return assignments.map(a => {
      const sub = a.submissions[0] || null;
      const now = new Date();
      let status = 'PENDING';
      if (sub) status = sub.status;
      else if (new Date(a.dueDate) < now) status = 'OVERDUE';
      return { ...a, studentStatus: status, mySubmission: sub };
    });
  }

  async submit(assignmentId, studentId, data, file) {
    const a = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!a) { const e = new Error('Assignment not found'); e.statusCode = 404; throw e; }
    const isLate = new Date(a.dueDate) < new Date();
    if (isLate && !a.allowLate) { const e = new Error('Deadline passed'); e.statusCode = 400; throw e; }
    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    const status = isLate ? 'LATE' : 'SUBMITTED';
    if (existing) {
      return prisma.submission.update({
        where: { id: existing.id },
        data: { content: data.content || null, fileUrl: fileUrl || existing.fileUrl, status: 'RESUBMITTED', submittedAt: new Date() },
        include: { student: { select: { id: true, name: true } } },
      });
    }
    return prisma.submission.create({
      data: { assignmentId, studentId, content: data.content || null, fileUrl, status },
      include: { student: { select: { id: true, name: true } } },
    });
  }

  async grade(submissionId, { score, feedback }, teacherId, userRole) {
    const sub = await prisma.submission.findUnique({
      where: { id: submissionId }, include: { assignment: { include: { class: true } } },
    });
    if (!sub) { const e = new Error('Submission not found'); e.statusCode = 404; throw e; }
    
    // Can grade if you created it, or you are the class teacher, or you are a SCHOOL admin
    if (sub.assignment.teacherId !== teacherId && sub.assignment.class.teacherId !== teacherId && userRole !== 'SCHOOL') { 
      const e = new Error('Forbidden'); e.statusCode = 403; throw e; 
    }
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: { score: parseFloat(score), feedback, status: 'GRADED', gradedAt: new Date() },
      include: {
        student:    { select: { id: true, name: true } },
        assignment: { select: { title: true, maxScore: true } },
      },
    });
    await notificationService.create({
      userId:  sub.studentId,
      type:    'ASSIGNMENT_GRADED',
      title:   `Assignment graded: ${sub.assignment.title}`,
      message: `You scored ${score}/${sub.assignment.maxScore}`,
      data:    { assignmentId: sub.assignmentId },
    });
    return updated;
  }

  async delete(id, teacherId) {
    const a = await prisma.assignment.findUnique({ where: { id } });
    if (!a) { const e = new Error('Not found'); e.statusCode = 404; throw e; }
    if (a.teacherId !== teacherId) { const e = new Error('Forbidden'); e.statusCode = 403; throw e; }
    return prisma.assignment.delete({ where: { id } });
  }
}

module.exports = new AssignmentService();

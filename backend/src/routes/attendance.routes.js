const { Router } = require('express');
const c = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const r = Router();

// Marking and viewing the full class roster's attendance is staff-only
r.post('/:classId', protect, restrictTo('TEACHER', 'SCHOOL', 'ADMIN'), c.markBulk);
r.get('/:classId', protect, restrictTo('TEACHER', 'SCHOOL', 'ADMIN'), c.getByDate);
r.get('/:classId/monthly', protect, restrictTo('TEACHER', 'SCHOOL', 'ADMIN'), c.getMonthly);

// A student may always view their own attendance report
r.get('/:classId/my-report', protect, c.getStudentReport);

module.exports = r;
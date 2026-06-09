const { Router } = require('express');
const c = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const r = Router();

r.post('/:classId',           protect, c.markBulk);
r.get('/:classId',            protect, c.getByDate);
r.get('/:classId/monthly',    protect, c.getMonthly);
r.get('/:classId/my-report',  protect, c.getStudentReport);

module.exports = r;

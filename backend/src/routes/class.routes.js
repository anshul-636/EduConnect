const { Router } = require('express');
const c = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const r = Router();

// Anyone logged in can view classes / their own teaching timetable
r.get('/my-timetable', protect, c.getMyTimetable);
r.get('/', protect, c.getAll);
r.get('/:id', protect, c.getById);

// Only school admins manage the class roster itself
r.post('/', protect, restrictTo('SCHOOL', 'ADMIN'), c.create);
r.patch('/:id', protect, restrictTo('SCHOOL', 'ADMIN'), c.update);
r.delete('/:id', protect, restrictTo('SCHOOL', 'ADMIN'), c.remove);
r.post('/:id/enroll', protect, restrictTo('SCHOOL', 'ADMIN'), c.enroll);
r.delete('/:id/enroll', protect, restrictTo('SCHOOL', 'ADMIN'), c.unenroll);

// Teachers may manage timetable slots for their own class; school/admin for any class
// (ownership for TEACHER is enforced inside class.service.js)
r.post('/:id/timetable', protect, restrictTo('SCHOOL', 'ADMIN', 'TEACHER'), c.addSlot);
r.patch('/:id/timetable/:slotId', protect, restrictTo('SCHOOL', 'ADMIN', 'TEACHER'), c.updateSlot);
r.delete('/:id/timetable/:slotId', protect, restrictTo('SCHOOL', 'ADMIN', 'TEACHER'), c.deleteSlot);

module.exports = r;
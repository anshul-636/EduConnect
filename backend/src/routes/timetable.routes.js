const { Router } = require('express');
const c = require('../controllers/timetable.controller');
const { protect } = require('../middleware/auth.middleware');
const r = Router();

r.get('/teacher/mine',    protect, c.getForTeacher);
r.get('/class/:classId',  protect, c.getForClass);
r.post('/',               protect, c.create);
r.patch('/:id',           protect, c.update);
r.delete('/:id',          protect, c.remove);

module.exports = r;
const { Router } = require('express');
const c = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');
const r = Router();

r.get('/my-timetable',           protect, c.getMyTimetable);
r.get('/',                       protect, c.getAll);
r.post('/',                      protect, c.create);
r.get('/:id',                    protect, c.getById);
r.patch('/:id',                  protect, c.update);
r.delete('/:id',                 protect, c.remove);
r.post('/:id/enroll',            protect, c.enroll);
r.delete('/:id/enroll',          protect, c.unenroll);
r.post('/:id/timetable',         protect, c.addSlot);
r.patch('/:id/timetable/:slotId',protect, c.updateSlot);
r.delete('/:id/timetable/:slotId',protect,c.deleteSlot);

module.exports = r;

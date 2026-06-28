const { Router } = require('express');
const c = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { upload: localUpload } = require('../utils/cloudinaryUpload');
const r = Router();

r.get('/mine', protect, c.getMine);
r.post('/', protect, restrictTo('TEACHER', 'SCHOOL'), c.create);
r.get('/class/:classId', protect, c.getForClass);
r.get('/:id', protect, c.getById);
r.delete('/:id', protect, restrictTo('TEACHER', 'SCHOOL'), c.remove);
r.post('/:id/submit', protect, restrictTo('STUDENT'), localUpload.single('file'), c.submit);
r.patch('/submissions/:submissionId/grade', protect, restrictTo('TEACHER', 'SCHOOL'), c.grade);

module.exports = r;
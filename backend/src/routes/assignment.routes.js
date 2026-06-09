const { Router } = require('express');
const c = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const r = Router();

r.get('/mine',                             protect, c.getMine);
r.post('/',                                protect, c.create);
r.get('/class/:classId',                   protect, c.getForClass);
r.get('/:id',                              protect, c.getById);
r.delete('/:id',                           protect, c.remove);
r.post('/:id/submit',                      protect, c.submit);
r.patch('/submissions/:submissionId/grade',protect, c.grade);

module.exports = r;

const { Router } = require('express');
const c = require('../controllers/announcement.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const r = Router();

r.get('/', protect, c.getAll);
r.post('/', protect, restrictTo('SCHOOL', 'TEACHER', 'ADMIN'), c.create);
r.delete('/:id', protect, c.remove);

module.exports = r;
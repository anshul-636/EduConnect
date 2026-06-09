const { Router } = require('express');
const c = require('../controllers/announcement.controller');
const { protect } = require('../middleware/auth.middleware');
const r = Router();

r.get('/',     protect, c.getAll);
r.post('/',    protect, c.create);
r.delete('/:id',protect, c.remove);

module.exports = r;

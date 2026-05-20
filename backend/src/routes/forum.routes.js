const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, reply, remove } = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', protect, [body('content').trim().notEmpty().withMessage('Content is required.')], create);
router.post('/:id/reply', protect, reply);
router.delete('/:id', protect, remove);

module.exports = router;

const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, reply, edit, like, remove } = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

const contentValidation = [
  body('content').trim().notEmpty().withMessage('Content is required.'),
];

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', protect, contentValidation, create);
router.post('/:id/reply', protect, contentValidation, reply);

// ADDED: edit a post (PATCH — partial update)
router.patch('/:id', protect, contentValidation, edit);

// ADDED: toggle like on a post
router.post('/:id/like', protect, like);

router.delete('/:id', protect, remove);

module.exports = router;

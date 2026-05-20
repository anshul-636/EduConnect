const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, remove, upvote } = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { upload } = require('../utils/cloudinary');

const router = Router();

const resourceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('type').isIn(['PDF','VIDEO','LINK','NOTES']).withMessage('Invalid type.'),
];

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', protect, restrictTo('SCHOOL','TEACHER'), upload.single('file'), resourceValidation, create);
router.delete('/:id', protect, restrictTo('SCHOOL','TEACHER','ADMIN'), remove);
router.post('/:id/upvote', protect, restrictTo('STUDENT'), upvote);

module.exports = router;

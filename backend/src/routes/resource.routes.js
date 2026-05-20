const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, remove, upvote, incrementView } = require('../controllers/resource.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { localUpload } = require('../utils/localUpload');


const router = Router();

const resourceValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('type').isIn(['PDF','VIDEO','LINK','NOTES']).withMessage('Invalid type.'),
];

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', protect, restrictTo('SCHOOL','TEACHER'), localUpload.single('file'), resourceValidation, create);

router.delete('/:id', protect, restrictTo('SCHOOL','TEACHER','ADMIN'), remove);
router.post('/:id/upvote', protect, upvote);

router.post('/:id/view', incrementView);


module.exports = router;

const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, update, getMySchool, remove, adminCreate } = require('../controllers/school.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

const router = Router();

const schoolValidation = [
  body('name').trim().notEmpty().withMessage('School name is required.'),
  body('location').optional().trim(),
  body('affiliation').optional().trim(),
];

// Public
router.get('/', getAll);
router.get('/my/school', protect, restrictTo('SCHOOL'), getMySchool); // must be before /:id
router.get('/:id', getById);

// Protected
router.post('/', protect, restrictTo('SCHOOL'), schoolValidation, create);
router.post('/admin-create', protect, restrictTo('ADMIN'), adminCreate);
router.put('/:id', protect, restrictTo('SCHOOL', 'ADMIN'), schoolValidation, update);
router.delete('/:id', protect, restrictTo('ADMIN'), remove);

module.exports = router;
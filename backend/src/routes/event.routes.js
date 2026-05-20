const { Router } = require('express');
const { body } = require('express-validator');
const { create, getAll, getById, update, register, getRegistrations, getMyRegistrations, submitResults, getLeaderboard, updateAnswerKey, remove } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

const router = Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required.'),
  body('eventDate').notEmpty().withMessage('Event date is required.'),
  body('category').isIn(['DEBATE','QUIZ','SCIENCE','SPORTS','ARTS','OTHER']).withMessage('Invalid category.'),
];

router.get('/', getAll);
router.get('/my', protect, restrictTo('STUDENT'), getMyRegistrations);
router.get('/:id', getById);
router.post('/', protect, restrictTo('SCHOOL'), eventValidation, create);
router.put('/:id', protect, restrictTo('SCHOOL'), update);
router.delete('/:id', protect, restrictTo('SCHOOL', 'ADMIN'), remove);
router.post('/:id/register', protect, restrictTo('STUDENT'), register);
router.get('/:id/registrations', protect, restrictTo('SCHOOL','ADMIN'), getRegistrations);
router.post('/:id/results', protect, restrictTo('SCHOOL','ADMIN'), submitResults);
router.get('/:id/leaderboard', getLeaderboard);
router.put('/:id/answer-key', protect, restrictTo('SCHOOL','ADMIN'), updateAnswerKey);

module.exports = router;
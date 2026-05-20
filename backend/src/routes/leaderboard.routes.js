const { Router } = require('express');
const { setScore, getAll, getByEvent, getMyRank } = require('../controllers/leaderboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

const router = Router();

router.get('/', getAll);
router.get('/my', protect, restrictTo('STUDENT'), getMyRank);
router.get('/event/:eventId', getByEvent);
router.post('/score', protect, restrictTo('SCHOOL', 'ADMIN'), setScore);

module.exports = router;

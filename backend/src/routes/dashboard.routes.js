const { Router } = require('express');
const { getSummary } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// GET /api/v1/dashboard/summary — role-aware dashboard data
router.get('/summary', protect, getSummary);

module.exports = router;

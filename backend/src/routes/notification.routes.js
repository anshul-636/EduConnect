const { Router } = require('express');
const { getAll, markRead, markAllRead, remove } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = Router();

// GET /api/v1/notifications?unreadOnly=true&page=1&limit=20
router.get('/', protect, getAll);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', protect, markRead);

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', protect, markAllRead);

// DELETE /api/v1/notifications/:id
router.delete('/:id', protect, remove);

module.exports = router;

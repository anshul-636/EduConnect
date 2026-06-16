const notificationService = require('../services/notification.service');

const getAll = async (req, res) => {
  try {
    const result = await notificationService.getForUser(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await notificationService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, markRead, markAllRead, remove };

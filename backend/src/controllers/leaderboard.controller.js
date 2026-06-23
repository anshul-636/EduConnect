const leaderboardService = require('../services/leaderboard.service');

const setScore = async (req, res) => {
  try {
    const entry = await leaderboardService.setScore(req.body, req.user.id, req.user.role);
    res.status(201).json({ success: true, data: entry });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const data = await leaderboardService.getAll(req.query);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getByEvent = async (req, res) => {
  try {
    const data = await leaderboardService.getByEvent(req.params.eventId);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMyRank = async (req, res) => {
  try {
    const data = await leaderboardService.getMyRank(req.user.id);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { setScore, getAll, getByEvent, getMyRank };
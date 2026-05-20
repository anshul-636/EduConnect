const { validationResult } = require('express-validator');
const eventService = require('../services/event.service');

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const event = await eventService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: event });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const events = await eventService.getAll(req.query);
    res.json({ success: true, data: events });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const event = await eventService.getById(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const event = await eventService.update(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: event });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const register = async (req, res) => {
  try {
    const reg = await eventService.register(req.params.id, req.user.id, req.body.teamName, req.body.teamMembers);
    res.status(201).json({ success: true, data: reg });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getRegistrations = async (req, res) => {
  try {
    const regs = await eventService.getRegistrations(req.params.id, req.user.id);
    res.json({ success: true, data: regs });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getMyRegistrations = async (req, res) => {
  try {
    const regs = await eventService.getMyRegistrations(req.user.id);
    res.json({ success: true, data: regs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const submitResults = async (req, res) => {
  try {
    const leaderboard = await eventService.submitResults(req.params.id, req.user.id, req.body.results);
    res.json({ success: true, data: leaderboard });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await eventService.getLeaderboard(req.params.id);
    res.json({ success: true, data: leaderboard });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const updateAnswerKey = async (req, res) => {
  try {
    const event = await eventService.updateAnswerKey(req.params.id, req.user.id, req.body.answerKey);
    res.json({ success: true, data: event });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    const event = await eventService.delete(req.params.id, req.user.id);
    res.json({ success: true, data: event });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

module.exports = { create, getAll, getById, update, register, getRegistrations, getMyRegistrations, submitResults, getLeaderboard, updateAnswerKey, remove };
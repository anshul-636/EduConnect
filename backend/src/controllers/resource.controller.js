const { validationResult } = require('express-validator');
const resourceService = require('../services/resource.service');

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const resource = await resourceService.create(req.body, req.file, req.user.id);
    res.status(201).json({ success: true, data: resource });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const resources = await resourceService.getAll(req.query);
    res.json({ success: true, data: resources });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const resource = await resourceService.getById(req.params.id);
    res.json({ success: true, data: resource });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await resourceService.delete(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const upvote = async (req, res) => {
  try {
    const resource = await resourceService.upvote(req.params.id, req.user.id);
    res.json({ success: true, data: resource });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const incrementView = async (req, res) => {
  try {
    const resource = await resourceService.incrementViewCount(req.params.id);
    res.json({ success: true, data: resource });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

module.exports = { create, getAll, getById, remove, upvote, incrementView };


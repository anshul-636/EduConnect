const { validationResult } = require('express-validator');
const forumService = require('../services/forum.service');

const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const post = await forumService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await forumService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const post = await forumService.getById(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const reply = async (req, res) => {
  if (!req.body.content)
    return res.status(422).json({ success: false, message: 'Content is required.' });
  try {
    const post = await forumService.reply(req.params.id, req.body.content, req.user.id);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ADDED: Edit a post
const edit = async (req, res) => {
  if (!req.body.content)
    return res.status(422).json({ success: false, message: 'Content is required.' });
  try {
    const post = await forumService.edit(
      req.params.id,
      req.body.content,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ADDED: Toggle like
const like = async (req, res) => {
  try {
    const result = await forumService.like(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await forumService.delete(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getAll, getById, reply, edit, like, remove };

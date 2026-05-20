const { Router } = require('express');
const { protect } = require('../middleware/auth.middleware');
const router = Router();
const axios = require('axios');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Proxy helper
const aiProxy = async (req, res, endpoint, method = 'POST') => {
  try {
    const response = await axios({
      method,
      url: AI_URL + endpoint,
      data: req.body,
      params: req.query,
      timeout: 60000,
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.detail || err.message || 'AI service error.'
    });
  }
};

router.post('/chat/rag', protect, (req, res) => aiProxy(req, res, '/api/v1/chat/rag'));
router.post('/chat/platform', protect, (req, res) => aiProxy(req, res, '/api/v1/chat/platform'));
router.delete('/chat/session/:id', protect, (req, res) => aiProxy(req, res, '/api/v1/chat/session/' + req.params.id, 'DELETE'));
router.post('/planner/generate', protect, (req, res) => aiProxy(req, res, '/api/v1/planner/generate'));
router.get('/recommend/resources', protect, (req, res) => aiProxy(req, res, '/api/v1/recommend/resources', 'GET'));

module.exports = router;

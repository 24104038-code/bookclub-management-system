const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// POST /api/ai/chat - Process conversational query for Forge AI
router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;

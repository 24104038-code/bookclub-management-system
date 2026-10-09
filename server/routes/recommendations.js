const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, recommendationController.getRecommendations);

module.exports = router;

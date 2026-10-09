const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', leaderboardController.getLeaderboards);

module.exports = router;

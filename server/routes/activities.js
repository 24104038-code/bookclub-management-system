const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', activityController.getActivities);
router.post('/', optionalAuth, activityController.createActivity);

module.exports = router;

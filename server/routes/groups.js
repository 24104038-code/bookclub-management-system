const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { auth, optionalAuth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);
router.post('/', auth, roleMiddleware(['organizer', 'admin']), groupController.createGroup);
router.put('/:id', auth, roleMiddleware(['organizer', 'admin']), groupController.updateGroup);
router.post('/:id/join', auth, groupController.toggleJoinGroup);
router.post('/:id/poll/vote', auth, groupController.votePoll);
router.post('/:id/track-event', optionalAuth, groupController.trackGroupEvent);

module.exports = router;

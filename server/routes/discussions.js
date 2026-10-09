const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { auth } = require('../middleware/auth');

router.get('/', discussionController.getAllDiscussions);
router.get('/:id', discussionController.getDiscussionById);
router.post('/', auth, discussionController.createDiscussion);
router.post('/:id/reply', auth, discussionController.addReply);
router.post('/:id/like', auth, discussionController.toggleLikeDiscussion);

module.exports = router;

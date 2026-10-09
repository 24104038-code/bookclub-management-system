const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// GET /api/messages/contacts - Get communication contacts list
router.get('/contacts', auth, messageController.getContacts);

// GET /api/messages/:contactId - Get message thread with a contact
router.get('/:contactId', auth, messageController.getMessages);

// POST /api/messages - Send a message
router.post('/', auth, messageController.sendMessage);

// PUT /api/messages/:contactId/read - Mark conversation read
router.put('/:contactId/read', auth, messageController.markAsRead);

module.exports = router;

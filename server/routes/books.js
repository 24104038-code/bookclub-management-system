const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth, optionalAuth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/:id/unlock', optionalAuth, bookController.unlockBook);

// Admin-only management routes
router.post('/', auth, roleMiddleware(['admin']), bookController.createBook);
router.put('/:id', auth, roleMiddleware(['admin']), bookController.updateBook);
router.delete('/:id', auth, roleMiddleware(['admin']), bookController.deleteBook);

module.exports = router;

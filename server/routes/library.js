const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', libraryController.getUserLibrary);
router.get('/reading-progress', libraryController.getReadingProgress);
router.put('/reading-progress/:bookId', libraryController.updateReadingProgress);
router.put('/:bookId', libraryController.updateLibraryEntry);
router.delete('/:bookId', libraryController.removeLibraryEntry);

module.exports = router;

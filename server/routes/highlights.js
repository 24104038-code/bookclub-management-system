const express = require('express');
const router = express.Router();
const highlightController = require('../controllers/highlightController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', highlightController.getAllHighlights);
router.post('/', highlightController.createHighlight);
router.put('/:id', highlightController.updateHighlight);
router.delete('/:id', highlightController.deleteHighlight);
router.post('/:id/favorite', highlightController.toggleFavorite);

module.exports = router;

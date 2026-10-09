const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', noteController.getAllNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;

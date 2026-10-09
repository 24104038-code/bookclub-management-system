const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', journalController.getJournal);
router.post('/', journalController.createJournalEntry);
router.delete('/:id', journalController.deleteJournalEntry);

module.exports = router;

const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { auth } = require('../middleware/auth');

router.get('/', competitionController.getAllCompetitions);
router.get('/:id', competitionController.getCompetitionById);
router.post('/:id/join', auth, competitionController.toggleJoinCompetition);

module.exports = router;

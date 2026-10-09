const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const certificateController = require('../controllers/certificateController');
const { auth } = require('../middleware/auth');

router.get('/', challengeController.getAllChallenges);
router.get('/:id', challengeController.getChallengeById);
router.post('/:id/join', auth, challengeController.toggleJoinChallenge);

// Challenge progress and completion
router.post('/:id/progress', auth, challengeController.updateChallengeProgress);
router.post('/:id/complete', auth, challengeController.completeChallenge);

// Challenge certificate integration endpoints
router.get('/:challengeId/certificate-status', auth, certificateController.getChallengeCertificateStatus);
router.post('/:challengeId/certificate', auth, certificateController.generateChallengeCertificate);

module.exports = router;


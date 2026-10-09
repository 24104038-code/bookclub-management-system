const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const certificateController = require('../controllers/certificateController');
const { auth, optionalAuth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', auth, roleMiddleware(['organizer', 'admin']), eventController.createEvent);
router.put('/:id', auth, roleMiddleware(['organizer', 'admin']), eventController.updateEvent);
router.post('/:id/rsvp', auth, eventController.toggleRSVP);
router.post('/:id/track', optionalAuth, eventController.trackEvent);

// Certificate integration endpoints
router.get('/:eventId/certificate-status', auth, certificateController.getEventCertificateStatus);
router.post('/:eventId/certificate', auth, certificateController.generateEventCertificate);
router.post('/:eventId/tasks/:taskId/complete', auth, certificateController.completeEventTask);

module.exports = router;

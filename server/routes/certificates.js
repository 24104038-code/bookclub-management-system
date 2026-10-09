const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { auth } = require('../middleware/auth');

// GET /api/certificates - Fetch authenticated user's certificates
router.get('/', auth, certificateController.getMyCertificates);

// GET /api/certificates/verify/:certificateId - Public certificate verification
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// GET /api/certificates/:certificateId/pdf - Download Certificate as PDF
router.get('/:certificateId/pdf', certificateController.downloadCertificatePDF);

// GET /api/certificates/:certificateId - Get single certificate by ID
router.get('/:certificateId', certificateController.getCertificateById);

module.exports = router;

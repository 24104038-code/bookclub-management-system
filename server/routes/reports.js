const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

// Submit report is allowed for any authenticated reader
router.post('/', auth, reportController.createReport);

// Viewing and resolving reports is strictly restricted to Admin & Organizer roles
router.get('/', auth, roleMiddleware(['admin', 'organizer']), reportController.getAllReports);
router.put('/:id', auth, roleMiddleware(['admin', 'organizer']), reportController.updateReport);

module.exports = router;

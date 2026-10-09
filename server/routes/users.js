const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/me', auth, userController.getMe);
router.put('/me', optionalAuth, userController.updateMe);
router.put('/:id', optionalAuth, userController.updateMe);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;

const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', goalController.getUserGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;

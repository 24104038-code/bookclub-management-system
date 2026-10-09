const Goal = require('../models/Goal');

// GET /api/goals
exports.getUserGoals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const goals = await Goal.find({ userId }).sort({ deadline: 1 });

    res.json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/goals
exports.createGoal = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, type, target, unit, deadline, description } = req.body;

    if (!title || !target) {
      return res.status(400).json({ success: false, message: 'Title and target are required.' });
    }

    const lastGoal = await Goal.findOne().sort({ id: -1 });
    const nextId = (lastGoal && lastGoal.id) ? lastGoal.id + 1 : 1;

    const newGoal = new Goal({
      id: nextId,
      userId,
      title: title.trim(),
      type: type || 'books_count',
      target: Number(target),
      current: 0,
      unit: unit || 'books',
      deadline: deadline || '2026-12-31',
      description: description || '',
      status: 'active'
    });

    await newGoal.save();

    res.status(201).json({
      success: true,
      message: 'Reading goal set!',
      data: newGoal
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const { current, target, status } = req.body;
    const goal = await Goal.findOne(query);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    if (current !== undefined) goal.current = Number(current);
    if (target !== undefined) goal.target = Number(target);
    if (status !== undefined) goal.status = status;

    if (goal.current >= goal.target) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully.',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const deleted = await Goal.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    res.json({
      success: true,
      message: 'Goal deleted.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

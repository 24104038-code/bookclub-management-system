const Activity = require('../models/Activity');

// GET /api/activities
exports.getActivities = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(limit);

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/activities
exports.createActivity = async (req, res, next) => {
  try {
    const { action, targetType, targetTitle, targetLink, details, badge } = req.body;

    const lastAct = await Activity.findOne().sort({ id: -1 });
    const nextId = (lastAct && lastAct.id) ? lastAct.id + 1 : 1;

    const newActivity = new Activity({
      id: nextId,
      userId: req.user ? req.user.userId : 1,
      user: req.user ? req.user.name : (req.body.user || 'Reader'),
      username: req.user ? req.user.username : (req.body.username || 'reader'),
      avatar: req.user ? (req.user.avatar || 'U') : (req.body.avatar || 'U'),
      avatarBg: req.body.avatarBg || 'var(--clay)',
      action: action || 'read',
      targetType: targetType || 'book',
      targetTitle: targetTitle || '',
      targetLink: targetLink || '#',
      time: 'Just now',
      details: details || '',
      badge: badge || null
    });

    await newActivity.save();

    res.status(201).json({
      success: true,
      message: 'Activity recorded.',
      data: newActivity
    });
  } catch (error) {
    next(error);
  }
};

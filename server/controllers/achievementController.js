const Achievement = require('../models/Achievement');

// GET /api/achievements
exports.getAllAchievements = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;

    const achievements = await Achievement.find(query).sort({ id: 1 });

    const unlockedCount = achievements.filter(a => a.status === 'unlocked').length;
    const inProgressCount = achievements.filter(a => a.status === 'in_progress').length;
    const lockedCount = achievements.filter(a => a.status === 'locked').length;

    res.json({
      success: true,
      count: achievements.length,
      stats: {
        total: achievements.length,
        unlocked: unlockedCount,
        inProgress: inProgressCount,
        locked: lockedCount
      },
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

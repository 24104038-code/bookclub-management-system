const User = require('../models/User');
const Group = require('../models/Group');

// GET /api/leaderboards
exports.getLeaderboards = async (req, res, next) => {
  try {
    // Top Readers by books read
    const topReaders = await User.find()
      .sort({ booksRead: -1, pagesRead: -1 })
      .limit(10)
      .select('userId name username level xp booksRead pagesRead streak avatar');

    // Streak Keepers
    const topStreaks = await User.find()
      .sort({ streak: -1, xp: -1 })
      .limit(10)
      .select('userId name username level streak avatar');

    // Top Reviewers
    const topReviewers = await User.find()
      .sort({ reviewsCount: -1 })
      .limit(10)
      .select('userId name username level reviewsCount avatar');

    // Active Groups
    const activeGroups = await Group.find()
      .sort({ memberCount: -1 })
      .limit(5)
      .select('id name category memberCount currentBookTitle');

    const formattedReaders = topReaders.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      username: u.username,
      level: u.level,
      xp: u.xp,
      books: u.booksRead,
      pages: u.pagesRead,
      streak: u.streak,
      avatar: u.avatar,
      badge: i === 0 ? 'Champion 👑' : i === 1 ? 'Scholar 🥈' : i === 2 ? 'Pacer 🥉' : 'Reader'
    }));

    res.json({
      success: true,
      data: {
        topReaders: formattedReaders,
        topStreaks,
        topReviewers,
        activeGroups
      }
    });
  } catch (error) {
    next(error);
  }
};

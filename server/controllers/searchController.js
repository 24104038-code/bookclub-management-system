const Book = require('../models/Book');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Discussion = require('../models/Discussion');

// GET /api/search?q=...
exports.searchAll = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.query || '';
    if (!q.trim()) {
      return res.json({
        success: true,
        query: '',
        results: { books: [], groups: [], events: [], discussions: [] },
        totalCount: 0
      });
    }

    const regex = { $regex: q.trim(), $options: 'i' };

    const [books, groups, events, discussions] = await Promise.all([
      Book.find({
        $or: [{ title: regex }, { author: regex }, { genre: regex }, { description: regex }]
      }).limit(10),

      Group.find({
        $or: [{ name: regex }, { description: regex }, { currentBookTitle: regex }]
      }).limit(5),

      Event.find({
        $or: [{ title: regex }, { description: regex }, { bookTitle: regex }, { location: regex }]
      }).limit(5),

      Discussion.find({
        $or: [{ title: regex }, { content: regex }, { bookTitle: regex }]
      }).limit(5)
    ]);

    const totalCount = books.length + groups.length + events.length + discussions.length;

    res.json({
      success: true,
      query: q.trim(),
      totalCount,
      results: {
        books,
        groups,
        events,
        discussions
      }
    });
  } catch (error) {
    next(error);
  }
};

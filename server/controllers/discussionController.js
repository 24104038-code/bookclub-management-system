const Discussion = require('../models/Discussion');

// GET /api/discussions
exports.getAllDiscussions = async (req, res, next) => {
  try {
    const { category, bookId, search } = req.query;
    let query = {};

    if (category && category !== 'all' && category !== 'All Topics') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (bookId) {
      query.bookId = Number(bookId);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { bookTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const discussions = await Discussion.find(query).sort({ lastActivity: -1 });

    res.json({
      success: true,
      count: discussions.length,
      data: discussions
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/discussions/:id
exports.getDiscussionById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const discussion = await Discussion.findOne(query);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found.' });
    }

    res.json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// POST /api/discussions
exports.createDiscussion = async (req, res, next) => {
  try {
    const { title, content, category, bookId, bookTitle, hasSpoiler, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const lastDisc = await Discussion.findOne().sort({ id: -1 });
    const nextId = (lastDisc && lastDisc.id) ? lastDisc.id + 1 : 1;

    const newDisc = new Discussion({
      id: nextId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      bookId: bookId ? Number(bookId) : null,
      bookTitle: bookTitle || null,
      author: req.user.name,
      authorUsername: req.user.username,
      authorAvatar: req.user.avatar || 'U',
      authorRole: req.user.role === 'admin' ? 'Administrator' : 'Member',
      date: new Date().toISOString().split('T')[0],
      repliesCount: 0,
      likes: 0,
      hasSpoiler: hasSpoiler || false,
      isPinned: false,
      lastActivity: 'Just now',
      tags: tags || [],
      replies: []
    });

    await newDisc.save();

    res.status(201).json({
      success: true,
      message: 'Discussion topic started.',
      data: newDisc
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/discussions/:id/reply
exports.addReply = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const { content, hasSpoiler } = req.body;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required.' });
    }

    const discussion = await Discussion.findOne(query);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    const nextReplyId = (discussion.replies && discussion.replies.length > 0)
      ? Math.max(...discussion.replies.map(r => r.id || 0)) + 1
      : 1;

    const reply = {
      id: nextReplyId,
      author: req.user.name,
      authorUsername: req.user.username,
      authorAvatar: req.user.avatar || 'U',
      authorRole: req.user.role === 'admin' ? 'Administrator' : 'Member',
      date: 'Just now',
      content: content.trim(),
      likes: 0,
      hasSpoiler: hasSpoiler || false
    };

    discussion.replies.push(reply);
    discussion.repliesCount = discussion.replies.length;
    discussion.lastActivity = 'Just now';

    await discussion.save();

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      data: reply
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/discussions/:id/like
exports.toggleLikeDiscussion = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const discussion = await Discussion.findOne(query);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    discussion.likes = (discussion.likes || 0) + 1;
    await discussion.save();

    res.json({
      success: true,
      data: { likes: discussion.likes }
    });
  } catch (error) {
    next(error);
  }
};

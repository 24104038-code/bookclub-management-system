const Highlight = require('../models/Highlight');
const Book = require('../models/Book');

// GET /api/highlights
exports.getAllHighlights = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, favorite } = req.query;

    let query = { userId };
    if (bookId) query.bookId = Number(bookId);
    if (favorite === 'true') query.isFavorite = true;

    const highlights = await Highlight.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: highlights.length,
      data: highlights
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/highlights
exports.createHighlight = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, quote, page, color, userNote, isFavorite, sharedToGroup } = req.body;

    if (!quote) {
      return res.status(400).json({ success: false, message: 'Quote text is required.' });
    }

    const book = bookId ? await Book.findOne({ id: Number(bookId) }) : null;

    const lastHl = await Highlight.findOne().sort({ id: -1 });
    const nextId = (lastHl && lastHl.id) ? lastHl.id + 1 : 1;

    const newHighlight = new Highlight({
      id: nextId,
      userId,
      bookId: bookId ? Number(bookId) : 1,
      bookTitle: book ? book.title : '',
      bookAuthor: book ? book.author : '',
      quote: quote.trim(),
      page: page ? Number(page) : 1,
      color: color || '#E9C6A5',
      userNote: userNote || '',
      isFavorite: isFavorite || false,
      sharedToGroup: sharedToGroup || null
    });

    await newHighlight.save();

    res.status(201).json({
      success: true,
      message: 'Highlight saved to quote wall.',
      data: newHighlight
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/highlights/:id
exports.updateHighlight = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const { quote, userNote, color, isFavorite, page } = req.body;
    const hl = await Highlight.findOne(query);

    if (!hl) {
      return res.status(404).json({ success: false, message: 'Highlight not found.' });
    }

    if (quote) hl.quote = quote.trim();
    if (userNote !== undefined) hl.userNote = userNote;
    if (color) hl.color = color;
    if (isFavorite !== undefined) hl.isFavorite = isFavorite;
    if (page !== undefined) hl.page = Number(page);

    await hl.save();

    res.json({
      success: true,
      message: 'Highlight updated.',
      data: hl
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/highlights/:id
exports.deleteHighlight = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const deleted = await Highlight.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Highlight not found.' });
    }

    res.json({
      success: true,
      message: 'Highlight removed.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/highlights/:id/favorite
exports.toggleFavorite = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const hl = await Highlight.findOne(query);
    if (!hl) {
      return res.status(404).json({ success: false, message: 'Highlight not found.' });
    }

    hl.isFavorite = !hl.isFavorite;
    await hl.save();

    res.json({
      success: true,
      data: { isFavorite: hl.isFavorite }
    });
  } catch (error) {
    next(error);
  }
};

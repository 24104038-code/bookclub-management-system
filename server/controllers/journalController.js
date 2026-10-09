const Journal = require('../models/Journal');
const Book = require('../models/Book');

// GET /api/journal
exports.getJournal = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const entries = await Journal.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/journal
exports.createJournalEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, mood, moodLabel, pagesRead, thoughts, rating, date } = req.body;

    if (!thoughts) {
      return res.status(400).json({ success: false, message: 'Thoughts are required.' });
    }

    const book = bookId ? await Book.findOne({ id: Number(bookId) }) : null;

    const lastJ = await Journal.findOne().sort({ id: -1 });
    const nextId = (lastJ && lastJ.id) ? lastJ.id + 1 : 1;

    const newEntry = new Journal({
      id: nextId,
      userId,
      bookId: bookId ? Number(bookId) : 1,
      bookTitle: book ? book.title : '',
      date: date || new Date().toISOString().split('T')[0],
      mood: mood || '😊',
      moodLabel: moodLabel || 'Satisfied',
      pagesRead: pagesRead ? Number(pagesRead) : 0,
      thoughts: thoughts.trim(),
      rating: rating ? Number(rating) : 5
    });

    await newEntry.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry saved.',
      data: newEntry
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/journal/:id
exports.deleteJournalEntry = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const deleted = await Journal.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Journal entry not found.' });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

const Note = require('../models/Note');
const Book = require('../models/Book');

// GET /api/notes
exports.getAllNotes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId } = req.query;

    let query = { userId };
    if (bookId) query.bookId = Number(bookId);

    const notes = await Note.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, page, note, tags } = req.body;

    if (!bookId || !note) {
      return res.status(400).json({ success: false, message: 'bookId and note content are required.' });
    }

    const book = await Book.findOne({ id: Number(bookId) });

    const lastNote = await Note.findOne().sort({ id: -1 });
    const nextId = (lastNote && lastNote.id) ? lastNote.id + 1 : 1;

    const newNote = new Note({
      id: nextId,
      userId,
      bookId: Number(bookId),
      bookTitle: book ? book.title : '',
      bookAuthor: book ? book.author : '',
      page: page ? Number(page) : 1,
      note: note.trim(),
      tags: tags || []
    });

    await newNote.save();

    res.status(201).json({
      success: true,
      message: 'Note saved successfully.',
      data: newNote
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const { note, page, tags } = req.body;
    const target = await Note.findOne(query);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (note) target.note = note.trim();
    if (page !== undefined) target.page = Number(page);
    if (tags) target.tags = tags;

    await target.save();

    res.json({
      success: true,
      message: 'Note updated.',
      data: target
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const deleted = await Note.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    res.json({
      success: true,
      message: 'Note deleted.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

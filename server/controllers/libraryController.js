const Library = require('../models/Library');
const Book = require('../models/Book');
const User = require('../models/User');

// GET /api/library
exports.getUserLibrary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { shelf, favorite } = req.query;

    let query = { userId };
    if (shelf) query.shelf = shelf;
    if (favorite === 'true') query.isFavorite = true;

    const entries = await Library.find(query);

    // Enrich with book details
    const bookIds = entries.map(e => e.bookId);
    const books = await Book.find({ id: { $in: bookIds } });
    const bookMap = {};
    books.forEach(b => { bookMap[b.id] = b; });

    const enriched = entries.map(entry => {
      const book = bookMap[entry.bookId] || null;
      return {
        ...entry.toObject(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          genre: book.genre,
          totalPages: book.totalPages,
          rating: book.rating
        } : null
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/library/:bookId
exports.updateLibraryEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const bookId = Number(req.params.bookId);
    const { shelf, currentPage, isFavorite, rating, notes } = req.body;

    const book = await Book.findOne({ id: bookId });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    let entry = await Library.findOne({ userId, bookId });
    const today = new Date().toISOString().split('T')[0];

    if (!entry) {
      entry = new Library({
        userId,
        bookId,
        shelf: shelf || 'want',
        currentPage: currentPage || 0,
        isFavorite: isFavorite || false,
        startDate: shelf === 'reading' ? today : null,
        completedDate: shelf === 'read' ? today : null
      });
    } else {
      if (shelf) {
        if (shelf === 'reading' && entry.shelf !== 'reading') {
          entry.startDate = today;
        }
        if (shelf === 'read' && entry.shelf !== 'read') {
          entry.completedDate = today;
          entry.currentPage = book.totalPages;
        }
        entry.shelf = shelf;
      }

      if (currentPage !== undefined) {
        entry.currentPage = Math.min(Number(currentPage), book.totalPages);
        if (entry.currentPage >= book.totalPages) {
          entry.shelf = 'read';
          entry.completedDate = today;
        }
      }

      if (isFavorite !== undefined) entry.isFavorite = isFavorite;
      if (rating !== undefined) entry.rating = rating;
      if (notes !== undefined) entry.notes = notes;
    }

    await entry.save();

    res.json({
      success: true,
      message: 'Library shelf updated successfully.',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/library/:bookId
exports.removeLibraryEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const bookId = Number(req.params.bookId);

    const deleted = await Library.findOneAndDelete({ userId, bookId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Entry not found in user library.' });
    }

    res.json({
      success: true,
      message: 'Book removed from library.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reading-progress
exports.getReadingProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const readingEntries = await Library.find({ userId, shelf: 'reading' });

    const bookIds = readingEntries.map(e => e.bookId);
    const books = await Book.find({ id: { $in: bookIds } });
    const bookMap = {};
    books.forEach(b => { bookMap[b.id] = b; });

    const progressList = readingEntries.map(entry => {
      const book = bookMap[entry.bookId] || {};
      const totalPages = book.totalPages || 300;
      const currentPage = entry.currentPage || 0;
      const percentage = Math.min(100, Math.round((currentPage / totalPages) * 100));

      return {
        bookId: entry.bookId,
        title: book.title || 'Unknown Title',
        author: book.author || 'Unknown Author',
        coverImage: book.coverImage || 'images/books/silent-orchard.jpg',
        currentPage,
        totalPages,
        percentage,
        isFavorite: entry.isFavorite,
        startDate: entry.startDate
      };
    });

    res.json({
      success: true,
      count: progressList.length,
      data: progressList
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reading-progress/:bookId
exports.updateReadingProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const bookId = Number(req.params.bookId);
    const { currentPage } = req.body;

    if (currentPage === undefined) {
      return res.status(400).json({ success: false, message: 'currentPage is required.' });
    }

    const book = await Book.findOne({ id: bookId });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    let entry = await Library.findOne({ userId, bookId });
    const today = new Date().toISOString().split('T')[0];

    const targetPage = Math.max(0, Math.min(Number(currentPage), book.totalPages));

    if (!entry) {
      entry = new Library({
        userId,
        bookId,
        shelf: targetPage >= book.totalPages ? 'read' : 'reading',
        currentPage: targetPage,
        startDate: today,
        completedDate: targetPage >= book.totalPages ? today : null
      });
    } else {
      entry.currentPage = targetPage;
      if (targetPage >= book.totalPages) {
        entry.shelf = 'read';
        entry.completedDate = today;
      } else if (entry.shelf !== 'reading') {
        entry.shelf = 'reading';
      }
    }

    await entry.save();

    // Increment user's pagesRead
    await User.findOneAndUpdate(
      { userId },
      { $inc: { pagesRead: Math.max(0, targetPage) } }
    );

    const percentage = Math.min(100, Math.round((entry.currentPage / book.totalPages) * 100));

    res.json({
      success: true,
      message: 'Reading progress updated.',
      data: {
        bookId: entry.bookId,
        currentPage: entry.currentPage,
        totalPages: book.totalPages,
        percentage,
        shelf: entry.shelf
      }
    });
  } catch (error) {
    next(error);
  }
};

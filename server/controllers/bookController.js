const Book = require('../models/Book');

// GET /api/books
exports.getAllBooks = async (req, res, next) => {
  try {
    const { search, genre, rating, minPages, maxPages, featured, popular, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'all' && genre !== 'All Genres') {
      query.genre = { $regex: `^${genre}$`, $options: 'i' };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (minPages || maxPages) {
      query.totalPages = {};
      if (minPages) query.totalPages.$gte = Number(minPages);
      if (maxPages) query.totalPages.$lte = Number(maxPages);
    }

    if (featured !== undefined) {
      query.featured = featured === 'true' || featured === true;
    }

    if (popular !== undefined) {
      query.popular = popular === 'true' || popular === true;
    }

    let sortOptions = { id: 1 };
    if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'title') sortOptions = { title: 1 };
    else if (sort === 'year') sortOptions = { publicationYear: -1 };
    else if (sort === 'pages_asc') sortOptions = { totalPages: 1 };
    else if (sort === 'pages_desc') sortOptions = { totalPages: -1 };

    const books = await Book.find(query).sort(sortOptions);
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let book = null;

    if (!isNaN(idParam)) {
      book = await Book.findOne({ id: Number(idParam) });
    } else if (idParam.length === 24) {
      book = await Book.findById(idParam);
    }

    // Also support title-based lookup / slug lookup
    if (!book) {
      const slugTitle = idParam.replace(/-/g, ' ');
      book = await Book.findOne({
        title: { $regex: `^${slugTitle}$`, $options: 'i' }
      });
    }

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with identifier: ${idParam}`
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books (admin)
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, genre, coverImage, description, publicationYear, totalPages, rating, reviewCount } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and Author are required.'
      });
    }

    // Auto-generate next numeric id
    const lastBook = await Book.findOne().sort({ id: -1 });
    const nextId = (lastBook && lastBook.id) ? lastBook.id + 1 : 1;

    const newBook = new Book({
      id: nextId,
      title: title.trim(),
      author: author.trim(),
      genre: genre || 'Fiction',
      coverImage: coverImage || 'images/books/silent-orchard.jpg',
      description: description || '',
      publicationYear: publicationYear || new Date().getFullYear(),
      totalPages: totalPages || 300,
      rating: rating || 4.5,
      reviewCount: reviewCount || 0
    });

    await newBook.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      data: newBook
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books/:id (admin)
exports.updateBook = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const updatedBook = await Book.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully.',
      data: updatedBook
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/books/:id (admin)
exports.deleteBook = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const deletedBook = await Book.findOneAndDelete(query);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully.',
      data: deletedBook
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books/:id/unlock
exports.unlockBook = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let book = null;
    if (!isNaN(idParam)) {
      book = await Book.findOne({ id: Number(idParam) });
    } else if (idParam.length === 24) {
      book = await Book.findById(idParam);
    }
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    const questId = book.unlockTask?.id || `quest_book_${book.id}`;
    const rewardXP = book.rewardXP || 100;
    const badge = book.rewardBadge || null;

    let userUpdated = null;
    if (req.user) {
      const user = req.user;
      if (!user.unlockedBooks) user.unlockedBooks = [];
      if (!user.claimedQuests) user.claimedQuests = [];

      const alreadyUnlocked = user.unlockedBooks.includes(book.id);
      if (!alreadyUnlocked) {
        user.unlockedBooks.push(book.id);
      }
      if (!user.claimedQuests.includes(questId)) {
        user.claimedQuests.push(questId);
        user.xp = (user.xp || 0) + rewardXP;
        user.level = Math.floor(user.xp / 200) + 1;
      }
      await user.save();
      userUpdated = user;
    }

    res.json({
      success: true,
      message: `Successfully unlocked ${book.title}! Earned +${rewardXP} XP!`,
      bookId: book.id,
      questId,
      rewardXP,
      rewardBadge: badge,
      user: userUpdated
    });
  } catch (error) {
    next(error);
  }
};

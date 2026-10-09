const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');

// GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const { bookId, userId, rating, sort } = req.query;
    let query = {};

    if (bookId) query.bookId = Number(bookId);
    if (userId) query.userId = Number(userId);
    if (rating) query.overallRating = Number(rating);

    let sortOption = { createdAt: -1 };
    if (sort === 'top' || sort === 'helpful') sortOption = { likes: -1 };
    if (sort === 'highest') sortOption = { overallRating: -1 };
    if (sort === 'lowest') sortOption = { overallRating: 1 };

    const reviews = await Review.find(query).sort(sortOption);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/:id
exports.getReviewById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const review = await Review.findOne(query);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { bookId, bookTitle, overallRating, categoryRatings, reviewText, hasSpoiler, spoilerText } = req.body;
    const userId = req.user.userId;

    if (!bookId || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'bookId and reviewText are required.'
      });
    }

    // Check book exists
    const book = await Book.findOne({ id: Number(bookId) });
    const title = book ? book.title : (bookTitle || 'Book');

    // Auto-generate numeric id
    const lastRev = await Review.findOne().sort({ id: -1 });
    const nextId = (lastRev && lastRev.id) ? lastRev.id + 1 : 1;

    const newReview = new Review({
      id: nextId,
      bookId: Number(bookId),
      bookTitle: title,
      userId,
      userName: req.user.name,
      userUsername: req.user.username,
      userAvatar: req.user.avatar || 'U',
      overallRating: overallRating ? Number(overallRating) : 5,
      categoryRatings: categoryRatings || {
        story: 5,
        characters: 5,
        writing: 5,
        pacing: 5,
        worldBuilding: 5
      },
      reviewText: reviewText.trim(),
      hasSpoiler: hasSpoiler || false,
      spoilerText: spoilerText || '',
      likes: 0,
      likedBy: [],
      date: new Date().toISOString().split('T')[0]
    });

    await newReview.save();

    // Update Book review count and average rating
    if (book) {
      const allReviewsForBook = await Review.find({ bookId: book.id });
      const avgRating = allReviewsForBook.reduce((acc, r) => acc + r.overallRating, 0) / allReviewsForBook.length;
      book.rating = Math.round(avgRating * 10) / 10;
      book.reviewCount = allReviewsForBook.length;
      await book.save();
    }

    // Award XP and increment review count for user
    await User.findOneAndUpdate(
      { userId },
      { $inc: { reviewsCount: 1, xp: 50 } }
    );

    res.status(201).json({
      success: true,
      message: 'Review posted successfully (+50 XP)!',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const review = await Review.findOne(query);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Check ownership or admin
    if (review.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this review.' });
    }

    const { overallRating, categoryRatings, reviewText, hasSpoiler, spoilerText } = req.body;
    if (overallRating !== undefined) review.overallRating = Number(overallRating);
    if (categoryRatings) review.categoryRatings = categoryRatings;
    if (reviewText) review.reviewText = reviewText.trim();
    if (hasSpoiler !== undefined) review.hasSpoiler = hasSpoiler;
    if (spoilerText !== undefined) review.spoilerText = spoilerText;

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const review = await Review.findOne(query);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review.' });
    }

    await Review.deleteOne(query);

    res.json({
      success: true,
      message: 'Review deleted successfully.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews/:id/like
exports.toggleLikeReview = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const review = await Review.findOne(query);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const index = review.likedBy.indexOf(userId);
    let liked = false;

    if (index === -1) {
      review.likedBy.push(userId);
      review.likes = (review.likes || 0) + 1;
      liked = true;
    } else {
      review.likedBy.splice(index, 1);
      review.likes = Math.max(0, (review.likes || 1) - 1);
      liked = false;
    }

    await review.save();

    res.json({
      success: true,
      message: liked ? 'Review liked.' : 'Like removed.',
      data: {
        likes: review.likes,
        isLiked: liked
      }
    });
  } catch (error) {
    next(error);
  }
};

const Book = require('../models/Book');
const Library = require('../models/Library');

// GET /api/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    let genre = 'Fiction';
    let readBookIds = [];

    if (req.user) {
      genre = req.user.favoriteGenre || 'Fiction';
      const userShelves = await Library.find({ userId: req.user.userId });
      readBookIds = userShelves.map(s => s.bookId);
    }

    // Books matching user's favorite genre not yet in library
    let recommendations = await Book.find({
      genre: { $regex: `^${genre}$`, $options: 'i' },
      id: { $nin: readBookIds }
    }).limit(4);

    if (recommendations.length < 4) {
      const more = await Book.find({
        id: { $nin: [...readBookIds, ...recommendations.map(b => b.id)] }
      }).sort({ rating: -1 }).limit(4 - recommendations.length);

      recommendations = [...recommendations, ...more];
    }

    // Tamil classics (IDs 13-18, 20, 22, 24, 25, 26 or isTamil: true)
    const tamilBooks = await Book.find({
      $or: [
        { isTamil: true },
        { id: { $in: [13, 14, 15, 16, 17, 18, 20, 22, 24, 25, 26] } }
      ]
    }).sort({ rating: -1 });

    // Hall of fame (5-star books)
    const hallOfFame = await Book.find({ rating: { $gte: 4.8 } }).sort({ reviewCount: -1 }).limit(4);

    res.json({
      success: true,
      genreBasis: genre,
      count: recommendations.length,
      data: recommendations,
      tamilClassics: tamilBooks,
      hallOfFame: hallOfFame
    });
  } catch (error) {
    next(error);
  }
};

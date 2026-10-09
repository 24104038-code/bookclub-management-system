const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  bookId: {
    type: Number,
    required: true,
    index: true
  },
  shelf: {
    type: String,
    enum: ['reading', 'want', 'read', 'dnf', 'favorites', 'none'],
    default: 'want'
  },
  currentPage: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 300
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: String,
    default: null
  },
  completedDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

librarySchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('Library', librarySchema);

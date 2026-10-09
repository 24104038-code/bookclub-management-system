const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Number,
    required: true,
    index: true,
    default: 1
  },
  bookId: {
    type: Number,
    required: true,
    index: true
  },
  bookTitle: {
    type: String,
    trim: true
  },
  bookAuthor: {
    type: String,
    trim: true
  },
  quote: {
    type: String,
    required: [true, 'Quote text is required']
  },
  page: {
    type: Number,
    default: 1
  },
  color: {
    type: String,
    default: '#E9C6A5'
  },
  userNote: {
    type: String,
    default: ''
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  sharedToGroup: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Highlight', highlightSchema);

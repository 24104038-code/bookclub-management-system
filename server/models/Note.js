const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  page: {
    type: Number,
    default: 1
  },
  note: {
    type: String,
    required: [true, 'Note content is required']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);

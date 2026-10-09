const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
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
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  mood: {
    type: String,
    default: '😊'
  },
  moodLabel: {
    type: String,
    default: 'Satisfied'
  },
  pagesRead: {
    type: Number,
    default: 0
  },
  thoughts: {
    type: String,
    required: [true, 'Journal thoughts are required']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Journal', journalSchema);

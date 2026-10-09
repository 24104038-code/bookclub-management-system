const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  bookId: {
    type: Number,
    required: true,
    index: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  bookAuthor: {
    type: String,
    default: ''
  },
  userId: {
    type: Number,
    default: 1,
    index: true
  },
  user: {
    type: String,
    default: 'Reader'
  },
  userName: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: 'reader'
  },
  userUsername: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'R'
  },
  userAvatar: {
    type: String,
    default: 'R'
  },
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categoryRatings: {
    story: { type: Number, default: 5 },
    characters: { type: Number, default: 5 },
    writing: { type: Number, default: 5 },
    pacing: { type: Number, default: 4 },
    worldBuilding: { type: Number, default: 4 }
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required']
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  },
  likes: {
    type: Number,
    default: 0
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  likedBy: [{
    type: Number
  }],
  hasSpoiler: {
    type: Boolean,
    default: false
  },
  spoilerText: {
    type: String,
    default: ''
  },
  reports: [{
    userId: Number,
    reason: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);

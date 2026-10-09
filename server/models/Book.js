const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    index: true
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  description: {
    type: String,
    default: ''
  },
  publicationYear: {
    type: Number,
    default: 2024
  },
  totalPages: {
    type: Number,
    default: 300
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  swatchClass: {
    type: String,
    default: 'swatch-1'
  },
  accentColor: {
    type: String,
    default: '#B5652F'
  },
  gradient: {
    type: String,
    default: 'linear-gradient(160deg, #B5652F, #7A4E2D)'
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  recommendedReason: {
    type: String,
    default: 'Recommended for avid readers.'
  },
  title_ta: { type: String, default: '' },
  title_hi: { type: String, default: '' },
  title_es: { type: String, default: '' },
  author_ta: { type: String, default: '' },
  author_hi: { type: String, default: '' },
  genre_ta: { type: String, default: '' },
  genre_hi: { type: String, default: '' },
  description_ta: { type: String, default: '' },
  description_hi: { type: String, default: '' },
  description_es: { type: String, default: '' },
  recommendedReason_ta: { type: String, default: '' },
  recommendedReason_hi: { type: String, default: '' },
  isLocked: { type: Boolean, default: false },
  questTier: { type: String, default: null },
  rewardXP: { type: Number, default: 0 },
  rewardBadge: { type: String, default: null },
  unlockTask: { type: Object, default: null }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Book', bookSchema);

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Number,
    default: 1,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  type: {
    type: String,
    default: 'Books per year'
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'books'
  },
  percentage: {
    type: Number,
    default: 0
  },
  deadline: {
    type: String,
    default: '2026-12-31'
  },
  daysRemaining: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    default: 'In Progress'
  },
  color: {
    type: String,
    default: '#B5652F'
  },
  completedDate: {
    type: String,
    default: null
  },
  achievementBadge: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);

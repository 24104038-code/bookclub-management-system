const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  key: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  status: {
    type: String,
    enum: ['unlocked', 'in_progress', 'locked'],
    default: 'locked'
  },
  dateUnlocked: {
    type: String,
    default: null
  },
  progress: {
    type: String,
    default: null
  },
  xp: {
    type: Number,
    default: 100
  },
  userId: {
    type: Number,
    index: true,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);

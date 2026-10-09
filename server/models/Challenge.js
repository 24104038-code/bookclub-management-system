const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  target: { type: Number, default: 5 },
  unit: { type: String, default: 'books' },
  progress: { type: Number, default: 0 },
  participantsCount: { type: Number, default: 0 },
  daysRemaining: { type: Number, default: 30 },
  rewardXp: { type: Number, default: 500 },
  badgeName: { type: String, default: 'Sprint Finisher' },
  badgeIcon: { type: String, default: '⚡' },
  joined: { type: Boolean, default: false },
  participants: [{
    userId: Number,
    name: String,
    progress: { type: Number, default: 0 },
    status: { type: String, default: 'In Progress' }
  }],
  rules: [String],
  timeline: [{
    step: String,
    desc: String,
    completed: { type: Boolean, default: false }
  }],
  leaderboard: [{
    rank: Number,
    name: String,
    books: Number,
    avatar: String,
    status: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);

const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
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
  target: { type: Number, default: 400 },
  unit: { type: String, default: 'pages' },
  deadline: String,
  daysRemaining: { type: Number, default: 15 },
  prize: String,
  badgeName: String,
  badgeIcon: String,
  participants: { type: Number, default: 0 },
  coverGradient: { type: String, default: 'linear-gradient(135deg, #7A4E2D, #B08A3E)' },
  joined: { type: Boolean, default: false },
  rank: { type: Number, default: 4 },
  rules: [String],
  podium: [{
    rank: Number,
    name: String,
    score: Number,
    avatar: String,
    title: String
  }],
  leaderboard: [{
    rank: Number,
    name: String,
    pages: Number,
    avatar: String,
    streak: Number
  }],
  participantsList: [{
    userId: Number,
    name: String,
    progress: { type: Number, default: 0 },
    rank: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Competition', competitionSchema);

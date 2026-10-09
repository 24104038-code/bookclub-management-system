const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Number,
    index: true,
    default: 1
  },
  user: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'U'
  },
  avatarBg: {
    type: String,
    default: 'var(--clay)'
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  targetTitle: {
    type: String,
    required: true
  },
  targetLink: {
    type: String,
    default: '#'
  },
  time: {
    type: String,
    default: 'Just now'
  },
  details: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);

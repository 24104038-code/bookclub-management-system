const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    default: 'system'
  },
  icon: {
    type: String,
    default: '🔔'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: 'Just now'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: '#'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);

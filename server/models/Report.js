const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Review', 'Discussion', 'Comment', 'User', 'Book', 'Group', 'Event', 'Other']
  },
  targetTitle: {
    type: String,
    required: true
  },
  reportedItemSnippet: {
    type: String,
    default: ''
  },
  reportedAuthor: {
    type: String,
    default: 'Anonymous'
  },
  reportedBy: {
    type: String,
    required: true
  },
  reportedById: {
    type: Number,
    index: true,
    default: null
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  resolution: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);

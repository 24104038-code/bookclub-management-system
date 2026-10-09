const mongoose = require('mongoose');

const nestedReplySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  author: String,
  username: String,
  avatar: String,
  userId: Number,
  timeAgo: { type: String, default: 'Just now' },
  likes: { type: Number, default: 0 },
  likedBy: [Number],
  content: { type: String, required: true }
}, { _id: false });

const replySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  author: String,
  username: String,
  avatar: String,
  userId: Number,
  timeAgo: { type: String, default: 'Just now' },
  likes: { type: Number, default: 0 },
  likedBy: [Number],
  content: { type: String, required: true },
  nestedReplies: [nestedReplySchema]
}, { _id: false });

const discussionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    index: true
  },
  bookTag: {
    type: String,
    default: 'General Topic'
  },
  bookId: {
    type: Number,
    default: null
  },
  author: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'R'
  },
  userId: {
    type: Number,
    default: 1
  },
  timeAgo: {
    type: String,
    default: 'Just now'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [Number],
  content: {
    type: String,
    required: [true, 'Discussion content is required']
  },
  hasSpoiler: {
    type: Boolean,
    default: false
  },
  spoilerContent: {
    type: String,
    default: ''
  },
  replies: [replySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Discussion', discussionSchema);

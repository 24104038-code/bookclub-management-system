const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: Number,
    required: true,
    index: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderAvatar: {
    type: String,
    default: 'U'
  },
  recipientId: {
    type: Number,
    index: true,
    default: null
  },
  recipientName: {
    type: String,
    default: ''
  },
  groupId: {
    type: Number,
    index: true,
    default: null
  },
  groupName: {
    type: String,
    default: ''
  },
  channelType: {
    type: String,
    enum: ['direct', 'group', 'whatsapp_sync', 'announcement'],
    default: 'direct'
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true
  },
  bookAttachment: {
    bookId: { type: Number, default: null },
    title: { type: String, default: '' },
    author: { type: String, default: '' },
    coverImage: { type: String, default: '' }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  viaPlatform: {
    type: String,
    enum: ['in_app', 'whatsapp', 'whatsapp_sync', 'sms'],
    default: 'in_app'
  }
}, {
  timestamps: true
});

messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  email: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  method: {
    type: String,
    enum: ['local', 'google', 'phone'],
    default: 'local'
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  loginAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);

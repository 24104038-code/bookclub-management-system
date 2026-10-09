const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically removed by MongoDB after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model('Otp', otpSchema);

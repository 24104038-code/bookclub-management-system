const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  type: {
    type: String,
    default: 'Book Club Meeting'
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: '6:00 PM'
  },
  day: {
    type: String,
    default: '15'
  },
  month: {
    type: String,
    default: 'Oct'
  },
  location: {
    type: String,
    default: 'Online Salon'
  },
  organizer: {
    type: String,
    default: 'Community Host'
  },
  organizerRole: {
    type: String,
    default: 'Host'
  },
  organizerAvatar: {
    type: String,
    default: 'H'
  },
  participants: {
    type: Number,
    default: 1
  },
  maxSeats: {
    type: Number,
    default: 30
  },
  coverGradient: {
    type: String,
    default: 'linear-gradient(135deg, #16291F, #4C6A50)'
  },
  description: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: 'https://meet.bookclub.internal/salon'
  },
  rules: [{
    type: String
  }],
  schedule: [{
    time: String,
    activity: String
  }],
  rsvpd: {
    type: Boolean,
    default: false
  },
  attendanceStatus: {
    type: String,
    default: 'Confirmed'
  },
  rsvps: [{
    userId: Number,
    name: String,
    email: String,
    rsvpdAt: { type: Date, default: Date.now }
  }],
  tasks: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    required: { type: Boolean, default: true }
  }],
  taskCompletions: [{
    userId: Number,
    taskId: String,
    completedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

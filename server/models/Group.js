const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    default: 'Fiction'
  },
  privacy: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  membersCount: {
    type: Number,
    default: 1
  },
  maxMembers: {
    type: Number,
    default: 25
  },
  currentBookId: {
    type: Number,
    default: 1
  },
  meetingSchedule: {
    type: String,
    default: 'Every Saturday'
  },
  meetingTime: {
    type: String,
    default: '6:00 PM'
  },
  location: {
    type: String,
    default: 'Online Community Salon'
  },
  organizerId: {
    type: Number,
    default: 1
  },
  organizerName: {
    type: String,
    default: 'Organizer'
  },
  activityLevel: {
    type: String,
    default: 'Active'
  },
  coverGradient: {
    type: String,
    default: 'linear-gradient(135deg, #16291F, #4C6A50)'
  },
  discussionsCount: {
    type: Number,
    default: 0
  },
  eventsCount: {
    type: Number,
    default: 0
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  members: [{
    userId: Number,
    name: String,
    role: { type: String, default: 'Member' },
    progress: { type: Number, default: 0 },
    avatar: String
  }],
  pastBooks: [{
    id: Number,
    title: String,
    author: String,
    completedDate: String
  }],
  upcomingBooks: [{
    id: Number,
    title: String,
    author: String,
    startDate: String
  }],
  poll: {
    question: String,
    active: { type: Boolean, default: true },
    totalVotes: { type: Number, default: 0 },
    userVotedOptionId: { type: Number, default: null },
    options: [{
      id: Number,
      bookId: Number,
      title: String,
      author: String,
      votes: { type: Number, default: 0 }
    }]
  },
  meetingPoll: {
    question: String,
    active: { type: Boolean, default: true },
    totalVotes: { type: Number, default: 0 },
    userVotedOptionId: { type: Number, default: null },
    options: [{
      id: Number,
      text: String,
      votes: { type: Number, default: 0 }
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  userId: {
    type: Number,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['event', 'challenge'],
    default: 'event',
    index: true
  },
  // Event Association
  eventId: {
    type: Number,
    index: true,
    default: null
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  // Challenge Association
  challengeId: {
    type: Number,
    index: true,
    default: null
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  participantName: {
    type: String,
    required: true,
    trim: true
  },
  participantEmail: {
    type: String,
    trim: true
  },
  // Event specific fields
  eventName: {
    type: String,
    trim: true,
    default: ''
  },
  eventDate: {
    type: String,
    default: ''
  },
  eventLocation: {
    type: String,
    default: 'Online Salon'
  },
  // Challenge specific fields
  challengeTitle: {
    type: String,
    trim: true,
    default: ''
  },
  targetRequirement: {
    type: String,
    trim: true,
    default: ''
  },
  badgeName: {
    type: String,
    trim: true,
    default: ''
  },
  badgeIcon: {
    type: String,
    default: '⚡'
  },
  rewardXp: {
    type: Number,
    default: 500
  },
  // Issuer & Authority
  organizerName: {
    type: String,
    default: 'BookClub Lead Organizer'
  },
  organizerRole: {
    type: String,
    default: 'Lead Event Host'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  certificateStatement: {
    type: String,
    default: 'For successfully completing all requirements and active reading participation.'
  },
  status: {
    type: String,
    enum: ['valid', 'revoked'],
    default: 'valid'
  },
  tasksCompleted: [{
    taskId: String,
    taskTitle: String,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Partial unique indexes so users can earn certificates for multiple challenges and events without null collisions
certificateSchema.index(
  { userId: 1, eventId: 1 },
  { unique: true, partialFilterExpression: { eventId: { $type: 'number' } } }
);

certificateSchema.index(
  { userId: 1, challengeId: 1 },
  { unique: true, partialFilterExpression: { challengeId: { $type: 'number' } } }
);

module.exports = mongoose.model('Certificate', certificateSchema);


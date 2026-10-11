const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    sparse: true,
    trim: true,
    default: null
  },
  googleId: {
    type: String,
    sparse: true,
    trim: true,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'phone'],
    default: 'local'
  },
  password: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['user', 'member', 'organizer', 'admin'],
    default: 'user'
  },
  favoriteGenre: {
    type: String,
    default: 'Fiction'
  },
  bio: {
    type: String,
    default: 'Avid book lover exploring stories and community discussions.'
  },
  avatar: {
    type: String,
    default: 'U'
  },
  profileImage: {
    type: String,
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 100
  },
  streak: {
    type: Number,
    default: 1
  },
  booksRead: {
    type: Number,
    default: 0
  },
  pagesRead: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  unlockedBooks: {
    type: [Number],
    default: []
  },
  claimedQuests: {
    type: [String],
    default: []
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Pre-save password hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

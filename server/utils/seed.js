const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Library = require('../models/Library');
const Group = require('../models/Group');
const Event = require('../models/Event');
const Review = require('../models/Review');
const Discussion = require('../models/Discussion');
const Goal = require('../models/Goal');
const Challenge = require('../models/Challenge');
const Competition = require('../models/Competition');
const Note = require('../models/Note');
const Highlight = require('../models/Highlight');
const Journal = require('../models/Journal');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Report = require('../models/Report');
const Achievement = require('../models/Achievement');

// Import mock data
const MOCK_BOOKS = require('../../js/data/books');
const MOCK_USERS = require('../../js/data/users');
const MOCK_GROUPS = require('../../js/data/groups');
const MOCK_EVENTS = require('../../js/data/events');
const MOCK_REVIEWS = require('../../js/data/reviews');
const MOCK_DISCUSSIONS = require('../../js/data/discussions');
const { MOCK_GOALS, MOCK_COMPLETED_GOALS } = require('../../js/data/goals');
const MOCK_CHALLENGES = require('../../js/data/challenges');
const MOCK_COMPETITIONS = require('../../js/data/competitions');
const { MOCK_NOTES, MOCK_HIGHLIGHTS } = require('../../js/data/notes');
const MOCK_JOURNAL = require('../../js/data/journal');
const MOCK_NOTIFICATIONS = require('../../js/data/notifications');
const MOCK_ACTIVITIES = require('../../js/data/activities');
const MOCK_REPORTS = require('../../js/data/reports');
const { MOCK_ACHIEVEMENTS } = require('../../js/data/leaderboards');

const DEFAULT_LIBRARY_ENTRIES = [
  { userId: 1, bookId: 1, shelf: 'reading', currentPage: 192, isFavorite: true, startDate: '2026-07-02' },
  { userId: 1, bookId: 2, shelf: 'reading', currentPage: 96, isFavorite: true, startDate: '2026-07-18' },
  { userId: 1, bookId: 3, shelf: 'read', currentPage: 280, isFavorite: true, completedDate: '2026-06-05' },
  { userId: 1, bookId: 4, shelf: 'reading', currentPage: 352, isFavorite: true, startDate: '2026-06-25' },
  { userId: 1, bookId: 5, shelf: 'want', currentPage: 0, isFavorite: false },
  { userId: 1, bookId: 6, shelf: 'read', currentPage: 360, isFavorite: false, completedDate: '2026-04-24' },
  { userId: 1, bookId: 10, shelf: 'want', currentPage: 0, isFavorite: false },
  { userId: 1, bookId: 11, shelf: 'want', currentPage: 0, isFavorite: false },
  // Also seed for demo user 7 (Elena Ramos)
  { userId: 7, bookId: 1, shelf: 'reading', currentPage: 192, isFavorite: true, startDate: '2026-07-02' },
  { userId: 7, bookId: 2, shelf: 'reading', currentPage: 96, isFavorite: true, startDate: '2026-07-18' },
  { userId: 7, bookId: 3, shelf: 'read', currentPage: 280, isFavorite: true, completedDate: '2026-06-05' },
  { userId: 7, bookId: 4, shelf: 'want', currentPage: 0, isFavorite: false }
];

const USERNAME_TO_USER_ID = {
  'admin': 1,
  'user': 7,
  'jordanreads': 2,
  'aditi_k': 3,
  'rahul_t': 4,
  'meera_j': 5,
  'sampark': 6
};

async function seedDatabase(force = false) {
  try {
    console.log('--- Checking Database Seeding Status ---');

    // 1. Seed Books
    for (const b of MOCK_BOOKS) {
      await Book.findOneAndUpdate({ id: b.id }, { $set: b }, { upsert: true, new: true });
    }
    console.log(`✓ Synchronized ${MOCK_BOOKS.length} books in database.`);

    // 2. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0 || force) {
      if (force) await User.deleteMany({});
      for (const u of MOCK_USERS) {
        const newUser = new User({ ...u });
        await newUser.save();
      }
      console.log(`✓ Seeded ${MOCK_USERS.length} users with hashed credentials.`);
    }

    // 3. Seed Library
    const libraryCount = await Library.countDocuments();
    if (libraryCount === 0 || force) {
      if (force) await Library.deleteMany({});
      await Library.insertMany(DEFAULT_LIBRARY_ENTRIES);
      console.log(`✓ Seeded ${DEFAULT_LIBRARY_ENTRIES.length} initial shelf entries.`);
    }

    // 4. Seed Groups
    const groupCount = await Group.countDocuments();
    if (groupCount === 0 || force) {
      if (force) await Group.deleteMany({});
      await Group.insertMany(MOCK_GROUPS);
      console.log(`✓ Seeded ${MOCK_GROUPS.length} reading groups.`);
    }

    // 5. Seed Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0 || force) {
      if (force) await Event.deleteMany({});
      await Event.insertMany(MOCK_EVENTS);
      console.log(`✓ Seeded ${MOCK_EVENTS.length} events.`);
    }

    // 6. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 || force) {
      if (force) await Review.deleteMany({});
      const reviewsWithUserId = MOCK_REVIEWS.map(r => ({
        ...r,
        userId: r.userId || USERNAME_TO_USER_ID[r.username] || 1,
        user: r.user || 'Reader',
        userName: r.user || 'Reader',
        username: r.username || 'reader',
        userUsername: r.username || 'reader',
        avatar: r.avatar || 'R',
        userAvatar: r.avatar || 'R'
      }));
      await Review.insertMany(reviewsWithUserId);
      console.log(`✓ Seeded ${reviewsWithUserId.length} reviews.`);
    }

    // 7. Seed Discussions
    const discussionCount = await Discussion.countDocuments();
    if (discussionCount === 0 || force) {
      if (force) await Discussion.deleteMany({});
      await Discussion.insertMany(MOCK_DISCUSSIONS);
      console.log(`✓ Seeded ${MOCK_DISCUSSIONS.length} discussions.`);
    }

    // 8. Seed Goals
    const goalCount = await Goal.countDocuments();
    if (goalCount === 0 || force) {
      if (force) await Goal.deleteMany({});
      const combinedGoals = [
        ...(MOCK_GOALS || []).map(g => ({ ...g, userId: 1 })),
        ...(MOCK_COMPLETED_GOALS || []).map(g => ({ ...g, userId: 1 }))
      ];
      await Goal.insertMany(combinedGoals);
      console.log(`✓ Seeded ${combinedGoals.length} goals.`);
    }

    // 9. Seed Challenges
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0 || force) {
      if (force) await Challenge.deleteMany({});
      await Challenge.insertMany(MOCK_CHALLENGES);
      console.log(`✓ Seeded ${MOCK_CHALLENGES.length} challenges.`);
    }

    // 10. Seed Competitions
    const compCount = await Competition.countDocuments();
    if (compCount === 0 || force) {
      if (force) await Competition.deleteMany({});
      await Competition.insertMany(MOCK_COMPETITIONS);
      console.log(`✓ Seeded ${MOCK_COMPETITIONS.length} competitions.`);
    }

    // 11. Seed Notes
    const noteCount = await Note.countDocuments();
    if (noteCount === 0 || force) {
      if (force) await Note.deleteMany({});
      await Note.insertMany(MOCK_NOTES);
      console.log(`✓ Seeded ${MOCK_NOTES.length} notes.`);
    }

    // 12. Seed Highlights
    const highlightCount = await Highlight.countDocuments();
    if (highlightCount === 0 || force) {
      if (force) await Highlight.deleteMany({});
      await Highlight.insertMany(MOCK_HIGHLIGHTS);
      console.log(`✓ Seeded ${MOCK_HIGHLIGHTS.length} highlights.`);
    }

    // 13. Seed Journal
    const journalCount = await Journal.countDocuments();
    if (journalCount === 0 || force) {
      if (force) await Journal.deleteMany({});
      await Journal.insertMany(MOCK_JOURNAL);
      console.log(`✓ Seeded ${MOCK_JOURNAL.length} journal logs.`);
    }

    // 14. Seed Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0 || force) {
      if (force) await Notification.deleteMany({});
      await Notification.insertMany(MOCK_NOTIFICATIONS);
      console.log(`✓ Seeded ${MOCK_NOTIFICATIONS.length} notifications.`);
    }

    // 15. Seed Activities
    const actCount = await Activity.countDocuments();
    if (actCount === 0 || force) {
      if (force) await Activity.deleteMany({});
      await Activity.insertMany(MOCK_ACTIVITIES);
      console.log(`✓ Seeded ${MOCK_ACTIVITIES.length} activities.`);
    }

    // 16. Seed Reports
    const reportCount = await Report.countDocuments();
    if (reportCount === 0 || force) {
      if (force) await Report.deleteMany({});
      await Report.insertMany(MOCK_REPORTS);
      console.log(`✓ Seeded ${MOCK_REPORTS.length} reports.`);
    }

    // 17. Seed Achievements
    const achCount = await Achievement.countDocuments();
    if (achCount === 0 || force) {
      if (force) await Achievement.deleteMany({});
      const achievementsWithKeys = (MOCK_ACHIEVEMENTS || []).map(a => ({
        ...a,
        key: a.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
      }));
      await Achievement.insertMany(achievementsWithKeys);
      console.log(`✓ Seeded ${achievementsWithKeys.length} achievements.`);
    }

    console.log('--- Database Seeding Complete ---');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

module.exports = seedDatabase;

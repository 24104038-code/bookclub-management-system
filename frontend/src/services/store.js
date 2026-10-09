import BookClubAPI from './api.js';
import MOCK_BOOKS from '../data/books.js';
import MOCK_GROUPS from '../data/groups.js';
import MOCK_EVENTS from '../data/events.js';
import MOCK_CHALLENGES from '../data/challenges.js';
import MOCK_COMPETITIONS from '../data/competitions.js';
import MOCK_REVIEWS from '../data/reviews.js';
import MOCK_DISCUSSIONS from '../data/discussions.js';
import MOCK_GOALS from '../data/goals.js';
import MOCK_NOTES from '../data/notes.js';
import MOCK_HIGHLIGHTS from '../data/highlights.js';
import MOCK_JOURNAL from '../data/journal.js';
import MOCK_NOTIFICATIONS from '../data/notifications.js';
import MOCK_ACTIVITIES from '../data/activities.js';
import MOCK_REPORTS from '../data/reports.js';
import MOCK_LEADERBOARDS from '../data/leaderboards.js';
import MOCK_USERS from '../data/users.js';

function getAuthUser() {
  try {
    const raw = localStorage.getItem('bookclub_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/* =========================================================
   BOOKCLUB — Central Data Store & LocalStorage Manager
   Provides a clean, API-ready abstraction for all frontend state.
   ========================================================= */

const BookClubStore = (function () {
  const KEYS = {
    BOOKS: 'bookclub_books_data',
    LIBRARY: 'bookclub_library_shelves',
    GROUPS: 'bookclub_groups_data',
    EVENTS: 'bookclub_events_data',
    CHALLENGES: 'bookclub_challenges_data',
    COMPETITIONS: 'bookclub_competitions_data',
    REVIEWS: 'bookclub_reviews_data',
    DISCUSSIONS: 'bookclub_discussions_data',
    GOALS: 'bookclub_goals_data',
    NOTES: 'bookclub_notes_data',
    HIGHLIGHTS: 'bookclub_highlights_data',
    JOURNAL: 'bookclub_journal_data',
    NOTIFICATIONS: 'bookclub_notifications_data',
    ACTIVITIES: 'bookclub_activities_data',
    REPORTS: 'bookclub_reports_data',
    CERTIFICATES: 'bookclub_certificates_data',
    USER_PROGRESS: 'bookclub_user_progress',
    TRACKED_EVENTS: 'bookclub_tracked_events_data',
    UNLOCKED_BOOKS: 'bookclub_unlocked_books',
    CLAIMED_QUESTS: 'bookclub_claimed_quests'
  };

  // Initial user shelf distribution
  const DEFAULT_LIBRARY = {
    // bookId: { shelf: 'reading' | 'want' | 'read' | 'dnf' | 'favorites', currentPage: number, isFavorite: boolean }
    1: { shelf: 'reading', currentPage: 192, isFavorite: true, startDate: '2026-07-02' },
    2: { shelf: 'reading', currentPage: 96, isFavorite: true, startDate: '2026-07-18' },
    3: { shelf: 'read', currentPage: 280, isFavorite: true, completedDate: '2026-06-05' },
    4: { shelf: 'reading', currentPage: 352, isFavorite: true, startDate: '2026-06-25' },
    5: { shelf: 'want', currentPage: 0, isFavorite: false },
    6: { shelf: 'read', currentPage: 360, isFavorite: false, completedDate: '2026-04-24' },
    10: { shelf: 'want', currentPage: 0, isFavorite: false },
    11: { shelf: 'want', currentPage: 0, isFavorite: false }
  };

  function initStore() {
    if (!localStorage.getItem(KEYS.BOOKS) && typeof MOCK_BOOKS !== 'undefined') {
      localStorage.setItem(KEYS.BOOKS, JSON.stringify(MOCK_BOOKS));
    } else if (localStorage.getItem(KEYS.BOOKS) && typeof MOCK_BOOKS !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(KEYS.BOOKS)) || [];
        const bookMap = new Map();
        // First index stored items
        stored.forEach(b => {
          if (b && b.id) bookMap.set(b.id, b);
        });
        // Synchronize with fresh canonical MOCK_BOOKS
        MOCK_BOOKS.forEach(mb => {
          if (!bookMap.has(mb.id)) {
            bookMap.set(mb.id, mb);
          } else {
            const existing = bookMap.get(mb.id);
            existing.coverImage = mb.coverImage;
            existing.isTamil = mb.isTamil;
            if (mb.title_ta) existing.title_ta = mb.title_ta;
            if (mb.author_ta) existing.author_ta = mb.author_ta;
            if (mb.genre_ta) existing.genre_ta = mb.genre_ta;
            if (mb.description_ta) existing.description_ta = mb.description_ta;
            if (mb.isLocked !== undefined) existing.isLocked = mb.isLocked;
            if (mb.questTier) existing.questTier = mb.questTier;
            if (mb.rewardXP) existing.rewardXP = mb.rewardXP;
            if (mb.rewardBadge) existing.rewardBadge = mb.rewardBadge;
            if (mb.unlockTask) existing.unlockTask = mb.unlockTask;
          }
        });
        const deduplicated = Array.from(bookMap.values()).sort((a, b) => a.id - b.id);
        localStorage.setItem(KEYS.BOOKS, JSON.stringify(deduplicated));
      } catch (e) {
        localStorage.setItem(KEYS.BOOKS, JSON.stringify(MOCK_BOOKS));
      }
    }
    if (!localStorage.getItem(KEYS.UNLOCKED_BOOKS)) {
      localStorage.setItem(KEYS.UNLOCKED_BOOKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.CLAIMED_QUESTS)) {
      localStorage.setItem(KEYS.CLAIMED_QUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.USER_PROGRESS)) {
      localStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify({
        xp: 150,
        level: 1,
        streak: 3,
        badges: []
      }));
    }
    if (!localStorage.getItem(KEYS.LIBRARY)) {
      localStorage.setItem(KEYS.LIBRARY, JSON.stringify(DEFAULT_LIBRARY));
    }
    if (!localStorage.getItem(KEYS.GROUPS) && typeof MOCK_GROUPS !== 'undefined') {
      localStorage.setItem(KEYS.GROUPS, JSON.stringify(MOCK_GROUPS));
    }
    if (!localStorage.getItem(KEYS.EVENTS) && typeof MOCK_EVENTS !== 'undefined') {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
    }
    if (!localStorage.getItem(KEYS.CHALLENGES) && typeof MOCK_CHALLENGES !== 'undefined') {
      localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(MOCK_CHALLENGES));
    }
    if (!localStorage.getItem(KEYS.COMPETITIONS) && typeof MOCK_COMPETITIONS !== 'undefined') {
      localStorage.setItem(KEYS.COMPETITIONS, JSON.stringify(MOCK_COMPETITIONS));
    }
    if (!localStorage.getItem(KEYS.REVIEWS) && typeof MOCK_REVIEWS !== 'undefined') {
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(MOCK_REVIEWS));
    }
    if (!localStorage.getItem(KEYS.DISCUSSIONS) && typeof MOCK_DISCUSSIONS !== 'undefined') {
      localStorage.setItem(KEYS.DISCUSSIONS, JSON.stringify(MOCK_DISCUSSIONS));
    }
    if (!localStorage.getItem(KEYS.GOALS) && typeof MOCK_GOALS !== 'undefined') {
      localStorage.setItem(KEYS.GOALS, JSON.stringify(MOCK_GOALS));
    }
    if (!localStorage.getItem(KEYS.NOTES) && typeof MOCK_NOTES !== 'undefined') {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(MOCK_NOTES));
    }
    if (!localStorage.getItem(KEYS.HIGHLIGHTS) && typeof MOCK_HIGHLIGHTS !== 'undefined') {
      localStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(MOCK_HIGHLIGHTS));
    }
    if (!localStorage.getItem(KEYS.JOURNAL) && typeof MOCK_JOURNAL !== 'undefined') {
      localStorage.setItem(KEYS.JOURNAL, JSON.stringify(MOCK_JOURNAL));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS) && typeof MOCK_NOTIFICATIONS !== 'undefined') {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
    }
    if (!localStorage.getItem(KEYS.ACTIVITIES) && typeof MOCK_ACTIVITIES !== 'undefined') {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(MOCK_ACTIVITIES));
    }
    if (!localStorage.getItem(KEYS.REPORTS) && typeof MOCK_REPORTS !== 'undefined') {
      localStorage.setItem(KEYS.REPORTS, JSON.stringify(MOCK_REPORTS));
    }
    if (!localStorage.getItem(KEYS.CERTIFICATES) || JSON.parse(localStorage.getItem(KEYS.CERTIFICATES) || '[]').length === 0) {
      const defaultCerts = [
        {
          certificateId: 'BC-CHG-2026-000001',
          userId: 1,
          type: 'challenge',
          challengeId: 1,
          participantName: 'Jordan Rivera',
          participantEmail: 'reader@bookclub.internal',
          challengeTitle: 'Read 5 Books This Month',
          targetRequirement: '5 books',
          badgeName: 'Sprint Finisher',
          badgeIcon: '⚡',
          rewardXp: 500,
          eventName: 'Read 5 Books This Month',
          eventDate: 'Monthly Target Achieved',
          eventLocation: 'Book Forge Reading Guild',
          organizerName: 'Sarah Jenkins',
          organizerRole: 'Challenge Curator & Reading Lead',
          issueDate: new Date().toISOString(),
          verificationCode: 'CRT-FINISHER-7729',
          certificateStatement: 'For outstanding dedication, intellectual vigor, and successfully completing all milestones for the "Read 5 Books This Month" reading quest.',
          status: 'valid'
        }
      ];
      localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(defaultCerts));
    }
  }

  function getRaw(key, fallback) {
    initStore();
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setRaw(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('BookClubStore write error', e);
    }
  }

  /* ---------- Books & Library ---------- */
  function getBooks() {
    const raw = getRaw(KEYS.BOOKS, typeof MOCK_BOOKS !== 'undefined' ? MOCK_BOOKS : []);
    const seen = new Set();
    const unique = [];
    raw.forEach(b => {
      if (b && b.id && !seen.has(b.id)) {
        seen.add(b.id);
        unique.push(b);
      }
    });
    return unique;
  }

  function getBookById(idOrSlug) {
    if (idOrSlug == null) return null;
    const books = getBooks();
    
    // 1. Numeric ID
    const num = Number(idOrSlug);
    if (!isNaN(num) && num > 0) {
      const byId = books.find(b => b.id === num);
      if (byId) return byId;
    }

    // 2. Exact Title match (case-insensitive)
    const str = String(idOrSlug).trim().toLowerCase();
    const byTitle = books.find(b => b.title.toLowerCase() === str);
    if (byTitle) return byTitle;

    // 3. Slug match: e.g. "winters-ledger" matches "Winter's Ledger"
    const normalize = s => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const targetSlug = normalize(str);
    const bySlug = books.find(b => normalize(b.title) === targetSlug);
    if (bySlug) return bySlug;

    return null;
  }

  function getLibraryMap() {
    return getRaw(KEYS.LIBRARY, DEFAULT_LIBRARY);
  }

  function getBookUserStatus(bookId) {
    const lib = getLibraryMap();
    return lib[bookId] || { shelf: null, currentPage: 0, isFavorite: false };
  }

  function setBookShelf(bookId, shelf) {
    bookId = Number(bookId);
    if (isBookLocked(bookId)) {
      return null;
    }
    const lib = getLibraryMap();
    if (!lib[bookId]) {
      const b = getBookById(bookId);
      lib[bookId] = { shelf: shelf, currentPage: 0, isFavorite: false, totalPages: b ? b.totalPages : 300 };
    } else {
      lib[bookId].shelf = shelf;
    }
    if (shelf === 'read') {
      const b = getBookById(bookId);
      lib[bookId].currentPage = b ? b.totalPages : lib[bookId].currentPage;
      lib[bookId].completedDate = new Date().toISOString().split('T')[0];
    }
    setRaw(KEYS.LIBRARY, lib);
    addActivity({
      action: shelf === 'read' ? 'completed' : 'updated_shelf',
      targetType: 'book',
      targetTitle: (getBookById(bookId) || {}).title || 'Book',
      targetLink: `book-details.html?id=${bookId}`,
      details: `Moved to '${shelf.toUpperCase()}' shelf.`
    });

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.library.updateShelf(bookId, {
        shelf,
        currentPage: lib[bookId].currentPage,
        isFavorite: lib[bookId].isFavorite
      }).catch(err => console.warn('[Library API Sync]:', err));
    }

    return lib[bookId];
  }

  function toggleBookFavorite(bookId) {
    bookId = Number(bookId);
    const lib = getLibraryMap();
    if (!lib[bookId]) {
      lib[bookId] = { shelf: 'want', currentPage: 0, isFavorite: true };
    } else {
      lib[bookId].isFavorite = !lib[bookId].isFavorite;
    }
    setRaw(KEYS.LIBRARY, lib);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.library.updateShelf(bookId, {
        isFavorite: lib[bookId].isFavorite
      }).catch(err => console.warn('[Favorite API Sync]:', err));
    }

    return lib[bookId].isFavorite;
  }

  function updateBookProgress(bookId, newPage) {
    bookId = Number(bookId);
    newPage = Number(newPage);
    const lib = getLibraryMap();
    const book = getBookById(bookId);
    const total = book ? book.totalPages : 300;
    newPage = Math.max(0, Math.min(newPage, total));

    if (!lib[bookId]) {
      lib[bookId] = { shelf: 'reading', currentPage: newPage, isFavorite: false };
    } else {
      lib[bookId].currentPage = newPage;
      if (newPage >= total) {
        lib[bookId].shelf = 'read';
        lib[bookId].completedDate = new Date().toISOString().split('T')[0];
      } else if (lib[bookId].shelf !== 'reading') {
        lib[bookId].shelf = 'reading';
      }
    }
    setRaw(KEYS.LIBRARY, lib);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.library.updateProgress(bookId, newPage).catch(err => console.warn('[Progress API Sync]:', err));
    }

    return { current: newPage, total: total, percentage: Math.round((newPage / total) * 100) };
  }

  function getLibraryShelves() {
    const books = getBooks();
    const lib = getLibraryMap();
    const shelves = {
      reading: [],
      want: [],
      read: [],
      dnf: [],
      favorites: []
    };

    books.forEach(b => {
      const meta = lib[b.id];
      if (meta && meta.shelf && shelves[meta.shelf]) {
        shelves[meta.shelf].push({
          ...b,
          currentPage: meta.currentPage || 0,
          percentage: Math.round(((meta.currentPage || 0) / b.totalPages) * 100),
          isFavorite: !!meta.isFavorite,
          userShelf: meta.shelf
        });
      }
      if (meta && meta.isFavorite) {
        shelves.favorites.push({
          ...b,
          currentPage: meta.currentPage || 0,
          percentage: Math.round(((meta.currentPage || 0) / b.totalPages) * 100),
          isFavorite: true,
          userShelf: meta.shelf || 'want'
        });
      }
    });
    return shelves;
  }

  /* ---------- User Stats ---------- */
  function getUserProgress() {
    return getRaw(KEYS.USER_PROGRESS, {
      xp: 150,
      level: 1,
      streak: 3,
      badges: []
    });
  }

  function addXP(amount, badgeName) {
    const progress = getUserProgress();
    progress.xp = (progress.xp || 0) + (amount || 0);
    progress.level = Math.floor(progress.xp / 200) + 1;
    if (badgeName) {
      if (!progress.badges) progress.badges = [];
      if (!progress.badges.includes(badgeName)) {
        progress.badges.push(badgeName);
      }
    }
    setRaw(KEYS.USER_PROGRESS, progress);
    return progress;
  }

  function getUserStats() {
    const shelves = getLibraryShelves();
    let pagesRead = 0;
    const lib = getLibraryMap();
    Object.values(lib).forEach(entry => {
      pagesRead += (entry.currentPage || 0);
    });
    const progress = getUserProgress();

    return {
      booksRead: shelves.read.length,
      currentlyReading: shelves.reading.length,
      wantToRead: shelves.want.length,
      pagesRead: pagesRead > 0 ? pagesRead : 65,
      streak: progress.streak || 3,
      level: progress.level || Math.floor((progress.xp || 150) / 200) + 1,
      xp: progress.xp || 150,
      xpToNextLevel: ((progress.level || Math.floor((progress.xp || 150) / 200) + 1) * 200),
      goalAnnual: 50,
      goalCurrent: shelves.read.length + 12,
      badges: progress.badges || []
    };
  }

  /* ---------- Groups ---------- */
  function getGroups() {
    return getRaw(KEYS.GROUPS, typeof MOCK_GROUPS !== 'undefined' ? MOCK_GROUPS : []);
  }

  function getGroupById(id) {
    id = Number(id);
    return getGroups().find(g => g.id === id) || null;
  }

  function joinGroup(groupId) {
    groupId = Number(groupId);
    const groups = getGroups();
    const g = groups.find(x => x.id === groupId);
    if (!g) return false;
    const user = getAuthUser();
    const userName = user ? user.name : 'Reader';
    const hasJoined = (g.members || []).some(m => m.name === userName);

    if (hasJoined) {
      g.members = g.members.filter(m => m.name !== userName);
      g.membersCount = Math.max(0, g.membersCount - 1);
    } else {
      g.members = g.members || [];
      g.members.push({ userId: user ? user.userId : 0, name: userName, role: 'Member', progress: 0, avatar: user ? user.avatar || 'U' : 'U' });
      g.membersCount += 1;
      addActivity({
        action: 'joined_group',
        targetType: 'group',
        targetTitle: g.name,
        targetLink: `group-details.html?id=${g.id}`,
        details: 'Became an active member.'
      });
    }
    setRaw(KEYS.GROUPS, groups);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.groups.toggleJoin(groupId).catch(err => console.warn('[Group Join Sync]:', err));
    }

    return !hasJoined;
  }

  function voteGroupPoll(groupId, pollType, optionId) {
    groupId = Number(groupId);
    optionId = Number(optionId);
    const groups = getGroups();
    const g = groups.find(x => x.id === groupId);
    if (!g) return null;

    const poll = pollType === 'meeting' ? g.meetingPoll : g.poll;
    if (!poll) return null;

    let optIdx = 0;
    poll.options.forEach((opt, idx) => {
      if (opt.id === optionId) {
        opt.votes = (opt.votes || 0) + 1;
        optIdx = idx;
      }
    });
    poll.totalVotes = (poll.totalVotes || 0) + 1;
    poll.userVotedOptionId = optionId;
    setRaw(KEYS.GROUPS, groups);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.groups.votePoll(groupId, optIdx).catch(err => console.warn('[Group Vote Sync]:', err));
    }

    return poll;
  }

  function createGroup(data) {
    const groups = getGroups();
    const newId = groups.reduce((m, g) => Math.max(m, g.id), 0) + 1;
    const user = getAuthUser();
    const newGroup = {
      id: newId,
      name: data.name,
      description: data.description,
      genre: data.genre || 'Fiction',
      privacy: data.privacy || 'Public',
      membersCount: 1,
      maxMembers: Number(data.maxMembers) || 20,
      currentBookId: Number(data.currentBookId) || 1,
      meetingSchedule: data.meetingSchedule || 'Every Saturday',
      meetingTime: data.meetingTime || '6:00 PM',
      location: data.location || 'Online Community Salon',
      organizerId: user ? user.userId : 1,
      organizerName: user ? user.name : 'Organizer',
      activityLevel: 'New',
      coverGradient: 'linear-gradient(135deg, #16291F, #4C6A50)',
      discussionsCount: 0,
      eventsCount: 0,
      progressPercent: 0,
      members: [
        { userId: user ? user.userId : 1, name: user ? user.name : 'Organizer', role: 'Organizer', progress: 0, avatar: user ? user.avatar || 'O' : 'O' }
      ]
    };
    groups.unshift(newGroup);
    setRaw(KEYS.GROUPS, groups);
    addActivity({
      action: 'created_group',
      targetType: 'group',
      targetTitle: newGroup.name,
      targetLink: `group-details.html?id=${newGroup.id}`,
      details: `Created new reading group for ${newGroup.genre}.`
    });
    return newGroup;
  }

  /* ---------- Events ---------- */
  function getEvents() {
    return getRaw(KEYS.EVENTS, typeof MOCK_EVENTS !== 'undefined' ? MOCK_EVENTS : []);
  }

  function getEventById(id) {
    id = Number(id);
    return getEvents().find(e => e.id === id) || null;
  }

  function toggleRSVP(eventId) {
    eventId = Number(eventId);
    const events = getEvents();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return false;
    ev.rsvpd = !ev.rsvpd;
    ev.participants += ev.rsvpd ? 1 : -1;
    ev.attendanceStatus = ev.rsvpd ? 'Confirmed' : 'Open';
    setRaw(KEYS.EVENTS, events);

    if (ev.rsvpd) {
      addActivity({
        action: 'rsvp_event',
        targetType: 'event',
        targetTitle: ev.title,
        targetLink: `event-details.html?id=${ev.id}`,
        details: `Reserved a seat for ${ev.date} at ${ev.time}.`
      });
    }

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.events.toggleRSVP(eventId).catch(err => console.warn('[Event RSVP Sync]:', err));
    }

    return ev.rsvpd;
  }

  function createEvent(data) {
    const events = getEvents();
    const newId = events.reduce((m, e) => Math.max(m, e.id), 0) + 1;
    const user = getAuthUser();
    const d = new Date(data.date || Date.now());
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });

    const newEv = {
      id: newId,
      title: data.title,
      type: data.type || 'Book Club Meeting',
      date: data.date,
      time: data.time || '6:00 PM',
      day: day,
      month: month,
      location: data.location || 'Online Salon',
      organizer: user ? user.name : 'Community Host',
      organizerRole: 'Host',
      organizerAvatar: user ? (user.avatar || 'H') : 'H',
      participants: 1,
      maxSeats: Number(data.maxSeats) || 30,
      coverGradient: 'linear-gradient(135deg, #16291F, #4C6A50)',
      description: data.description,
      meetingLink: data.meetingLink || 'https://meet.bookclub.internal/salon',
      rules: ['Respect speaker turns', 'Keep microphones muted when not talking'],
      schedule: [{ time: data.time || '6:00 PM', activity: 'Event Kickoff & Discussion' }],
      rsvpd: true,
      attendanceStatus: 'Confirmed'
    };
    events.unshift(newEv);
    setRaw(KEYS.EVENTS, events);
    return newEv;
  }

  /* ---------- Event & Gathering Tracking (WhatsApp / Email / ICS) ---------- */
  function getTrackedEvents() {
    return getRaw(KEYS.TRACKED_EVENTS, {});
  }

  function getTrackingStatus(type, id) {
    const key = `${type}_${id}`;
    const all = getTrackedEvents();
    return all[key] || { whatsapp: false, email: false };
  }

  function trackGatheringOrEvent(params) {
    const { type, id, method, contact, details } = params;
    const key = `${type}_${id}`;
    const all = getTrackedEvents();
    const current = all[key] || { whatsapp: false, email: false };

    if (method === 'whatsapp' || method === 'both') {
      current.whatsapp = true;
      if (contact) current.phone = contact;
    }
    if (method === 'email' || method === 'both') {
      current.email = true;
      if (contact) current.emailAddress = contact;
    }
    current.updatedAt = new Date().toISOString();
    current.title = details ? details.title : (type === 'group' ? 'Group Gathering' : 'Club Event');
    all[key] = current;
    setRaw(KEYS.TRACKED_EVENTS, all);

    const titleStr = details && details.title ? details.title : (type === 'group' ? 'Reading Circle' : 'Event');
    addActivity({
      action: 'tracked_event',
      targetType: type,
      targetTitle: titleStr,
      targetLink: type === 'group' ? `/groups/${id}` : `/events/${id}`,
      details: `Tracking event updates via ${method === 'both' ? 'WhatsApp & Email' : (method === 'whatsapp' ? 'WhatsApp' : 'Email')}.`
    });

    if (typeof BookClubAPI !== 'undefined') {
      if (type === 'group' && BookClubAPI.groups && BookClubAPI.groups.trackEvent) {
        BookClubAPI.groups.trackEvent(id, { method, contact, eventDetails: details }).catch(e => console.warn('[Track Sync]:', e));
      } else if (type === 'event' && BookClubAPI.events && BookClubAPI.events.track) {
        BookClubAPI.events.track(id, { method, contact, eventDetails: details }).catch(e => console.warn('[Track Sync]:', e));
      }
    }

    return current;
  }

  function formatWhatsAppEventText(info) {
    const groupName = info.groupName || 'Reading Circle';
    const title = info.title || 'Weekly Gathering';
    const schedule = info.schedule || 'Upcoming Session';
    const time = info.time || '5:00 PM';
    const location = info.location || 'Community Salon & Online';
    const bookTitle = info.bookTitle || '';
    const bookAuthor = info.bookAuthor || '';
    const milestone = info.milestone || 'Chapters 12–15 before session';
    const hostName = info.hostName || info.organizerName || 'Guild Host';
    const memberName = info.memberName || info.userName || 'Reader';
    const offer = info.offer || '+150 Bonus XP & Verified Attendance Badge for checked-in attendees';
    const trackingCode = info.trackingCode || `BF-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const url = info.url || (typeof window !== 'undefined' ? window.location.href : '');

    return [
      `📦 *BOOK FORGE · OFFICIAL HOST EVENT & OFFER ALERT*`,
      `*(Verified Automated WhatsApp Notification)*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Hello *${memberName}*! 👋`,
      ``,
      `You are actively tracking live sessions with host *${hostName}* for:`,
      `📚 *Circle:* ${groupName} — ${title}`,
      ``,
      `⚡ *GATHERING SCHEDULE & VENUE:*`,
      `🗓️ *Date & Time:* ${schedule} · ${time}`,
      `📍 *Location:* ${location}`,
      bookTitle ? `📖 *Featured Book:* ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}` : '',
      `🎯 *Discussion Focus:* ${milestone}`,
      ``,
      `🎁 *EXCLUSIVE GUILD OFFER & PERK:*`,
      `🔥 *Event Perk:* ${offer}`,
      ``,
      url ? `🔗 *Live Portal & Session Link:* ${url}?trk=${trackingCode}` : '',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ *Tracking ID:* ${trackingCode}`,
      `_Automated notification dispatched by Host via Book Forge WhatsApp Hub._`
    ].filter(Boolean).join('\n');
  }

  function openWhatsAppTracker(text, phone) {
    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '';
    let url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return url;
  }

  function dispatchHostWhatsAppNotification(groupId, options = {}) {
    const group = getGroupById(groupId) || { name: 'Reading Circle', organizerName: 'Guild Host' };
    const user = getAuthUser();
    const hostName = options.hostName || group.organizerName || 'Host';
    const memberName = options.memberName || (user ? user.name : 'Jordan Rivera');
    const phone = options.phone || (user ? user.phone : '919876543210');
    const offer = options.offer || '+150 Bonus XP & Verified Attendance Badge';
    const title = options.title || 'Official Gathering & Live Offer Alert';
    const schedule = options.schedule || group.meetingSchedule || group.schedule || 'Every Saturday 5:00 PM';
    const location = options.location || group.location || 'Cafe Solace & Live Stream';
    const curBook = getBookById(group.currentBookId) || { title: 'Selected Title', author: '' };

    const trackingCode = `BF-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const text = formatWhatsAppEventText({
      groupName: group.name,
      title,
      schedule,
      time: group.meetingTime || '5:00 PM',
      location,
      bookTitle: curBook.title,
      bookAuthor: curBook.author,
      milestone: options.milestone || 'Chapter Discussion & Guild Check-in',
      hostName,
      memberName,
      offer,
      trackingCode,
      url: typeof window !== 'undefined' ? `${window.location.origin}/groups/${group.id}` : ''
    });

    // Save tracking state
    trackGatheringOrEvent({
      type: 'group',
      id: group.id,
      method: 'whatsapp',
      contact: phone,
      details: { title: `${group.name} - ${title}`, hostName, trackingCode, offer }
    });

    // Record notification in user's in-app feed
    addNotification({
      type: 'whatsapp',
      title: `📲 WhatsApp Alert from Host ${hostName}`,
      message: `Automatic alert for ${group.name}: ${offer}. Dispatched to +${phone}.`,
      link: `/groups/${group.id}`
    });

    // Broadcast live event in browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bookforge_host_whatsapp_alert', {
          detail: {
            groupName: group.name,
            hostName,
            memberName,
            phone,
            offer,
            text,
            trackingCode,
            time: 'Just now'
          }
        })
      );
    }

    return { text, phone, trackingCode };
  }

  function formatGroupWhatsAppEventText(info) {
    const groupName = info.groupName || 'Reading Circle';
    const title = info.title || 'Weekly Gathering';
    const schedule = info.schedule || 'Upcoming Session';
    const time = info.time || '5:00 PM';
    const location = info.location || 'Community Salon & Online';
    const bookTitle = info.bookTitle || '';
    const bookAuthor = info.bookAuthor || '';
    const milestone = info.milestone || 'Chapters 12–15 before session';
    const hostName = info.hostName || info.organizerName || 'Guild Host';
    const membersList = info.membersList || ['All Circle Members'];
    const count = info.memberCount || (Array.isArray(membersList) ? membersList.length : 5);
    const offer = info.offer || '+150 Bonus XP, Attendance Badge & Chapter Discussion Pass';
    const trackingCode = info.trackingCode || `BF-GRP-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const url = info.url || (typeof window !== 'undefined' ? window.location.href : '');

    return [
      `📦 *BOOK FORGE · OFFICIAL GROUP GATHERING BROADCAST*`,
      `*(Automated Host Announcement to All Group Members)*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👑 *Host Dispatcher:* ${hostName} (Circle Lead)`,
      `👥 *Broadcast Target:* All ${count} Confirmed Group Members`,
      `👥 *Recipients:* ${Array.isArray(membersList) ? membersList.slice(0, 8).join(', ') : membersList}${count > 8 ? ` +${count - 8} more` : ''}`,
      ``,
      `Hello readers! 👋 Host *${hostName}* has triggered an automated gathering alert for your circle:`,
      `📚 *Circle:* ${groupName} — ${title}`,
      ``,
      `⚡ *GATHERING SCHEDULE & VENUE:*`,
      `🗓️ *Date & Time:* ${schedule} · ${time}`,
      `📍 *Location:* ${location}`,
      bookTitle ? `📖 *Featured Book:* ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}` : '',
      `🎯 *Group Milestone Target:* ${milestone}`,
      ``,
      `🎁 *EXCLUSIVE GROUP EVENT OFFER (All Attending Members):*`,
      `🔥 *Member Reward:* ${offer}`,
      `✨ *Amazon-Style Pass:* Verified attendance unlocks double XP & guild certificates!`,
      ``,
      url ? `🔗 *Join Group Salon & Live Discussions:* ${url}?batch=${trackingCode}` : '',
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ *Group Broadcast Tracking ID:* ${trackingCode}`,
      `_Automated multi-member broadcast sent to all ${count} circle members via Book Forge WhatsApp Hub._`
    ].filter(Boolean).join('\n');
  }

  function dispatchGroupWhatsAppNotification(groupId, options = {}) {
    const group = getGroupById(groupId) || { name: 'Reading Circle', organizerName: 'Guild Host', members: [] };
    const user = getAuthUser();
    const hostName = options.hostName || group.organizerName || group.organizer || 'Host';
    const members = (options.members && options.members.length > 0) ? options.members : (group.members && group.members.length > 0 ? group.members : [
      { name: 'Aditi Krishnan', role: 'Host', phone: '919876543210' },
      { name: 'Jordan Rivera', role: 'Member', phone: '919840122345' },
      { name: 'Rahul Thomas', role: 'Member', phone: '919123456789' },
      { name: 'Meera Joseph', role: 'Member', phone: '919442188301' },
      { name: 'Sam Park', role: 'Member', phone: '919789011223' },
      { name: user ? user.name : 'Srimuthuvel', role: 'Member', phone: '919876543210' }
    ]);
    const memberNames = members.map(m => m.name || m);
    const count = memberNames.length;
    const offer = options.offer || '+150 Bonus XP, Attendance Badge & Discussion Pass for all members';
    const title = options.title || 'Weekly Salon';
    const schedule = options.schedule || group.meetingSchedule || group.schedule || 'Every Saturday 5:00 PM';
    const location = options.location || group.location || 'Community Library Hall & Online';
    const curBook = getBookById(group.currentBookId) || { title: 'Selected Title', author: '' };

    const trackingCode = `BF-GRP-${group.id}-${Date.now().toString().slice(-5)}`;

    const text = formatGroupWhatsAppEventText({
      groupName: group.name,
      title,
      schedule,
      time: group.meetingTime || '5:00 PM',
      location,
      bookTitle: curBook.title,
      bookAuthor: curBook.author,
      milestone: options.milestone || 'Chapter Discussion & Guild Check-in',
      hostName,
      membersList: memberNames,
      memberCount: count,
      offer,
      trackingCode,
      url: typeof window !== 'undefined' ? `${window.location.origin}/groups/${group.id}` : ''
    });

    // Save tracking state for group
    trackGatheringOrEvent({
      type: 'group',
      id: group.id,
      method: 'whatsapp',
      contact: `${count} Group Members`,
      details: { title: `${group.name} - Group Broadcast`, hostName, trackingCode, offer, memberCount: count }
    });

    // Add in-app notification
    addNotification({
      type: 'whatsapp',
      title: `📢 WhatsApp Group Alert from Host ${hostName}`,
      message: `Automated group alert dispatched to all ${count} members of ${group.name} with offer: ${offer}.`,
      link: `/groups/${group.id}`
    });

    // Broadcast live event in browser for toast
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bookforge_host_whatsapp_alert', {
          detail: {
            groupName: group.name,
            hostName,
            memberName: `All ${count} Members (${memberNames.slice(0, 3).join(', ')}...)`,
            phone: `Group of ${count} Members`,
            offer,
            text,
            trackingCode,
            isGroupBroadcast: true,
            memberCount: count,
            time: 'Just now'
          }
        })
      );
    }

    return { text, count, memberNames, trackingCode, members };
  }

  function downloadICSFile(info) {
    const title = info.title || 'BookClub Event';
    const description = info.description || 'BookClub gathering session';
    const location = info.location || 'Community Salon & Online';
    const filename = (info.filename || 'bookclub-event').replace(/[^a-zA-Z0-9_-]/g, '_');

    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookForge//BookClub Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${filename}-${Date.now()}@bookclub.internal`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${nowStr}`,
      `SUMMARY:${title.replace(/[\r\n]+/g, ' ')}`,
      `DESCRIPTION:${description.replace(/[\r\n]+/g, ' ')}`,
      `LOCATION:${location.replace(/[\r\n]+/g, ' ')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Upcoming BookClub Gathering for ${title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    if (typeof window !== 'undefined') {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return icsContent;
  }

  /* ---------- Challenges & Competitions ---------- */
  function getChallenges() {
    return getRaw(KEYS.CHALLENGES, typeof MOCK_CHALLENGES !== 'undefined' ? MOCK_CHALLENGES : []);
  }

  function getChallengeById(id) {
    id = Number(id);
    return getChallenges().find(c => c.id === id) || null;
  }

  function toggleJoinChallenge(id) {
    id = Number(id);
    const challenges = getChallenges();
    const ch = challenges.find(c => c.id === id);
    if (!ch) return false;
    ch.joined = !ch.joined;
    ch.participantsCount += ch.joined ? 1 : -1;
    setRaw(KEYS.CHALLENGES, challenges);
    if (ch.joined) {
      addActivity({
        action: 'joined_challenge',
        targetType: 'challenge',
        targetTitle: ch.title,
        targetLink: `challenge-details.html?id=${ch.id}`,
        details: `Committed to reach ${ch.target} ${ch.unit}.`
      });
    }

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.challenges.toggleJoin(id).catch(err => console.warn('[Challenge Join Sync]:', err));
    }

    return ch.joined;
  }

  function updateChallengeProgress(id, progress) {
    id = Number(id);
    const challenges = getChallenges();
    const ch = challenges.find(c => c.id === id);
    if (!ch) return null;
    ch.progress = Math.max(0, Number(progress));
    ch.joined = true;
    if (ch.progress >= ch.target) {
      if (ch.timeline) ch.timeline.forEach(t => t.completed = true);
    }
    setRaw(KEYS.CHALLENGES, challenges);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.challenges.updateProgress(id, ch.progress).catch(err => console.warn('[Challenge Progress Sync]:', err));
    }
    return ch;
  }

  function completeChallenge(id) {
    id = Number(id);
    const challenges = getChallenges();
    const ch = challenges.find(c => c.id === id);
    if (!ch) return null;
    ch.progress = ch.target;
    ch.joined = true;
    if (ch.timeline) {
      ch.timeline.forEach(t => t.completed = true);
    }
    setRaw(KEYS.CHALLENGES, challenges);

    addActivity({
      action: 'completed_challenge',
      targetType: 'challenge',
      targetTitle: ch.title,
      targetLink: `challenge-details.html?id=${ch.id}`,
      details: `Completed reading target of ${ch.target} ${ch.unit} and earned ${ch.badgeName} (${ch.badgeIcon})!`
    });

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.challenges.complete(id).catch(err => console.warn('[Challenge Complete Sync]:', err));
    }
    return ch;
  }

  function generateChallengeCertificate(id, customParticipantName) {
    id = Number(id);
    const challenges = getChallenges();
    const ch = challenges.find(c => c.id === id);
    if (!ch) return null;

    const user = getAuthUser();
    const pName = customParticipantName || (user ? user.name : 'Jordan Rivera');
    const existing = getCertificates().find(c => c.challengeId === id);
    if (existing) {
      if (customParticipantName && existing.participantName !== customParticipantName) {
        existing.participantName = customParticipantName;
        addCertificate(existing);
      }
      return existing;
    }

    const year = new Date().getFullYear();
    const certCount = getCertificates().length;
    const certId = `BC-CHG-${year}-${String(certCount + 1).padStart(6, '0')}`;
    const code = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    const newCert = {
      certificateId: certId,
      userId: user ? (user.id || user.userId || 1) : 1,
      type: 'challenge',
      challengeId: ch.id,
      participantName: pName,
      participantEmail: user ? user.email : 'reader@bookclub.internal',
      challengeTitle: ch.title,
      targetRequirement: `${ch.target} ${ch.unit}`,
      badgeName: ch.badgeName || 'Sprint Finisher',
      badgeIcon: ch.badgeIcon || '⚡',
      rewardXp: ch.rewardXp || 500,
      eventName: ch.title,
      eventDate: `Target: ${ch.target} ${ch.unit}`,
      eventLocation: 'BookClub Reading Quest',
      organizerName: 'Sarah Jenkins',
      organizerRole: 'Challenge Curator & Reading Lead',
      issueDate: new Date().toISOString(),
      verificationCode: code,
      certificateStatement: `For outstanding reading dedication and successfully completing the "${ch.title}" challenge (${ch.target} ${ch.unit}) and earning the ${ch.badgeName} badge.`,
      status: 'valid'
    };

    addCertificate(newCert);

    addActivity({
      action: 'earned_certificate',
      targetType: 'certificate',
      targetTitle: `Certificate: ${ch.title}`,
      targetLink: `challenge-details.html?id=${ch.id}`,
      details: `Awarded credential ID: ${certId} for challenge completion.`
    });

    return newCert;
  }

  function getCompetitions() {
    return getRaw(KEYS.COMPETITIONS, typeof MOCK_COMPETITIONS !== 'undefined' ? MOCK_COMPETITIONS : []);
  }

  function getCompetitionById(id) {
    id = Number(id);
    return getCompetitions().find(c => c.id === id) || null;
  }

  function toggleJoinCompetition(id) {
    id = Number(id);
    const comps = getCompetitions();
    const cp = comps.find(c => c.id === id);
    if (!cp) return false;
    cp.joined = !cp.joined;
    cp.participants += cp.joined ? 1 : -1;
    setRaw(KEYS.COMPETITIONS, comps);
    if (cp.joined) {
      addActivity({
        action: 'joined_competition',
        targetType: 'competition',
        targetTitle: cp.title,
        targetLink: `competition-details.html?id=${cp.id}`,
        details: `Entered tournament competing for ${cp.prize}.`
      });
    }

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.competitions.toggleJoin(id).catch(err => console.warn('[Competition Join Sync]:', err));
    }

    return cp.joined;
  }

  /* ---------- Reviews ---------- */
  function getReviews() {
    return getRaw(KEYS.REVIEWS, typeof MOCK_REVIEWS !== 'undefined' ? MOCK_REVIEWS : []);
  }

  function addReview(data) {
    const reviews = getReviews();
    const newId = reviews.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const user = getAuthUser();
    const book = getBookById(data.bookId);

    const newRev = {
      id: newId,
      bookId: Number(data.bookId),
      bookTitle: book ? book.title : data.bookTitle,
      bookAuthor: book ? book.author : data.bookAuthor,
      user: user ? user.name : 'Reader',
      username: user ? user.username : 'reader',
      avatar: user ? (user.avatar || 'R') : 'R',
      overallRating: Number(data.overallRating) || 5,
      categoryRatings: {
        story: Number(data.storyRating) || 5,
        characters: Number(data.characterRating) || 5,
        writing: Number(data.writingRating) || 5,
        pacing: Number(data.pacingRating) || 4,
        worldBuilding: Number(data.worldBuildingRating) || 4
      },
      reviewText: data.reviewText,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      likes: 1,
      isLiked: false,
      hasSpoiler: !!data.hasSpoiler,
      spoilerText: data.spoilerText || ''
    };
    reviews.unshift(newRev);
    setRaw(KEYS.REVIEWS, reviews);
    addActivity({
      action: 'reviewed',
      targetType: 'book',
      targetTitle: newRev.bookTitle,
      targetLink: `book-details.html?id=${newRev.bookId}`,
      details: `Rated ${newRev.overallRating}★: "${newRev.reviewText.slice(0, 70)}..."`
    });

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.reviews.create({
        bookId: newRev.bookId,
        bookTitle: newRev.bookTitle,
        overallRating: newRev.overallRating,
        categoryRatings: newRev.categoryRatings,
        reviewText: newRev.reviewText,
        hasSpoiler: newRev.hasSpoiler,
        spoilerText: newRev.spoilerText
      }).catch(err => console.warn('[Review API Sync]:', err));
    }

    return newRev;
  }

  function toggleLikeReview(id) {
    id = Number(id);
    const reviews = getReviews();
    const r = reviews.find(x => x.id === id);
    if (!r) return false;
    r.isLiked = !r.isLiked;
    r.likes += r.isLiked ? 1 : -1;
    setRaw(KEYS.REVIEWS, reviews);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.reviews.toggleLike(id).catch(err => console.warn('[Review Like Sync]:', err));
    }

    return r.isLiked;
  }

  /* ---------- Discussions ---------- */
  function getDiscussions() {
    return getRaw(KEYS.DISCUSSIONS, typeof MOCK_DISCUSSIONS !== 'undefined' ? MOCK_DISCUSSIONS : []);
  }

  function getDiscussionById(id) {
    id = Number(id);
    return getDiscussions().find(d => d.id === id) || null;
  }

  function addDiscussion(data) {
    const list = getDiscussions();
    const newId = list.reduce((m, d) => Math.max(m, d.id), 0) + 1;
    const user = getAuthUser();

    const newDisc = {
      id: newId,
      title: data.title,
      category: data.category || 'General',
      bookTag: data.bookTag || 'General Topic',
      bookId: data.bookId ? Number(data.bookId) : null,
      author: user ? user.name : 'Reader',
      username: user ? user.username : 'reader',
      avatar: user ? (user.avatar || 'R') : 'R',
      timeAgo: 'Just now',
      date: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
      isLiked: false,
      content: data.content,
      hasSpoiler: !!data.hasSpoiler,
      spoilerContent: data.spoilerContent || '',
      replies: []
    };
    list.unshift(newDisc);
    setRaw(KEYS.DISCUSSIONS, list);
    addActivity({
      action: 'started_discussion',
      targetType: 'discussion',
      targetTitle: newDisc.title,
      targetLink: `discussion-details.html?id=${newDisc.id}`,
      details: `Started conversation in ${newDisc.category}.`
    });
    return newDisc;
  }

  function addDiscussionReply(discId, replyText, parentReplyId) {
    discId = Number(discId);
    const list = getDiscussions();
    const disc = list.find(d => d.id === discId);
    if (!disc) return null;
    const user = getAuthUser();

    const newReply = {
      id: Date.now(),
      author: user ? user.name : 'Reader',
      username: user ? user.username : 'reader',
      avatar: user ? (user.avatar || 'R') : 'R',
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
      content: replyText,
      nestedReplies: []
    };

    if (parentReplyId) {
      const parent = (disc.replies || []).find(r => r.id === Number(parentReplyId));
      if (parent) {
        parent.nestedReplies = parent.nestedReplies || [];
        parent.nestedReplies.push(newReply);
      } else {
        disc.replies.push(newReply);
      }
    } else {
      disc.replies = disc.replies || [];
      disc.replies.push(newReply);
    }
    setRaw(KEYS.DISCUSSIONS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.discussions.reply(discId, replyText, false).catch(err => console.warn('[Discussion Reply Sync]:', err));
    }

    return newReply;
  }

  function toggleLikeDiscussion(id) {
    id = Number(id);
    const list = getDiscussions();
    const d = list.find(x => x.id === id);
    if (!d) return false;
    d.isLiked = !d.isLiked;
    d.likes += d.isLiked ? 1 : -1;
    setRaw(KEYS.DISCUSSIONS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.discussions.toggleLike(id).catch(err => console.warn('[Discussion Like Sync]:', err));
    }

    return d.isLiked;
  }

  /* ---------- Goals ---------- */
  function getGoals() {
    return getRaw(KEYS.GOALS, typeof MOCK_GOALS !== 'undefined' ? MOCK_GOALS : []);
  }

  function addGoal(data) {
    const goals = getGoals();
    const newId = goals.reduce((m, g) => Math.max(m, g.id), 0) + 1;
    const target = Number(data.target) || 10;
    const current = Number(data.current) || 0;
    const newGoal = {
      id: newId,
      title: data.title,
      type: data.type || 'Books per year',
      target: target,
      current: current,
      unit: data.unit || 'books',
      percentage: Math.round((current / target) * 100),
      deadline: data.deadline || '2026-12-31',
      daysRemaining: 60,
      status: 'In Progress',
      color: '#B5652F'
    };
    goals.unshift(newGoal);
    setRaw(KEYS.GOALS, goals);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.goals.create(data).catch(err => console.warn('[Goal API Sync]:', err));
    }

    return newGoal;
  }

  function deleteGoal(id) {
    id = Number(id);
    const goals = getGoals().filter(g => g.id !== id);
    setRaw(KEYS.GOALS, goals);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.goals.delete(id).catch(err => console.warn('[Goal Delete Sync]:', err));
    }

    return true;
  }

  /* ---------- Notes & Highlights ---------- */
  function getNotes() {
    return getRaw(KEYS.NOTES, typeof MOCK_NOTES !== 'undefined' ? MOCK_NOTES : []);
  }

  function addNote(data) {
    const notes = getNotes();
    const newId = notes.reduce((m, n) => Math.max(m, n.id), 0) + 1;
    const book = getBookById(data.bookId);
    const newNote = {
      id: newId,
      bookId: Number(data.bookId),
      bookTitle: book ? book.title : 'Selected Book',
      bookAuthor: book ? book.author : 'Author',
      page: Number(data.page) || 1,
      note: data.note,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(s => s.trim()) : (data.tags || ['Reflection']),
      createdAt: new Date().toISOString().split('T')[0]
    };
    notes.unshift(newNote);
    setRaw(KEYS.NOTES, notes);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.notes.create({
        bookId: newNote.bookId,
        page: newNote.page,
        note: newNote.note,
        tags: newNote.tags
      }).catch(err => console.warn('[Note API Sync]:', err));
    }

    return newNote;
  }

  function deleteNote(id) {
    id = Number(id);
    const notes = getNotes().filter(n => n.id !== id);
    setRaw(KEYS.NOTES, notes);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.notes.delete(id).catch(err => console.warn('[Note Delete Sync]:', err));
    }

    return true;
  }

  function getHighlights() {
    return getRaw(KEYS.HIGHLIGHTS, typeof MOCK_HIGHLIGHTS !== 'undefined' ? MOCK_HIGHLIGHTS : []);
  }

  function addHighlight(data) {
    const highlights = getHighlights();
    const newId = highlights.reduce((m, h) => Math.max(m, h.id), 0) + 1;
    const book = getBookById(data.bookId);
    const newHl = {
      id: newId,
      bookId: Number(data.bookId),
      bookTitle: book ? book.title : 'Selected Book',
      bookAuthor: book ? book.author : 'Author',
      quote: data.quote,
      page: Number(data.page) || 1,
      color: data.color || '#E9C6A5',
      userNote: data.userNote || '',
      isFavorite: false,
      sharedToGroup: data.sharedToGroup || null
    };
    highlights.unshift(newHl);
    setRaw(KEYS.HIGHLIGHTS, highlights);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.highlights.create(newHl).catch(err => console.warn('[Highlight API Sync]:', err));
    }

    return newHl;
  }

  function toggleHighlightFavorite(id) {
    id = Number(id);
    const list = getHighlights();
    const hl = list.find(x => x.id === id);
    if (!hl) return false;
    hl.isFavorite = !hl.isFavorite;
    setRaw(KEYS.HIGHLIGHTS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.highlights.toggleFavorite(id).catch(err => console.warn('[Highlight Fav Sync]:', err));
    }

    return hl.isFavorite;
  }

  function deleteHighlight(id) {
    id = Number(id);
    const list = getHighlights().filter(h => h.id !== id);
    setRaw(KEYS.HIGHLIGHTS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.highlights.delete(id).catch(err => console.warn('[Highlight Delete Sync]:', err));
    }

    return true;
  }

  /* ---------- Journal ---------- */
  function getJournal() {
    return getRaw(KEYS.JOURNAL, typeof MOCK_JOURNAL !== 'undefined' ? MOCK_JOURNAL : []);
  }

  function addJournalEntry(data) {
    const list = getJournal();
    const newId = list.reduce((m, j) => Math.max(m, j.id), 0) + 1;
    const book = getBookById(data.bookId);
    const newEntry = {
      id: newId,
      bookId: Number(data.bookId),
      bookTitle: book ? book.title : data.bookTitle,
      date: data.date || new Date().toISOString().split('T')[0],
      mood: data.mood || '😊',
      moodLabel: data.moodLabel || 'Satisfied',
      pagesRead: Number(data.pagesRead) || 20,
      thoughts: data.thoughts,
      rating: Number(data.rating) || 4
    };
    list.unshift(newEntry);
    setRaw(KEYS.JOURNAL, list);

    // Also increment book progress if book is in library
    if (newEntry.bookId) {
      const cur = getBookUserStatus(newEntry.bookId);
      updateBookProgress(newEntry.bookId, (cur.currentPage || 0) + newEntry.pagesRead);
    }

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.journal.create(newEntry).catch(err => console.warn('[Journal API Sync]:', err));
    }

    return newEntry;
  }

  /* ---------- Notifications ---------- */
  function getNotifications() {
    return getRaw(KEYS.NOTIFICATIONS, typeof MOCK_NOTIFICATIONS !== 'undefined' ? MOCK_NOTIFICATIONS : []);
  }

  function getUnreadNotificationsCount() {
    return getNotifications().filter(n => !n.isRead).length;
  }

  function markNotificationRead(id) {
    id = Number(id);
    const list = getNotifications();
    const n = list.find(x => x.id === id);
    if (n) n.isRead = true;
    setRaw(KEYS.NOTIFICATIONS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.notifications.markRead(id).catch(err => console.warn('[Notif Read Sync]:', err));
    }
  }

  function markAllNotificationsRead() {
    const list = getNotifications();
    list.forEach(n => n.isRead = true);
    setRaw(KEYS.NOTIFICATIONS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.notifications.markAllRead().catch(err => console.warn('[All Notif Read Sync]:', err));
    }
  }

  /* ---------- Activities ---------- */
  function getActivities() {
    return getRaw(KEYS.ACTIVITIES, typeof MOCK_ACTIVITIES !== 'undefined' ? MOCK_ACTIVITIES : []);
  }

  function addActivity(item) {
    const list = getActivities();
    const user = getAuthUser();
    const act = {
      id: Date.now(),
      user: user ? user.name : 'Reader',
      username: user ? user.username : 'reader',
      avatar: user ? (user.avatar || 'R') : 'R',
      avatarBg: 'var(--clay)',
      time: 'Just now',
      badge: null,
      ...item
    };
    list.unshift(act);
    if (list.length > 50) list.pop();
    setRaw(KEYS.ACTIVITIES, list);
  }

  /* ---------- Reports & Moderation ---------- */
  function getReports() {
    return getRaw(KEYS.REPORTS, typeof MOCK_REPORTS !== 'undefined' ? MOCK_REPORTS : []);
  }

  function addReport(data) {
    const list = getReports();
    const newId = list.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const user = getAuthUser();
    const newRep = {
      id: newId,
      targetType: data.targetType || 'Review',
      targetTitle: data.targetTitle || 'Reported Content',
      reportedItemSnippet: data.reportedItemSnippet || '',
      reportedAuthor: data.reportedAuthor || 'Community Member',
      reportedBy: user ? user.name : 'Community Member',
      date: new Date().toISOString().split('T')[0],
      reason: data.reason || 'Inappropriate Content',
      description: data.description || '',
      status: 'Pending'
    };
    list.unshift(newRep);
    setRaw(KEYS.REPORTS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.reports.create(data).catch(err => console.warn('[Report Create Sync]:', err));
    }

    return newRep;
  }

  function updateReportStatus(id, newStatus, resolutionText) {
    id = Number(id);
    const list = getReports();
    const r = list.find(x => x.id === id);
    if (!r) return false;
    r.status = newStatus;
    if (resolutionText) r.resolution = resolutionText;
    setRaw(KEYS.REPORTS, list);

    if (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken()) {
      BookClubAPI.reports.update(id, {
        status: newStatus,
        resolution: resolutionText
      }).catch(err => console.warn('[Report Update Sync]:', err));
    }

    return true;
  }

  /* ---------- Certificates ---------- */
  function getCertificates() {
    return getRaw(KEYS.CERTIFICATES, []);
  }

  function getCertificateById(id) {
    const certs = getCertificates();
    return certs.find(c => c.certificateId === id || c._id === id || c.id === id) || null;
  }

  function addCertificate(cert) {
    const certs = getCertificates();
    const existingIdx = certs.findIndex(c => c.certificateId === cert.certificateId);
    if (existingIdx !== -1) {
      certs[existingIdx] = cert;
    } else {
      certs.unshift(cert);
    }
    setRaw(KEYS.CERTIFICATES, certs);
    return cert;
  }

  function addNotification(item) {
    const list = getNotifications();
    const notif = {
      id: Date.now(),
      type: item.type || 'info',
      title: item.title || 'Notification',
      message: item.message || '',
      link: item.link || '',
      time: 'Just now',
      isRead: false
    };
    list.unshift(notif);
    setRaw(KEYS.NOTIFICATIONS, list);
    return notif;
  }

  /* ---------- Quests & Locked Books System ---------- */
  function getUnlockedBookIds() {
    return getRaw(KEYS.UNLOCKED_BOOKS, []);
  }

  function getClaimedQuestIds() {
    return getRaw(KEYS.CLAIMED_QUESTS, []);
  }

  function isBookLocked(bookId) {
    const book = getBookById(bookId);
    if (!book || !book.isLocked) return false;
    const unlocked = getUnlockedBookIds();
    return !unlocked.includes(Number(book.id));
  }

  function isQuestClaimed(questId) {
    const claimed = getClaimedQuestIds();
    return claimed.includes(String(questId));
  }

  function getUserQuests() {
    const allBooks = getBooks();
    const lockedRewardBooks = allBooks.filter(b => b.isLocked || b.unlockTask);
    const claimedIds = getClaimedQuestIds();
    const unlockedIds = getUnlockedBookIds();
    const stats = getUserStats();
    const groups = getGroups();
    const reviews = getReviews();
    const notes = getNotes();
    const goals = getGoals();
    const lib = getLibraryMap();

    const user = getAuthUser();
    const userName = user ? user.name : 'Reader';
    const joinedGroupsCount = groups.filter(g => (g.members || []).some(m => m.name === userName)).length;
    const reviewsCount = reviews.length;
    const notesCount = notes.length;
    const goalsCount = goals.length;
    const shelfCount = Object.keys(lib).length;
    const pagesCount = stats.pagesRead;
    const currentStreak = stats.streak;
    const currentXP = stats.xp;

    return lockedRewardBooks.map(book => {
      const task = book.unlockTask || {
        id: `quest_book_${book.id}`,
        title: `Unlock ${book.title}`,
        type: 'general',
        target: 1,
        description: 'Complete the task to unlock this book.'
      };

      let current = 0;
      const target = task.target || 1;

      switch (task.type) {
        case 'has_goals_or_shelf':
          current = (goalsCount + shelfCount > 0) ? 1 : 0;
          break;
        case 'pages_read':
          current = pagesCount;
          break;
        case 'joined_group':
          current = joinedGroupsCount;
          break;
        case 'has_reviews_or_notes':
          current = reviewsCount + notesCount;
          break;
        case 'reading_streak':
          current = currentStreak;
          break;
        case 'total_xp':
          current = currentXP;
          break;
        default:
          current = 0;
      }

      const isCompleted = current >= target;
      const isClaimed = claimedIds.includes(task.id) || unlockedIds.includes(Number(book.id));
      const isUnlocked = unlockedIds.includes(Number(book.id));
      const percentage = Math.min(100, Math.round((current / target) * 100));

      return {
        id: task.id,
        questId: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        target,
        current: Math.min(current, target),
        rawCurrent: current,
        percentage,
        isCompleted,
        isClaimed,
        isUnlocked,
        rewardXP: book.rewardXP || 100,
        rewardBadge: book.rewardBadge || 'Book Hunter',
        questTier: book.questTier || 'beginner',
        book: {
          id: book.id,
          title: book.title,
          title_ta: book.title_ta,
          author: book.author,
          author_ta: book.author_ta,
          genre: book.genre,
          coverImage: book.coverImage,
          totalPages: book.totalPages,
          description: book.description
        }
      };
    });
  }

  function claimQuestAndUnlockBook(questIdOrBookId) {
    const allBooks = getBooks();
    let book = null;

    const numId = Number(questIdOrBookId);
    if (!isNaN(numId) && numId > 0) {
      book = allBooks.find(b => b.id === numId);
    } else {
      book = allBooks.find(b => b.unlockTask && b.unlockTask.id === questIdOrBookId);
    }

    if (!book) return { success: false, message: 'Reward or book not found.' };

    const questId = book.unlockTask?.id || `quest_book_${book.id}`;
    const unlocked = getUnlockedBookIds();
    const claimed = getClaimedQuestIds();

    if (!unlocked.includes(Number(book.id))) {
      unlocked.push(Number(book.id));
      setRaw(KEYS.UNLOCKED_BOOKS, unlocked);
    }

    const wasClaimed = claimed.includes(questId);
    if (!wasClaimed) {
      claimed.push(questId);
      setRaw(KEYS.CLAIMED_QUESTS, claimed);
      addXP(book.rewardXP || 100, book.rewardBadge);
    }

    addActivity({
      action: 'unlocked_book',
      targetType: 'book',
      targetTitle: book.title,
      targetLink: `/books/${book.id}`,
      details: `Earned +${book.rewardXP} XP and unlocked "${book.title}"!`
    });

    addNotification({
      type: 'achievement',
      title: `🎉 Quest Reward Claimed!`,
      message: `You earned +${book.rewardXP} XP and badge "${book.rewardBadge}". "${book.title}" is now unlocked in your catalog!`,
      link: `/books/${book.id}`
    });

    try {
      fetch(`/api/books/${book.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken && BookClubAPI.getToken()) ? `Bearer ${BookClubAPI.getToken()}` : ''
        }
      }).catch(err => console.warn('[Backend Book Unlock Sync]:', err));
    } catch (e) {}

    return {
      success: true,
      book,
      rewardXP: book.rewardXP || 100,
      rewardBadge: book.rewardBadge,
      alreadyClaimed: wasClaimed
    };
  }

  return {
    init: initStore,
    getUserProgress,
    addXP,
    getUnlockedBookIds,
    isBookLocked,
    getClaimedQuestIds,
    isQuestClaimed,
    getUserQuests,
    claimQuestAndUnlockBook,
    getCertificates,
    getCertificateById,
    addCertificate,
    addNotification,
    getBooks,
    getBookById,
    getLibraryShelves,
    getBookUserStatus,
    setBookShelf,
    toggleBookFavorite,
    updateBookProgress,
    getUserStats,
    getGroups,
    getGroupById,
    joinGroup,
    voteGroupPoll,
    createGroup,
    getEvents,
    getEventById,
    toggleRSVP,
    createEvent,
    getChallenges,
    getChallengeById,
    toggleJoinChallenge,
    updateChallengeProgress,
    completeChallenge,
    generateChallengeCertificate,
    getCompetitions,
    getCompetitionById,
    toggleJoinCompetition,
    getReviews,
    addReview,
    toggleLikeReview,
    getDiscussions,
    getDiscussionById,
    addDiscussion,
    addDiscussionReply,
    toggleLikeDiscussion,
    getGoals,
    addGoal,
    deleteGoal,
    getNotes,
    addNote,
    deleteNote,
    getHighlights,
    addHighlight,
    toggleHighlightFavorite,
    deleteHighlight,
    getJournal,
    addJournalEntry,
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    getActivities,
    addActivity,
    getReports,
    addReport,
    updateReportStatus,
    getTrackedEvents,
    getTrackingStatus,
    trackGatheringOrEvent,
    formatWhatsAppEventText,
    formatGroupWhatsAppEventText,
    openWhatsAppTracker,
    dispatchHostWhatsAppNotification,
    dispatchGroupWhatsAppNotification,
    downloadICSFile,
    syncFromBackend
  };

  async function syncFromBackend() {
    if (typeof BookClubAPI === 'undefined' || !BookClubAPI.getToken()) return;
    try {
      const [booksRes, libRes, groupsRes, eventsRes, revRes, discRes, goalsRes] = await Promise.all([
        BookClubAPI.books.getAll(),
        BookClubAPI.library.getAll(),
        BookClubAPI.groups.getAll(),
        BookClubAPI.events.getAll(),
        BookClubAPI.reviews.getAll(),
        BookClubAPI.discussions.getAll(),
        BookClubAPI.goals.getAll()
      ]);

      if (booksRes && booksRes.data && booksRes.data.length) {
        setRaw(KEYS.BOOKS, booksRes.data);
      }
      if (libRes && libRes.data && libRes.data.length) {
        const libMap = getLibraryMap();
        libRes.data.forEach(entry => {
          libMap[entry.bookId] = {
            shelf: entry.shelf,
            currentPage: entry.currentPage,
            isFavorite: entry.isFavorite
          };
        });
        setRaw(KEYS.LIBRARY, libMap);
      }
      if (groupsRes && groupsRes.data && groupsRes.data.length) {
        setRaw(KEYS.GROUPS, groupsRes.data);
      }
      if (eventsRes && eventsRes.data && eventsRes.data.length) {
        setRaw(KEYS.EVENTS, eventsRes.data);
      }
      if (revRes && revRes.data && revRes.data.length) {
        setRaw(KEYS.REVIEWS, revRes.data);
      }
      if (discRes && discRes.data && discRes.data.length) {
        setRaw(KEYS.DISCUSSIONS, discRes.data);
      }
      if (goalsRes && goalsRes.data && goalsRes.data.length) {
        setRaw(KEYS.GOALS, goalsRes.data);
      }
      if (typeof BookClubAPI.certificates !== 'undefined') {
        const certRes = await BookClubAPI.certificates.getAll().catch(() => null);
        if (certRes && certRes.data && certRes.data.length) {
          setRaw(KEYS.CERTIFICATES, certRes.data);
        }
      }
    } catch (e) {
      console.warn('[Backend Hydration Notice]:', e);
    }
  }
})();

// Auto initialize store
BookClubStore.init();
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    BookClubStore.syncFromBackend();
  });
}

export default BookClubStore;
export { BookClubStore };

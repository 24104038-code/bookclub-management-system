/* =========================================================
   BOOKCLUB MOCK DATA — ACTIVITY FEED
   ========================================================= */

const MOCK_ACTIVITIES = [
  {
    id: 1,
    user: "Jordan Rivera",
    username: "jordanreads",
    avatar: "JR",
    avatarBg: "var(--clay)",
    action: "completed",
    targetType: "book",
    targetTitle: "The Silent Orchard",
    targetLink: "book-details.html?id=1",
    time: "2 hours ago",
    details: "Rated 5 stars · 'Slow in the best possible way. A triumph of quiet storytelling.'",
    badge: null
  },
  {
    id: 2,
    user: "Aditi Krishnan",
    username: "aditi_k",
    avatar: "AK",
    avatarBg: "var(--green-shelf)",
    action: "earned_badge",
    targetType: "badge",
    targetTitle: "Bookworm Elite",
    targetLink: "achievements.html",
    time: "4 hours ago",
    details: "Unlocked after reaching 30 books read in the 2026 challenge cycle.",
    badge: "🐛"
  },
  {
    id: 3,
    user: "Rahul Thomas",
    username: "rahul_t",
    avatar: "RT",
    avatarBg: "var(--shell-gold-deep)",
    action: "joined_challenge",
    targetType: "challenge",
    targetTitle: "1,000 Pages Summer Sprint",
    targetLink: "challenge-details.html?id=2",
    time: "6 hours ago",
    details: "Committed to logging 1,000 pages before October 15.",
    badge: null
  },
  {
    id: 4,
    user: "Sam Park",
    username: "sampark",
    avatar: "SP",
    avatarBg: "#6A4C93",
    action: "reviewed",
    targetType: "book",
    targetTitle: "Paper Lanterns",
    targetLink: "book-details.html?id=4",
    time: "Yesterday",
    details: "Left a 5-star review with deep analysis on the lantern magical system.",
    badge: null
  },
  {
    id: 5,
    user: "Meera Joseph",
    username: "meera_j",
    avatar: "MJ",
    avatarBg: "#4A6D8C",
    action: "joined_group",
    targetType: "group",
    targetTitle: "Classic Literature Club",
    targetLink: "group-details.html?id=3",
    time: "2 days ago",
    details: "Joined the weekly Wednesday evening salons in Study Room B.",
    badge: null
  },
  {
    id: 6,
    user: "Jordan Rivera",
    username: "jordanreads",
    avatar: "JR",
    avatarBg: "var(--clay)",
    action: "rsvp_event",
    targetType: "event",
    targetTitle: "Author Meet & Greet: Elena Marsh",
    targetLink: "event-details.html?id=3",
    time: "3 days ago",
    details: "Reserved a seat for the exclusive fireside chat and live Q&A.",
    badge: null
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_ACTIVITIES;
}

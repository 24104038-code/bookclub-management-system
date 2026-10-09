/* =========================================================
   BOOKCLUB MOCK DATA — NOTIFICATIONS
   ========================================================= */

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "review_like",
    icon: "❤️",
    title: "Review Liked",
    message: "Aditi Krishnan and 4 others liked your review of 'Winter's Ledger'.",
    time: "15 minutes ago",
    isRead: false,
    link: "reviews.html"
  },
  {
    id: 2,
    type: "comment_reply",
    icon: "💬",
    title: "New Reply in Discussion",
    message: "Rahul Thomas replied to your comment in 'The Silent Orchard ending debate'.",
    time: "1 hour ago",
    isRead: false,
    link: "discussion-details.html?id=1"
  },
  {
    id: 3,
    type: "badge_earned",
    icon: "🏆",
    title: "Badge Unlocked!",
    message: "Congratulations! You earned the '14-Day Streak Keeper' badge.",
    time: "Yesterday",
    isRead: false,
    link: "achievements.html"
  },
  {
    id: 4,
    type: "event_reminder",
    icon: "📅",
    title: "Event Tomorrow",
    message: "Reminder: 'Monthly Book Discussion: Winter's Ledger' starts tomorrow at 6:00 PM.",
    time: "Yesterday",
    isRead: true,
    link: "event-details.html?id=1"
  },
  {
    id: 5,
    type: "competition_start",
    icon: "🏁",
    title: "Competition Update",
    message: "You climbed to Rank #4 in the Autumn Cup 30-Day Reading Race!",
    time: "2 days ago",
    isRead: true,
    link: "competition-details.html?id=1"
  },
  {
    id: 6,
    type: "group_activity",
    icon: "👥",
    title: "Group Poll Ending Soon",
    message: "Mystery Readers group poll 'What should we read next month?' closes in 24 hours.",
    time: "3 days ago",
    isRead: true,
    link: "group-details.html?id=1"
  },
  {
    id: 7,
    type: "new_follower",
    icon: "👤",
    title: "New Follower",
    message: "Meera Joseph started following your reading activity and reviews.",
    time: "4 days ago",
    isRead: true,
    link: "profile.html?user=meera_j"
  }
];



export default MOCK_NOTIFICATIONS;
export { MOCK_NOTIFICATIONS };

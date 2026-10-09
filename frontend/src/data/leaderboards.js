/* =========================================================
   BOOKCLUB MOCK DATA — LEADERBOARDS
   ========================================================= */

const MOCK_LEADERBOARDS = {
  overall: [
    { rank: 1, name: "Admin User", username: "admin", level: 15, xp: 4850, books: 58, pages: 19400, streak: 42, badge: "Grand Scholar 👑", avatar: "AU" },
    { rank: 2, name: "Aditi Krishnan", username: "aditi_k", level: 12, xp: 3890, books: 34, pages: 11200, streak: 28, badge: "Master Critic ✒️", avatar: "AK" },
    { rank: 3, name: "Rahul Thomas", username: "rahul_t", level: 10, xp: 3100, books: 26, pages: 8700, streak: 19, badge: "Pace Setter ⚡", avatar: "RT" },
    { rank: 4, name: "Jordan Rivera", username: "jordanreads", level: 8, xp: 2340, books: 12, pages: 3950, streak: 14, badge: "Rising Star 🌟", avatar: "JR", isCurrentUser: true },
    { rank: 5, name: "Meera Joseph", username: "meera_j", level: 7, xp: 1950, books: 16, pages: 5300, streak: 9, badge: "Deep Thinker 🦉", avatar: "MJ" },
    { rank: 6, name: "Sam Park", username: "sampark", level: 6, xp: 1620, books: 8, pages: 4100, streak: 7, badge: "Realm Wanderer 🔮", avatar: "SP" }
  ],
  monthly: [
    { rank: 1, name: "Marcus Brody", username: "marcus_b", level: 14, xp: 950, books: 6, pages: 2150, streak: 21, badge: "Monthly Champ 🏆", avatar: "MB" },
    { rank: 2, name: "Jordan Rivera", username: "jordanreads", level: 8, xp: 720, books: 4, pages: 1450, streak: 14, badge: "Sprint Master ⚡", avatar: "JR", isCurrentUser: true },
    { rank: 3, name: "Aditi Krishnan", username: "aditi_k", level: 12, xp: 680, books: 3, pages: 1200, streak: 16, badge: "Detective 🔍", avatar: "AK" },
    { rank: 4, name: "Rahul Thomas", username: "rahul_t", level: 10, xp: 540, books: 2, pages: 890, streak: 11, badge: "Navigator 🧭", avatar: "RT" },
    { rank: 5, name: "Meera Joseph", username: "meera_j", level: 7, xp: 420, books: 2, pages: 710, streak: 9, badge: "Classicist 📜", avatar: "MJ" }
  ],
  weekly: [
    { rank: 1, name: "Jordan Rivera", username: "jordanreads", level: 8, xp: 310, books: 2, pages: 540, streak: 7, badge: "Weekly Ace 🎯", avatar: "JR", isCurrentUser: true },
    { rank: 2, name: "Sam Park", username: "sampark", level: 6, xp: 280, books: 1, pages: 490, streak: 6, badge: "Page Turner 📖", avatar: "SP" },
    { rank: 3, name: "Aditi Krishnan", username: "aditi_k", level: 12, xp: 240, books: 1, pages: 380, streak: 7, badge: "Avid Reader ☕", avatar: "AK" },
    { rank: 4, name: "Rahul Thomas", username: "rahul_t", level: 10, xp: 190, books: 1, pages: 310, streak: 5, badge: "Fact Finder 💡", avatar: "RT" }
  ],
  friends: [
    { rank: 1, name: "Aditi Krishnan", username: "aditi_k", level: 12, xp: 3890, books: 34, pages: 11200, streak: 28, badge: "Leader 🥇", avatar: "AK" },
    { rank: 2, name: "Jordan Rivera", username: "jordanreads", level: 8, xp: 2340, books: 12, pages: 3950, streak: 14, badge: "Challenger 🥈", avatar: "JR", isCurrentUser: true },
    { rank: 3, name: "Rahul Thomas", username: "rahul_t", level: 10, xp: 3100, books: 26, pages: 8700, streak: 19, badge: "Pacer 🥉", avatar: "RT" },
    { rank: 4, name: "Meera Joseph", username: "meera_j", level: 7, xp: 1950, books: 16, pages: 5300, streak: 9, badge: "Companion 🤝", avatar: "MJ" }
  ]
};

const MOCK_ACHIEVEMENTS = [
  { id: 1, title: "First Book", icon: "🌱", description: "Completed your first book in BookClub.", status: "unlocked", dateUnlocked: "May 2, 2026", xp: 100 },
  { id: 2, title: "Bookworm", icon: "🐛", description: "Finished 10 books on your reading journey.", status: "unlocked", dateUnlocked: "July 18, 2026", xp: 250 },
  { id: 3, title: "14-Day Streak Keeper", icon: "🔥", description: "Maintained a 14-day daily reading streak.", status: "unlocked", dateUnlocked: "September 20, 2026", xp: 300 },
  { id: 4, title: "Review Writer", icon: "✒️", description: "Wrote your first 5 comprehensive reviews.", status: "unlocked", dateUnlocked: "June 25, 2026", xp: 150 },
  { id: 5, title: "Challenge Winner", icon: "🏆", description: "Successfully finished a monthly reading challenge.", status: "unlocked", dateUnlocked: "April 30, 2026", xp: 500 },
  { id: 6, title: "50 Books Milestone", icon: "📚", description: "Read 50 books in total.", status: "in_progress", progress: "12 / 50", xp: 1000 },
  { id: 7, title: "5,000 Pages Master", icon: "📜", description: "Turned over 5,000 verified pages.", status: "in_progress", progress: "3,950 / 5,000", xp: 750 },
  { id: 8, title: "30 Day Iron Streak", icon: "⚡", description: "Read every single day for 30 consecutive days.", status: "in_progress", progress: "14 / 30", xp: 600 },
  { id: 9, title: "100 Books Titan", icon: "🏛️", description: "Read 100 books.", status: "locked", progress: "0 / 100", xp: 2500 },
  { id: 10, title: "Top Reviewer Hall of Fame", icon: "👑", description: "Accumulate 250 helpful upvotes across your book reviews.", status: "locked", progress: "96 / 250", xp: 1500 },
  { id: 11, title: "Competition Champion", icon: "🥇", description: "Take 1st place in an official BookClub tournament.", status: "locked", progress: "Current: #4", xp: 2000 }
];

export default MOCK_LEADERBOARDS;
export { MOCK_LEADERBOARDS, MOCK_ACHIEVEMENTS };

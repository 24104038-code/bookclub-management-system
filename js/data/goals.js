/* =========================================================
   BOOKCLUB MOCK DATA — READING GOALS
   ========================================================= */

const MOCK_GOALS = [
  {
    id: 1,
    title: "2026 Annual Book Goal",
    type: "Books per year",
    target: 50,
    current: 28,
    unit: "books",
    percentage: 56,
    deadline: "2026-12-31",
    daysRemaining: 101,
    status: "In Progress",
    color: "#B5652F"
  },
  {
    id: 2,
    title: "Monthly Page Smasher",
    type: "Pages per month",
    target: 1200,
    current: 850,
    unit: "pages",
    percentage: 71,
    deadline: "2026-09-30",
    daysRemaining: 9,
    status: "In Progress",
    color: "#4C6A50"
  },
  {
    id: 3,
    title: "Fantasy Deep Exploration",
    type: "Genre challenge",
    target: 10,
    current: 7,
    unit: "fantasy books",
    percentage: 70,
    deadline: "2026-11-30",
    daysRemaining: 70,
    status: "In Progress",
    color: "#8A5B7A"
  },
  {
    id: 4,
    title: "Weekly Habit Anchor",
    type: "Weekly goal",
    target: 150,
    current: 120,
    unit: "pages/week",
    percentage: 80,
    deadline: "Sunday midnight",
    daysRemaining: 3,
    status: "In Progress",
    color: "#B08A3E"
  }
];

const MOCK_COMPLETED_GOALS = [
  {
    id: 101,
    title: "Spring Reading Sprint 2026",
    type: "Books per month",
    target: 8,
    current: 8,
    unit: "books",
    percentage: 100,
    completedDate: "April 30, 2026",
    status: "Completed",
    achievementBadge: "🌸 Spring Bloom Master"
  },
  {
    id: 102,
    title: "Non-Fiction Broadening Quest",
    type: "Genre challenge",
    target: 5,
    current: 5,
    unit: "books",
    percentage: 100,
    completedDate: "June 15, 2026",
    status: "Completed",
    achievementBadge: "🧠 Truth Seeker"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOCK_GOALS, MOCK_COMPLETED_GOALS };
}

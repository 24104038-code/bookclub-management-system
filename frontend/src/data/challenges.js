/* =========================================================
   BOOKCLUB MOCK DATA — READING CHALLENGES
   ========================================================= */

const MOCK_CHALLENGES = [
  {
    id: 1,
    title: "Read 5 Books This Month",
    description: "Expand your horizons by completing 5 full books across any genre before the month wraps up.",
    target: 5,
    unit: "books",
    progress: 5,
    participantsCount: 142,
    daysRemaining: 12,
    rewardXp: 500,
    badgeName: "Sprint Finisher",
    badgeIcon: "⚡",
    joined: true,
    rules: [
      "Any book over 150 pages counts toward your goal.",
      "Audiobooks and physical books both count.",
      "Mark books as 'Read' in your library to automatically sync progress."
    ],
    timeline: [
      { step: "Milestone 1", desc: "Finish 1st book", completed: true },
      { step: "Milestone 2", desc: "Finish 3rd book", completed: true },
      { step: "Milestone 3", desc: "Finish 5th book", completed: true }
    ],
    leaderboard: [
      { rank: 1, name: "Elena Ramos", books: 5, avatar: "ER", status: "Completed" },
      { rank: 2, name: "Jordan Rivera", books: 3, avatar: "JR", status: "In Progress" },
      { rank: 3, name: "Meera Joseph", books: 3, avatar: "MJ", status: "In Progress" },
      { rank: 4, name: "Rahul Thomas", books: 2, avatar: "RT", status: "In Progress" }
    ]
  },
  {
    id: 2,
    title: "1,000 Pages Summer Sprint",
    description: "Turn pages and build strong daily habits. Read 1,000 total pages tracked via your reading tracker.",
    target: 1000,
    unit: "pages",
    progress: 680,
    participantsCount: 230,
    daysRemaining: 18,
    rewardXp: 750,
    badgeName: "Millennium Reader",
    badgeIcon: "📜",
    joined: true,
    rules: [
      "Every session logged in the reading tracker adds to your total.",
      "Re-reading books also qualifies for page count.",
      "Daily average of 35 pages recommended to finish on schedule."
    ],
    timeline: [
      { step: "250 Pages", desc: "Bronze checkpoint", completed: true },
      { step: "500 Pages", desc: "Silver checkpoint", completed: true },
      { step: "750 Pages", desc: "Gold checkpoint", completed: false },
      { step: "1,000 Pages", desc: "Final badge unlock", completed: false }
    ],
    leaderboard: [
      { rank: 1, name: "Tariq Mansoor", books: 1120, avatar: "TM", status: "Completed" },
      { rank: 2, name: "Aditi Krishnan", books: 890, avatar: "AK", status: "In Progress" },
      { rank: 3, name: "Jordan Rivera", books: 680, avatar: "JR", status: "In Progress" },
      { rank: 4, name: "Sam Park", books: 510, avatar: "SP", status: "In Progress" }
    ]
  },
  {
    id: 3,
    title: "Read 3 Fantasy Novels",
    description: "Dive into imaginary realms, ancient magic systems, and legendary quests with fellow fantasy readers.",
    target: 3,
    unit: "books",
    progress: 2,
    participantsCount: 98,
    daysRemaining: 24,
    rewardXp: 400,
    badgeName: "Realm Wanderer",
    badgeIcon: "🔮",
    joined: true,
    rules: [
      "Must have the 'Fantasy' or 'Sci-Fi' genre tag.",
      "Short stories under 100 pages do not qualify."
    ],
    timeline: [
      { step: "Novice", desc: "Complete 1 fantasy novel", completed: true },
      { step: "Adept", desc: "Complete 2 fantasy novels", completed: true },
      { step: "Master", desc: "Complete 3 fantasy novels", completed: false }
    ],
    leaderboard: [
      { rank: 1, name: "Sam Park", books: 3, avatar: "SP", status: "Completed" },
      { rank: 2, name: "Jordan Rivera", books: 2, avatar: "JR", status: "In Progress" },
      { rank: 3, name: "Claire Dupont", books: 1, avatar: "CD", status: "In Progress" }
    ]
  },
  {
    id: 4,
    title: "Read 5 Different Genres Quest",
    description: "Break out of your comfort zone! Complete one book from Fiction, Mystery, Fantasy, Non-Fiction, and Classic.",
    target: 5,
    unit: "genres",
    progress: 1,
    participantsCount: 165,
    daysRemaining: 40,
    rewardXp: 900,
    badgeName: "Omni Reader",
    badgeIcon: "🧭",
    joined: false,
    rules: [
      "Each book must be in a distinct category.",
      "Must leave at least a short review upon completion."
    ],
    timeline: [
      { step: "Explorer", desc: "Read in 2 different genres", completed: false },
      { step: "Adventurer", desc: "Read in 4 different genres", completed: false },
      { step: "Polymath", desc: "Read in 5 different genres", completed: false }
    ],
    leaderboard: [
      { rank: 1, name: "Admin User", books: 5, avatar: "AU", status: "Completed" },
      { rank: 2, name: "Rahul Thomas", books: 4, avatar: "RT", status: "In Progress" },
      { rank: 3, name: "Aditi Krishnan", books: 3, avatar: "AK", status: "In Progress" }
    ]
  },
  {
    id: 5,
    title: "Weekend Reading Marathon",
    description: "Dedicate this Saturday and Sunday to pure reading immersion. Log at least 300 pages over the weekend.",
    target: 300,
    unit: "pages",
    progress: 0,
    participantsCount: 88,
    daysRemaining: 4,
    rewardXp: 350,
    badgeName: "Weekend Warrior",
    badgeIcon: "☕",
    joined: false,
    rules: [
      "Pages only count if logged between Friday 6:00 PM and Sunday 11:59 PM.",
      "Take breaks and stay hydrated!"
    ],
    timeline: [
      { step: "Warm Up", desc: "Log first 100 pages", completed: false },
      { step: "Peak", desc: "Log 200 pages", completed: false },
      { step: "Finish", desc: "Hit 300 pages", completed: false }
    ],
    leaderboard: [
      { rank: 1, name: "Meera Joseph", books: 0, avatar: "MJ", status: "Ready" },
      { rank: 2, name: "Sam Park", books: 0, avatar: "SP", status: "Ready" }
    ]
  }
];



export default MOCK_CHALLENGES;
export { MOCK_CHALLENGES };

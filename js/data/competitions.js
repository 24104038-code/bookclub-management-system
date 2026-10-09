/* =========================================================
   BOOKCLUB MOCK DATA — COMPETITIONS
   ========================================================= */

const MOCK_COMPETITIONS = [
  {
    id: 1,
    title: "30-Day Reading Race: Autumn Cup",
    description: "The premier competitive sprint of the season. Compete with readers across the platform to log the most verified pages in 30 days.",
    type: "30-Day Reading Race",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    countdownDays: 9,
    participants: 185,
    prize: "Golden Laurel Trophy & \$100 Bookshop Voucher",
    xpReward: 1500,
    status: "Active",
    joined: true,
    myProgress: {
      pagesLogged: 420,
      currentRank: 4,
      behindLeader: 140
    },
    rules: [
      "All logged sessions are subject to community reading-pace rate limits (max 300 pages/day).",
      "Must submit at least 2 mini chapter reflections during the competition.",
      "Ties will be settled by review quality scores."
    ],
    top3: [
      { rank: 1, name: "Marcus Brody", score: "560 pages", avatar: "MB", badge: "Gold Leader" },
      { rank: 2, name: "Aditi Krishnan", score: "510 pages", avatar: "AK", badge: "Silver" },
      { rank: 3, name: "Tariq Mansoor", score: "480 pages", avatar: "TM", badge: "Bronze" }
    ],
    leaderboard: [
      { rank: 1, name: "Marcus Brody", score: 560, avatar: "MB", level: 14 },
      { rank: 2, name: "Aditi Krishnan", score: 510, avatar: "AK", level: 12 },
      { rank: 3, name: "Tariq Mansoor", score: 480, avatar: "TM", level: 11 },
      { rank: 4, name: "Jordan Rivera", score: 420, avatar: "JR", level: 8, isUser: true },
      { rank: 5, name: "Sam Park", score: 380, avatar: "SP", level: 6 },
      { rank: 6, name: "Meera Joseph", score: 350, avatar: "MJ", level: 7 },
      { rank: 7, name: "Rahul Thomas", score: 310, avatar: "RT", level: 10 }
    ],
    achievements: [
      { name: "Pace Setter", desc: "Log 100 pages in the first 48 hours", unlocked: true },
      { name: "Night Owl", desc: "Complete 3 evening reading sessions", unlocked: true },
      { name: "Podium Finisher", desc: "Finish in top 3 rankings", unlocked: false }
    ]
  },
  {
    id: 2,
    title: "Fastest Reader: 400-Page Tome Dash",
    description: "Who can read Wren Achebe's 'Paper Lanterns' (400 pages) with the highest comprehension score in 7 days?",
    type: "Fastest Reader",
    startDate: "2026-10-15",
    endDate: "2026-10-22",
    countdownDays: 23,
    participants: 94,
    prize: "Author Signed Hardcover & Custom Leather Bookmark",
    xpReward: 1200,
    status: "Upcoming",
    joined: false,
    myProgress: {
      pagesLogged: 0,
      currentRank: "-",
      behindLeader: 0
    },
    rules: [
      "Everyone begins reading at 00:00 UTC on kickoff day.",
      "Must take a 10-question trivia quiz at the finish to verify reading comprehension.",
      "Fair play honor code enforced."
    ],
    top3: [
      { rank: 1, name: "Defending Champ: Clara Vance", score: "Previous record: 2.1 days", avatar: "CV", badge: "Legend" },
      { rank: 2, name: "Sam Park", score: "Contender", avatar: "SP", badge: "Challenger" },
      { rank: 3, name: "Aditi Krishnan", score: "Contender", avatar: "AK", badge: "Challenger" }
    ],
    leaderboard: [
      { rank: 1, name: "Clara Vance", score: "-", avatar: "CV", level: 13 },
      { rank: 2, name: "Sam Park", score: "-", avatar: "SP", level: 6 },
      { rank: 3, name: "Aditi Krishnan", score: "-", avatar: "AK", level: 12 }
    ],
    achievements: [
      { name: "Early Starter", desc: "Log reading within 1 hour of kickoff", unlocked: false },
      { name: "Comprehension Whiz", desc: "Score 100% on the closing quiz", unlocked: false }
    ]
  },
  {
    id: 3,
    title: "Best Reviewer Grand Prix",
    description: "Recognizing insightful criticism, literary analysis, and thoughtful feedback. Evaluated by community upvotes and editorial scoring.",
    type: "Best Reviewer",
    startDate: "2026-09-01",
    endDate: "2026-10-15",
    countdownDays: 5,
    participants: 62,
    prize: "Featured Critic Spotlight & \$75 Bookstore Credit",
    xpReward: 1000,
    status: "Active",
    joined: true,
    myProgress: {
      pagesLogged: 4, // reviews submitted
      currentRank: 3,
      behindLeader: 2
    },
    rules: [
      "Reviews must be at least 200 words with category breakdowns.",
      "No spoilers without the spoiler tag active.",
      "Voter manipulation or spam accounts lead to immediate disqualification."
    ],
    top3: [
      { rank: 1, name: "Elena Ramos", score: "148 Helpful Votes", avatar: "ER", badge: "Top Critic" },
      { rank: 2, name: "Priya Nandan", score: "124 Helpful Votes", avatar: "PN", badge: "Featured Writer" },
      { rank: 3, name: "Jordan Rivera", score: "96 Helpful Votes", avatar: "JR", badge: "Rising Voice" }
    ],
    leaderboard: [
      { rank: 1, name: "Elena Ramos", score: 148, avatar: "ER", level: 15 },
      { rank: 2, name: "Priya Nandan", score: 124, avatar: "PN", level: 14 },
      { rank: 3, name: "Jordan Rivera", score: 96, avatar: "JR", level: 8, isUser: true },
      { rank: 4, name: "Rahul Thomas", score: 82, avatar: "RT", level: 10 }
    ],
    achievements: [
      { name: "Deep Diver", desc: "Submit a 500+ word analytical critique", unlocked: true },
      { name: "Crowd Favorite", desc: "Reach 50 helpful votes on a single review", unlocked: true }
    ]
  },
  {
    id: 4,
    title: "Classic Mystery Book Trivia Bowl",
    description: "A fast-paced interactive quiz bowl testing knowledge of Agatha Christie, Arthur Conan Doyle, and contemporary thriller plots.",
    type: "Book Trivia",
    startDate: "2026-11-05",
    endDate: "2026-11-05",
    countdownDays: 45,
    participants: 120,
    prize: "Detective Sherlock Enamel Pin & Rare Editions Box",
    xpReward: 800,
    status: "Upcoming",
    joined: false,
    myProgress: {
      pagesLogged: 0,
      currentRank: "-",
      behindLeader: 0
    },
    rules: [
      "Live 45-minute trivia session.",
      "Speed bonus points awarded for answers in under 5 seconds."
    ],
    top3: [],
    leaderboard: [],
    achievements: []
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_COMPETITIONS;
}

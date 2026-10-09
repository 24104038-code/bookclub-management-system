/* =========================================================
   BOOKCLUB MOCK DATA — READING GROUPS
   ========================================================= */

const MOCK_GROUPS = [
  {
    id: 1,
    name: "Mystery Readers",
    description: "For readers who like their books full of clues, red herrings, and a satisfying final reveal. We meet weekly to compare theories before finishing each book.",
    genre: "Mystery",
    privacy: "Public",
    membersCount: 18,
    maxMembers: 25,
    currentBookId: 2, // Winter's Ledger
    meetingSchedule: "Every Saturday",
    meetingTime: "5:00 PM",
    location: "Community Library Hall, Room 2 & Online",
    organizerId: 3,
    organizerName: "Aditi Krishnan",
    activityLevel: "Very Active",
    coverGradient: "linear-gradient(135deg, #16291F, #4C6A50)",
    discussionsCount: 42,
    eventsCount: 8,
    progressPercent: 68,
    members: [
      { userId: 3, name: "Aditi Krishnan", role: "Organizer", progress: 75, avatar: "AK" },
      { userId: 2, name: "Jordan Rivera", role: "Member", progress: 64, avatar: "JR" },
      { userId: 4, name: "Rahul Thomas", role: "Member", progress: 40, avatar: "RT" },
      { userId: 5, name: "Meera Joseph", role: "Member", progress: 85, avatar: "MJ" },
      { userId: 6, name: "Sam Park", role: "Member", progress: 50, avatar: "SP" }
    ],
    pastBooks: [
      { id: 10, title: "A Gentle Treason", author: "Claire Dupont", completedDate: "June 2026" },
      { id: 1, title: "The Silent Orchard", author: "Elena Marsh", completedDate: "May 2026" }
    ],
    upcomingBooks: [
      { id: 5, title: "The Cartographer's Daughter", author: "Mina Sterling", startDate: "Oct 1, 2026" }
    ],
    poll: {
      question: "What should we read next month?",
      active: true,
      totalVotes: 32,
      userVotedOptionId: 1,
      options: [
        { id: 1, bookId: 10, title: "A Gentle Treason", author: "Claire Dupont", votes: 14 },
        { id: 2, bookId: 5, title: "The Cartographer's Daughter", author: "Mina Sterling", votes: 11 },
        { id: 3, bookId: 8, title: "Shadows Over Valdor", author: "Lucian Drake", votes: 7 }
      ]
    },
    meetingPoll: {
      question: "Preferred time for October kickoff meeting?",
      active: true,
      totalVotes: 24,
      userVotedOptionId: null,
      options: [
        { id: 101, text: "Saturday 5:00 PM UTC", votes: 13 },
        { id: 102, text: "Sunday 4:00 PM UTC", votes: 8 },
        { id: 103, text: "Wednesday 7:00 PM UTC", votes: 3 }
      ]
    }
  },
  {
    id: 2,
    name: "Fantasy Fans Circle",
    description: "Dragons, ethereal magic systems, expansive world maps, and long series are warmly celebrated here. We host deep lore breakdown discussions.",
    genre: "Fantasy",
    privacy: "Public",
    membersCount: 22,
    maxMembers: 30,
    currentBookId: 4, // Paper Lanterns
    meetingSchedule: "Every Sunday",
    meetingTime: "3:00 PM",
    location: "Virtual Meeting Room (Discord/Zoom)",
    organizerId: 2,
    organizerName: "Jordan Rivera",
    activityLevel: "High",
    coverGradient: "linear-gradient(135deg, #3B1F37, #8A5B7A)",
    discussionsCount: 56,
    eventsCount: 6,
    progressPercent: 82,
    members: [
      { userId: 2, name: "Jordan Rivera", role: "Organizer", progress: 88, avatar: "JR" },
      { userId: 6, name: "Sam Park", role: "Member", progress: 80, avatar: "SP" },
      { userId: 3, name: "Aditi Krishnan", role: "Member", progress: 65, avatar: "AK" }
    ],
    pastBooks: [
      { id: 8, title: "Shadows Over Valdor", author: "Lucian Drake", completedDate: "July 2026" }
    ],
    upcomingBooks: [
      { id: 1, title: "The Silent Orchard", author: "Elena Marsh", startDate: "Oct 15, 2026" }
    ],
    poll: {
      question: "Which magical sub-genre should our winter challenge focus on?",
      active: true,
      totalVotes: 28,
      userVotedOptionId: null,
      options: [
        { id: 1, title: "Ethereal Silk & Urban Magic", author: "Various Picks", votes: 15 },
        { id: 2, title: "Mythological Retellings", author: "Global Authors", votes: 9 },
        { id: 3, title: "Hard Magic & Alchemy", author: "Classic Canon", votes: 4 }
      ]
    },
    meetingPoll: {
      question: "Bi-weekly voice discussion session day?",
      active: true,
      totalVotes: 20,
      userVotedOptionId: 201,
      options: [
        { id: 201, text: "Sunday Evening 7:00 PM", votes: 12 },
        { id: 202, text: "Friday Night 8:00 PM", votes: 8 }
      ]
    }
  },
  {
    id: 3,
    name: "Classic Literature Club",
    description: "Slow reads, close literary attention, historical contextualization, and long conversations about timeless sentences worth rereading.",
    genre: "Classic",
    privacy: "Public",
    membersCount: 14,
    maxMembers: 20,
    currentBookId: 5, // The Cartographer's Daughter
    meetingSchedule: "Every Wednesday",
    meetingTime: "7:00 PM",
    location: "City Central Library — Study Room B",
    organizerId: 5,
    organizerName: "Meera Joseph",
    activityLevel: "Moderate",
    coverGradient: "linear-gradient(135deg, #2A4C3B, #B08A3E)",
    discussionsCount: 29,
    eventsCount: 4,
    progressPercent: 45,
    members: [
      { userId: 5, name: "Meera Joseph", role: "Organizer", progress: 60, avatar: "MJ" },
      { userId: 4, name: "Rahul Thomas", role: "Member", progress: 45, avatar: "RT" },
      { userId: 1, name: "Admin User", role: "Member", progress: 50, avatar: "AU" }
    ],
    pastBooks: [
      { id: 12, title: "The Autumn Garden Society", author: "Beatrice Finch", completedDate: "June 2026" }
    ],
    upcomingBooks: [
      { id: 3, title: "Salt & Story", author: "Priya Nandan", startDate: "Nov 1, 2026" }
    ],
    poll: {
      question: "Which era should our next cycle highlight?",
      active: true,
      totalVotes: 18,
      userVotedOptionId: null,
      options: [
        { id: 1, title: "Early 20th-century Modernists", author: "Picks: Woolf, Joyce, Mansfield", votes: 10 },
        { id: 2, title: "19th-century Realism & Naturalism", author: "Picks: Eliot, Hardy, Zola", votes: 8 }
      ]
    }
  },
  {
    id: 4,
    name: "Non-Fiction Thinkers",
    description: "Deep explorations of economics, ecology, science history, investigative journalism, and culinary sociology.",
    genre: "Non-Fiction",
    privacy: "Public",
    membersCount: 16,
    maxMembers: 25,
    currentBookId: 3, // Salt & Story
    meetingSchedule: "Every other Thursday",
    meetingTime: "6:30 PM",
    location: "Cafe Solace & Live Stream",
    organizerId: 4,
    organizerName: "Rahul Thomas",
    activityLevel: "High",
    coverGradient: "linear-gradient(135deg, #7A4E2D, #B08A3E)",
    discussionsCount: 38,
    eventsCount: 5,
    progressPercent: 70,
    members: [
      { userId: 4, name: "Rahul Thomas", role: "Organizer", progress: 75, avatar: "RT" },
      { userId: 1, name: "Admin User", role: "Member", progress: 90, avatar: "AU" },
      { userId: 3, name: "Aditi Krishnan", role: "Member", progress: 60, avatar: "AK" }
    ],
    pastBooks: [
      { id: 6, title: "Iron Tide", author: "Kareem Vance", completedDate: "May 2026" }
    ],
    upcomingBooks: [
      { id: 11, title: "Letters from the Old Silk Path", author: "Zhu Wei & Maya Lin", startDate: "Oct 10, 2026" }
    ]
  }
];



export default MOCK_GROUPS;
export { MOCK_GROUPS };

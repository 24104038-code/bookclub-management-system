/* =========================================================
   BOOKCLUB MOCK DATA — EVENTS
   ========================================================= */

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Monthly Book Discussion: Winter's Ledger",
    type: "Book Club Meeting",
    date: "2026-10-14",
    time: "6:00 PM - 7:30 PM",
    day: "14",
    month: "Oct",
    location: "Community Library Hall & Virtual Room",
    organizer: "Aditi Krishnan",
    organizerRole: "Lead Organizer",
    organizerAvatar: "AK",
    participants: 38,
    maxSeats: 50,
    coverGradient: "linear-gradient(135deg, #16291F, #4C6A50)",
    description: "Join us for our monthly breakdown of Colin Reyes's Winter's Ledger. We will dissect the accounting clues, debate the morality of the town mayor's choice, and vote on next month's selection.",
    meetingLink: "https://meet.bookclub.internal/winter-ledger-oct",
    rules: [
      "Read through Chapter 18 before attending if you want to avoid minor spoilers.",
      "Mute microphones upon entering virtual room.",
      "Be respectful and allow equal sharing time for all members."
    ],
    schedule: [
      { time: "6:00 PM", activity: "Welcome, Tea & Warm-up impressions" },
      { time: "6:20 PM", activity: "Plot & Suspense Analysis: The Red Herrings" },
      { time: "7:00 PM", activity: "Character motivations & Author interview clip" },
      { time: "7:25 PM", activity: "Voting on Next Month's Book & Close" }
    ],
    rsvpd: true, // user is RSVP'd
    attendanceStatus: "Confirmed"
  },
  {
    id: 2,
    title: "Weekend Silent Reading & Journaling Session",
    type: "Reading Session",
    date: "2026-10-18",
    time: "10:00 AM - 1:00 PM",
    day: "18",
    month: "Oct",
    location: "Riverside Reading Room, Terrace B",
    organizer: "Rahul Thomas",
    organizerRole: "Community Facilitator",
    organizerAvatar: "RT",
    participants: 22,
    maxSeats: 30,
    coverGradient: "linear-gradient(135deg, #7A4E2D, #B08A3E)",
    description: "Bring whatever book you are currently reading! An uninterrupted, cozy morning of reading with soft ambient acoustic sound, artisan coffee, and 15-minute group sharing at the finish.",
    meetingLink: "In-Person Attendance Priority",
    rules: [
      "Phones on silent throughout reading blocks.",
      "Bring your own journal or notebook for margin annotations."
    ],
    schedule: [
      { time: "10:00 AM", activity: "Coffee, seating & reading intentions" },
      { time: "10:15 AM", activity: "Deep Reading Sprint 1 (50 mins)" },
      { time: "11:05 AM", activity: "Tea & stretch break" },
      { time: "11:20 AM", activity: "Deep Reading Sprint 2 (60 mins)" },
      { time: "12:20 PM", activity: "Favorite sentence sharing & book recommendations" }
    ],
    rsvpd: false,
    attendanceStatus: "Open"
  },
  {
    id: 3,
    title: "Author Meet & Greet: Elena Marsh Live Q&A",
    type: "Author Talk",
    date: "2026-10-25",
    time: "4:00 PM - 5:30 PM",
    day: "25",
    month: "Oct",
    location: "BookClub Main Auditorium & Global Stream",
    organizer: "BookClub Editorial Team",
    organizerRole: "Platform Host",
    organizerAvatar: "AU",
    participants: 84,
    maxSeats: 100,
    coverGradient: "linear-gradient(135deg, #B5652F, #3E2712)",
    description: "An exclusive fireside chat with Elena Marsh, author of The Silent Orchard. Elena will discuss researching agricultural records, crafting multigenerational trauma, and answer reader questions live.",
    meetingLink: "https://stream.bookclub.internal/elena-marsh-live",
    rules: [
      "Submit reader questions in the chat during the first 30 minutes.",
      "Recording will be available for registered attendees for 30 days."
    ],
    schedule: [
      { time: "4:00 PM", activity: "Opening remarks & Host Introduction" },
      { time: "4:10 PM", activity: "Elena Marsh on The Silent Orchard's 7-year writing journey" },
      { time: "4:45 PM", activity: "Audience Q&A" },
      { time: "5:20 PM", activity: "Book giveaway raffle & closing words" }
    ],
    rsvpd: true,
    attendanceStatus: "Confirmed"
  },
  {
    id: 4,
    title: "Worldbuilding Masterclass: Magic & Economics",
    type: "Writing Workshop",
    date: "2026-11-02",
    time: "5:00 PM - 7:00 PM",
    day: "02",
    month: "Nov",
    location: "Creative Writing Studio & Discord",
    organizer: "Wren Achebe & Sam Park",
    organizerRole: "Workshop Mentors",
    organizerAvatar: "SP",
    participants: 35,
    maxSeats: 40,
    coverGradient: "linear-gradient(135deg, #5C3A54, #8A5B7A)",
    description: "How does magic affect currency, grain supply, and city design? Learn how to craft believable fantasy economies with author Wren Achebe.",
    meetingLink: "https://discord.gg/bookclub-workshops",
    rules: [
      "Have a draft concept or notebook ready for interactive writing prompts.",
      "Constructive feedback only."
    ],
    schedule: [
      { time: "5:00 PM", activity: "Lecture: The cost of spells and scarcity" },
      { time: "5:45 PM", activity: "15-minute quick-world prompt" },
      { time: "6:00 PM", activity: "Peer critique breakout rooms" },
      { time: "6:45 PM", activity: "Wrap-up & resource PDF giveaway" }
    ],
    rsvpd: false,
    attendanceStatus: "Open"
  },
  {
    id: 5,
    title: "Autumn Community Book Swap & Social",
    type: "Social Event",
    date: "2026-11-12",
    time: "2:00 PM - 5:00 PM",
    day: "12",
    month: "Nov",
    location: "Botanical Garden Pavilion",
    organizer: "Meera Joseph",
    organizerRole: "Social Coordinator",
    organizerAvatar: "MJ",
    participants: 46,
    maxSeats: 60,
    coverGradient: "linear-gradient(135deg, #4C6A50, #7A4E2D)",
    description: "Bring 2 to 5 gently loved books from your shelf, place them on our genre tables, and take home new discoveries! Baked goods and cider provided.",
    meetingLink: "Physical Venue Only",
    rules: [
      "Books must be complete and in readable condition.",
      "All genres welcome!"
    ],
    schedule: [
      { time: "2:00 PM", activity: "Book drop-off & categorisation" },
      { time: "2:30 PM", activity: "Browsing Round 1 (1 token per book)" },
      { time: "3:45 PM", activity: "Tea, cider & blind-date-with-a-book raffle" },
      { time: "4:15 PM", activity: "Open trade round" }
    ],
    rsvpd: false,
    attendanceStatus: "Open"
  }
];



export default MOCK_EVENTS;
export { MOCK_EVENTS };

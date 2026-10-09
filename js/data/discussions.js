/* =========================================================
   BOOKCLUB MOCK DATA — DISCUSSIONS
   ========================================================= */

const MOCK_DISCUSSIONS = [
  {
    id: 1,
    title: "What did you think about the ending of The Silent Orchard?",
    category: "Books",
    bookTag: "The Silent Orchard",
    bookId: 1,
    author: "Aditi Krishnan",
    username: "aditi_k",
    avatar: "AK",
    timeAgo: "2 hours ago",
    date: "2026-09-21",
    views: 340,
    likes: 32,
    isLiked: false,
    content: "I didn't expect Margaret to leave the orchard standing after everything she learned about her grandfather's deceit. Curious if anyone else read that as true forgiveness, or simply the exhaustion of fighting a ghost who cannot answer back?",
    hasSpoiler: true,
    spoilerContent: "The realization that the dead orchard was a sanctuary for displaced war veterans changed the entire moral landscape of Margaret's decision.",
    replies: [
      {
        id: 101,
        author: "Rahul Thomas",
        username: "rahul_t",
        avatar: "RT",
        timeAgo: "1 hour ago",
        likes: 12,
        isLiked: false,
        content: "I saw it as radical acceptance. Cutting down the trees would have been an act of vengeance, but keeping them alive forces the town to remember what happened.",
        nestedReplies: [
          {
            id: 1011,
            author: "Jordan Rivera",
            username: "jordanreads",
            avatar: "JR",
            timeAgo: "35 mins ago",
            likes: 5,
            isLiked: true,
            content: "Agreed! And that final scene where she plants the single heirloom sapling at the property gate felt like the quietest, most powerful defiance possible."
          }
        ]
      },
      {
        id: 102,
        author: "Meera Joseph",
        username: "meera_j",
        avatar: "MJ",
        timeAgo: "45 mins ago",
        likes: 7,
        isLiked: false,
        content: "The legal paperwork sub-plot was a bit dry, but the emotional symbolism of the fruit blossom was breathtaking.",
        nestedReplies: []
      }
    ]
  },
  {
    id: 2,
    title: "Which apprentice in Paper Lanterns was your favorite?",
    category: "Books",
    bookTag: "Paper Lanterns",
    bookId: 4,
    author: "Rahul Thomas",
    username: "rahul_t",
    avatar: "RT",
    timeAgo: "1 day ago",
    date: "2026-09-20",
    views: 480,
    likes: 21,
    isLiked: true,
    content: "Mine's the old deaf lantern-maker Kaelen, hands down. His devotion to capturing the celestial moths and how he spoke in gestures with the shadow spirits gave me chills.",
    hasSpoiler: false,
    replies: [
      {
        id: 201,
        author: "Sam Park",
        username: "sampark",
        avatar: "SP",
        timeAgo: "18 hours ago",
        likes: 9,
        isLiked: false,
        content: "Kaelen's sacrifice broke my heart. I really hope Wren Achebe writes a prequel focusing on his youth in the Sunken Citadel.",
        nestedReplies: []
      }
    ]
  },
  {
    id: 3,
    title: "Best tips for maintaining a 30+ day reading streak when busy?",
    category: "Reading Progress",
    bookTag: "Habits & Tracking",
    bookId: null,
    author: "Jordan Rivera",
    username: "jordanreads",
    avatar: "JR",
    timeAgo: "2 days ago",
    date: "2026-09-19",
    views: 610,
    likes: 54,
    isLiked: false,
    content: "I'm on day 14 of my reading streak! What are your go-to routines for keeping momentum on long workdays? Do you set a page minimum or a 15-minute timer?",
    hasSpoiler: false,
    replies: [
      {
        id: 301,
        author: "Admin User",
        username: "admin",
        avatar: "AU",
        timeAgo: "1 day ago",
        likes: 24,
        isLiked: false,
        content: "Always keep a book by your morning coffee. Even 5 pages before opening your work email establishes the habit without friction.",
        nestedReplies: []
      },
      {
        id: 302,
        author: "Aditi Krishnan",
        username: "aditi_k",
        avatar: "AK",
        timeAgo: "1 day ago",
        likes: 18,
        isLiked: false,
        content: "Audiobooks on 1.25x speed during commute or kitchen prep! It keeps your mind in the story even when your hands are full.",
        nestedReplies: []
      }
    ]
  },
  {
    id: 4,
    title: "Non-fiction books that read like fast-paced detective thrillers",
    category: "Recommendations",
    bookTag: "Recommendations",
    bookId: null,
    author: "Meera Joseph",
    username: "meera_j",
    avatar: "MJ",
    timeAgo: "3 days ago",
    date: "2026-09-18",
    views: 520,
    likes: 41,
    isLiked: false,
    content: "Looking for gripping historical or scientific investigative books similar to 'Iron Tide' and 'The Devil in the White City'. Drop your must-reads below!",
    hasSpoiler: false,
    replies: []
  },
  {
    id: 5,
    title: "Planning the Autumn Book Swap: Venue, snacks & guidelines",
    category: "Events",
    bookTag: "Community Events",
    bookId: null,
    author: "Aditi Krishnan",
    username: "aditi_k",
    avatar: "AK",
    timeAgo: "4 days ago",
    date: "2026-09-17",
    views: 290,
    likes: 19,
    isLiked: false,
    content: "We're finalizing table assignments for the November book swap. Should we divide tables purely by genre or by 'Favorite Comfort Reads vs. New Discoveries'?",
    hasSpoiler: false,
    replies: []
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_DISCUSSIONS;
}

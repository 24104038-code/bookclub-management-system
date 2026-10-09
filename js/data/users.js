/* =========================================================
   BOOKCLUB MOCK DATA — USERS
   ========================================================= */

const DEMO_CREDENTIALS = {
  user: {
    role: "user",
    email: "user@bookclub.com",
    username: "user",
    password: "user123",
    name: "Elena Ramos"
  },
  admin: {
    role: "admin",
    email: "admin@bookclub.com",
    username: "admin",
    password: "admin123",
    name: "Admin User"
  }
};

const MOCK_USERS = [
  {
    userId: 1,
    name: "Admin User",
    username: "admin",
    email: "admin@bookclub.com",
    password: "admin123",
    role: "admin",
    favoriteGenre: "Non-Fiction",
    bio: "BookClub head administrator and literature curator. Maintaining order, community safety, and book catalogs.",
    avatar: "AU",
    level: 15,
    xp: 4850,
    streak: 42,
    booksRead: 58,
    pagesRead: 19400,
    reviewsCount: 32,
    followers: 180,
    following: 64
  },
  {
    userId: 7,
    name: "Elena Ramos",
    username: "user",
    email: "user@bookclub.com",
    password: "user123",
    role: "user",
    favoriteGenre: "Fiction",
    bio: "Passionate reader exploring book club selections, thoughtful reviews, and reading goals.",
    avatar: "ER",
    level: 5,
    xp: 1420,
    streak: 8,
    booksRead: 10,
    pagesRead: 3200,
    reviewsCount: 7,
    followers: 40,
    following: 35
  },
  {
    userId: 2,
    name: "Jordan Rivera",
    username: "jordanreads",
    email: "jordan.rivera@example.com",
    password: "Reader@123",
    role: "member",
    favoriteGenre: "Fantasy",
    bio: "Lifelong fantasy & mystery enthusiast. Reading 50 books this year. Always up for bookish discussions and tea recommendations!",
    avatar: "JR",
    level: 8,
    xp: 2340,
    streak: 14,
    booksRead: 12,
    pagesRead: 3950,
    reviewsCount: 9,
    followers: 84,
    following: 52
  },
  {
    userId: 3,
    name: "Aditi Krishnan",
    username: "aditi_k",
    email: "aditi.krishnan@example.com",
    password: "Reader@123",
    role: "organizer",
    favoriteGenre: "Fiction",
    bio: "Organizer for Mystery Readers and host of monthly discussions. Book collector and lover of twisty psychological plots.",
    avatar: "AK",
    level: 12,
    xp: 3890,
    streak: 28,
    booksRead: 34,
    pagesRead: 11200,
    reviewsCount: 22,
    followers: 142,
    following: 95
  },
  {
    userId: 4,
    name: "Rahul Thomas",
    username: "rahul_t",
    email: "rahul.thomas@example.com",
    password: "Reader@123",
    role: "organizer",
    favoriteGenre: "Sci-Tech",
    bio: "Science journalist by day, avid classic reader by night. Hosting weekend reading sessions and technical book break-downs.",
    avatar: "RT",
    level: 10,
    xp: 3100,
    streak: 19,
    booksRead: 26,
    pagesRead: 8700,
    reviewsCount: 15,
    followers: 110,
    following: 78
  },
  {
    userId: 5,
    name: "Meera Joseph",
    username: "meera_j",
    email: "meera.joseph@example.com",
    password: "Reader@123",
    role: "member",
    favoriteGenre: "Classic",
    bio: "Exploring Victorian literature and translated East Asian fiction. Slow reader with deep margin notes.",
    avatar: "MJ",
    level: 7,
    xp: 1950,
    streak: 9,
    booksRead: 16,
    pagesRead: 5300,
    reviewsCount: 11,
    followers: 65,
    following: 40
  },
  {
    userId: 6,
    name: "Sam Park",
    username: "sampark",
    email: "sam.park@example.com",
    password: "Reader@123",
    role: "member",
    favoriteGenre: "Fantasy",
    bio: "Epic fantasy binge reader. Currently tackling 1000-page tomes.",
    avatar: "SP",
    level: 6,
    xp: 1620,
    streak: 7,
    booksRead: 8,
    pagesRead: 4100,
    reviewsCount: 5,
    followers: 45,
    following: 38
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_USERS;
}

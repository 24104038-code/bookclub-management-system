/* =========================================================
   BOOKCLUB MOCK DATA — REPORTS & MODERATION
   ========================================================= */

const MOCK_REPORTS = [
  {
    id: 1,
    targetType: "Review",
    targetTitle: "Unflagged Major Climax Spoiler in Winter's Ledger",
    reportedItemSnippet: "The murderer was the clerk's brother who swapped the audit books in 1984...",
    reportedAuthor: "JohnDoe99",
    reportedBy: "Aditi Krishnan",
    date: "2026-09-20",
    reason: "Spoiler Violation",
    description: "User revealed the ending murderer without using the spoiler tag or warning.",
    status: "Pending"
  },
  {
    id: 2,
    targetType: "Discussion",
    targetTitle: "Commercial Crypto Spam in Sci-Tech Category",
    reportedItemSnippet: "Buy this revolutionary reading token today at 100x gains link...",
    reportedAuthor: "CryptoBot44",
    reportedBy: "Rahul Thomas",
    date: "2026-09-19",
    reason: "Spam / Advertising",
    description: "Irrelevant cryptocurrency advertisement posted inside science book club topic.",
    status: "Pending"
  },
  {
    id: 3,
    targetType: "Comment",
    targetTitle: "Harassment in Discussion #14",
    reportedItemSnippet: "You have zero reading comprehension if you didn't see that coming...",
    reportedAuthor: "GrumpyReader",
    reportedBy: "Meera Joseph",
    date: "2026-09-18",
    reason: "Harassment / Uncivil",
    description: "Derogatory comments targeted at beginner readers.",
    status: "Resolved",
    resolution: "User warned; offending comment edited by moderator."
  },
  {
    id: 4,
    targetType: "User",
    targetTitle: "Impersonation of Author Elena Marsh",
    reportedItemSnippet: "Profile pretending to be the official author account promoting fake merch.",
    reportedAuthor: "ElenaMarsh_Official1",
    reportedBy: "Admin User",
    date: "2026-09-15",
    reason: "Impersonation",
    description: "Account was impersonating a verified author.",
    status: "Resolved",
    resolution: "Account suspended and verified badge badge restored to real author."
  },
  {
    id: 5,
    targetType: "Review",
    targetTitle: "Off-topic rant about delivery packaging",
    reportedItemSnippet: "Book arrived with bent corners in the mail, 1 star!",
    reportedAuthor: "ParcelHater",
    reportedBy: "Sam Park",
    date: "2026-09-14",
    reason: "Off-topic Review",
    description: "Review was complaining about courier shipping, not the literary content.",
    status: "Rejected",
    resolution: "Dismissed with advisory note to reviewer."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_REPORTS;
}

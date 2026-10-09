/* =========================================================
   BOOKCLUB MOCK DATA — READING JOURNAL
   ========================================================= */

const MOCK_JOURNAL = [
  {
    id: 1,
    bookId: 1,
    bookTitle: "The Silent Orchard",
    date: "2026-09-21",
    mood: "😍",
    moodLabel: "Enchanted",
    pagesRead: 45,
    thoughts: "Read out on the porch as the rain started. Margaret's encounter with the old beekeeper by the stone well gave me actual chills. So beautifully paced.",
    rating: 5
  },
  {
    id: 2,
    bookId: 4,
    bookTitle: "Paper Lanterns",
    date: "2026-09-20",
    mood: "🤯",
    moodLabel: "Mind Blown",
    pagesRead: 60,
    thoughts: "The battle at the Glass Spires! The revelation about who manufactured the tainted silk lanterns changed everything. Couldn't put it down until 1:00 AM.",
    rating: 5
  },
  {
    id: 3,
    bookId: 2,
    bookTitle: "Winter's Ledger",
    date: "2026-09-18",
    mood: "😊",
    moodLabel: "Satisfied",
    pagesRead: 35,
    thoughts: "Slow progress through the audit spreadsheets, but Colin Reyes makes the detective dialogue so sharp that even bank statements feel dangerous.",
    rating: 4
  },
  {
    id: 4,
    bookId: 3,
    bookTitle: "Salt & Story",
    date: "2026-09-15",
    mood: "❤️",
    moodLabel: "Heartwarming",
    pagesRead: 40,
    thoughts: "Made the cardamom spiced rice recipe while reading the coastal Kerala chapter. My apartment smells incredible and my soul feels completely nourished.",
    rating: 5
  },
  {
    id: 5,
    bookId: 5,
    bookTitle: "The Cartographer's Daughter",
    date: "2026-09-12",
    mood: "😐",
    moodLabel: "Contemplative",
    pagesRead: 25,
    thoughts: "Heavy Victorian cadence today. Took a while to get into the flow of Edinburgh maritime terminology, but the father's hidden journal entries are drawing me in.",
    rating: 3
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_JOURNAL;
}

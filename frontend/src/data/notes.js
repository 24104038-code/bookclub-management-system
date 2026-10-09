/* =========================================================
   BOOKCLUB MOCK DATA — NOTES & HIGHLIGHTS
   ========================================================= */

const MOCK_NOTES = [
  {
    id: 1,
    bookId: 1,
    bookTitle: "The Silent Orchard",
    bookAuthor: "Elena Marsh",
    page: 47,
    note: "Margaret describes the sound of the autumn wind through the bare apple branches as 'an unwritten will'. Notice the recurring motif of inheritances that cannot be legally codified.",
    tags: ["Symbolism", "Themes", "Family"],
    createdAt: "2026-09-12"
  },
  {
    id: 2,
    bookId: 2,
    bookTitle: "Winter's Ledger",
    bookAuthor: "Colin Reyes",
    page: 112,
    note: "The signature on the 1984 municipal land transfer has a double cross on the letter 't' — exactly identical to the suicide note discovered in Chapter 2. Clue points directly toward the sheriff.",
    tags: ["Clues", "Theories", "Mystery"],
    createdAt: "2026-09-16"
  },
  {
    id: 3,
    bookId: 4,
    bookTitle: "Paper Lanterns",
    bookAuthor: "Wren Achebe",
    page: 88,
    note: "The silk spun by the twilight silkworms hardens when exposed to lies. This would explain why the Emperor's palace walls are made of sheer fabric — nobody can enter while concealing deception.",
    tags: ["Worldbuilding", "Lore"],
    createdAt: "2026-09-18"
  },
  {
    id: 4,
    bookId: 3,
    bookTitle: "Salt & Story",
    bookAuthor: "Priya Nandan",
    page: 64,
    note: "The concept of 'taste memory' as inherited ancestral resilience. Reminded me of my grandmother's cardamom tea recipes during monsoon.",
    tags: ["Personal", "Quotes", "Memory"],
    createdAt: "2026-09-20"
  }
];

const MOCK_HIGHLIGHTS = [
  {
    id: 1,
    bookId: 1,
    bookTitle: "The Silent Orchard",
    bookAuthor: "Elena Marsh",
    quote: "A family is not an island; it is an orchard whose roots twist invisibly beneath the fences until they trip the neighboring children thirty years down the line.",
    page: 104,
    color: "#E9C6A5", // Clay tint
    userNote: "One of the most poetic opening chapter sentences I have read all year.",
    isFavorite: true,
    sharedToGroup: "Mystery Readers"
  },
  {
    id: 2,
    bookId: 4,
    bookTitle: "Paper Lanterns",
    bookAuthor: "Wren Achebe",
    quote: "Do not fear the darkness beyond the harbor. Fear only the lantern that burns with an borrowed flame, for it will cast someone else's shadows upon your path.",
    page: 219,
    color: "#EDE7F6", // Lavender tint
    userNote: "Said by master Kaelen during the lantern voyage ritual.",
    isFavorite: true,
    sharedToGroup: "Fantasy Fans Circle"
  },
  {
    id: 3,
    bookId: 2,
    bookTitle: "Winter's Ledger",
    bookAuthor: "Colin Reyes",
    quote: "Numbers never lie, but the men who write them into books have perfected the art of omission.",
    page: 15,
    color: "#E3EEE3", // Sage tint
    userNote: "The thesis of the entire mystery.",
    isFavorite: false,
    sharedToGroup: null
  },
  {
    id: 4,
    bookId: 3,
    bookTitle: "Salt & Story",
    bookAuthor: "Priya Nandan",
    quote: "Salt does not create flavor where none exists; it simply awakens the truths the tongue was too tired to notice.",
    page: 72,
    color: "#FDF4E3", // Gold tint
    userNote: "Cooking philosophy at its finest.",
    isFavorite: true,
    sharedToGroup: "Non-Fiction Thinkers"
  }
];

export default MOCK_NOTES;
export { MOCK_NOTES, MOCK_HIGHLIGHTS };

/* =========================================================
   BOOKCLUB MOCK DATA — REVIEWS
   ========================================================= */

const MOCK_REVIEWS = [
  {
    id: 1,
    bookId: 1,
    bookTitle: "The Silent Orchard",
    bookAuthor: "Elena Marsh",
    user: "Aditi Krishnan",
    username: "aditi_k",
    avatar: "AK",
    overallRating: 5,
    categoryRatings: {
      story: 5,
      characters: 5,
      writing: 5,
      pacing: 4,
      worldBuilding: 4
    },
    reviewText: "Slow in the best possible way. Every single chapter uncovers one more tangled root of this family's generational silence. Elena Marsh knows how to write grief without turning it into cheap melodrama. The imagery of the dying orchard in late November will stay with me for years.",
    date: "June 12, 2026",
    likes: 48,
    isLiked: false,
    hasSpoiler: false
  },
  {
    id: 2,
    bookId: 2,
    bookTitle: "Winter's Ledger",
    bookAuthor: "Colin Reyes",
    user: "Jordan Rivera",
    username: "jordanreads",
    avatar: "JR",
    overallRating: 5,
    categoryRatings: {
      story: 5,
      characters: 4,
      writing: 4,
      pacing: 5,
      worldBuilding: 4
    },
    reviewText: "I usually read fantasy, but Winter's Ledger had my pulse racing by chapter four! Colin Reyes manages to turn municipal audits and ledger entries into an absolute page-turner. The mid-book twist caught me totally off guard. HIGHLY recommended for any mystery lover.",
    date: "July 20, 2026",
    likes: 36,
    isLiked: true,
    hasSpoiler: false
  },
  {
    id: 3,
    bookId: 4,
    bookTitle: "Paper Lanterns",
    bookAuthor: "Wren Achebe",
    user: "Sam Park",
    username: "sampark",
    avatar: "SP",
    overallRating: 5,
    categoryRatings: {
      story: 5,
      characters: 5,
      writing: 5,
      pacing: 4,
      worldBuilding: 5
    },
    reviewText: "The lantern-making magic system is one of the most original and atmospheric concepts I've read in modern fantasy. The relationship between the apprentice and the old master feels earned and emotionally devastating by the final act.",
    date: "August 2, 2026",
    likes: 29,
    isLiked: false,
    hasSpoiler: false
  },
  {
    id: 4,
    bookId: 3,
    bookTitle: "Salt & Story",
    bookAuthor: "Priya Nandan",
    user: "Meera Joseph",
    username: "meera_j",
    avatar: "MJ",
    overallRating: 4,
    categoryRatings: {
      story: 4,
      characters: 4,
      writing: 5,
      pacing: 3,
      worldBuilding: 4
    },
    reviewText: "A warm, generous food memoir. The historical essays woven between recipes shed so much light on ancient Indian Ocean spice commerce. Don't read this on an empty stomach!",
    date: "August 14, 2026",
    likes: 19,
    isLiked: false,
    hasSpoiler: false
  },
  {
    id: 5,
    bookId: 1,
    bookTitle: "The Silent Orchard",
    bookAuthor: "Elena Marsh",
    user: "Rahul Thomas",
    username: "rahul_t",
    avatar: "RT",
    overallRating: 4,
    categoryRatings: {
      story: 4,
      characters: 4,
      writing: 4,
      pacing: 3,
      worldBuilding: 3
    },
    reviewText: "The middle act slows down significantly around the legal dispute over the irrigation rights, but the emotional payoff in the final 40 pages makes every quiet moment worth it. Beware the secret revealed in Margaret's grandmother's diary!",
    date: "August 29, 2026",
    likes: 14,
    isLiked: false,
    hasSpoiler: true,
    spoilerText: "The deed was never actually signed by Margaret's grandfather; her grandmother kept the estate illegally to protect the orchard hands from eviction."
  }
];



export default MOCK_REVIEWS;
export { MOCK_REVIEWS };

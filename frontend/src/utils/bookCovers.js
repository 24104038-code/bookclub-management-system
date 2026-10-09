export const DEFAULT_BOOK_COVER = '/images/books/default-cover.jpg';

export const BOOK_COVER_MAP = {
  1: '/images/books/silent-orchard.jpg',
  2: '/images/books/winters-ledger.jpg',
  3: '/images/books/salt-and-story.jpg',
  4: '/images/books/paper-lanterns.jpg',
  5: '/images/books/cartographers-daughter.jpg',
  6: '/images/books/iron-tide.jpg',
  7: '/images/books/high-weald.jpg',
  8: '/images/books/shadows-valdor.jpg',
  9: '/images/books/clockwork-astrolabe.jpg',
  10: '/images/books/gentle-treason.jpg',
  11: '/images/books/silk-path.jpg',
  12: '/images/books/autumn-garden.jpg',
  13: '/images/books/ponniyin-selvan.svg',
  14: '/images/books/sivagami.svg',
  15: '/images/books/parthiban-kanavu.svg',
  16: '/images/books/thirukkural.svg',
  17: '/images/books/velpari.svg',
  18: '/images/books/mogamul.svg',
  19: '/images/books/obsidian-codex.svg',
  20: '/images/books/banyan-whispers.svg',
  21: '/images/books/celestial-navigator.svg',
  22: '/images/books/veera-yugam.svg',
  23: '/images/books/alchemist-shadows.svg',
  24: '/images/books/thirukkural-gold.svg',
  25: '/images/books/silappatikaram.svg',
  26: '/images/books/kurinjithen.svg',
  "The Silent Orchard": '/images/books/silent-orchard.jpg',
  "Winter's Ledger": '/images/books/winters-ledger.jpg',
  "Salt & Story": '/images/books/salt-and-story.jpg',
  "Paper Lanterns Over Kyoto": '/images/books/paper-lanterns.jpg',
  "The Cartographer's Daughter": '/images/books/cartographers-daughter.jpg',
  "The Iron Tide": '/images/books/iron-tide.jpg',
  "The High Weald": '/images/books/high-weald.jpg',
  "Shadows of Valdor": '/images/books/shadows-valdor.jpg',
  "The Clockwork Astrolabe": '/images/books/clockwork-astrolabe.jpg',
  "A Gentle Treason": '/images/books/gentle-treason.jpg',
  "Letters from the Old Silk Path": '/images/books/silk-path.jpg',
  "The Autumn Garden Society": '/images/books/autumn-garden.jpg',
  "Ponniyin Selvan": '/images/books/ponniyin-selvan.svg',
  "பொன்னியின் செல்வன்": '/images/books/ponniyin-selvan.svg',
  "Sivagamiyin Sabatham": '/images/books/sivagami.svg',
  "சிவகாமியின் சபதம்": '/images/books/sivagami.svg',
  "Parthiban Kanavu": '/images/books/parthiban-kanavu.svg',
  "பார்த்திபன் கனவு": '/images/books/parthiban-kanavu.svg',
  "Thirukkural": '/images/books/thirukkural.svg',
  "திருக்குறள்": '/images/books/thirukkural.svg',
  "Velpari": '/images/books/velpari.svg',
  "வேள்பாரி": '/images/books/velpari.svg',
  "Mogamul": '/images/books/mogamul.svg',
  "மோகமுள்": '/images/books/mogamul.svg',
  "Silappatikaram": '/images/books/silappatikaram.svg',
  "சிலப்பதிகாரம்": '/images/books/silappatikaram.svg',
  "Kurinjithen": '/images/books/kurinjithen.svg',
  "குறிஞ்சித்தேன்": '/images/books/kurinjithen.svg',
  "The Obsidian Codex": '/images/books/obsidian-codex.svg',
  "Whispers of the Banyan Tree": '/images/books/banyan-whispers.svg',
  "The Celestial Navigator": '/images/books/celestial-navigator.svg',
  "Veera Yugam: Chronicles of the Lost Dynasty": '/images/books/veera-yugam.svg',
  "The Alchemist of Shadows": '/images/books/alchemist-shadows.svg',
  "Tirukkural: The Art of Living Master Gold Edition": '/images/books/thirukkural-gold.svg'
};

export function getBookCoverUrl(book) {
  if (!book) return DEFAULT_BOOK_COVER;
  let cover = book.coverImage || book.image || book.cover || book.cover_image;
  if (!cover && book.id) cover = BOOK_COVER_MAP[book.id];
  if (!cover && book.title) cover = BOOK_COVER_MAP[book.title];
  if (!cover) cover = DEFAULT_BOOK_COVER;

  if (cover && !cover.startsWith('http') && !cover.startsWith('/') && !cover.startsWith('data:')) {
    cover = '/' + cover;
  }
  return cover;
}

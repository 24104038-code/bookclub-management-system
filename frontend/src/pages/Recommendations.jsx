import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BookClubStore from '../services/store';
import BookCard from '../components/BookCard';
import { useI18n } from '../context/I18nContext';

export default function Recommendations() {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const { language, t } = useI18n();

  useEffect(() => {
    setBooks(BookClubStore.getBooks());
  }, []);

  // Helper to safely find a book by numeric ID
  const getBook = (id) => books.find(b => b.id === id);

  // SECTION 1: Top Picks For You (No duplicates with other sections)
  const forYou = useMemo(() => {
    return [getBook(1), getBook(5), getBook(6), getBook(8)].filter(Boolean);
  }, [books]);

  // SECTION 2: Tamil Literature & Heritage Classics (Ponniyin Selvan, Sivagami, Thirukkural, Velpari, etc.)
  const tamilClassics = useMemo(() => {
    const list = [
      getBook(13), // Ponniyin Selvan
      getBook(14), // Sivagamiyin Sabatham
      getBook(16), // Thirukkural
      getBook(17), // Velpari
      getBook(15), // Parthiban Kanavu
      getBook(18), // Mogamul
      getBook(25), // Silappatikaram
      getBook(26)  // Kurinjithen
    ].filter(Boolean);
    return list;
  }, [books]);

  // SECTION 3: Gripping Mysteries & Detective Fiction
  const mysteryPicks = useMemo(() => {
    return [getBook(2), getBook(10), getBook(23), getBook(9)].filter(Boolean);
  }, [books]);

  // SECTION 4: Cultural Heritage, Non-Fiction & Memoirs
  const nonFictionPicks = useMemo(() => {
    return [getBook(3), getBook(11), getBook(12), getBook(20)].filter(Boolean);
  }, [books]);

  // SECTION 5: Epic Fantasy & Sci-Tech
  const fantasyPicks = useMemo(() => {
    return [getBook(4), getBook(19), getBook(21), getBook(22)].filter(Boolean);
  }, [books]);

  // SECTION 6: Community Hall of Fame (Highest Rated Across Platform)
  const hallOfFame = useMemo(() => {
    return [getBook(24), getBook(13), getBook(2), getBook(17)].filter(Boolean);
  }, [books]);

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    if (sectionId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <style>{`
        .why-badge {
          background: var(--cream-deep);
          border: 1px dashed var(--clay);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.78rem;
          color: var(--brown-deep);
          margin-bottom: 10px;
          display: block;
          font-weight: 600;
        }
        .why-badge-tamil {
          background: #FFF7ED;
          border: 1px solid #F97316;
          color: #C2410C;
        }
        .why-badge-gold {
          background: #FEF9C3;
          border: 1px solid #EAB308;
          color: #854D0E;
        }
        .rec-nav-dock {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 24px;
        }
        .rec-pill-btn {
          background: var(--paper);
          border: 1.5px solid var(--line);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--ink-soft);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .rec-pill-btn:hover {
          border-color: var(--clay);
          color: var(--brown-deep);
          background: var(--cream-deep);
        }
        .rec-pill-btn.active {
          background: var(--brown-deep);
          color: #fff;
          border-color: var(--brown-deep);
        }
        .rec-pill-btn.tamil-highlight {
          border-color: #F97316;
          color: #EA580C;
          background: #FFF7ED;
        }
        .rec-pill-btn.tamil-highlight.active {
          background: #EA580C;
          color: #fff;
        }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            {language === 'ta' ? 'தனிப்பயன் புத்தகப் பரிந்துரைகள்' : 'Personalized Recommendations'}
          </h1>
          <p className="text-soft" style={{ margin: '4px 0 0' }}>
            {language === 'ta'
              ? 'உங்கள் வாசிப்பு விருப்பங்கள், மதிப்பீடுகள் மற்றும் தமிழ் இலக்கியத் தேர்வுகள் அடிப்படையில் தேர்ந்தெடுக்கப்பட்டவை.'
              : 'Hand-picked literature matched to your reader taste, historical classics, and circle pace.'}
          </p>
        </div>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <Link to="/books" className="btn btn-outline btn-sm">
            {language === 'ta' ? 'முழு நூல்களஞ்சியம் 📚' : 'Browse All Books 📚'}
          </Link>
          <Link to="/library" className="btn btn-primary btn-sm">
            {language === 'ta' ? 'எனது அலமாரி 🔖' : 'My Shelf Queue 🔖'}
          </Link>
        </div>
      </div>

      {/* BANNER */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, var(--brown-deep), #2A1808)', color: '#fff' }}>
        <span className="eyebrow" style={{ color: 'var(--shell-gold)' }}>
          {language === 'ta' ? '✨ செயற்கை நுண்ணறிவுப் பரிந்துரை இயந்திரம்' : '✨ Literary Engine & Heritage Archive'}
        </span>
        <h1 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '1.8rem' }}>
          {language === 'ta' ? 'வாசக ரசனைக்கேற்ற சிறந்த நூல்கள்' : 'Distinct Books Tailored to Your Reading Taste'}
        </h1>
        <p style={{ color: '#DCC9AE', maxWidth: 700, margin: 0, fontSize: '0.95rem' }}>
          {language === 'ta'
            ? 'சோழர் வரலாறு, சங்க கால காவியங்கள், தமிழ் செவ்வியல் நூல்கள் மற்றும் உலக இலக்கியங்கள் உள்ளடக்கிய தனித்துவமான பரிந்துரைகள்.'
            : 'Explore diverse, non-repeating recommendations featuring celebrated Tamil epics, gripping mysteries, fantasy sagas, and 5-star community favorites.'}
        </p>
      </div>

      {/* CATEGORY JUMP DOCK */}
      <div className="rec-nav-dock">
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => scrollToSection('all')}
        >
          🌟 {language === 'ta' ? 'அனைத்து தேர்வுகள்' : 'All Recommendations'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn tamil-highlight ${activeTab === 'section-tamil' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-tamil')}
        >
          🌾 {language === 'ta' ? 'தமிழ் இலக்கியப் பொக்கிஷங்கள் (8 நூல்கள்)' : 'Tamil Literature & Classics (8 Books)'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'section-foryou' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-foryou')}
        >
          💡 {language === 'ta' ? 'சிறப்புத் தேர்வுகள்' : 'Top Picks For You'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'section-mystery' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-mystery')}
        >
          🔍 {language === 'ta' ? 'மர்மம் & துப்பறிதல்' : 'Mystery & Investigation'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'section-nonfiction' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-nonfiction')}
        >
          📜 {language === 'ta' ? 'வரலாறு & பண்பாடு' : 'Memoirs & Cultural Lore'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'section-fantasy' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-fantasy')}
        >
          ✨ {language === 'ta' ? 'கற்பனை & விண்வெளி' : 'Fantasy & Worldbuilding'}
        </button>
        <button
          type="button"
          className={`rec-pill-btn ${activeTab === 'section-halloffame' ? 'active' : ''}`}
          onClick={() => scrollToSection('section-halloffame')}
        >
          🏆 {language === 'ta' ? 'வாசகர் விருப்பங்கள்' : 'Community Hall of Fame'}
        </button>
      </div>

      {/* SECTION 1: RECOMMENDED FOR YOU */}
      <div id="section-foryou" style={{ marginBottom: '45px' }}>
        <div className="flex-between mb-20">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              💡 {language === 'ta' ? 'உங்களுக்கான சிறப்புத் தேர்வுகள்' : 'Recommended For You'}
            </h2>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta' ? 'ஆழ்ந்த புனைகதை மற்றும் இலக்கியத் தேர்வுகள்.' : 'Top matches based on introspective fiction and classic literature.'}
            </p>
          </div>
        </div>
        <div className="grid grid-4">
          {forYou.map(b => (
            <div key={b.id}>
              <span className="why-badge">
                💡 {b.recommendedReason_ta && language === 'ta' ? b.recommendedReason_ta : b.recommendedReason || 'Curated match for your reading style'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CELEBRATED TAMIL LITERATURE & CLASSICS */}
      <div id="section-tamil" style={{ marginBottom: '50px', background: 'rgba(255, 247, 237, 0.4)', padding: '24px', borderRadius: '16px', border: '1.5px solid rgba(249, 115, 22, 0.25)' }}>
        <div className="flex-between mb-20">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>🌾</span>
              <h2 style={{ margin: 0, fontSize: '1.45rem', color: '#9A3412' }}>
                {language === 'ta' ? 'தமிழ் இலக்கியப் பொக்கிஷங்கள்' : 'Celebrated Tamil Literature & Classics'}
              </h2>
              <span style={{ background: '#EA580C', color: '#fff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                தமிழ் மரபு
              </span>
            </div>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta'
                ? 'பொன்னியின் செல்வன், சிவகாமியின் சபதம், திருக்குறள், வேள்பாரி, சிலப்பதிகாரம் உள்ளிட்ட அழியாத் தமிழ் காவியங்கள்.'
                : 'Immortal Tamil masterpieces featuring Chola epics, Pallava history, Thirukkural moral wisdom, and Sangam valor with original book covers.'}
            </p>
          </div>
          <Link to="/books?genre=Historical%20Fiction" className="btn btn-outline btn-sm" style={{ borderColor: '#EA580C', color: '#EA580C' }}>
            {language === 'ta' ? 'அனைத்து தமிழ் நூல்கள் →' : 'View All Tamil Books →'}
          </Link>
        </div>
        <div className="grid grid-4" style={{ rowGap: '30px' }}>
          {tamilClassics.map(b => (
            <div key={b.id}>
              <span className="why-badge why-badge-tamil">
                🌾 {b.recommendedReason_ta && language === 'ta' ? b.recommendedReason_ta : b.recommendedReason || 'Celebrated Tamil classic'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: GRIPPING MYSTERIES & INVESTIGATION */}
      <div id="section-mystery" style={{ marginBottom: '45px' }}>
        <div className="flex-between mb-20">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              🔍 {language === 'ta' ? 'புதிரான மர்மங்கள் & துப்பறியும் நாவல்கள்' : 'Investigative Mysteries & Deduction'}
            </h2>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta' ? 'விறுவிறுப்பான புதிர்கள், மர்மக் குறிப்புகள் மற்றும் எதிர்பாராத திருப்பங்கள்.' : 'Intricate clues, suspenseful investigations, and atmospheric secrets.'}
            </p>
          </div>
        </div>
        <div className="grid grid-4">
          {mysteryPicks.map(b => (
            <div key={b.id}>
              <span className="why-badge">
                🔍 {b.recommendedReason_ta && language === 'ta' ? b.recommendedReason_ta : b.recommendedReason || 'Pacing with intricate secrets'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: CULTURAL HERITAGE & MEMOIRS */}
      <div id="section-nonfiction" style={{ marginBottom: '45px' }}>
        <div className="flex-between mb-20">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              📜 {language === 'ta' ? 'வரலாறு, பண்பாடு & நினைவுக் குறிப்புகள்' : 'Cultural Heritage & Rich Non-Fiction'}
            </h2>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta' ? 'உணவு மரபுகள், பழங்கால வர்த்தக வழிகள் மற்றும் சமூக வரலாறு.' : 'Culinary journeys, ancient trade routes, and heartwarming social reflections.'}
            </p>
          </div>
        </div>
        <div className="grid grid-4">
          {nonFictionPicks.map(b => (
            <div key={b.id}>
              <span className="why-badge">
                📜 {b.recommendedReason_ta && language === 'ta' ? b.recommendedReason_ta : b.recommendedReason || 'Cultural insight and reflection'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: EPIC FANTASY & SCI-TECH */}
      <div id="section-fantasy" style={{ marginBottom: '45px' }}>
        <div className="flex-between mb-20">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              ✨ {language === 'ta' ? 'கற்பனை உலகம் & விண்வெளி சாகசங்கள்' : 'Epic Fantasy & Worldbuilding Adventures'}
            </h2>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta' ? 'மந்திர ஏடுகள், தொலைதூர விண்மீன் மண்டலங்கள் மற்றும் பிரம்மாண்ட போர்கள்.' : 'Forbidden grimoires, cosmic space corridors, and grand dynastic chronicles.'}
            </p>
          </div>
        </div>
        <div className="grid grid-4">
          {fantasyPicks.map(b => (
            <div key={b.id}>
              <span className="why-badge">
                ✨ {b.recommendedReason_ta && language === 'ta' ? b.recommendedReason_ta : b.recommendedReason || 'High-concept worldbuilding'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: COMMUNITY HALL OF FAME */}
      <div id="section-halloffame" style={{ marginBottom: '45px' }}>
        <div className="flex-between mb-20">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              🏆 {language === 'ta' ? 'வாசகர்களின் ஆல்-டைம் விருப்பங்கள் (ஹால் ஆஃப் ஃபேம்)' : 'Community Hall of Fame'}
            </h2>
            <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
              {language === 'ta' ? 'BOOK FORGE வாசகர்களால் அதிக மதிப்பீடு வழங்கப்பட்ட தலைசிறந்த நூல்கள்.' : 'Top 5.0 and 4.9 star rated books with community-wide acclaim.'}
            </p>
          </div>
        </div>
        <div className="grid grid-4">
          {hallOfFame.map(b => (
            <div key={b.id}>
              <span className="why-badge why-badge-gold">
                🏆 ★ {b.rating} · {language === 'ta' ? 'வாசகர் மனங்களை வென்ற நூல்' : 'All-time community acclaim'}
              </span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

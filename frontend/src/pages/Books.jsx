import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookCard from '../components/BookCard';
import BookClubStore from '../services/store';
import { useI18n } from '../context/I18nContext';

export default function Books() {
  const [searchParams] = useSearchParams();
  const outletCtx = useOutletContext() || {};
  const { t, language, getBookText } = useI18n();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [genreFilter, setGenreFilter] = useState(searchParams.get('genre') || 'all');
  const [ratingFilter, setRatingFilter] = useState('0');
  const [pageFilter, setPageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);

  const allBooks = BookClubStore.getBooks();

  // Listen for unlock events
  React.useEffect(() => {
    const handleClaim = () => setRefreshTick((t) => t + 1);
    window.addEventListener('bookclub_quest_claimed', handleClaim);
    return () => window.removeEventListener('bookclub_quest_claimed', handleClaim);
  }, []);

  // Helper to detect Tamil books
  const isTamilBook = (b) => {
    return !!(
      b.isTamil ||
      [13, 14, 15, 16, 17, 18, 20, 22, 24, 25, 26].includes(b.id) ||
      (b.title_ta && /[\u0B80-\u0BFF]/.test(b.title_ta)) ||
      (b.author_ta && /[\u0B80-\u0BFF]/.test(b.author_ta))
    );
  };

  const filteredBooks = useMemo(() => {
    let result = allBooks.filter((b) => {
      const q = searchQuery.trim().toLowerCase();

      // Status filter
      const isLocked = BookClubStore.isBookLocked(b.id);
      if (statusFilter === 'available' && isLocked) return false;
      if (statusFilter === 'locked' && !isLocked) return false;
      if (statusFilter === 'tamil' && !isTamilBook(b)) return false;

      const isTamil = isTamilBook(b);
      const matchesSearch = !q ||
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.title_ta && b.title_ta.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.author_ta && b.author_ta.toLowerCase().includes(q)) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (b.genre_ta && b.genre_ta.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.description_ta && b.description_ta.toLowerCase().includes(q)) ||
        ((q === 'tamil' || q === 'தமிழ்' || q === 'chola' || q === 'kalki') && isTamil);

      const matchesGenre = genreFilter === 'all' ||
        (genreFilter === 'Tamil Literature' ? isTamil : b.genre.toLowerCase() === genreFilter.toLowerCase());
      const minRating = Number(ratingFilter) || 0;
      const matchesRating = !minRating || b.rating >= minRating;

      let matchesLength = true;
      if (pageFilter === 'short') matchesLength = b.totalPages < 300;
      else if (pageFilter === 'medium') matchesLength = b.totalPages >= 300 && b.totalPages <= 450;
      else if (pageFilter === 'long') matchesLength = b.totalPages > 450;

      return matchesSearch && matchesGenre && matchesRating && matchesLength;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.publicationYear || 0) - (a.publicationYear || 0);
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      if (sortBy === 'title') {
        const titleA = getBookText ? getBookText(a, 'title') : a.title;
        const titleB = getBookText ? getBookText(b, 'title') : b.title;
        return titleA.localeCompare(titleB);
      }
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating;
    });

    return result;
  }, [allBooks, searchQuery, genreFilter, ratingFilter, pageFilter, sortBy, statusFilter, refreshTick, getBookText]);

  const handleReset = () => {
    setSearchQuery('');
    setGenreFilter('all');
    setRatingFilter('0');
    setPageFilter('all');
    setSortBy('popular');
    setStatusFilter('all');
  };

  const resultsLabel = language === 'ta'
    ? `${allBooks.length} புத்தகங்களில் ${filteredBooks.length} காட்டப்படுகிறது`
    : language === 'hi'
    ? `${allBooks.length} किताबों में से ${filteredBooks.length} दिखाई जा रही हैं`
    : language === 'es'
    ? `Mostrando ${filteredBooks.length} de ${allBooks.length} libros`
    : language === 'fr'
    ? `Affichage de ${filteredBooks.length} sur ${allBooks.length} livres`
    : language === 'de'
    ? `Zeige ${filteredBooks.length} von ${allBooks.length} Büchern`
    : `Showing ${filteredBooks.length} of ${allBooks.length} books`;

  return (
    <div>
      <Topbar
        title={language === 'ta' ? 'புத்தகங்கள்' : language === 'hi' ? 'पुस्तक संग्रह' : 'Book Discovery'}
        subtitle={language === 'ta' ? 'நூல்களைத் தேடுங்கள், உங்கள் நூலகத்தில் சேர்த்து வாசியுங்கள்.' : 'Browse our curated catalog, filter by genre or pacing, and add books to your personal shelf.'}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/library" className="btn btn-outline btn-sm">
            {language === 'ta' ? 'எனது நூலகம் 📚' : 'My Library Shelves 📚'}
          </Link>
        }
      />

      {/* ADVANCED FILTER & SEARCH BAR */}
      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2, minWidth: '250px' }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder={t('topbar.searchPlaceholder', 'Search by book title, author, or keywords...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="all">{t('books.allGenres', 'All Genres')}</option>
          <option value="Tamil Literature">🌾 {language === 'ta' ? 'தமிழ் இலக்கியம் & செவ்வியல்' : 'Tamil Literature (தமிழ் நூல்கள்)'}</option>
          <option value="Fiction">{t('books.genreFiction', 'Fiction')}</option>
          <option value="Historical Fiction">{t('books.genreHistorical', 'Historical Fiction')}</option>
          <option value="Mystery">{t('books.genreMystery', 'Mystery')}</option>
          <option value="Fantasy">{t('books.genreFantasy', 'Fantasy')}</option>
          <option value="Classic">{t('books.genreClassic', 'Classic Literature')}</option>
          <option value="Philosophy">{t('books.genrePhilosophy', 'Philosophy')}</option>
          <option value="Non-Fiction">{t('books.genreNonFiction', 'Non-Fiction')}</option>
          <option value="Sci-Tech">{t('books.genreSciTech', 'Science & Technology')}</option>
        </select>

        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="0">{t('books.anyRating', 'Any Rating')}</option>
          <option value="4.5">★ 4.5 & up</option>
          <option value="4.0">★ 4.0 & up</option>
          <option value="3.5">★ 3.5 & up</option>
        </select>

        <select value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}>
          <option value="all">{t('books.anyLength', 'Any Length')}</option>
          <option value="short">{t('books.shortPages', '< 300 pages')}</option>
          <option value="medium">{t('books.mediumPages', '300 - 450 pages')}</option>
          <option value="long">{t('books.longPages', '> 450 pages')}</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="popular">{t('books.mostPopular', 'Sort: Most Popular')}</option>
          <option value="rating">{t('books.highestRated', 'Sort: Highest Rated')}</option>
          <option value="newest">{t('books.newest', 'Sort: Newest')}</option>
          <option value="reviews">{t('books.mostReviewed', 'Sort: Most Reviewed')}</option>
          <option value="title">{t('books.titleAZ', 'Sort: Title A–Z')}</option>
        </select>

        <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
          {t('books.reset', 'Reset')}
        </button>
      </div>

      {/* STATUS TABS: ALL / TAMIL CLASSICS / AVAILABLE / LOCKED REWARDS */}
      <div className="catalog-status-tabs">
        <button
          type="button"
          className={`status-pill-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          📚 All Catalog
        </button>
        <button
          type="button"
          className={`status-pill-tab ${statusFilter === 'tamil' ? 'active' : ''}`}
          onClick={() => setStatusFilter('tamil')}
          style={statusFilter === 'tamil' ? { background: '#EA580C', borderColor: '#EA580C', color: '#fff' } : undefined}
        >
          🌾 {language === 'ta' ? 'தமிழ் இலக்கியப் பொக்கிஷங்கள்' : 'தமிழ் நூல்கள் (Tamil Classics)'}
        </button>
        <button
          type="button"
          className={`status-pill-tab ${statusFilter === 'available' ? 'active' : ''}`}
          onClick={() => setStatusFilter('available')}
        >
          🔓 Available Books
        </button>
        <button
          type="button"
          className={`status-pill-tab ${statusFilter === 'locked' ? 'active' : ''}`}
          onClick={() => setStatusFilter('locked')}
        >
          🔒 Quest Rewards Vault
        </button>
      </div>

      {/* HIGHLIGHTED BANNER FOR TAMIL SECTION */}
      {statusFilter === 'tamil' && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1.5px solid #F97316',
          borderRadius: '12px',
          padding: '16px 22px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌾</span>
            <div>
              <strong style={{ color: '#9A3412', fontSize: '1.1rem', display: 'block' }}>
                {language === 'ta' ? 'அழியாத் தமிழ் செவ்வியல் நூல்கள் & காவியங்கள்' : 'Immortal Tamil Literature & Classics'}
              </strong>
              <span style={{ color: '#C2410C', fontSize: '0.86rem' }}>
                {language === 'ta'
                  ? 'கல்கி, திருவள்ளுவர், சு. வெங்கடேசன், இளங்கோ அடிகள், தி. ஜானகிராமன், ராஜம் கிருஷ்ணன் ஆகியோரின் பெருமைமிகு படைப்புகள்.'
                  : 'Featuring Ponniyin Selvan, Sivagamiyin Sabatham, Thirukkural, Velpari, Silappatikaram, Kurinjithen & more.'}
              </span>
            </div>
          </div>
          <span style={{
            background: '#EA580C',
            color: '#fff',
            fontSize: '0.82rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '999px',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
          }}>
            🌾 {filteredBooks.length} {language === 'ta' ? 'தமிழ் நூல்கள்' : 'Tamil Classics'}
          </span>
        </div>
      )}

      {/* RESULTS METRIC STRIP */}
      <div className="flex-between mb-30" style={{ padding: '0 4px' }}>
        <span className="text-soft">{resultsLabel}</span>
        <div className="flex gap-12" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          <span>{t('books.tip', 'Tip: Click on a book cover to open in-depth discussions & reader notes')}</span>
        </div>
      </div>

      {/* BOOK GRID */}
      {filteredBooks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <h3>{t('books.noBooks', 'No books match your filters')}</h3>
          <p className="text-soft" style={{ marginBottom: '20px' }}>
            {t('books.noBooksSub', 'Try resetting filters or searching for another title.')}
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleReset}>
            {t('books.resetAll', 'Reset All Filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-4" style={{ marginBottom: '40px' }}>
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

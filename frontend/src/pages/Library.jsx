import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { useI18n } from '../context/I18nContext';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function Library() {
  const outletCtx = useOutletContext() || {};
  const { t, getBookText, language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [shelves, setShelves] = useState({
    reading: [],
    want: [],
    read: [],
    dnf: [],
    favorites: []
  });
  const [pickedBook, setPickedBook] = useState(null);

  const loadShelves = () => {
    const s = BookClubStore.getLibraryShelves();
    setShelves(s);
  };

  useEffect(() => {
    loadShelves();
  }, []);

  const handleShelfChange = (bookId, newShelf) => {
    BookClubStore.setBookShelf(bookId, newShelf);
    loadShelves();
  };

  const handleFavoriteToggle = (bookId) => {
    BookClubStore.toggleBookFavorite(bookId);
    loadShelves();
  };

  const handlePickForMe = () => {
    const wantList = shelves.want;
    if (wantList.length === 0) {
      alert('Your "Want to Read" shelf is empty! Add books from the catalog first.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * wantList.length);
    setPickedBook(wantList[randomIndex]);
  };

  const filterBooks = (booksList) => {
    return booksList.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchesGenre = genreFilter === 'all' || b.genre.toLowerCase() === genreFilter.toLowerCase();
      return matchesSearch && matchesGenre;
    });
  };

  const renderShelfColumn = (title, count, books, shelfKey) => {
    const filtered = filterBooks(books);
    return (
      <div className="shelf-column" id={`col-${shelfKey}`}>
        <div className="shelf-header">
          <h3 className="shelf-title">{title}</h3>
          <span className="shelf-count">{filtered.length}</span>
        </div>
        <div className="shelf-book-list">
          {filtered.length === 0 ? (
            <div className="empty-shelf-hint" style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
              No books on this shelf
            </div>
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="card shelf-book-item" style={{ padding: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '56px', height: '82px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.14)', background: 'var(--cream-deep)' }}>
                    <img
                      src={getBookCoverUrl(b)}
                      alt={b.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                      onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Link to={`/books/${b.id}`}>{getBookText ? getBookText(b, 'title') : (b.title_ta || b.title)}</Link>
                    </h4>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                      {getBookText ? getBookText(b, 'author') : (b.author_ta || b.author)} · {getBookText ? getBookText(b, 'genre') : (b.genre_ta || b.genre)}
                    </p>
                    
                    {shelfKey === 'reading' && (
                      <div style={{ marginBottom: '8px' }}>
                        <div className="progress-track" style={{ height: '5px' }}>
                          <div className="progress-fill" style={{ width: `${b.percentage || 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                          {b.currentPage || 0} / {b.totalPages || 300} pgs ({b.percentage || 0}%)
                        </span>
                      </div>
                    )}

                    <div className="flex-between" style={{ marginTop: '6px' }}>
                      <select
                        value={b.userShelf || shelfKey}
                        onChange={(e) => handleShelfChange(b.id, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--line)' }}
                      >
                        <option value="reading">Currently Reading</option>
                        <option value="want">Want to Read</option>
                        <option value="read">Finished</option>
                        <option value="dnf">Did Not Finish</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleFavoriteToggle(b.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                        title="Toggle Favorite"
                      >
                        {b.isFavorite ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Topbar
        title="My Personal Library"
        subtitle="Organize and track your book life across customizable shelves."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/reading-progress" className="btn btn-primary btn-sm">Reading Tracker 📈</Link>
        }
      />

      {/* PICK FOR ME BANNER */}
      <div className="pick-for-me-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream-deep)', padding: '20px 24px', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>✨ Don't know what to read next?</h2>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Let the library pick a book from your "Want to Read" shelf based on your current reading mood.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePickForMe}
          style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', flexShrink: 0 }}
        >
          🎲 Pick For Me
        </button>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Filter books in your personal library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="all">All Genres</option>
          <option value="Fiction">Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Classic">Classic Literature</option>
        </select>

        <div className="flex gap-8">
          <Link to="/books" className="btn btn-outline btn-sm">+ Add More Books</Link>
        </div>
      </div>

      {/* VISUAL SHELVES (KANBAN GRID) */}
      <div className="shelves-container">
        {renderShelfColumn('📖 Currently Reading', shelves.reading.length, shelves.reading, 'reading')}
        {renderShelfColumn('🔖 Want to Read', shelves.want.length, shelves.want, 'want')}
        {renderShelfColumn('✅ Finished Reads', shelves.read.length, shelves.read, 'read')}
        {renderShelfColumn('❤️ All-Time Favorites', shelves.favorites.length, shelves.favorites, 'favorites')}
        {renderShelfColumn('⏸️ Did Not Finish', shelves.dnf.length, shelves.dnf, 'dnf')}
      </div>

      {/* Pick for me result modal */}
      {pickedBook && (
        <div className="modal-overlay show" onClick={() => setPickedBook(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%', textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px 0' }}>Your Next Literary Adventure:</h3>
            <h2 style={{ margin: '0 0 4px 0', color: 'var(--brown-deep)' }}>{pickedBook.title}</h2>
            <p className="text-soft" style={{ marginBottom: '16px' }}>by {pickedBook.author}</p>
            <div style={{ width: '120px', height: '180px', margin: '0 auto 20px auto', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.18)', background: 'var(--cream-deep)' }}>
              <img
                src={getBookCoverUrl(pickedBook)}
                alt={pickedBook.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
              />
            </div>
            <div className="flex gap-8" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleShelfChange(pickedBook.id, 'reading');
                  setPickedBook(null);
                }}
              >
                Start Reading Now 📖
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPickedBook(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

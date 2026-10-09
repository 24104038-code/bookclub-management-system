import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Highlights() {
  const outletCtx = useOutletContext() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFav, setFilterFav] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newBookId, setNewBookId] = useState('1');
  const [newPage, setNewPage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const allBooks = BookClubStore.getBooks();
  const list = BookClubStore.getHighlights();

  let filtered = list;
  if (filterFav === 'favorites') {
    filtered = filtered.filter((h) => h.isFavorite);
  }
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (h) =>
        h.quote.toLowerCase().includes(q) ||
        h.bookTitle?.toLowerCase().includes(q) ||
        (h.bookAuthor || '').toLowerCase().includes(q)
    );
  }

  const handleToggleFav = (id) => {
    BookClubStore.toggleHighlightFavorite(id);
    showToast('Quote favorite status updated!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this saved quote?')) {
      BookClubStore.deleteHighlight(id);
      showToast('Quote removed');
    }
  };

  const handleSaveQuote = (e) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    const b = BookClubStore.getBookById(newBookId);
    BookClubStore.addHighlight({
      bookId: Number(newBookId),
      bookTitle: b?.title || 'Selected Book',
      bookAuthor: b?.author || 'Author',
      quote: newQuote,
      page: Number(newPage) || 1,
      userNote: newNote,
      isFavorite: false,
      color: '#FAF7F2'
    });
    setShowModal(false);
    setNewQuote('');
    setNewPage('');
    setNewNote('');
    showToast('Highlight saved to your quote wall!');
  };

  return (
    <div>
      <Topbar
        title="Memorable Highlights & Quotes"
        subtitle="A personal quote wall of poetic sentences, philosophy, and unforgettable dialogue."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Save Quote
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Search memorable quotes by phrase, author, or book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={filterFav} onChange={(e) => setFilterFav(e.target.value)}>
          <option value="all">All Quotes</option>
          <option value="favorites">Favorites Only (❤️)</option>
        </select>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Save Quote
        </button>
      </div>

      {/* QUOTE WALL (MASONRY STYLE COLUMNS) */}
      <div className="quote-wall" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💡</div>
              <h3>No quotes saved yet</h3>
              <p className="text-soft">Save the most inspiring sentences from your reading sessions.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Add Quote</button>
            </div>
          </div>
        ) : (
          filtered.map((h) => (
            <div key={h.id} className="card quote-card" style={{ background: h.color || '#FAF7F2', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex-between mb-0" style={{ marginBottom: '12px' }}>
                  <Link to={`/books/${h.bookId}`} style={{ fontWeight: 700, color: 'var(--brown-deep)', fontSize: '0.92rem' }}>
                    📖 {h.bookTitle}
                  </Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleToggleFav(h.id)} title="Toggle favorite">
                    {h.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="quote-text" style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.5, margin: '8px 0 12px 0' }}>
                  "{h.quote}"
                </div>

                {h.userNote && (
                  <p className="text-soft" style={{ fontSize: '0.85rem', fontStyle: 'normal', marginBottom: '10px' }}>
                    💬 <em>{h.userNote}</em>
                  </p>
                )}
              </div>

              <div className="quote-meta flex-between" style={{ borderTop: '1px dashed var(--line)', paddingTop: '10px', marginTop: '14px', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                <div>
                  <span>Page {h.page}</span>
                  {h.sharedToGroup && (
                    <span style={{ marginLeft: '6px', color: 'var(--green-shelf)' }}>· Shared to {h.sharedToGroup}</span>
                  )}
                </div>
                <div className="flex gap-8">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(h.quote);
                        showToast('Quote copied to clipboard!');
                      }
                    }}
                    title="Copy text"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleDelete(h.id)}
                    style={{ color: '#C0554A' }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Quote Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Save Highlight to Quote Wall</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveQuote} style={{ padding: '20px' }}>
              <div className="field">
                <label>Select Book</label>
                <select value={newBookId} onChange={(e) => setNewBookId(e.target.value)}>
                  {allBooks.map((b) => (
                    <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quote / Memorable Passage</label>
                <textarea rows="3" value={newQuote} onChange={(e) => setNewQuote(e.target.value)} required placeholder="Type the excerpt..."></textarea>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Page Number</label>
                  <input type="number" value={newPage} onChange={(e) => setNewPage(e.target.value)} placeholder="e.g. 104" />
                </div>
                <div className="field">
                  <label>Personal Reflection (Optional)</label>
                  <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Why did this resonate?" />
                </div>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Pin to Wall 💡</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Notes() {
  const outletCtx = useOutletContext() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // New note form
  const [newBookId, setNewBookId] = useState('1');
  const [newPage, setNewPage] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newTag, setNewTag] = useState('Themes');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const allBooks = BookClubStore.getBooks();
  const list = BookClubStore.getNotes();

  let filtered = list;
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.note?.toLowerCase().includes(q) ||
        n.bookTitle?.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }
  if (bookFilter !== 'all') {
    filtered = filtered.filter((n) => n.bookId === Number(bookFilter));
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this private note?')) {
      BookClubStore.deleteNote(id);
      showToast('Note deleted');
    }
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const b = BookClubStore.getBookById(newBookId);
    BookClubStore.addNote({
      bookId: Number(newBookId),
      bookTitle: b?.title || 'Selected Book',
      page: Number(newPage) || 1,
      note: newNoteText,
      tags: [newTag],
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setShowModal(false);
    setNewNoteText('');
    setNewPage('');
    showToast('Note saved to notebook!');
  };

  return (
    <div>
      <Topbar
        title="Private Book Notes"
        subtitle="Personal reflections, character theories, and margin notes for your eyes only."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + New Note
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
            placeholder="Search notes by keyword, tags, or book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={bookFilter} onChange={(e) => setBookFilter(e.target.value)}>
          <option value="all">All Books</option>
          {allBooks.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + New Note
        </button>
      </div>

      {/* NOTES GRID */}
      <div className="grid grid-2" style={{ gap: '20px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
              <h3>No notes found</h3>
              <p className="text-soft">Capture your first margin reflection while reading.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Take Note</button>
            </div>
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className="card panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
              <div>
                <div className="flex-between mb-0" style={{ marginBottom: '10px' }}>
                  <Link to={`/books/${n.bookId}`} style={{ fontWeight: 700, color: 'var(--brown-deep)' }}>
                    📖 {n.bookTitle}
                  </Link>
                  <span className="badge badge-want">Page {n.page}</span>
                </div>

                <p style={{ margin: '14px 0', fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--ink)' }}>
                  {n.note || n.content}
                </p>

                <div className="flex gap-8" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(n.tags || []).map((t, idx) => (
                    <span key={idx} className="badge badge-member">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex-between" style={{ borderTop: '1px dashed var(--line)', paddingTop: '10px', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                <span>Saved on {n.createdAt || n.date || 'Recent'}</span>
                <button type="button" className="btn btn-ghost btn-xs" style={{ color: '#C0554A' }} onClick={() => handleDelete(n.id)}>
                  Delete Note
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Note Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Add Private Book Note</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateNote} style={{ padding: '20px' }}>
              <div className="field">
                <label>Book</label>
                <select value={newBookId} onChange={(e) => setNewBookId(e.target.value)}>
                  {allBooks.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Page #</label>
                  <input type="number" value={newPage} onChange={(e) => setNewPage(e.target.value)} placeholder="e.g. 52" />
                </div>
                <div className="field">
                  <label>Tag / Topic</label>
                  <select value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                    <option value="Themes">Themes</option>
                    <option value="Characters">Characters</option>
                    <option value="Plot Clues">Plot Clues</option>
                    <option value="Style & Prose">Style & Prose</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Note Reflection</label>
                <textarea rows="4" value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} required placeholder="Record your observations, questions, or marginalia..."></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Note 📝</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

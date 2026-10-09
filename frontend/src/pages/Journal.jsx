import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Journal() {
  const outletCtx = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('timeline');
  const [showModal, setShowModal] = useState(false);

  // New entry form
  const [entryBookId, setEntryBookId] = useState('1');
  const [entryMood, setEntryMood] = useState('☕ Cozy / Reflective');
  const [entryPages, setEntryPages] = useState(30);
  const [entryThoughts, setEntryThoughts] = useState('');
  const [entryRating, setEntryRating] = useState(5);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const allBooks = BookClubStore.getBooks();
  const list = BookClubStore.getJournal();

  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!entryThoughts.trim()) return;
    const b = BookClubStore.getBookById(entryBookId);
    BookClubStore.addJournalEntry({
      bookId: Number(entryBookId),
      bookTitle: b?.title || 'Selected Book',
      mood: entryMood.slice(0, 2),
      moodLabel: entryMood.slice(3),
      pagesRead: Number(entryPages) || 10,
      thoughts: entryThoughts,
      rating: Number(entryRating) || 5,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setShowModal(false);
    setEntryThoughts('');
    showToast('Reflective journal entry saved!');
  };

  return (
    <div>
      <Topbar
        title="Personal Reading Journal"
        subtitle="Document moods, thoughts, and chapter breakthroughs day by day."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + New Journal Entry
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        <span
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
          style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: activeTab === 'timeline' ? 700 : 500 }}
        >
          Chronological Timeline
        </span>
        <span
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
          style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: activeTab === 'calendar' ? 700 : 500 }}
        >
          Monthly Grid View
        </span>
      </div>

      {/* TIMELINE VIEW */}
      {activeTab === 'timeline' && (
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          {list.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📓</div>
              <h3>Your journal is empty</h3>
              <p className="text-soft">Log your first daily reflection after reading a chapter.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Write Entry</button>
            </div>
          ) : (
            list.map((j) => (
              <div key={j.id} className="card panel mb-30" style={{ padding: '20px' }}>
                <div className="flex-between mb-0" style={{ marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '1.6rem', verticalAlign: 'middle', marginRight: '8px' }}>{j.mood}</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--brown-deep)' }}>{j.bookTitle}</strong>
                    <span className="text-soft" style={{ fontSize: '0.85rem', marginLeft: '8px' }}>— Mood: {j.moodLabel}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-want">📄 +{j.pagesRead} pages</span>
                    <div className="text-soft" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{j.date}</div>
                  </div>
                </div>

                <p style={{ margin: '14px 0 6px 0', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink)' }}>
                  {j.thoughts}
                </p>

                <div className="flex-between" style={{ borderTop: '1px dashed var(--line)', paddingTop: '8px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  <span>Session Rating: {'★'.repeat(j.rating || 4)}</span>
                  <span>Personal Reflection</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="card panel mb-30" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Reflections by Date</h3>
          <div className="grid grid-3" style={{ gap: '16px' }}>
            {list.map((j) => (
              <div key={j.id} className="card" style={{ padding: '16px', background: 'var(--cream)' }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{j.date}</strong>
                  <span style={{ fontSize: '1.3rem' }}>{j.mood}</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--brown-deep)', fontSize: '0.92rem', marginBottom: '4px' }}>
                  {j.bookTitle}
                </div>
                <p className="text-soft" style={{ fontSize: '0.82rem', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                  {j.thoughts?.slice(0, 80)}...
                </p>
                <span className="badge badge-reading">+{j.pagesRead} pgs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Journal Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>New Reading Journal Reflection</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateEntry} style={{ padding: '20px' }}>
              <div className="field">
                <label>Book Read</label>
                <select value={entryBookId} onChange={(e) => setEntryBookId(e.target.value)}>
                  {allBooks.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Mood State</label>
                  <select value={entryMood} onChange={(e) => setEntryMood(e.target.value)}>
                    <option value="☕ Cozy / Reflective">☕ Cozy / Reflective</option>
                    <option value="⚡ Electrified / Hooked">⚡ Electrified / Hooked</option>
                    <option value="💔 Melancholic / Moved">💔 Melancholic / Moved</option>
                    <option value="🤯 Mind-Bending">🤯 Mind-Bending</option>
                  </select>
                </div>
                <div className="field">
                  <label>Pages Read</label>
                  <input type="number" min="1" value={entryPages} onChange={(e) => setEntryPages(e.target.value)} required />
                </div>
              </div>
              <div className="field">
                <label>Stream of Consciousness Reflections</label>
                <textarea rows="4" value={entryThoughts} onChange={(e) => setEntryThoughts(e.target.value)} required placeholder="How did this session feel? What thoughts did it evoke?"></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Entry 📓</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

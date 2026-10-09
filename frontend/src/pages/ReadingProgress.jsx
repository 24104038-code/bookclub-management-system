import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function ReadingProgress() {
  const outletCtx = useOutletContext() || {};
  const [shelves, setShelves] = useState({ reading: [] });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [pagesReadInput, setPagesReadInput] = useState(25);
  const [sessionMinutes, setSessionMinutes] = useState(30);
  const [sessionNotes, setSessionNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = () => {
    const s = BookClubStore.getLibraryShelves();
    setShelves(s);
    if (s.reading && s.reading.length > 0 && !selectedBookId) {
      setSelectedBookId(s.reading[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStepProgress = (bookId, delta) => {
    const status = BookClubStore.getBookUserStatus(bookId);
    const book = BookClubStore.getBookById(bookId);
    const total = book ? book.totalPages : 300;
    const current = status.currentPage || 0;
    const newPage = Math.max(0, Math.min(total, current + delta));
    const res = BookClubStore.updateBookProgress(bookId, newPage);
    loadData();
    showToast(`Progress: ${res.current} / ${res.total} pgs (${res.percentage}%)`);
  };

  const handleSetExactPage = (bookId, newPage) => {
    const res = BookClubStore.updateBookProgress(bookId, Number(newPage));
    loadData();
    showToast(`Updated to page ${res.current} (${res.percentage}%)`);
  };

  const handleSessionSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookId) return;
    const status = BookClubStore.getBookUserStatus(selectedBookId);
    const current = status.currentPage || 0;
    const added = Number(pagesReadInput) || 0;
    BookClubStore.updateBookProgress(selectedBookId, current + added);
    setShowSessionModal(false);
    loadData();
    showToast(`Logged session: +${added} pages in ${sessionMinutes} minutes!`);
  };

  // Generate 30 days heat map
  const heatCells = Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 29 - i;
    const pages = daysAgo === 0 ? 45 : Math.floor(Math.sin(i * 1.5) * 20 + 25);
    let levelClass = '';
    if (pages > 40) levelClass = 'l4';
    else if (pages > 25) levelClass = 'l3';
    else if (pages > 15) levelClass = 'l2';
    else if (pages > 0) levelClass = 'l1';
    return { day: 30 - daysAgo, pages, levelClass };
  });

  const activeBooks = shelves.reading || [];

  return (
    <div>
      <Topbar
        title="Reading Progress Tracker"
        subtitle="Track your reading pace, log active sessions, and protect your streak."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/reading-goals" className="btn btn-outline btn-sm">Reading Goals 🎯</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* STATS STRIP */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-title">Pages Today</div>
          <div className="stat-value tone-green">45</div>
          <div className="stat-delta up">Daily minimum hit ✅</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Pages This Week</div>
          <div className="stat-value tone-gold">380</div>
          <div className="stat-delta">Target: 400 pages</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Pages This Month</div>
          <div className="stat-value tone-blue">1,450</div>
          <div className="stat-delta up">↑ 18% over last month</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Average Daily Pace</div>
          <div className="stat-value tone-purple">35 pgs</div>
          <div className="stat-delta">Est. 1 book / 9 days</div>
        </div>
      </div>

      {/* 30-DAY HABIT STREAK & CALENDAR VISUALIZATION */}
      <div className="card panel mb-30">
        <div className="flex-between">
          <div>
            <h3 style={{ margin: '0 0 4px 0' }}>Reading Streak Visualization</h3>
            <p className="text-soft" style={{ margin: 0, fontSize: '0.88rem' }}>
              Current Streak: <strong style={{ color: 'var(--clay)' }}>14 Consecutive Days</strong> · Longest Streak: <strong>21 Days</strong>
            </p>
          </div>
          <div className="flex gap-8" style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', alignItems: 'center' }}>
            <span>Less</span>
            <span className="heat-cell" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            <span className="heat-cell l1" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            <span className="heat-cell l2" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            <span className="heat-cell l3" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            <span className="heat-cell l4" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            <span>More</span>
          </div>
        </div>

        <div className="heat-calendar-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '6px', marginTop: '14px' }}>
          {heatCells.map((cell, idx) => (
            <div
              key={idx}
              className={`heat-cell ${cell.levelClass}`}
              title={`Day ${cell.day}: ${cell.pages} pages read`}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                cursor: 'pointer'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* CURRENTLY READING TRACKER ITEMS */}
      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Active Books</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>Update your page numbers or log a focused reading session.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowSessionModal(true)}>
          + Log Reading Session
        </button>
      </div>

      <div className="grid" style={{ gap: '18px', marginBottom: '40px' }}>
        {activeBooks.length === 0 ? (
          <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
            <p className="text-soft">No active books currently being read.</p>
            <Link to="/library" className="btn btn-primary btn-sm">Pick a Book from Library</Link>
          </div>
        ) : (
          activeBooks.map((b) => (
            <div key={b.id} className="card panel" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '64px', height: '96px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', background: 'var(--cream-deep)' }}>
                <img
                  src={getBookCoverUrl(b)}
                  alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>
                  <Link to={`/books/${b.id}`}>{b.title}</Link>
                </h4>
                <p className="text-soft" style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>{b.author} · {b.genre}</p>

                <div className="progress-track" style={{ height: '8px', marginBottom: '6px' }}>
                  <div className="progress-fill" style={{ width: `${b.percentage || 0}%` }}></div>
                </div>

                <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  <span>{b.currentPage || 0} / {b.totalPages || 300} pages</span>
                  <strong style={{ color: 'var(--brown-deep)' }}>{b.percentage || 0}% Completed</strong>
                </div>
              </div>

              {/* Stepper controls */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button type="button" className="btn btn-outline btn-xs" onClick={() => handleStepProgress(b.id, -10)}>-10</button>
                <button type="button" className="btn btn-outline btn-xs" onClick={() => handleStepProgress(b.id, -1)}>-1</button>
                <input
                  type="number"
                  defaultValue={b.currentPage || 0}
                  onBlur={(e) => handleSetExactPage(b.id, e.target.value)}
                  style={{ width: '64px', padding: '4px 6px', textAlign: 'center', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '0.85rem' }}
                />
                <button type="button" className="btn btn-outline btn-xs" onClick={() => handleStepProgress(b.id, 1)}>+1</button>
                <button type="button" className="btn btn-outline btn-xs" onClick={() => handleStepProgress(b.id, 10)}>+10</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Session Modal */}
      {showSessionModal && (
        <div className="modal-overlay show" onClick={() => setShowSessionModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Log Reading Session</h3>
              <button className="modal-close" onClick={() => setShowSessionModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSessionSubmit} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="modalSelectBook">Book</label>
                <select
                  id="modalSelectBook"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                >
                  {activeBooks.map((b) => (
                    <option key={b.id} value={b.id}>{b.title} (Page {b.currentPage || 0})</option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="modalPagesRead">Pages Read Today</label>
                  <input
                    type="number"
                    id="modalPagesRead"
                    min="1"
                    value={pagesReadInput}
                    onChange={(e) => setPagesReadInput(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="modalMinutes">Minutes Spent</label>
                  <input
                    type="number"
                    id="modalMinutes"
                    min="1"
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="modalNotes">Session Reflections / Notes</label>
                <textarea
                  id="modalNotes"
                  rows="2"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Key thoughts or reactions from this reading session..."
                ></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSessionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Reading Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

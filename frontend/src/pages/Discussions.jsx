import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Discussions() {
  const outletCtx = useOutletContext() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // New discussion
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newBookTag, setNewBookTag] = useState('');
  const [newContent, setNewContent] = useState('');
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const list = BookClubStore.getDiscussions();

  let filtered = list;
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.bookTag || '').toLowerCase().includes(q)
    );
  }
  if (catFilter !== 'all') {
    filtered = filtered.filter((d) => d.category === catFilter);
  }

  const handleLike = (id) => {
    BookClubStore.toggleLikeDiscussion(id);
    showToast('Updated discussion vote!');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    BookClubStore.addDiscussion({
      title: newTitle,
      category: newCategory,
      bookTag: newBookTag || newCategory,
      content: newContent,
      hasSpoiler
    });
    setShowModal(false);
    setNewTitle('');
    setNewContent('');
    showToast('Discussion thread posted to the salon!');
  };

  return (
    <div>
      <Topbar
        title="Community Forums & Salons"
        subtitle="Talk endings, character motivations, theories, and book tips with fellow readers."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Start Discussion
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="filter-bar" style={{ gap: '8px' }}>
        <div className="search-box" style={{ flex: 2, minWidth: '240px' }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Search discussion topics, book theories, spoilers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="General">General</option>
          <option value="Books">Books & Plot</option>
          <option value="Reviews">Reviews</option>
          <option value="Reading Progress">Reading Progress</option>
          <option value="Recommendations">Recommendations</option>
          <option value="Events">Events</option>
          <option value="Groups">Groups</option>
          <option value="Off Topic">Off Topic</option>
        </select>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + Start Discussion
        </button>
      </div>

      {/* DISCUSSIONS GRID */}
      <div className="grid grid-2" style={{ gap: '20px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💬</div>
              <h3>No discussions found</h3>
              <p className="text-soft">Be the first to start a conversation in this category.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                Start Discussion
              </button>
            </div>
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="card discussion-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
              <div>
                <div className="discussion-top flex-between" style={{ marginBottom: '8px' }}>
                  <span className="discussion-book-tag" style={{ background: 'var(--cream-deep)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {d.bookTag || d.category}
                  </span>
                  <span className="text-soft" style={{ fontSize: '0.8rem' }}>
                    {d.timeAgo} · 👁️ {d.views || 1} views
                  </span>
                </div>

                <h3 className="discussion-title" style={{ margin: '8px 0 6px 0', fontSize: '1.2rem' }}>
                  <Link to={`/discussions/${d.id}`}>{d.title}</Link>
                </h3>

                <p className="discussion-content" style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {d.content?.slice(0, 140)}...
                </p>

                {d.hasSpoiler && (
                  <div className="spoiler-box" style={{ padding: '6px 10px', margin: '8px 0', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '4px' }}>
                    <small style={{ color: '#92400E', fontWeight: 700 }}>⚠️ Contains Plot Spoilers</small>
                  </div>
                )}
              </div>

              <div className="discussion-footer flex-between" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px', marginTop: '14px' }}>
                <div className="author-line" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                    {d.author?.slice(0, 2).toUpperCase() || 'JR'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.author}</span>
                </div>
                <div className="flex gap-12" style={{ alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>💬 {(d.replies || []).length} replies</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleLike(d.id)}>
                    {d.isLiked ? '❤️' : '🤍'} {d.likes || 0}
                  </button>
                  <Link to={`/discussions/${d.id}`} className="btn btn-outline btn-sm">Join Chat →</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Discussion Modal */}
      {showModal && (
        <div className="modal-overlay show" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Start New Thread</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="modalDiscTitle">Topic Title</label>
                <input
                  type="text"
                  id="modalDiscTitle"
                  placeholder="e.g. Favorite quotes from Winter's Ledger?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="modalDiscCat">Category</label>
                  <select id="modalDiscCat" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="General">General</option>
                    <option value="Books">Books & Plot</option>
                    <option value="Reviews">Reviews</option>
                    <option value="Reading Progress">Reading Progress</option>
                    <option value="Recommendations">Recommendations</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="modalDiscTag">Book Tag (Optional)</label>
                  <input
                    type="text"
                    id="modalDiscTag"
                    placeholder="e.g. Winter's Ledger"
                    value={newBookTag}
                    onChange={(e) => setNewBookTag(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="modalDiscContent">Content</label>
                <textarea
                  id="modalDiscContent"
                  rows="4"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your perspectives, arguments, or questions..."
                  required
                ></textarea>
              </div>
              <div className="checkbox-row" style={{ marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="modalSpoilerCheck"
                  checked={hasSpoiler}
                  onChange={(e) => setHasSpoiler(e.target.checked)}
                />
                <label htmlFor="modalSpoilerCheck">Mark thread as containing plot spoilers</label>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Post Thread 💬</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

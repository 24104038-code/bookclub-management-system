import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookClubStore from '../services/store';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [toast, setToast] = useState(null);

  // Form state
  const [formBookId, setFormBookId] = useState('');
  const [formOverall, setFormOverall] = useState(5);
  const [formStory, setFormStory] = useState(5);
  const [formChar, setFormChar] = useState(5);
  const [formWrit, setFormWrit] = useState(5);
  const [formPace, setFormPace] = useState(4);
  const [formWorld, setFormWorld] = useState(4);
  const [formText, setFormText] = useState('');
  const [formSpoiler, setFormSpoiler] = useState(false);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = () => {
    const rList = BookClubStore.getReviews();
    const bList = BookClubStore.getBooks();
    setReviews([...rList]);
    setBooks(bList);
    if (bList.length > 0 && !formBookId) {
      setFormBookId(bList[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLike = (id) => {
    BookClubStore.toggleLikeReview(id);
    loadData();
  };

  const toggleSpoiler = (id) => {
    setRevealedSpoilers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!formText.trim()) {
      alert('Please enter your review.');
      return;
    }

    BookClubStore.addReview({
      bookId: Number(formBookId),
      overallRating: Number(formOverall) || 5,
      storyRating: Number(formStory) || 5,
      characterRating: Number(formChar) || 5,
      writingRating: Number(formWrit) || 5,
      pacingRating: Number(formPace) || 4,
      worldBuildingRating: Number(formWorld) || 4,
      reviewText: formText.trim(),
      hasSpoiler: formSpoiler
    });

    setShowModal(false);
    setFormText('');
    setFormSpoiler(false);
    showToastMsg('Your review was published to the feed! ⭐');
    loadData();
  };

  // Filter & sort
  let filtered = [...reviews];
  const q = search.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(r => 
      (r.bookTitle && r.bookTitle.toLowerCase().includes(q)) ||
      (r.reviewText && r.reviewText.toLowerCase().includes(q)) ||
      (r.user && r.user.toLowerCase().includes(q))
    );
  }

  if (sort === 'highest') {
    filtered.sort((a, b) => b.overallRating - a.overallRating);
  } else if (sort === 'likes') {
    filtered.sort((a, b) => b.likes - a.likes);
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--brown-deep, #3D2314)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Community Literary Reviews</h1>
          <p className="text-soft" style={{ margin: '4px 0 0' }}>
            Explore detailed, multi-category reader ratings across storytelling, pacing, and worldbuilding.
          </p>
        </div>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <button 
            type="button"
            className="btn btn-primary btn-sm" 
            onClick={() => setShowModal(true)}
          >
            + Review a Book
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Filter reviews by book title, author, or keyword..."
          />
        </div>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Sort: Newest First</option>
          <option value="highest">Sort: Highest Rated</option>
          <option value="likes">Sort: Most Helpful / Liked</option>
        </select>

        <button 
          type="button" 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowModal(true)}
        >
          + Write a Review
        </button>
      </div>

      {/* REVIEWS GRID */}
      <div className="grid grid-2" style={{ marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No reviews found</h3>
            <p className="text-soft" style={{ margin: '0 0 20px 0' }}>Try adjusting your search terms or write a review.</p>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowModal(true)}
            >
              Write Review
            </button>
          </div>
        ) : (
          filtered.map(r => (
            <div 
              key={r.id} 
              className="card review-card" 
              style={{ flexDirection: 'column', justifyContent: 'space-between', display: 'flex' }}
            >
              <div>
                <div className="flex-between mb-0" style={{ alignItems: 'flex-start' }}>
                  <div className="author-line" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar-chip" style={{ background: 'var(--clay)', marginLeft: 0 }}>
                      {r.avatar || 'R'}
                    </div>
                    <div>
                      <strong>{r.user}</strong>
                      <div className="text-soft" style={{ fontSize: '0.78rem' }}>{r.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="stars" style={{ fontSize: '1.15rem', color: '#D9A441' }}>
                      {'★'.repeat(r.overallRating)}{'☆'.repeat(Math.max(0, 5 - r.overallRating))}
                    </span>
                    <div className="text-soft" style={{ fontSize: '0.75rem' }}>Overall: {r.overallRating}/5</div>
                  </div>
                </div>

                <div style={{ margin: '12px 0 6px 0' }}>
                  <Link 
                    to={`/books/${r.bookId}`} 
                    style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--brown-deep)' }}
                  >
                    📖 {r.bookTitle}
                  </Link>
                  <span className="text-soft" style={{ fontSize: '0.85rem', marginLeft: 8 }}>by {r.bookAuthor || 'Author'}</span>
                </div>

                <p style={{ margin: '8px 0 14px 0', fontSize: '0.92rem', lineHeight: 1.5 }}>{r.reviewText}</p>

                {r.hasSpoiler && (
                  <div className="spoiler-box" style={{ background: 'rgba(181, 101, 47, 0.08)', padding: '10px 14px', borderRadius: 8, margin: '8px 0' }}>
                    <div className="flex-between">
                      <small style={{ color: 'var(--clay)', fontWeight: 700 }}>⚠️ Spoilers enclosed</small>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => toggleSpoiler(r.id)}
                      >
                        {revealedSpoilers[r.id] ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    {revealedSpoilers[r.id] && (
                      <div style={{ marginTop: 6, fontSize: '0.88rem' }}>
                        {r.spoilerText || r.reviewText || 'Spoiler text concealed.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Aspect Ratings Strip */}
                <div 
                  className="card" 
                  style={{
                    background: 'var(--cream-deep)',
                    padding: '10px 14px',
                    margin: '10px 0 14px',
                    borderColor: 'var(--line)',
                    fontSize: '0.78rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6,
                    textAlign: 'center'
                  }}
                >
                  <div>Story<br /><strong>{(r.categoryRatings || {}).story || 5}★</strong></div>
                  <div>Chars<br /><strong>{(r.categoryRatings || {}).characters || 5}★</strong></div>
                  <div>Writing<br /><strong>{(r.categoryRatings || {}).writing || 5}★</strong></div>
                  <div>Pacing<br /><strong>{(r.categoryRatings || {}).pacing || 4}★</strong></div>
                  <div>World<br /><strong>{(r.categoryRatings || {}).worldBuilding || 4}★</strong></div>
                </div>
              </div>

              <div className="flex-between" style={{ borderTop: '1px dashed var(--line)', paddingTop: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => handleLike(r.id)}
                >
                  {r.isLiked ? '❤️ Helpful' : '🤍 Helpful'} ({r.likes})
                </button>
                <Link to={`/books/${r.bookId}`} className="btn btn-outline btn-sm">
                  Book Page →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* WRITE REVIEW MODAL */}
      {showModal && (
        <div className="modal active" style={{ display: 'flex' }}>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="modal-dialog" style={{ maxWidth: 550, width: '100%', margin: 'auto', zIndex: 1000 }}>
            <div className="modal-header">
              <h3>Write a Detailed Book Review</h3>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveReview}>
              <div className="modal-body">
                <div className="field">
                  <label>Select Book</label>
                  <select 
                    value={formBookId} 
                    onChange={(e) => setFormBookId(e.target.value)}
                  >
                    {books.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                    ))}
                  </select>
                </div>
                <div className="field-row" style={{ display: 'flex', gap: 12 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Overall Stars (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formOverall} 
                      onChange={(e) => setFormOverall(e.target.value)} 
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Story Arc (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formStory} 
                      onChange={(e) => setFormStory(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="field-row" style={{ display: 'flex', gap: 12 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Characters (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formChar} 
                      onChange={(e) => setFormChar(e.target.value)} 
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Writing / Prose (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formWrit} 
                      onChange={(e) => setFormWrit(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="field-row" style={{ display: 'flex', gap: 12 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Pacing (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formPace} 
                      onChange={(e) => setFormPace(e.target.value)} 
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>World Building (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={formWorld} 
                      onChange={(e) => setFormWorld(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Review Essay</label>
                  <textarea 
                    rows="4" 
                    value={formText} 
                    onChange={(e) => setFormText(e.target.value)} 
                    placeholder="What resonated with you? Character dynamics, themes, or surprises..."
                  />
                </div>
                <div className="checkbox-row" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="checkbox" 
                    id="rmSpoiler" 
                    checked={formSpoiler} 
                    onChange={(e) => setFormSpoiler(e.target.checked)} 
                  />
                  <label htmlFor="rmSpoiler" style={{ margin: 0 }}>Contains major plot spoilers</label>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

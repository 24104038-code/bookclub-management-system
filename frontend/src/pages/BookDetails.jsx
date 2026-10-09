import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function BookDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const bookIdOrSlug = paramId || searchParams.get('id') || '1';
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();
  const { t, getBookText, language } = useI18n();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [shelfStatus, setShelfStatus] = useState(null);
  const [currentPageInput, setCurrentPageInput] = useState(0);

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notePage, setNotePage] = useState('');
  const [noteChapter, setNoteChapter] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightQuote, setHighlightQuote] = useState('');
  const [highlightPage, setHighlightPage] = useState('');
  const [highlightColor, setHighlightColor] = useState('gold');

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const b = BookClubStore.getBookById(bookIdOrSlug);
    if (b) {
      setBook(b);
      const status = BookClubStore.getBookUserStatus(b.id);
      setShelfStatus(status);
      setCurrentPageInput(status?.currentPage || 0);
    }
  }, [bookIdOrSlug]);

  if (!book) {
    return (
      <div>
        <Topbar title="Book Details" subtitle="Loading literary details..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Book Not Found</h3>
          <p className="text-soft">The book you are looking for does not exist in our library catalog.</p>
          <Link to="/books" className="btn btn-primary btn-sm">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  const handleShelfChange = (newShelf) => {
    const updated = BookClubStore.setBookShelf(book.id, newShelf);
    setShelfStatus({ ...updated });
    showToast(`Book moved to '${newShelf.toUpperCase()}' shelf`);
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();
    const res = BookClubStore.updateBookProgress(book.id, currentPageInput);
    const updatedStatus = BookClubStore.getBookUserStatus(book.id);
    setShelfStatus({ ...updatedStatus });
    showToast(`Progress updated to ${res.current} / ${res.total} pages (${res.percentage}%)`);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    BookClubStore.addReview({
      bookId: book.id,
      rating: reviewRating,
      title: reviewTitle || `${reviewRating}-Star Review`,
      content: reviewText
    });
    setShowReviewModal(false);
    setReviewTitle('');
    setReviewText('');
    showToast('Review submitted successfully!');
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    BookClubStore.addNote({
      bookId: book.id,
      page: Number(notePage) || 0,
      chapter: noteChapter || 'Notes',
      content: noteContent
    });
    setShowNoteModal(false);
    setNoteContent('');
    setNotePage('');
    setNoteChapter('');
    showToast('Note saved to your reading notebook!');
  };

  const handleHighlightSubmit = (e) => {
    e.preventDefault();
    if (!highlightQuote.trim()) return;
    BookClubStore.addHighlight({
      bookId: book.id,
      quote: highlightQuote,
      page: Number(highlightPage) || 0,
      color: highlightColor
    });
    setShowHighlightModal(false);
    setHighlightQuote('');
    setHighlightPage('');
    showToast('Highlight saved to your quote wall!');
  };

  const bookReviews = BookClubStore.getReviews().filter((r) => r.bookId === book.id);
  const bookNotes = BookClubStore.getNotes().filter((n) => n.bookId === book.id);
  const bookHighlights = BookClubStore.getHighlights().filter((h) => h.bookId === book.id);
  const relatedBooks = BookClubStore.getBooks().filter((b) => b.genre === book.genre && b.id !== book.id).slice(0, 3);
  const discussions = BookClubStore.getDiscussions().slice(0, 3);

  const [localUnlocked, setLocalUnlocked] = useState(false);
  const isLocked = !localUnlocked && BookClubStore.isBookLocked(book.id);
  const quests = isLocked ? BookClubStore.getUserQuests() : [];
  const quest = isLocked ? quests.find((q) => q.book.id === book.id) : null;

  const handleClaimUnlock = () => {
    const res = BookClubStore.claimQuestAndUnlockBook(book.id);
    if (res && res.success) {
      setLocalUnlocked(true);
      showToast(`🎉 UNLOCKED! "${book.title}" is now available! +${res.rewardXP} XP Earned!`);
      window.dispatchEvent(new CustomEvent('bookclub_quest_claimed', { detail: res }));
    }
  };

  const curPage = shelfStatus?.currentPage || 0;
  const pct = Math.round((curPage / (book.totalPages || 300)) * 100);

  const localizedTitle = getBookText ? getBookText(book, 'title') : (book.title_ta || book.title);
  const localizedAuthor = getBookText ? getBookText(book, 'author') : (book.author_ta || book.author);
  const localizedGenre = getBookText ? getBookText(book, 'genre') : (book.genre_ta || book.genre);
  const localizedDesc = getBookText ? getBookText(book, 'description') : (book.description_ta || book.description);

  return (
    <div>
      <Topbar
        title={localizedTitle}
        subtitle={`${t('books.by', 'by')} ${localizedAuthor} · ${localizedGenre}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/books" className="btn btn-outline btn-sm">← {t('books.allGenres', 'All Books')}</Link>
        }
      />

      {toastMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMessage}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="book-details-hero">
        <div style={{ width: '220px', height: '330px', flexShrink: 0, position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', background: 'var(--cream-deep)' }}>
          <img
            src={getBookCoverUrl(book)}
            alt={localizedTitle}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
          />
          {isLocked && (
            <div className="book-locked-overlay" style={{ borderRadius: '10px' }}>
              <div className="book-lock-icon">🔒</div>
              <div className="book-lock-tier">{(book.questTier || 'QUEST').replace('_', ' ').toUpperCase()}</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div className="flex-between">
            <span className="book-genre" style={{ background: 'var(--cream-deep)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
              {localizedGenre}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!');
                }
              }}
            >
              💌 Share Book
            </button>
          </div>

          <h1 style={{ marginTop: '10px', fontSize: '2.2rem' }}>{localizedTitle}</h1>
          <p className="text-soft" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>{t('books.by', 'by')} {localizedAuthor}</p>

          <div className="book-details-meta" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', color: 'var(--ink-soft)' }}>
            <span>📅 Published {book.publicationYear || 2023}</span>
            <span>📄 {book.totalPages || 300} {t('books.pages', 'pages')}</span>
            <span style={{ color: 'var(--gold)' }}>★ {book.rating} ({book.reviewCount || 120} reviews)</span>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', maxWidth: '680px' }}>
            {localizedDesc}
          </p>

          {/* Quest requirement box when locked */}
          {isLocked ? (
            <div className="card" style={{ padding: '22px 26px', border: '2px dashed #D9A441', background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF8EC 100%)', borderRadius: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <span className="badge-locked" style={{ marginBottom: '8px', display: 'inline-block' }}>🔒 QUEST REWARD LOCKED</span>
                  <h3 style={{ margin: '6px 0 8px 0', fontFamily: 'var(--font-display)', color: '#8C5E14', fontSize: '1.3rem' }}>
                    {quest?.title || book.unlockTask?.title || 'Unlock Reading Quest'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#665235', lineHeight: 1.5 }}>
                    {quest?.description || book.unlockTask?.description || 'Complete reading milestones to claim and read this book.'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge-xp-reward" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    +{quest?.rewardXP || book.rewardXP || 100} XP
                  </span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8C5E14', marginTop: '6px' }}>
                    🏆 {quest?.rewardBadge || book.rewardBadge || 'Reward Badge'}
                  </div>
                </div>
              </div>

              <div style={{ margin: '18px 0 16px 0', background: 'rgba(0,0,0,0.03)', padding: '12px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: '#734F15' }}>
                  <span>Quest Progress: {quest?.current || 0} / {quest?.target || 1}</span>
                  <span>{quest?.percentage || 0}% Complete</span>
                </div>
                <div style={{ height: '10px', background: 'rgba(0,0,0,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${quest?.percentage || 0}%`, background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '0.88rem', color: '#856404', fontWeight: 600 }}>
                  {quest?.isCompleted
                    ? '✨ All requirements completed! Click claim to unlock reading access.'
                    : '💡 Complete the goal above in your reading tracker to unlock this book.'}
                </span>
                {quest?.isCompleted ? (
                  <button
                    type="button"
                    className="btn btn-warning btn-sm btn-claim-quest"
                    onClick={handleClaimUnlock}
                    style={{ fontWeight: 700, padding: '10px 24px', fontSize: '1rem' }}
                  >
                    🎁 Claim Reward &amp; Unlock Book (+{quest.rewardXP} XP)
                  </button>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" disabled style={{ opacity: 0.7, cursor: 'not-allowed', padding: '8px 18px' }}>
                    🔒 Locked Until Completed
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Current shelf status box */
            <div className="card" style={{ padding: '14px 18px', marginBottom: '24px', background: 'var(--cream-deep)', borderColor: 'var(--line)' }}>
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown-deep)' }}>
                  Status: {shelfStatus?.shelf ? shelfStatus.shelf.toUpperCase() : 'Not on shelf'}
                </span>
                <div className="flex gap-8">
                  <button
                    className={`btn btn-sm ${shelfStatus?.shelf === 'reading' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleShelfChange('reading')}
                  >
                    Start Reading
                  </button>
                  <button
                    className={`btn btn-sm ${shelfStatus?.shelf === 'want' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleShelfChange('want')}
                  >
                    Want to Read
                  </button>
                  <button
                    className={`btn btn-sm ${shelfStatus?.shelf === 'read' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleShelfChange('read')}
                  >
                    Mark as Read
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="book-details-actions flex gap-12" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowReviewModal(true)}>+ Write Review</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowNoteModal(true)}>+ Add Note</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowHighlightModal(true)}>✦ Save Highlight</button>
              <Link to="/groups" className="btn btn-ghost btn-sm">Join Reading Group 👥</Link>
            </div>
          )}
        </div>
      </div>

      <hr className="divider" style={{ margin: '30px 0' }} />

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '24px' }}>
        {[
          { id: 'about', label: 'About & Context' },
          { id: 'progress', label: 'My Reading Progress' },
          { id: 'reviews', label: `Reader Reviews (${bookReviews.length})` },
          { id: 'discussions', label: 'Discussions' },
          { id: 'notes', label: `My Notes (${bookNotes.length})` },
          { id: 'related', label: 'Related Books' }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: activeTab === tab.id ? 700 : 500 }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'about' && (
        <div className="tab-pane">
          <div className="card panel" style={{ maxWidth: '800px' }}>
            <h3 style={{ marginTop: 0 }}>Literary Overview & Themes</h3>
            <p className="text-soft">Curated by the BookClub Editorial Guild</p>
            <p style={{ lineHeight: 1.7 }}>
              {localizedDesc}
            </p>
            <div className="grid grid-3" style={{ marginTop: '24px', gap: '16px' }}>
              <div><strong>Primary Tone:</strong> <div>Introspective, Lyrical</div></div>
              <div><strong>Pacing:</strong> <div>Moderate / Measured</div></div>
              <div><strong>Recommended Drink:</strong> <div>Earl Grey Tea ☕</div></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="tab-pane">
          <div className="card panel" style={{ maxWidth: '680px' }}>
            <h3>Track Your Reading Pace</h3>
            <div className="progress-track" style={{ height: '12px', margin: '16px 0' }}>
              <div className="progress-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <div className="flex-between mb-30">
              <span>{curPage} / {book.totalPages || 300} pages</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--clay)' }}>{pct}%</strong>
            </div>

            <form onSubmit={handleProgressSubmit} className="flex gap-12" style={{ alignItems: 'flex-end' }}>
              <div className="field" style={{ margin: 0, flex: 1 }}>
                <label htmlFor="inputCurrentPage">Update Current Page</label>
                <input
                  type="number"
                  id="inputCurrentPage"
                  min="0"
                  max={book.totalPages || 300}
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(Number(e.target.value))}
                />
              </div>
              <button type="submit" className="btn btn-primary">Update Progress</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="tab-pane">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Community Reviews</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowReviewModal(true)}>+ Write a Review</button>
          </div>
          {bookReviews.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <p className="text-soft">No reviews yet for this title. Be the first to share your thoughts!</p>
              <button className="btn btn-outline btn-sm" onClick={() => setShowReviewModal(true)}>Write First Review</button>
            </div>
          ) : (
            <div className="grid grid-2" style={{ gap: '20px' }}>
              {bookReviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: '20px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <strong>{r.userName || r.user || 'Reader'}</strong>
                    <span style={{ color: 'var(--gold)' }}>{'★'.repeat(r.rating || 5)}</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>{r.title}</h4>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--ink)' }}>{r.content || r.body}</p>
                  <span className="text-soft" style={{ fontSize: '0.75rem' }}>{r.date || 'Recently'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="tab-pane">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Book Conversations</h3>
            <Link to="/discussions" className="btn btn-primary btn-sm">+ Start Discussion</Link>
          </div>
          <div className="grid" style={{ gap: '16px' }}>
            {discussions.map((d) => (
              <div key={d.id} className="card" style={{ padding: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <span className="badge badge-reading" style={{ fontSize: '0.7rem' }}>{d.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{d.repliesCount || 0} replies</span>
                </div>
                <h4 style={{ margin: '0 0 6px 0' }}><Link to={`/discussions/${d.id}`}>{d.title}</Link></h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{d.snippet || d.content?.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="tab-pane">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>My Personal Notes & Highlights</h3>
            <div className="flex gap-8">
              <button className="btn btn-outline btn-sm" onClick={() => setShowNoteModal(true)}>+ Add Note</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowHighlightModal(true)}>✦ Save Highlight</button>
            </div>
          </div>
          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div>
              <h4>Notes</h4>
              {bookNotes.length === 0 ? (
                <p className="text-soft">No private notes for this book yet.</p>
              ) : (
                bookNotes.map((n) => (
                  <div key={n.id} className="card" style={{ padding: '16px', marginBottom: '12px' }}>
                    <div className="flex-between" style={{ marginBottom: '6px', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                      <span>Page {n.page} · {n.chapter}</span>
                      <span>{n.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{n.content}</p>
                  </div>
                ))
              )}
            </div>
            <div>
              <h4>Highlights</h4>
              {bookHighlights.length === 0 ? (
                <p className="text-soft">No highlighted quotes saved yet.</p>
              ) : (
                bookHighlights.map((h) => (
                  <div key={h.id} className="card" style={{ padding: '16px', marginBottom: '12px', borderLeft: '4px solid var(--shell-gold)' }}>
                    <blockquote style={{ margin: '0 0 8px 0', fontStyle: 'italic', fontSize: '0.95rem' }}>"{h.quote}"</blockquote>
                    <span className="text-soft" style={{ fontSize: '0.75rem' }}>Page {h.page}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'related' && (
        <div className="tab-pane">
          <h3 style={{ marginBottom: '20px' }}>More in {book.genre}</h3>
          <div className="grid grid-3">
            {relatedBooks.map((rb) => (
              <div key={rb.id} className="card" style={{ padding: '16px' }}>
                <Link to={`/books/${rb.id}`}>
                  <h4 style={{ margin: '0 0 4px 0' }}>{rb.title}</h4>
                </Link>
                <p className="author" style={{ fontSize: '0.85rem' }}>{rb.author}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>★ {rb.rating}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay show" onClick={() => setShowReviewModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Review "{book.title}"</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ padding: '20px' }}>
              <div className="field">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '1.6rem', cursor: 'pointer', color: 'var(--gold)' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} onClick={() => setReviewRating(s)}>
                      {s <= reviewRating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="reviewTitle">Headline / Title</label>
                <input
                  type="text"
                  id="reviewTitle"
                  placeholder="e.g. Masterful pacing and unforgettable imagery"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="reviewText">Your Review</label>
                <textarea
                  id="reviewText"
                  rows="4"
                  placeholder="Share what moved you, what didn't, or what readers should expect..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay show" onClick={() => setShowNoteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Add Private Note</h3>
              <button className="modal-close" onClick={() => setShowNoteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleNoteSubmit} style={{ padding: '20px' }}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="notePage">Page #</label>
                  <input type="number" id="notePage" value={notePage} onChange={(e) => setNotePage(e.target.value)} placeholder="e.g. 142" />
                </div>
                <div className="field">
                  <label htmlFor="noteChapter">Chapter / Section</label>
                  <input type="text" id="noteChapter" value={noteChapter} onChange={(e) => setNoteChapter(e.target.value)} placeholder="e.g. Chapter 7" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="noteContent">Note Content</label>
                <textarea id="noteContent" rows="4" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Your reading reflection..." required></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNoteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Highlight Modal */}
      {showHighlightModal && (
        <div className="modal-overlay show" onClick={() => setShowHighlightModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Save Highlight / Quote</h3>
              <button className="modal-close" onClick={() => setShowHighlightModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleHighlightSubmit} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="highlightQuote">Memorable Passage / Quote</label>
                <textarea id="highlightQuote" rows="3" value={highlightQuote} onChange={(e) => setHighlightQuote(e.target.value)} placeholder="Type or paste the quote..." required></textarea>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="highlightPage">Page #</label>
                  <input type="number" id="highlightPage" value={highlightPage} onChange={(e) => setHighlightPage(e.target.value)} placeholder="e.g. 88" />
                </div>
                <div className="field">
                  <label htmlFor="highlightColor">Highlight Hue</label>
                  <select id="highlightColor" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)}>
                    <option value="gold">Gold / Amber</option>
                    <option value="green">Sage Green</option>
                    <option value="purple">Lilac Purple</option>
                    <option value="blue">Slate Blue</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHighlightModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save to Quotes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

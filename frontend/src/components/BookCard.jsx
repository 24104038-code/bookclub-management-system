import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookCoverUrl } from '../utils/bookCovers';
import { useI18n } from '../context/I18nContext';
import BookClubStore from '../services/store';

export default function BookCard({ book, currentShelf, isFavorite, onUpdateShelf, onToggleFavorite, onUnlocked }) {
  const [shelfMenuOpen, setShelfMenuOpen] = useState(false);
  const [localUnlocked, setLocalUnlocked] = useState(false);
  const { t, getBookText } = useI18n();

  const isLocked = !localUnlocked && BookClubStore.isBookLocked(book.id);
  const quests = isLocked ? BookClubStore.getUserQuests() : [];
  const quest = isLocked ? quests.find(q => q.book.id === book.id) : null;

  const handleClaimQuest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = BookClubStore.claimQuestAndUnlockBook(book.id);
    if (res && res.success) {
      setLocalUnlocked(true);
      if (onUnlocked) onUnlocked(book);
      window.dispatchEvent(new CustomEvent('bookclub_quest_claimed', { detail: res }));
    }
  };

  const localizedTitle = getBookText ? getBookText(book, 'title') : (book.title_ta || book.title);
  const localizedAuthor = getBookText ? getBookText(book, 'author') : (book.author_ta || book.author);
  const localizedGenre = getBookText ? getBookText(book, 'genre') : (book.genre_ta || book.genre);
  const localizedDesc = getBookText ? getBookText(book, 'description') : (book.description_ta || book.description);

  const byPrefix = t('books.by', 'by');
  const pagesSuffix = t('books.pages', 'pages');
  const detailsText = t('books.details', 'Details');
  const addShelfText = t('books.addToShelf', 'Add to Shelf');

  const lblReading = t('books.currentlyReading', 'Currently Reading');
  const lblWant = t('books.wantToRead', 'Want to Read');
  const lblRead = t('books.completed', 'Completed');
  const lblDnf = t('books.didNotFinish', 'Did Not Finish');
  const lblMarkRead = t('books.markAsRead', 'Mark as Read');

  const shelfLabels = {
    reading: lblReading,
    want: lblWant,
    read: lblRead,
    dnf: lblDnf
  };

  const currentShelfLabel = currentShelf ? (shelfLabels[currentShelf] || currentShelf) : addShelfText;
  const coverUrl = getBookCoverUrl(book);

  if (isLocked) {
    return (
      <div className="card book-card book-card-locked" data-book-id={book.id}>
        <div className="book-card-cover-wrap">
          <Link to={`/books/${book.id}`} className="book-cover-link">
            <div className="book-cover-wrap book-cover-pro">
              <img
                src={coverUrl}
                alt={`${localizedTitle} by ${localizedAuthor}`}
                className="book-cover-img"
                loading="lazy"
                onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
              />
              <div className="book-locked-overlay">
                <div className="book-lock-icon">🔒</div>
                <div className="book-lock-tier">
                  {(book.questTier || 'QUEST').replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          </Link>
          <button
            type="button"
            className={`book-fav-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite && onToggleFavorite(book.id)}
            title="Save to favorites"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="book-card-body">
          <div className="book-card-top">
            <span className="badge-locked">🔒 {(book.questTier || 'LOCKED').replace('_', ' ').toUpperCase()}</span>
            <span className="badge-xp-reward">+{book.rewardXP || 100} XP</span>
          </div>

          <h3 className="book-title">
            <Link to={`/books/${book.id}`}>{localizedTitle}</Link>
          </h3>
          <p className="book-author">{byPrefix} {localizedAuthor}</p>

          <div className="quest-card-progress-box">
            <div className="quest-task-label">
              🎯 {quest ? quest.title : (book.unlockTask ? book.unlockTask.title : 'Unlock Quest')}
            </div>
            <div className="quest-mini-bar-bg">
              <div className="quest-mini-bar-fill" style={{ width: `${quest ? quest.percentage : 0}%` }}></div>
            </div>
            <div className="quest-mini-meta">
              <span>{quest ? `${quest.current} / ${quest.target}` : '0 / 1'} ({quest ? quest.percentage : 0}%)</span>
              <span>🏆 {book.rewardBadge || 'Reward Badge'}</span>
            </div>
          </div>

          <div className="book-meta-strip">
            <span>📄 {book.totalPages || 320} {pagesSuffix}</span>
            <span>⭐ {book.rating || 4.9}</span>
          </div>

          <div className="book-card-footer">
            {quest && quest.isCompleted ? (
              <button
                type="button"
                className="btn btn-warning btn-sm btn-claim-quest"
                onClick={handleClaimQuest}
                style={{ flex: 1 }}
              >
                🎁 Claim &amp; Unlock (+{book.rewardXP || 100} XP)
              </button>
            ) : (
              <Link
                to={`/books/${book.id}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, fontSize: '0.8rem' }}
              >
                🔒 View Quest
              </Link>
            )}
            <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm book-details-btn">
              {detailsText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card book-card" data-book-id={book.id}>
      <div className="book-card-cover-wrap">
        <Link to={`/books/${book.id}`} className="book-cover-link">
          <div className="book-cover-wrap book-cover-pro">
            <img
              src={coverUrl}
              alt={`${localizedTitle} by ${localizedAuthor}`}
              className="book-cover-img"
              loading="lazy"
              onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
            />
          </div>
        </Link>
        <button
          type="button"
          className={`book-fav-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={() => onToggleFavorite && onToggleFavorite(book.id)}
          title="Save to favorites"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="book-card-body">
        <div className="book-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="book-genre">{localizedGenre}</span>
            {(book.isTamil || [13, 14, 15, 16, 17, 18, 20, 22, 24, 25, 26].includes(book.id)) && (
              <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #F97316', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                🌾 தமிழ்
              </span>
            )}
          </div>
          <span className="book-rating">★ {book.rating || 4.5}</span>
        </div>

        <h3 className="book-title">
          <Link to={`/books/${book.id}`}>{localizedTitle}</Link>
        </h3>
        <p className="book-author">{byPrefix} {localizedAuthor}</p>
        <p className="book-desc">{(localizedDesc || '').slice(0, 100)}...</p>

        <div className="book-meta-strip">
          <span>📄 {book.totalPages || 320} {pagesSuffix}</span>
          <span>📅 {book.publicationYear || 2024}</span>
        </div>

        <div className="book-card-footer">
          <div className="shelf-dropdown-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm shelf-btn"
              onClick={() => setShelfMenuOpen(!shelfMenuOpen)}
            >
              <span>{currentShelfLabel}</span> ▾
            </button>
            {shelfMenuOpen && (
              <div className="shelf-menu" style={{ display: 'block', position: 'absolute', zIndex: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateShelf && onUpdateShelf(book.id, 'reading');
                    setShelfMenuOpen(false);
                  }}
                >
                  {lblReading}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateShelf && onUpdateShelf(book.id, 'want');
                    setShelfMenuOpen(false);
                  }}
                >
                  {lblWant}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateShelf && onUpdateShelf(book.id, 'read');
                    setShelfMenuOpen(false);
                  }}
                >
                  {lblMarkRead}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateShelf && onUpdateShelf(book.id, 'dnf');
                    setShelfMenuOpen(false);
                  }}
                >
                  {lblDnf}
                </button>
              </div>
            )}
          </div>
          <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm book-details-btn">
            {detailsText}
          </Link>
        </div>
      </div>
    </div>
  );
}

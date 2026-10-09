import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useLocation } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import BookClubStore from '../services/store';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, getBookText, language } = useI18n();
  const outletCtx = useOutletContext() || {};
  const location = useLocation();
  const [accessDeniedToast, setAccessDeniedToast] = useState(false);

  useEffect(() => {
    if (location.search.includes('access_denied=1')) {
      setAccessDeniedToast(true);
      const timer = setTimeout(() => setAccessDeniedToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const handleQuestUpdate = () => setRefreshTick((t) => t + 1);
    window.addEventListener('bookclub_quest_claimed', handleQuestUpdate);
    return () => window.removeEventListener('bookclub_quest_claimed', handleQuestUpdate);
  }, []);

  const stats = BookClubStore.getUserStats();
  const shelves = BookClubStore.getLibraryShelves();
  const currentlyReading = shelves.reading || [];
  const challenges = BookClubStore.getChallenges().slice(0, 2);
  const events = BookClubStore.getEvents().slice(0, 2);
  const activities = BookClubStore.getActivities().slice(0, 4);
  const recommendations = BookClubStore.getBooks().slice(4, 8);
  const quests = BookClubStore.getUserQuests ? BookClubStore.getUserQuests() : [];

  const handleClaimQuest = (bookId) => {
    const res = BookClubStore.claimQuestAndUnlockBook(bookId);
    if (res && res.success) {
      setRefreshTick((t) => t + 1);
      window.dispatchEvent(new CustomEvent('bookclub_quest_claimed', { detail: res }));
    }
  };

  const badges = [
    { icon: '🌱', name: 'First Book', date: 'May 2' },
    { icon: '🐛', name: 'Bookworm', date: 'Jul 18' },
    { icon: '🔥', name: '14-Day Streak', date: 'Sep 20' }
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Reader';

  return (
    <div>
      <Topbar
        title={`Welcome, ${firstName} 📖`}
        subtitle="Here's your reading habit snapshot for today."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/books" className="btn btn-primary btn-sm">+ Find Books</Link>
        }
      />

      {accessDeniedToast && (
        <div className="alert alert-error" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B' }}>
          Access Denied: Administrator privileges required to access that page.
        </div>
      )}

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-4" style={{ marginBottom: '20px' }}>
        <div className="card stat-card">
          <div className="stat-title">Books Read</div>
          <div className="stat-value tone-green">{stats.booksRead}</div>
          <div className="stat-delta up">↑ 3 this month</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Currently Reading</div>
          <div className="stat-value tone-gold">{stats.currentlyReading}</div>
          <div className="stat-delta">On track for weekly goal</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Want to Read</div>
          <div className="stat-value tone-blue">{stats.wantToRead}</div>
          <div className="stat-delta">In your queue</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Pages Read</div>
          <div className="stat-value tone-purple">{stats.pagesRead?.toLocaleString()}</div>
          <div className="stat-delta up">↑ 35 avg pages/day</div>
        </div>
      </div>

      {/* STREAK & LEVEL CARDS */}
      <div className="grid grid-3" style={{ marginBottom: '30px' }}>
        <div className="card stat-card">
          <div className="stat-title">Daily Reading Streak</div>
          <div className="stat-value" style={{ color: 'var(--clay)', fontSize: '1.8rem' }}>🔥 {stats.streak} Days</div>
          <div className="stat-delta">Personal record: 21 days</div>
        </div>

        <div className="card stat-card">
          <div className="stat-title">Current Reader Level</div>
          <div className="stat-value tone-gold" style={{ fontSize: '1.8rem' }}>Level {user?.level || stats.level || 8} · Sage</div>
          <div className="stat-delta">{stats.xp || 2340} / {stats.xpToNextLevel || 3000} XP</div>
          <div className="progress-track" style={{ marginTop: '6px' }}>
            <div className="progress-fill" style={{ width: '78%', background: 'var(--shell-gold)' }}></div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-title">2026 Annual Goal</div>
          <div className="flex-between">
            <div className="stat-value tone-green" style={{ fontSize: '1.8rem' }}>{stats.goalCurrent || 28} / {stats.goalAnnual || 50}</div>
            <span className="badge badge-completed">
              {Math.round(((stats.goalCurrent || 28) / (stats.goalAnnual || 50)) * 100)}%
            </span>
          </div>
          <div className="progress-track" style={{ marginTop: '6px' }}>
            <div className="progress-fill" style={{ width: `${Math.round(((stats.goalCurrent || 28) / (stats.goalAnnual || 50)) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* BEGINNER REWARDS & QUEST VAULT */}
      <div className="beginner-rewards-vault" style={{ marginBottom: '35px' }}>
        <div className="vault-header">
          <div className="vault-title-wrap">
            <h3>🎁 Beginner Rewards &amp; Quest Vault (Progressive Tiers)</h3>
            <p>
              Complete reading goals to unlock exclusive books, collect badges, and earn escalating XP: <strong>100 → 150 → 250 → 350 → 500 → 750 XP</strong>!
            </p>
          </div>
          <div className="vault-level-pill">
            <span>🔓 {quests.filter(q => q.isUnlocked).length} / {quests.length} Unlocked</span>
            <span>⚡ {stats.xp} Total XP</span>
          </div>
        </div>

        <div className="vault-cards-grid">
          {quests.map((q) => {
            const isUnlocked = q.isUnlocked;
            const isCompleted = q.isCompleted;

            return (
              <div key={q.id} className={`vault-quest-card ${isUnlocked ? 'unlocked-card' : ''}`}>
                <div>
                  <div className="vault-book-preview">
                    <div className="vault-book-thumb" style={{ width: '56px', height: '84px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 3px 8px rgba(0,0,0,0.18)', background: 'var(--cream-deep)' }}>
                      <img
                        src={getBookCoverUrl(q.book)}
                        alt={q.book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                        onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                      />
                    </div>
                    <div className="vault-book-details">
                      <h4>{q.book.title}</h4>
                      <p className="vault-author">
                        by {q.book.author} · <span style={{ color: '#F8E7BE' }}>{q.book.genre}</span>
                      </p>
                      <span className="vault-reward-pill">
                        ⚡ +{q.rewardXP} XP · 🏆 {q.rewardBadge}
                      </span>
                    </div>
                  </div>

                  <div className="quest-task-label" style={{ color: '#FFFFFF', marginBottom: '6px' }}>
                    🎯 {q.title}
                  </div>
                  <p className="vault-quest-desc">
                    {q.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#CAD7CE', fontWeight: 700, marginBottom: '4px' }}>
                    <span>Progress: {q.current} / {q.target}</span>
                    <span>{q.percentage}%</span>
                  </div>
                  <div className="quest-mini-bar-bg" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <div className="quest-mini-bar-fill" style={{ width: `${q.percentage}%` }}></div>
                  </div>

                  <div className="vault-quest-foot">
                    {isUnlocked ? (
                      <>
                        <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700 }}>✓ Unlocked</span>
                        <Link to={`/books/${q.book.id}`} className="btn btn-outline btn-sm" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}>
                          Read Book
                        </Link>
                      </>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        className="btn btn-warning btn-sm btn-claim-quest"
                        onClick={() => handleClaimQuest(q.book.id)}
                        style={{ width: '100%', fontWeight: 700 }}
                      >
                        🎁 Claim &amp; Unlock (+{q.rewardXP} XP)
                      </button>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.78rem', color: '#FCD34D' }}>🔒 In Progress</span>
                        <Link to={`/books/${q.book.id}`} className="btn btn-ghost btn-sm" style={{ color: '#CAD7CE', fontSize: '0.8rem' }}>
                          View Quest →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CURRENTLY READING SECTION */}
      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Currently Reading</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>Pick up right where you left off or log your pages for today.</p>
        </div>
        <div className="flex gap-8">
          <Link to="/library" className="btn btn-outline btn-sm">View My Library Shelves</Link>
          <Link to="/reading-progress" className="btn btn-primary btn-sm">Reading Tracker →</Link>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        {currentlyReading.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📖</div>
              <h3>No books currently being read</h3>
              <p className="text-soft" style={{ marginBottom: '20px' }}>Add a book from your library to start tracking your daily reading pace.</p>
              <Link to="/books" className="btn btn-primary">Explore Books</Link>
            </div>
          </div>
        ) : (
          currentlyReading.slice(0, 3).map((b) => (
            <div key={b.id} className="card reading-card" style={{ alignItems: 'flex-start', padding: '20px' }}>
              <div className="mini-cover" style={{ width: '64px', height: '94px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', background: 'var(--cream-deep)' }}>
                <img
                  src={getBookCoverUrl(b)}
                  alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                />
              </div>
              <div className="info" style={{ flex: 1, minWidth: 0, marginLeft: '16px' }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Link to={`/books/${b.id}`}>{getBookText ? getBookText(b, 'title') : (b.title_ta || b.title)}</Link>
                </h4>
                <p className="author" style={{ fontSize: '0.82rem', margin: '0 0 6px 0' }}>
                  {getBookText ? getBookText(b, 'author') : (b.author_ta || b.author)} · <span className="badge badge-want" style={{ fontSize: '0.68rem' }}>{getBookText ? getBookText(b, 'genre') : (b.genre_ta || b.genre)}</span>
                </p>

                <div className="progress-track" style={{ margin: '10px 0 6px' }}>
                  <div className="progress-fill" style={{ width: `${b.percentage || 0}%` }}></div>
                </div>

                <div className="progress-label-row flex-between" style={{ marginBottom: '12px', fontSize: '0.78rem' }}>
                  <span>{b.currentPage || 0} / {b.totalPages || 300} pgs</span>
                  <strong style={{ color: 'var(--brown-deep)' }}>{b.percentage || 0}%</strong>
                </div>

                <Link to="/reading-progress" className="btn btn-outline btn-sm btn-block">Continue Reading →</Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MAIN TWO COLUMN SECTION */}
      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
        {/* LEFT COLUMN: Upcoming Events & Challenges */}
        <div>
          <div className="card panel mb-30">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Active Challenges & Competitions</h3>
              <Link to="/challenges" style={{ color: 'var(--clay)', fontSize: '0.85rem' }}>View All →</Link>
            </div>
            <div>
              {challenges.map((c) => (
                <div key={c.id} className="list-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex-between" style={{ marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.92rem' }}>{c.badgeIcon} {c.title}</strong>
                      <span className="badge badge-active">{c.daysRemaining}d left</span>
                    </div>
                    <div className="progress-track" style={{ height: '6px', marginBottom: '4px' }}>
                      <div className="progress-fill" style={{ width: `${Math.round((c.progress / c.target) * 100)}%` }}></div>
                    </div>
                    <span className="meta" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      {c.progress} / {c.target} {c.unit} ({Math.round((c.progress / c.target) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Upcoming Book Club Events</h3>
              <Link to="/events" style={{ color: 'var(--clay)', fontSize: '0.85rem' }}>Events Hub →</Link>
            </div>
            <div>
              {events.map((e) => (
                <div key={e.id} className="event-row">
                  <div className="event-date-badge">
                    <span className="mon">{e.month}</span>
                    <span className="day">{e.day}</span>
                  </div>
                  <div className="event-body">
                    <div className="event-title"><Link to={`/events/${e.id}`}><strong>{e.title}</strong></Link></div>
                    <div className="event-sub">🕒 {e.time} · 👥 {e.participants} attending</div>
                  </div>
                  <Link to={`/events/${e.id}`} className="btn btn-outline btn-sm">RSVP</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Activity Feed & Badges */}
        <div>
          <div className="card panel mb-30">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Recent Community Activity</h3>
              <Link to="/activity" style={{ color: 'var(--clay)', fontSize: '0.85rem' }}>Full Stream →</Link>
            </div>
            <div className="feed-list">
              {activities.map((a) => (
                <div key={a.id} className="feed-row" style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="feed-ico" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: a.avatarBg || 'var(--clay)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {a.avatar || 'JR'}
                  </div>
                  <div className="feed-body" style={{ flex: 1, minWidth: 0 }}>
                    <div className="feed-title" style={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                      <strong>{a.user}</strong> {a.action?.replace('_', ' ')} <span style={{ color: 'var(--clay)', fontWeight: 600 }}>{a.targetTitle}</span>
                    </div>
                    <div className="feed-time" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{a.time} · {a.details || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Recently Earned Badges</h3>
              <Link to="/achievements" style={{ color: 'var(--clay)', fontSize: '0.85rem' }}>All Badges →</Link>
            </div>
            <div className="grid grid-3" style={{ gap: '12px' }}>
              {badges.map((b, idx) => (
                <div key={idx} className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{b.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>{b.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED BOOKS */}
      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Recommended For You</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>Based on your interest in Fantasy, Mystery, and historical memoirs.</p>
        </div>
        <Link to="/recommendations" className="btn btn-outline btn-sm">See Why You'll Love These →</Link>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        {recommendations.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}

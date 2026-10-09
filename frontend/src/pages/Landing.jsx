import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import BookClubStore from '../services/store';
import BookCard from '../components/BookCard';

export default function Landing() {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  const featuredBooks = BookClubStore.getBooks().slice(0, 4);
  const challenges = BookClubStore.getChallenges().slice(0, 3);
  const events = BookClubStore.getEvents().slice(0, 2);
  const discussions = BookClubStore.getDiscussions().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-page">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="mark">📖</span>
            <span className="brand-text"><span className="brand-book">BOOK</span> <span className="brand-forge">FORGE</span></span>
          </Link>

          <button
            className="nav-toggle"
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle navigation"
          >
            <span></span><span></span><span></span>
          </button>

          <ul className={`nav-links ${navOpen ? 'open' : ''}`}>
            <li><Link to="/" className="active">Home</Link></li>
            <li><Link to="/books">Browse Books</Link></li>
            <li><Link to="/groups">Reading Groups</Link></li>
            <li><Link to="/challenges">Challenges</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/discussions">Discussions</Link></li>
            <li><Link to="/dashboard">Reader Portal</Link></li>
          </ul>

          <div className="nav-auth">
            {/* Quick Theme Switcher */}
            <div className="theme-switch-dock" style={{ marginRight: '6px' }}>
              <button
                type="button"
                className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => changeTheme('light')}
                title="Light Theme"
              >☀️</button>
              <button
                type="button"
                className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => changeTheme('dark')}
                title="Dark Theme"
              >🌙</button>
            </div>

            {user ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    textAlign: 'center',
                    background: 'var(--clay)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    overflow: 'hidden'
                  }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (user.avatar || 'U')}
                  </span>
                  <span style={{ fontWeight: 700 }}>{user.name}</span>
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-reading'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {user.role?.toUpperCase()}
                  </span>
                </Link>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary btn-sm">
                  {user.role === 'admin' ? 'Admin Console' : 'Dashboard'}
                </Link>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout} title="Sign out">
                  Logout ↩
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Club</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="hero-glow-blob hero-glow-blob-1" aria-hidden="true"></div>
          <div className="hero-glow-blob hero-glow-blob-2" aria-hidden="true"></div>
          <div className="hero-glow-blob hero-glow-blob-3" aria-hidden="true"></div>

          <div className="hero-library-watermark" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 1200 560" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M40 560 V220 Q40 50 220 50 Q400 50 400 220 V560" stroke="#7A4E2D" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.045"/>
              <path d="M420 560 V180 Q420 30 600 30 Q780 30 780 180 V560" stroke="#7A4E2D" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.055"/>
              <path d="M800 560 V220 Q800 50 980 50 Q1160 50 1160 220 V560" stroke="#7A4E2D" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.045"/>
              <circle cx="600" cy="30" r="16" stroke="#B08A3E" strokeWidth="1" opacity="0.07"/>
              <circle cx="600" cy="30" r="8" stroke="#B08A3E" strokeWidth="1" opacity="0.06"/>
              <line x1="592" y1="30" x2="608" y2="30" stroke="#B08A3E" strokeWidth="1" opacity="0.07"/>
              <line x1="600" y1="22" x2="600" y2="38" stroke="#B08A3E" strokeWidth="1" opacity="0.07"/>
              <line x1="0" y1="480" x2="1200" y2="480" stroke="#7A4E2D" strokeWidth="1" opacity="0.035"/>
            </svg>
          </div>

          <div className="container hero-inner">
            <div className="hero-content">
              <div className="hero-eyebrow-badge">
                <span className="eyebrow-star">✦</span>
                <span className="eyebrow-text">The Modern Reading Community</span>
              </div>
              <h1 className="hero-title">Read Together. <span className="accent">Connect Better.</span></h1>
              <p className="lead">Discover curated books, join scheduled reading groups, track your annual reading goals, and enter exciting community reading competitions.</p>
              
              <div className="hero-actions">
                <Link to="/books" className="btn btn-primary">Explore Books</Link>
                {user ? (
                  user.role === 'admin' ? (
                    <Link to="/admin" className="btn btn-outline">Admin Command Console</Link>
                  ) : (
                    <Link to="/dashboard" className="btn btn-outline">Go to Dashboard</Link>
                  )
                ) : (
                  <Link to="/register" className="btn btn-outline">Join BOOK FORGE</Link>
                )}
                <Link to="/dashboard" className="btn btn-ghost">Go to Reader Dashboard →</Link>
              </div>

              <div className="hero-social-proof">
                <div className="hero-avatar-stack">
                  <span className="hero-mini-avatar" style={{ background: '#4C6A50' }}>EM</span>
                  <span className="hero-mini-avatar" style={{ background: '#B5652F' }}>CR</span>
                  <span className="hero-mini-avatar" style={{ background: '#B08A3E' }}>PN</span>
                  <span className="hero-mini-avatar" style={{ background: '#5C3A54' }}>WA</span>
                </div>
                <span className="hero-proof-text">Joined by <strong>1,250+</strong> passionate readers discussing literature this week</span>
              </div>
            </div>

            {/* Hero Featured Books Grid (2x2 with realistic covers) */}
            <div className="hero-art">
              <Link to="/books/1" className="hero-book-card" title="View details for The Silent Orchard">
                <div className="hero-book-cover-wrap">
                  <img src="/images/books/silent-orchard.jpg" alt="The Silent Orchard" className="hero-book-cover-img" onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }} />
                  <div className="hero-book-spine-line"></div>
                </div>
                <div className="hero-book-info">
                  <div className="hero-book-meta-top">
                    <span className="hero-book-genre genre-fiction">Fiction</span>
                    <span className="hero-book-rating">★ 4.2</span>
                  </div>
                  <h3 className="hero-book-title">The Silent Orchard</h3>
                  <p className="hero-book-author">by Elena Marsh</p>
                </div>
              </Link>

              <Link to="/books/2" className="hero-book-card" title="View details for Winter's Ledger">
                <div className="hero-book-cover-wrap">
                  <img src="/images/books/winters-ledger.jpg" alt="Winter's Ledger" className="hero-book-cover-img" onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }} />
                  <div className="hero-book-spine-line"></div>
                </div>
                <div className="hero-book-info">
                  <div className="hero-book-meta-top">
                    <span className="hero-book-genre genre-mystery">Mystery</span>
                    <span className="hero-book-rating">★ 4.8</span>
                  </div>
                  <h3 className="hero-book-title">Winter's Ledger</h3>
                  <p className="hero-book-author">by Colin Reyes</p>
                </div>
              </Link>

              <Link to="/books/3" className="hero-book-card" title="View details for Salt & Story">
                <div className="hero-book-cover-wrap">
                  <img src="/images/books/salt-and-story.jpg" alt="Salt & Story" className="hero-book-cover-img" onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }} />
                  <div className="hero-book-spine-line"></div>
                </div>
                <div className="hero-book-info">
                  <div className="hero-book-meta-top">
                    <span className="hero-book-genre genre-nonfiction">Non-Fiction</span>
                    <span className="hero-book-rating">★ 4.0</span>
                  </div>
                  <h3 className="hero-book-title">Salt & Story</h3>
                  <p className="hero-book-author">by Priya Nandan</p>
                </div>
              </Link>

              <Link to="/books/4" className="hero-book-card" title="View details for Paper Lanterns">
                <div className="hero-book-cover-wrap">
                  <img src="/images/books/paper-lanterns.jpg" alt="Paper Lanterns" className="hero-book-cover-img" onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }} />
                  <div className="hero-book-spine-line"></div>
                </div>
                <div className="hero-book-info">
                  <div className="hero-book-meta-top">
                    <span className="hero-book-genre genre-fantasy">Fantasy</span>
                    <span className="hero-book-rating">★ 4.7</span>
                  </div>
                  <h3 className="hero-book-title">Paper Lanterns</h3>
                  <p className="hero-book-author">by Wren Achebe</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="stats-strip">
          <div className="container stats-grid">
            <div><div className="stat-num">1,250+</div><div className="stat-label">Active Readers</div></div>
            <div><div className="stat-num">320+</div><div className="stat-label">Curated Books</div></div>
            <div><div className="stat-num">48</div><div className="stat-label">Reading Circles</div></div>
            <div><div className="stat-num">18,500+</div><div className="stat-label">Pages Logged This Week</div></div>
          </div>
        </section>

        {/* FEATURED BOOKS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">On The Shelves</span>
              <h2>Featured Books</h2>
              <p>Hand-picked literary works our community is actively reading and reviewing right now.</p>
            </div>
            <div className="grid grid-4">
              {featuredBooks.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '36px' }}>
              <Link to="/books" className="btn btn-outline">Browse All 320+ Books →</Link>
            </div>
          </div>
        </section>

        {/* ACTIVE READING CHALLENGES */}
        <section className="section" style={{ background: 'var(--cream-deep)' }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Community Milestones</span>
              <h2>Active Reading Challenges</h2>
              <p>Build daily reading habits, earn XP, and unlock badges with fellow book lovers.</p>
            </div>
            <div className="grid grid-3">
              {challenges.map((c) => (
                <div key={c.id} className="card challenge-card">
                  <div className="badge-ico">{c.badgeIcon || '🏆'}</div>
                  <h3>{c.title}</h3>
                  <p className="desc">{c.description}</p>
                  <div className="progress-track" style={{ margin: '14px 0 8px' }}>
                    <div className="progress-fill" style={{ width: `${Math.round((c.progress / c.target) * 100)}%` }}></div>
                  </div>
                  <div className="flex-between meta" style={{ marginBottom: '16px' }}>
                    <span>{c.progress} / {c.target} {c.unit}</span>
                    <span>{c.daysRemaining} days left</span>
                  </div>
                  <Link to={`/challenges/${c.id}`} className="btn btn-outline btn-sm btn-block">Join Challenge →</Link>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '30px' }}>
              <Link to="/challenges" className="btn btn-primary btn-sm">Explore All Challenges</Link>
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS & TRENDING DISCUSSIONS */}
        <section className="section">
          <div className="container">
            <div className="grid grid-2" style={{ gap: '40px', alignItems: 'start' }}>
              <div>
                <div className="flex-between mb-30">
                  <div>
                    <span className="eyebrow">Gatherings</span>
                    <h2 style={{ margin: '4px 0 0 0' }}>Upcoming Events</h2>
                  </div>
                  <Link to="/events" className="btn btn-ghost btn-sm">View Calendar →</Link>
                </div>
                <div className="grid" style={{ gap: '16px' }}>
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

              <div>
                <div className="flex-between mb-30">
                  <div>
                    <span className="eyebrow">Conversations</span>
                    <h2 style={{ margin: '4px 0 0 0' }}>Trending Discussions</h2>
                  </div>
                  <Link to="/discussions" className="btn btn-ghost btn-sm">All Forums →</Link>
                </div>
                <div className="grid" style={{ gap: '16px' }}>
                  {discussions.map((d) => (
                    <div key={d.id} className="card" style={{ padding: '16px' }}>
                      <div className="flex-between" style={{ marginBottom: '6px' }}>
                        <span className="badge badge-reading" style={{ fontSize: '0.7rem' }}>{d.category || 'General'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{d.repliesCount || d.replies?.length || 0} replies</span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>
                        <Link to={`/discussions/${d.id}`}>{d.title}</Link>
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineClamp: 2, overflow: 'hidden' }}>
                        {d.snippet || d.content?.slice(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP READERS / LEADERBOARD SPOTLIGHT */}
        <section className="section" style={{ background: 'var(--cream-deep)' }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Reader Spotlight</span>
              <h2>This Month's Top Readers</h2>
              <p>Celebrating the readers who turned the most pages and led inspiring discussions.</p>
            </div>

            <div className="podium-wrap">
              <div className="podium-step podium-rank-2">
                <div className="podium-avatar" style={{ background: 'var(--green-shelf)' }}>AK</div>
                <div className="podium-name">Aditi Krishnan</div>
                <div className="podium-score">1,200 pgs</div>
                <div className="podium-pillar"><span>#2</span></div>
              </div>
              <div className="podium-step podium-rank-1">
                <div className="podium-avatar" style={{ background: 'var(--shell-gold-deep)' }}>MB</div>
                <div className="podium-name">Marcus Brody</div>
                <div className="podium-score">2,150 pgs</div>
                <div className="podium-pillar"><span>#1 👑</span></div>
              </div>
              <div className="podium-step podium-rank-3">
                <div className="podium-avatar" style={{ background: 'var(--clay)' }}>JR</div>
                <div className="podium-name">Jordan Rivera</div>
                <div className="podium-score">1,450 pgs</div>
                <div className="podium-pillar"><span>#3</span></div>
              </div>
            </div>

            <div className="text-center" style={{ marginTop: '24px' }}>
              <Link to="/leaderboards" className="btn btn-outline btn-sm">View Full Leaderboards</Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Voices of BOOK FORGE</span>
              <h2>Why Our Community Loves Reading Here</h2>
            </div>
            <div className="grid grid-3">
              <div className="card feature-card">
                <p style={{ fontStyle: 'italic', fontSize: '1rem', marginBottom: '16px' }}>
                  "The reading streaks and monthly challenges pushed me to read 28 books this year — my highest ever since college!"
                </p>
                <div className="author-line">
                  <div className="avatar-chip" style={{ background: 'var(--clay)' }}>WA</div>
                  <div>
                    <strong>Wren Achebe</strong>
                    <div className="text-soft" style={{ fontSize: '0.8rem' }}>Fantasy Enthusiast · 3 yrs member</div>
                  </div>
                </div>
              </div>

              <div className="card feature-card">
                <p style={{ fontStyle: 'italic', fontSize: '1rem', marginBottom: '16px' }}>
                  "I love our weekly Zoom sessions for Mystery Readers. The poll for 'What should we read next' has turned into a beloved monthly ritual."
                </p>
                <div className="author-line">
                  <div className="avatar-chip" style={{ background: 'var(--green-shelf)' }}>AK</div>
                  <div>
                    <strong>Aditi Krishnan</strong>
                    <div className="text-soft" style={{ fontSize: '0.8rem' }}>Reading Group Organizer</div>
                  </div>
                </div>
              </div>

              <div className="card feature-card">
                <p style={{ fontStyle: 'italic', fontSize: '1rem', marginBottom: '16px' }}>
                  "The private reading journal and quote wall changed the way I remember books. It feels like having my personal antique library in my pocket."
                </p>
                <div className="author-line">
                  <div className="avatar-chip" style={{ background: 'var(--gold)' }}>MJ</div>
                  <div>
                    <strong>Meera Joseph</strong>
                    <div className="text-soft" style={{ fontSize: '0.8rem' }}>Literature Student</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--brown-deep), #2A170A)', color: '#fff', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '680px' }}>
            <h2 style={{ color: '#fff', fontSize: '2.4rem', marginBottom: '16px' }}>Ready for your next great read?</h2>
            <p style={{ color: '#DCC9AE', fontSize: '1.15rem', marginBottom: '30px' }}>Join hundreds of passionate readers. Track your books, join lively discussions, and discover books you'll never forget.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ borderColor: '#DCC9AE', color: '#fff' }}>Open Reader Dashboard</Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span className="mark">📖</span>
                <span className="brand-text"><span className="brand-book">BOOK</span> <span className="brand-forge">FORGE</span></span>
              </div>
              <p>A warm, thoughtful platform for reading guilds, book circles, and literary discovery.</p>
              <div className="social-row">
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="Instagram">📸</a>
                <a href="#" aria-label="Discord">💬</a>
                <a href="#" aria-label="Goodreads">📖</a>
              </div>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><Link to="/books">Book Discovery</Link></li>
                <li><Link to="/groups">Reading Groups</Link></li>
                <li><Link to="/challenges">Challenges & Badges</Link></li>
                <li><Link to="/competitions">Competitions</Link></li>
                <li><Link to="/events">Upcoming Events</Link></li>
              </ul>
            </div>
            <div>
              <h4>Reader Tools</h4>
              <ul>
                <li><Link to="/dashboard">Reader Dashboard</Link></li>
                <li><Link to="/library">My Library Shelves</Link></li>
                <li><Link to="/reading-progress">Reading Tracker</Link></li>
                <li><Link to="/reading-goals">Annual Reading Goals</Link></li>
                <li><Link to="/journal">Reading Journal</Link></li>
              </ul>
            </div>
            <div>
              <h4>Community</h4>
              <ul>
                <li><Link to="/discussions">Forums & Discussions</Link></li>
                <li><Link to="/reviews">Community Reviews</Link></li>
                <li><Link to="/leaderboards">Leaderboards</Link></li>
                <li><Link to="/calendar">Events Calendar</Link></li>
                <li><Link to="/reports">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; 2026 BOOK FORGE Platform. Designed for book lovers and reading guilds everywhere.
          </div>
        </div>
      </footer>
    </div>
  );
}

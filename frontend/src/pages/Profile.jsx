import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import CertificateModal from '../components/CertificateModal';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function Profile() {
  const outletCtx = useOutletContext() || {};
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Reader');
  const [editUsername, setEditUsername] = useState(user?.username || 'reader');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || 'Lifelong fantasy reader, slow when it comes to mysteries, always down for a good book recommendation.');
  const [editGenre, setEditGenre] = useState(user?.favoriteGenre || 'Fantasy');
  const [editImage, setEditImage] = useState(user?.profileImage || '');

  const [activeCert, setActiveCert] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const stats = BookClubStore.getUserStats();
  const shelves = BookClubStore.getLibraryShelves();
  const certs = BookClubStore.getCertificates();
  const activities = BookClubStore.getActivities().slice(0, 6);
  const allReviews = BookClubStore.getReviews();
  const userReviews = allReviews.filter(
    r => (user && (r.username === user.username || r.user === user.name))
  );
  const displayReviews = userReviews.length > 0 ? userReviews : allReviews.slice(0, 4);

  const badges = [
    { icon: '🌱', name: 'First Book Finished', date: 'May 2, 2026', xp: 100, desc: 'Read first full novel in the reader community.' },
    { icon: '🐛', name: 'Bookworm Initiate', date: 'Jul 18, 2026', xp: 250, desc: 'Finished 5 books across 3 different genres.' },
    { icon: '🔥', name: '14-Day Streak', date: 'Sep 20, 2026', xp: 500, desc: 'Logged 20+ pages consecutively for 14 days.' },
    { icon: '⭐', name: 'Thoughtful Critic', date: 'Aug 12, 2026', xp: 150, desc: 'Wrote verified book reviews with reflections.' },
    { icon: '🎓', name: 'Salon Graduate', date: 'Oct 1, 2026', xp: 300, desc: 'Earned official verified salon participation credential.' }
  ];

  const handleOpenEdit = () => {
    setEditName(user?.name || 'Reader');
    setEditUsername(user?.username || 'reader');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditBio(user?.bio || '');
    setEditGenre(user?.favoriteGenre || 'Fantasy');
    setEditImage(user?.profileImage || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({
      name: editName,
      username: editUsername,
      email: editEmail,
      phone: editPhone,
      bio: editBio,
      favoriteGenre: editGenre,
      profileImage: editImage
    });
    setShowEditModal(false);
    showToast('Profile information successfully updated!');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const roleLabel = user?.role === 'admin' ? '👑 Admin' : user?.role === 'organizer' ? '📋 Organizer' : '📖 Guild Member';
  const roleBadgeClass = user?.role === 'admin' ? 'badge-admin' : user?.role === 'organizer' ? 'badge-active' : 'badge-completed';

  return (
    <div>
      <Topbar
        title="Reader Profile"
        subtitle="Your reader identity, reading records, verified credentials, and bookshelf."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <div className="flex gap-8">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenEdit}>
              ✏️ Edit Profile
            </button>
            <Link to="/messages" className="btn btn-ghost btn-sm">💬 Messages</Link>
          </div>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* 1. PROFILE HERO HEADER & IDENTITY CARD */}
      <div className="card panel mb-30" style={{ padding: '32px', background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar with photo or fallback initials */}
          <div
            className="avatar-chip"
            style={{
              width: '110px',
              height: '110px',
              fontSize: '2.4rem',
              background: 'var(--clay)',
              border: '4px solid var(--cream-deep)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
              borderRadius: '50%'
            }}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'
            )}
          </div>

          {/* User Information & Identity Details */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '2rem', lineHeight: 1.2 }}>{user?.name || 'Reader Profile'}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="text-soft" style={{ fontSize: '0.95rem', fontWeight: 600 }}>@{user?.username || 'reader'}</span>
                  <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                    {roleLabel}
                  </span>
                  <span className="badge badge-want" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                    📚 {user?.favoriteGenre || 'Fiction'} Reader
                  </span>
                </div>
              </div>

              <button type="button" className="btn btn-outline btn-sm" onClick={handleOpenEdit}>
                ✏️ Edit Profile Info
              </button>
            </div>

            {/* Contact & Membership Meta Strip */}
            <div style={{ display: 'flex', gap: '20px', margin: '14px 0 10px', fontSize: '0.88rem', color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
              {user?.email && (
                <span title="Registered email address">📧 <strong>{user.email}</strong></span>
              )}
              {user?.phone && (
                <span title="Verified phone number">📱 <strong>{user.phone}</strong></span>
              )}
              <span>🗓️ Member since <strong>2026</strong></span>
            </div>

            {/* Bio */}
            <p style={{ margin: '10px 0 16px', color: 'var(--ink)', maxWidth: '680px', fontSize: '0.98rem', lineHeight: 1.55 }}>
              {user?.bio || 'Lifelong fantasy reader, slow when it comes to mysteries, always down for a good book recommendation. Currently tackling 50 books in 2026.'}
            </p>

            {/* Level, Streak, XP Status */}
            <div className="flex gap-16" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
              <span>Level: <strong style={{ color: 'var(--shell-gold-deep)' }}>{user?.level || stats.level || 8} (Literary Sage)</strong></span>
              <span>Streak: <strong style={{ color: 'var(--clay)' }}>🔥 {stats.streak || 14} Days Active</strong></span>
              <span>Total XP: <strong style={{ color: 'var(--green-shelf)' }}>⚡ {(stats.xp || 2340).toLocaleString()} XP</strong></span>
            </div>
          </div>
        </div>

        {/* 2. STATISTICAL METRIC STRIP */}
        <div className="grid grid-4" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed var(--line)', textAlign: 'center' }}>
          <div>
            <div className="stat-value tone-green" style={{ fontSize: '1.75rem' }}>{stats.booksRead}</div>
            <div className="stat-title">Books Finished</div>
          </div>
          <div>
            <div className="stat-value tone-purple" style={{ fontSize: '1.75rem' }}>{stats.pagesRead?.toLocaleString()}</div>
            <div className="stat-title">Pages Read</div>
          </div>
          <div>
            <div className="stat-value tone-gold" style={{ fontSize: '1.75rem' }}>{displayReviews.length}</div>
            <div className="stat-title">Reviews Written</div>
          </div>
          <div>
            <div className="stat-value tone-blue" style={{ fontSize: '1.75rem' }}>{certs.length}</div>
            <div className="stat-title">Official Certificates</div>
          </div>
        </div>
      </div>

      {/* 3. PROFILE NAVIGATION TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--line)', marginBottom: '28px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '🌟 Full Overview' },
          { id: 'current', label: `📖 Currently Reading (${shelves.reading.length})` },
          { id: 'books', label: `📚 Completed Shelf (${shelves.read.length})` },
          { id: 'achievements', label: `🏆 Badges & Trophies (${badges.length})` },
          { id: 'certificates', label: `🎓 Certificates (${certs.length})` },
          { id: 'reviews', label: `⭐ Reviews (${displayReviews.length})` },
          { id: 'activity', label: '⚡ Activity Timeline' }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              cursor: 'pointer',
              padding: '12px 18px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              whiteSpace: 'nowrap',
              borderBottom: activeTab === tab.id ? '3px solid var(--clay)' : 'none',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* TAB 1: OVERVIEW (Renders Complete Ordered Profile) */}
      {(activeTab === 'overview' || activeTab === 'current') && (
        <div style={{ marginBottom: '36px' }}>
          <div className="grid grid-2" style={{ gap: '26px', alignItems: 'stretch' }}>
            {/* CURRENTLY READING SHELF */}
            <div className="card panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: 0 }}>📖 Currently Reading</h3>
                  <Link to="/library" className="btn btn-ghost btn-sm">Manage Shelves →</Link>
                </div>
                <div className="feed-list" style={{ marginTop: '8px' }}>
                  {shelves.reading.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--ink-soft)' }}>
                      <p>No books currently logged on your reading shelf.</p>
                      <Link to="/books" className="btn btn-primary btn-sm">Browse Books</Link>
                    </div>
                  ) : (
                    shelves.reading.map((b) => (
                      <div key={b.id} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                        {/* High-res proportional cover thumbnail */}
                        <div style={{ width: '56px', height: '82px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', background: 'var(--cream-deep)' }}>
                          <img
                            src={getBookCoverUrl(b)}
                            alt={b.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                            onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Link to={`/books/${b.id}`} style={{ color: 'var(--ink)' }}>{b.title}</Link>
                          </h4>
                          <p className="text-soft" style={{ margin: '0 0 6px 0', fontSize: '0.82rem' }}>
                            by {b.author} · <span style={{ color: 'var(--clay)', fontWeight: 600 }}>{b.genre}</span>
                          </p>
                          <div className="progress-track" style={{ height: '7px', marginBottom: '4px' }}>
                            <div className="progress-fill" style={{ width: `${b.percentage || 0}%` }}></div>
                          </div>
                          <div className="flex-between" style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                            <span>Page {b.currentPage || 0} of {b.totalPages || 300} ({b.percentage || 0}%)</span>
                            <Link to={`/books/${b.id}`} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                              Continue →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ANNUAL READING GOAL PACE */}
            <div className="card panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: 0 }}>🎯 2026 Reading Goal Pace</h3>
                  <Link to="/reading-goals" className="btn btn-ghost btn-sm">Goal Details →</Link>
                </div>
                <p className="text-soft" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  Keep your daily reading streak alive to reach your annual milestones.
                </p>
                <div style={{ padding: '18px', background: 'var(--cream-deep, #F4ECE1)', borderRadius: '10px', marginBottom: '16px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Annual Target</span>
                    <strong style={{ color: 'var(--shell-gold-deep)', fontSize: '1.1rem' }}>
                      {stats.goalCurrent || 28} / {stats.goalAnnual || 50} Books
                    </strong>
                  </div>
                  <div className="progress-track" style={{ height: '14px', background: 'var(--paper)', borderRadius: '7px', overflow: 'hidden' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.round(((stats.goalCurrent || 28) / (stats.goalAnnual || 50)) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--clay), var(--shell-gold-deep))'
                      }}
                    ></div>
                  </div>
                  <div className="flex-between" style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                    <span>{Math.max(0, (stats.goalAnnual || 50) - (stats.goalCurrent || 28))} books left to finish</span>
                    <strong>{Math.round(((stats.goalCurrent || 28) / (stats.goalAnnual || 50)) * 100)}% Completed</strong>
                  </div>
                </div>

                <div className="flex gap-16" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
                  <div>🔥 Daily Reading Streak: <strong style={{ color: 'var(--clay)' }}>{stats.streak || 14} Days</strong></div>
                  <div>⚡ Daily Habit: <strong style={{ color: 'var(--green-shelf)' }}>20+ pages/day</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED BOOKS SHELF */}
      {(activeTab === 'overview' || activeTab === 'books') && (
        <div className="card panel mb-30" style={{ padding: '26px' }}>
          <div className="panel-head flex-between" style={{ marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0 }}>📚 Finished Reading Shelf</h3>
              <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                Completed literary works logged in your personal guild archives.
              </p>
            </div>
            <Link to="/library" className="btn btn-outline btn-sm">Full Library ({shelves.read.length} finished)</Link>
          </div>

          {shelves.read.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-soft)' }}>
              <p>No completed books recorded yet. Mark a book as finished to celebrate your literary journey!</p>
              <Link to="/books" className="btn btn-primary btn-sm">Browse Catalog</Link>
            </div>
          ) : (
            <div className="grid grid-4" style={{ gap: '20px' }}>
              {shelves.read.map((b) => (
                <div key={b.id} className="card book-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Proportional 2:3 Book Cover */}
                  <Link to={`/books/${b.id}`} className="book-cover-link">
                    <div className="book-cover-wrap book-cover-pro" style={{ height: '240px' }}>
                      <img
                        src={getBookCoverUrl(b)}
                        alt={b.title}
                        className="book-cover-img"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                      />
                    </div>
                  </Link>
                  <div className="book-card-body" style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="flex-between" style={{ marginBottom: '4px' }}>
                        <span className="badge badge-completed" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Finished ✓</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--shell-gold-deep)', fontWeight: 700 }}>★ {b.rating || 4.5}</span>
                      </div>
                      <h4 style={{ margin: '4px 0 2px', fontSize: '0.98rem', lineHeight: 1.3 }}>
                        <Link to={`/books/${b.id}`} style={{ color: 'var(--ink)' }}>{b.title}</Link>
                      </h4>
                      <p className="text-soft" style={{ margin: 0, fontSize: '0.82rem' }}>by {b.author}</p>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <Link to={`/books/${b.id}`} className="btn btn-outline btn-sm btn-block" style={{ fontSize: '0.78rem', padding: '5px' }}>
                        View Details & Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. COMMUNITY BADGES & TROPHIES */}
      {(activeTab === 'overview' || activeTab === 'achievements') && (
        <div className="card panel mb-30" style={{ padding: '26px' }}>
          <div className="panel-head flex-between" style={{ marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0 }}>🏆 Earned Community Badges & Trophies</h3>
              <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                Special honours unlocked through reading streaks, book salon participation, and challenges.
              </p>
            </div>
            <Link to="/achievements" className="btn btn-outline btn-sm">All Badges ({badges.length} Unlocked)</Link>
          </div>

          <div className="grid grid-4" style={{ gap: '16px' }}>
            {badges.map((b, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '20px', background: 'var(--paper)' }}>
                <div style={{ fontSize: '2.6rem', marginBottom: '8px' }}>{b.icon}</div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{b.name}</h4>
                <p className="text-soft" style={{ margin: '0 0 10px 0', fontSize: '0.82rem', minHeight: '36px' }}>{b.desc}</p>
                <div className="flex-between" style={{ fontSize: '0.74rem' }}>
                  <span className="badge badge-completed">Awarded {b.date}</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-shelf)' }}>+{b.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. OFFICIAL VERIFIED CERTIFICATES (CRT) */}
      {(activeTab === 'overview' || activeTab === 'certificates') && (
        <div className="card panel mb-30" style={{ padding: '26px' }}>
          <div className="panel-head flex-between" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>🎓 Official Verified Certificates (CRT)</h3>
              <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                Authentic credentials awarded for author salons, seasonal reading quests, and club achievements.
              </p>
            </div>
            <span className="badge badge-completed">{certs.length} Earned</span>
          </div>

          {certs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-soft)' }}>
              <p>No certificates earned yet. Attend events or complete reading quests to unlock your credentials!</p>
              <Link to="/events" className="btn btn-primary btn-sm">Browse Events</Link>
            </div>
          ) : (
            <div className="grid grid-2" style={{ gap: '20px' }}>
              {certs.map((crt) => (
                <div key={crt.id} className="card panel" style={{ borderLeft: '5px solid var(--shell-gold-deep)', padding: '22px', background: 'var(--paper)' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.74rem' }}>Verified CRT</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>ID: {crt.id}</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem' }}>{crt.title}</h4>
                  <p className="text-soft" style={{ fontSize: '0.84rem', margin: '0 0 16px 0' }}>
                    Issued on <strong>{crt.date}</strong> by <strong>{crt.issuer}</strong>
                  </p>
                  <div className="flex gap-8">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveCert(crt)}>
                      🎓 View CRT Certificate
                    </button>
                    <Link to={`/verify-certificate?id=${encodeURIComponent(crt.id)}`} className="btn btn-outline btn-sm">
                      Public Verify Portal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. REVIEWS WRITTEN */}
      {(activeTab === 'overview' || activeTab === 'reviews') && (
        <div className="card panel mb-30" style={{ padding: '26px' }}>
          <div className="panel-head flex-between" style={{ marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: 0 }}>⭐ Literary Reviews Written</h3>
              <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                Your personal reflections, critiques, and ratings shared with the community.
              </p>
            </div>
            <Link to="/reviews" className="btn btn-outline btn-sm">All Reviews ({displayReviews.length})</Link>
          </div>

          <div className="grid grid-2" style={{ gap: '20px' }}>
            {displayReviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: '20px', background: 'var(--paper)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>
                      {'★'.repeat(r.overallRating || r.rating || 5)}
                    </span>
                    <span className="text-soft" style={{ fontSize: '0.78rem' }}>{r.date || 'Recently'}</span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>
                    📖 {r.bookTitle || r.title || 'Book Review'}
                  </h4>
                  {r.bookAuthor && (
                    <p className="text-soft" style={{ margin: '0 0 10px 0', fontSize: '0.82rem' }}>by {r.bookAuthor}</p>
                  )}
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                    "{r.reviewText || r.content || r.body || 'Thoughtful review of this title.'}"
                  </p>
                </div>
                <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                  <span>❤️ {r.likes || 12} helpful readers</span>
                  {r.bookId && (
                    <Link to={`/books/${r.bookId}`} style={{ color: 'var(--clay)', fontWeight: 600 }}>Book Page →</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. RECENT ACTIVITY TIMELINE */}
      {(activeTab === 'overview' || activeTab === 'activity') && (
        <div className="card panel mb-30" style={{ padding: '26px' }}>
          <div className="panel-head flex-between" style={{ marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>⚡ Reader Activity Timeline</h3>
              <p className="text-soft" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                Your recent reading log updates, review posts, and community discussions.
              </p>
            </div>
            <Link to="/activity" className="btn btn-outline btn-sm">Full Activity Feed</Link>
          </div>

          <div className="feed-list">
            {activities.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: a.avatarBg || 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {a.avatar || user?.avatar || 'U'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem' }}>
                    <strong>{a.user || user?.name}</strong> {a.action?.replace('_', ' ')} <span style={{ color: 'var(--clay)', fontWeight: 600 }}>{a.targetTitle}</span>
                  </div>
                  <div className="text-soft" style={{ fontSize: '0.78rem' }}>{a.time} · {a.details || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay show" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Edit Reader Profile</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ padding: '22px' }}>
              {/* Profile Avatar Section */}
              <div className="field">
                <label style={{ fontWeight: 700, marginBottom: '8px' }}>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--clay)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0, boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}>
                    {editImage ? (
                      <img src={editImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      editName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ fontSize: '0.82rem' }} />
                    <div className="text-soft" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Upload a JPEG, PNG, or WebP photo</div>
                  </div>
                </div>
              </div>

              {/* Name & Username Fields */}
              <div className="field-row" style={{ display: 'flex', gap: '14px' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="modalEditName">Full Name</label>
                  <input type="text" id="modalEditName" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="modalEditUsername">Username</label>
                  <input type="text" id="modalEditUsername" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
                </div>
              </div>

              {/* Email & Phone Contact Fields */}
              <div className="field-row" style={{ display: 'flex', gap: '14px' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="modalEditEmail">Email Address</label>
                  <input type="email" id="modalEditEmail" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="modalEditPhone">Phone Number</label>
                  <input type="tel" id="modalEditPhone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>

              {/* Favorite Genre */}
              <div className="field">
                <label htmlFor="modalEditGenre">Favorite Genre</label>
                <select id="modalEditGenre" value={editGenre} onChange={(e) => setEditGenre(e.target.value)}>
                  <option value="Fiction">Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Classic">Classic Literature</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Tamil Classics">Tamil Classics</option>
                </select>
              </div>

              {/* Bio */}
              <div className="field">
                <label htmlFor="modalEditBio">Bio</label>
                <textarea rows="3" id="modalEditBio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Write a short note about your reading tastes..."></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRT CERTIFICATE MODAL */}
      {activeCert && (
        <CertificateModal cert={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
}

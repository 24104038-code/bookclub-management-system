import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Achievements() {
  const outletCtx = useOutletContext() || {};
  const [filter, setFilter] = useState('all');

  const stats = BookClubStore.getUserStats();

  const allBadges = [
    { id: 1, title: 'First Book Finished', status: 'unlocked', icon: '🌱', dateUnlocked: 'May 2, 2026', xp: 100, description: 'Finished your first complete novel in the reader community.' },
    { id: 2, title: 'Bookworm Initiate', status: 'unlocked', icon: '🐛', dateUnlocked: 'Jul 18, 2026', xp: 250, description: 'Read 5 books spanning across multiple literary genres.' },
    { id: 3, title: 'Daily Habit Hero', status: 'unlocked', icon: '🔥', dateUnlocked: 'Sep 20, 2026', xp: 500, description: 'Achieved a continuous 14-day daily reading streak.' },
    { id: 4, title: 'Thoughtful Critic', status: 'unlocked', icon: '⭐', dateUnlocked: 'Aug 12, 2026', xp: 150, description: 'Wrote 3 detailed book reviews with ratings and reflections.' },
    { id: 5, title: 'Salon Graduate', status: 'unlocked', icon: '🎓', dateUnlocked: 'Oct 1, 2026', xp: 300, description: 'Attended a live author salon and earned verified participation credentials.' },
    { id: 6, title: 'Century Reader', status: 'in_progress', icon: '⚡', progress: '28 / 50 Books', xp: 1000, description: 'Read 50 books in a single calendar year.' },
    { id: 7, title: 'Genre Omnivore', status: 'in_progress', icon: '🧭', progress: '4 / 6 Genres', xp: 400, description: 'Read at least one book from 6 distinct literary categories.' },
    { id: 8, title: 'Community Pillar', status: 'in_progress', icon: '🏛️', progress: '18 / 25 Replies', xp: 350, description: 'Engage actively in book club discussion forums.' },
    { id: 9, title: 'Trophy Hunter', status: 'locked', icon: '🏆', xp: 750, description: 'Finish in the top 3 on any seasonal reading competition.' },
    { id: 10, title: 'Ancient Scholar', status: 'locked', icon: '📜', xp: 600, description: 'Read 5 books published before the 20th century.' },
    { id: 11, title: 'Master of the Forge', status: 'locked', icon: '👑', xp: 2000, description: 'Reach Level 10 and unlock all premier guild privileges.' }
  ];

  let filtered = allBadges;
  if (filter !== 'all') {
    filtered = allBadges.filter((b) => b.status === filter);
  }

  return (
    <div>
      <Topbar
        title="Achievements & Badges"
        subtitle="Earn rewards for your dedication to the reading life."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/leaderboards" className="btn btn-outline btn-sm">Community Rankings 🏅</Link>
        }
      />

      {/* LEVEL & XP BANNER */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, #1E3A2E, #16291F)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--shell-gold)' }}>Reader Level {stats.level || 8}</span>
            <h1 style={{ color: '#fff', margin: '6px 0', fontSize: '2rem' }}>Literary Sage</h1>
            <p style={{ color: '#B9C7BC', maxWidth: '500px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Level up by completing challenges, writing thoughtful reviews, and logging your daily pages.
            </p>
            <div className="flex gap-16" style={{ fontSize: '0.9rem', color: '#E7D9C6' }}>
              <span>🔥 Streak: <strong>{stats.streak || 14} Days</strong></span>
              <span>🏆 Unlocked: <strong>5 / 11 Badges</strong></span>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '18px 24px', minWidth: '240px' }}>
            <div className="flex-between" style={{ fontSize: '0.85rem', color: '#B9C7BC', marginBottom: '6px' }}>
              <span>XP Progress</span>
              <strong style={{ color: 'var(--shell-gold)' }}>{stats.xp || 2340} / {stats.xpToNextLevel || 3000} XP</strong>
            </div>
            <div className="progress-track" style={{ height: '10px', background: 'rgba(255,255,255,0.15)' }}>
              <div className="progress-fill" style={{ width: '78%', background: 'var(--shell-gold)' }}></div>
            </div>
            <div className="text-soft" style={{ fontSize: '0.75rem', marginTop: '8px', color: '#B9C7BC' }}>
              660 XP until Level 9: Grand Scholar
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All Badges (${allBadges.length})` },
          { id: 'unlocked', label: 'Unlocked (5)' },
          { id: 'in_progress', label: 'In Progress (3)' },
          { id: 'locked', label: 'Locked (3)' }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${filter === tab.id ? 'active' : ''}`}
            onClick={() => setFilter(tab.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: filter === tab.id ? 700 : 500 }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* BADGES GRID */}
      <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {filtered.map((b) => (
          <div key={b.id} className={`card badge-card ${b.status === 'locked' ? 'locked' : ''}`} style={{ padding: '20px', textAlign: 'center', opacity: b.status === 'locked' ? 0.6 : 1 }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{b.icon}</div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{b.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.4, marginBottom: '12px' }}>{b.description}</p>

            {b.status === 'unlocked' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--green-shelf)', fontWeight: 700, marginBottom: '8px' }}>
                ✓ Unlocked on {b.dateUnlocked}
              </div>
            )}
            {b.status === 'in_progress' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--clay)', fontWeight: 700, marginBottom: '8px' }}>
                Progress: {b.progress}
              </div>
            )}
            {b.status === 'locked' && (
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                🔒 Locked milestone
              </div>
            )}

            <span className="badge-xp-tag" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              +{b.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

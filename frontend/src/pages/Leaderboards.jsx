import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

export default function Leaderboards() {
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();
  const [tab, setTab] = useState('overall');

  const leaderboardsData = {
    overall: [
      { rank: 1, name: 'Marcus Brody', username: 'marcusb', avatar: 'MB', level: 12, xp: 6420, books: 42, pages: 14200, streak: 64, badge: '👑 Grand Master' },
      { rank: 2, name: 'Aditi Krishnan', username: 'aditik', avatar: 'AK', level: 10, xp: 5120, books: 36, pages: 11800, streak: 45, badge: '🌸 Salon Master' },
      { rank: 3, name: `${user?.name || 'Jordan Rivera'}`, username: `${user?.username || 'jordanreads'}`, avatar: `${user?.avatar || 'JR'}`, level: user?.level || 8, xp: 2340, books: 28, pages: 8950, streak: 14, badge: '🔥 Habit Hero', isCurrentUser: true },
      { rank: 4, name: 'Elena Ramos', username: 'elenar', avatar: 'ER', level: 8, xp: 2210, books: 24, pages: 7600, streak: 12, badge: '🐛 Bookworm' },
      { rank: 5, name: 'Priya Nandan', username: 'priyan', avatar: 'PN', level: 7, xp: 1950, books: 19, pages: 6200, streak: 8, badge: '📜 Explorer' }
    ],
    monthly: [
      { rank: 1, name: 'Marcus Brody', username: 'marcusb', avatar: 'MB', level: 12, xp: 1200, books: 6, pages: 2150, streak: 30, badge: '👑 Monthly Leader' },
      { rank: 2, name: 'Aditi Krishnan', username: 'aditik', avatar: 'AK', level: 10, xp: 950, books: 5, pages: 1800, streak: 26, badge: '🥈 Silver Runner' },
      { rank: 3, name: `${user?.name || 'Jordan Rivera'}`, username: `${user?.username || 'jordanreads'}`, avatar: `${user?.avatar || 'JR'}`, level: 8, xp: 780, books: 4, pages: 1450, streak: 14, badge: '🥉 Bronze Sprinter', isCurrentUser: true }
    ],
    weekly: [
      { rank: 1, name: 'Aditi Krishnan', username: 'aditik', avatar: 'AK', level: 10, xp: 320, books: 2, pages: 620, streak: 7, badge: '⚡ Weekly Pace' },
      { rank: 2, name: `${user?.name || 'Jordan Rivera'}`, username: `${user?.username || 'jordanreads'}`, avatar: `${user?.avatar || 'JR'}`, level: 8, xp: 260, books: 1, pages: 480, streak: 7, badge: '🥈 Steady Reader', isCurrentUser: true },
      { rank: 3, name: 'Marcus Brody', username: 'marcusb', avatar: 'MB', level: 12, xp: 210, books: 1, pages: 390, streak: 7, badge: '🥉 Pacing' }
    ],
    friends: [
      { rank: 1, name: 'Marcus Brody', username: 'marcusb', avatar: 'MB', level: 12, xp: 6420, books: 42, pages: 14200, streak: 64, badge: '👑 Grand Master' },
      { rank: 2, name: `${user?.name || 'Jordan Rivera'}`, username: `${user?.username || 'jordanreads'}`, avatar: `${user?.avatar || 'JR'}`, level: 8, xp: 2340, books: 28, pages: 8950, streak: 14, badge: '🔥 Habit Hero', isCurrentUser: true }
    ]
  };

  const currentList = leaderboardsData[tab] || leaderboardsData.overall;

  return (
    <div>
      <Topbar
        title="Community Leaderboards"
        subtitle="Honor top readers turning pages, finishing challenges, and inspiring book circles."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/achievements" className="btn btn-outline btn-sm">My Achievements 🏆</Link>
        }
      />

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'overall', label: 'Overall All-Time' },
          { id: 'monthly', label: 'This Month' },
          { id: 'weekly', label: 'This Week' },
          { id: 'friends', label: 'Friends & Circle' }
        ].map((t) => (
          <span
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: tab === t.id ? 700 : 500 }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {currentList.length >= 3 && (
        <div className="card panel mb-30 text-center" style={{ padding: '28px' }}>
          <h3 style={{ marginTop: 0 }}>Top 3 Reader Podium</h3>
          <div className="podium-wrap" style={{ marginTop: '20px' }}>
            <div className="podium-step podium-rank-2">
              <div className="podium-avatar" style={{ background: 'var(--green-shelf)' }}>{currentList[1].avatar}</div>
              <div className="podium-name">{currentList[1].name}</div>
              <div className="podium-score">{currentList[1].books} bks · {currentList[1].pages} pgs</div>
              <div className="podium-pillar"><span>#2 🥈</span></div>
            </div>
            <div className="podium-step podium-rank-1">
              <div className="podium-avatar" style={{ background: 'var(--shell-gold-deep)' }}>{currentList[0].avatar}</div>
              <div className="podium-name">{currentList[0].name}</div>
              <div className="podium-score">{currentList[0].books} bks · {currentList[0].pages} pgs</div>
              <div className="podium-pillar"><span>#1 👑</span></div>
            </div>
            <div className="podium-step podium-rank-3">
              <div className="podium-avatar" style={{ background: 'var(--clay)' }}>{currentList[2].avatar}</div>
              <div className="podium-name">{currentList[2].name}</div>
              <div className="podium-score">{currentList[2].books} bks · {currentList[2].pages} pgs</div>
              <div className="podium-pillar"><span>#3 🥉</span></div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD TABLE */}
      <div className="card panel mb-30" style={{ padding: '20px' }}>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line)' }}>
                <th style={{ padding: '12px', width: '70px' }}>Rank</th>
                <th style={{ padding: '12px' }}>Reader</th>
                <th style={{ padding: '12px' }}>Level</th>
                <th style={{ padding: '12px' }}>Total XP</th>
                <th style={{ padding: '12px' }}>Books Read</th>
                <th style={{ padding: '12px' }}>Pages Turned</th>
                <th style={{ padding: '12px' }}>Streak</th>
                <th style={{ padding: '12px' }}>Badge</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((row) => (
                <tr
                  key={row.rank}
                  style={{
                    borderBottom: '1px solid var(--line)',
                    background: row.isCurrentUser ? 'rgba(217, 164, 65, 0.15)' : 'transparent',
                    fontWeight: row.isCurrentUser ? 600 : 'normal'
                  }}
                >
                  <td style={{ padding: '12px' }}><strong>#{row.rank}</strong></td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {row.avatar}
                      </span>
                      <div>
                        <strong>{row.name} {row.isCurrentUser && <span className="badge badge-want" style={{ fontSize: '0.68rem', marginLeft: '4px' }}>You</span>}</strong>
                        <div className="text-soft" style={{ fontSize: '0.78rem' }}>@{row.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}><span className="badge badge-member">Lvl {row.level}</span></td>
                  <td style={{ padding: '12px' }}><strong>{row.xp?.toLocaleString()} XP</strong></td>
                  <td style={{ padding: '12px' }}>{row.books}</td>
                  <td style={{ padding: '12px' }}>{row.pages?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>🔥 {row.streak}d</td>
                  <td style={{ padding: '12px' }}><span className="badge badge-reading">{row.badge}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

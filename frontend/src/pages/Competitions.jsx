import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Competitions() {
  const outletCtx = useOutletContext() || {};
  const [filter, setFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const list = BookClubStore.getCompetitions();

  let filtered = list;
  if (filter === 'active') filtered = list.filter((c) => c.status === 'Active');
  else if (filter === 'upcoming') filtered = list.filter((c) => c.status === 'Upcoming');

  const handleToggleComp = (id) => {
    const isJoined = BookClubStore.toggleJoinCompetition(id);
    showToast(isJoined ? 'You entered the tournament! May the best reader win! 🏁' : 'You withdrew from tournament.');
  };

  return (
    <div>
      <Topbar
        title="Reading Competitions & Races"
        subtitle="Participate in high-energy reading tournaments, race against the clock, and win prestigious prizes."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/leaderboards" className="btn btn-primary btn-sm">Podium Standings 🏅</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* BANNER */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, #16291F, #2A4C3B)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--shell-gold)' }}>Seasonal Championship</span>
            <h1 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '2rem' }}>Official Reading Tournaments</h1>
            <p style={{ color: '#B9C7BC', maxWidth: '580px', margin: 0, lineHeight: 1.5 }}>
              Compete with reading circles worldwide. Track verified reading sprints, write top-rated critiques, and race for podium trophies and bookstore vouchers.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--shell-gold)' }}>$350+</div>
            <div style={{ fontSize: '0.85rem', color: '#B9C7BC' }}>In Active Tournament Prizes</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Tournaments' },
          { id: 'active', label: 'Active Now' },
          { id: 'upcoming', label: 'Upcoming' }
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

      {/* COMPETITIONS GRID */}
      <div className="grid grid-2" style={{ gap: '24px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏁</div>
              <h3>No competitions in this filter</h3>
              <p className="text-soft">Check back soon for the next seasonal race series.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setFilter('all')}>View All</button>
            </div>
          </div>
        ) : (
          filtered.map((cp) => (
            <div key={cp.id} className="card panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div className="flex-between mb-0" style={{ marginBottom: '10px' }}>
                  <span className={`badge ${cp.status === 'Active' ? 'badge-completed' : 'badge-want'}`}>
                    {cp.status}
                  </span>
                  <span className="badge-xp-tag" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    +{cp.xpReward} XP
                  </span>
                </div>

                <h3 style={{ margin: '14px 0 4px 0', fontSize: '1.28rem' }}>
                  <Link to={`/competitions/${cp.id}`}>{cp.title}</Link>
                </h3>
                <p className="text-soft" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  Type: <strong>{cp.type}</strong> · 👥 {cp.participants} competitors
                </p>

                <p style={{ color: 'var(--ink)', fontSize: '0.92rem', marginBottom: '16px', lineHeight: 1.5 }}>
                  {cp.description}
                </p>

                <div className="card" style={{ background: 'var(--cream-deep)', padding: '12px 16px', marginBottom: '16px', borderColor: 'var(--line)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brown-deep)' }}>🏆 Prize:</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--clay)', fontWeight: 600 }}>{cp.prize}</div>
                </div>

                <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                  <span>Dates: {cp.startDate} – {cp.endDate}</span>
                  <strong style={{ color: 'var(--shell-gold-deep)' }}>⏳ {cp.countdownDays} days remaining</strong>
                </div>
              </div>

              <div className="flex gap-8" style={{ borderTop: '1px dashed var(--line)', paddingTop: '14px' }}>
                <button
                  type="button"
                  className={`btn ${cp.joined ? 'btn-outline' : 'btn-primary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => handleToggleComp(cp.id)}
                >
                  {cp.joined ? 'Leave Tournament' : 'Join Competition'}
                </button>
                <Link to={`/competitions/${cp.id}`} className="btn btn-outline btn-sm">Tournament Arena →</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function CompetitionDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const compId = Number(paramId || searchParams.get('id') || 1);
  const outletCtx = useOutletContext() || {};

  const [comp, setComp] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadComp = () => {
    const c = BookClubStore.getCompetitionById(compId) || BookClubStore.getCompetitions()[0];
    setComp(c);
  };

  useEffect(() => {
    loadComp();
  }, [compId]);

  if (!comp) {
    return (
      <div>
        <Topbar title="Tournament Arena" subtitle="Loading competition..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Competition Not Found</h3>
          <Link to="/competitions" className="btn btn-primary btn-sm">Return to Competitions</Link>
        </div>
      </div>
    );
  }

  const handleToggleJoin = () => {
    const isJoined = BookClubStore.toggleJoinCompetition(comp.id);
    loadComp();
    showToast(isJoined ? 'You entered the tournament! 🏁' : 'You withdrew from tournament.');
  };

  const leaderboard = comp.leaderboard || [
    { rank: 1, name: 'Marcus Brody', score: 560, avatar: 'MB', bg: 'var(--shell-gold-deep)' },
    { rank: 2, name: 'Aditi Krishnan', score: 480, avatar: 'AK', bg: 'var(--green-shelf)' },
    { rank: 3, name: 'Jordan Rivera (You)', score: 420, avatar: 'JR', bg: 'var(--clay)' },
    { rank: 4, name: 'Elena Ramos', score: 390, avatar: 'ER', bg: '#B5652F' },
    { rank: 5, name: 'Priya Nandan', score: 340, avatar: 'PN', bg: '#4A7FB5' }
  ];

  return (
    <div>
      <Topbar
        title={comp.title}
        subtitle={`${comp.type} · ${comp.participants} competitors · Prize: ${comp.prize}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/competitions" className="btn btn-outline btn-sm">← Back to All Tournaments</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* TOURNAMENT BANNER */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, #16291F, #33473A)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--shell-gold)' }}>{comp.type}</span>
            <h1 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '2rem' }}>{comp.title}</h1>
            <p style={{ color: '#B9C7BC', maxWidth: '600px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {comp.description}
            </p>
            <div className="flex gap-16" style={{ fontSize: '0.88rem', color: '#E7D9C6' }}>
              <span>{comp.startDate} – {comp.endDate}</span>
              <span>👥 {comp.participants} Competitors</span>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '18px 24px', textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--shell-text-dim)' }}>Countdown to Finish</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--shell-gold)', margin: '4px 0 10px' }}>
              09d : 14h : 22m
            </div>
            <button
              type="button"
              className={`btn btn-sm ${comp.joined ? 'btn-outline' : 'btn-primary'}`}
              style={{ borderColor: '#fff', color: comp.joined ? '#fff' : undefined }}
              onClick={handleToggleJoin}
            >
              {comp.joined ? 'Leave Tournament' : 'Join Competition'}
            </button>
          </div>
        </div>
      </div>

      {/* PODIUM FOR TOP 3 */}
      <div className="card panel mb-30 text-center" style={{ padding: '28px' }}>
        <h3 style={{ marginTop: 0 }}>Tournament Leaders & Podium</h3>
        <p className="text-soft">Real-time standings based on verified pages logged and reflection checks.</p>

        <div className="podium-wrap" style={{ marginTop: '24px' }}>
          <div className="podium-step podium-rank-2">
            <div className="podium-avatar" style={{ background: 'var(--green-shelf)' }}>AK</div>
            <div className="podium-name">Aditi Krishnan</div>
            <div className="podium-score">480 pgs</div>
            <div className="podium-pillar"><span>#2 🥈</span></div>
          </div>
          <div className="podium-step podium-rank-1">
            <div className="podium-avatar" style={{ background: 'var(--shell-gold-deep)' }}>MB</div>
            <div className="podium-name">Marcus Brody</div>
            <div className="podium-score">560 pgs</div>
            <div className="podium-pillar"><span>#1 👑</span></div>
          </div>
          <div className="podium-step podium-rank-3">
            <div className="podium-avatar" style={{ background: 'var(--clay)' }}>JR</div>
            <div className="podium-name">Jordan Rivera</div>
            <div className="podium-score">420 pgs</div>
            <div className="podium-pillar"><span>#3 🥉</span></div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN */}
      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* LEFT: Rules & Prize */}
        <div>
          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 12px 0' }}>Tournament Grand Prize</h3>
            <div className="card" style={{ background: 'var(--cream-deep)', padding: '20px', borderLeft: '4px solid var(--shell-gold)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brown-deep)' }}>{comp.prize}</div>
              <p className="text-soft" style={{ margin: '6px 0 0 0', fontSize: '0.88rem' }}>
                Shipped worldwide to the #1 podium finisher plus permanent profile gold laurel badge.
              </p>
            </div>
          </div>

          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 12px 0' }}>Tournament Rules</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-soft)', lineHeight: 1.8, margin: 0 }}>
              <li>Every 25 pages read earns 10 tournament points.</li>
              <li>Complete 1 book reflection in the discussion forum to unlock 2x multiplier.</li>
              <li>Automated anti-cheat verification inspects reading speed logs.</li>
              <li>Leaderboard finalizes automatically at 11:59 PM on closing day.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: My Progress & Full Leaderboard */}
        <div>
          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 14px 0' }}>My Tournament Performance</h3>
            <div className="grid grid-3" style={{ margin: '16px 0', textAlign: 'center' }}>
              <div className="card" style={{ padding: '12px', background: 'var(--cream-deep)' }}>
                <div className="stat-title" style={{ fontSize: '0.75rem' }}>Pages Logged</div>
                <div className="stat-value tone-gold" style={{ fontSize: '1.4rem' }}>420</div>
              </div>
              <div className="card" style={{ padding: '12px', background: 'var(--cream-deep)' }}>
                <div className="stat-title" style={{ fontSize: '0.75rem' }}>Current Standing</div>
                <div className="stat-value tone-green" style={{ fontSize: '1.4rem' }}>Rank #3</div>
              </div>
              <div className="card" style={{ padding: '12px', background: 'var(--cream-deep)' }}>
                <div className="stat-title" style={{ fontSize: '0.75rem' }}>Behind Leader</div>
                <div className="stat-value" style={{ color: '#C0554A', fontSize: '1.4rem' }}>-140 pgs</div>
              </div>
            </div>
            <Link to="/reading-progress" className="btn btn-outline btn-sm btn-block">
              Log Reading Sprints in Tracker →
            </Link>
          </div>

          <div className="card panel">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Leaderboard Standings</h3>
              <span className="text-soft" style={{ fontSize: '0.8rem' }}>Top 5</span>
            </div>
            <div className="feed-list">
              {leaderboard.map((item) => (
                <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--clay)', minWidth: '24px' }}>#{item.rank}</span>
                    <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: item.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {item.avatar}
                    </span>
                    <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                  </div>
                  <strong style={{ color: 'var(--brown-deep)', fontSize: '0.9rem' }}>{item.score} pgs</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

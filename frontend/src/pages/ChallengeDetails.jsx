import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import CertificateModal from '../components/CertificateModal';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';

export default function ChallengeDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const challengeId = Number(paramId || searchParams.get('id') || 1);
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [activeCert, setActiveCert] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadChallenge = () => {
    const ch = BookClubStore.getChallengeById(challengeId);
    setChallenge(ch);
  };

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  if (!challenge) {
    return (
      <div>
        <Topbar title="Challenge Details" subtitle="Loading reading quest..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Challenge Not Found</h3>
          <p className="text-soft">The reading quest you requested does not exist or has ended.</p>
          <Link to="/challenges" className="btn btn-primary btn-sm">Return to Challenges</Link>
        </div>
      </div>
    );
  }

  const handleToggleJoin = () => {
    BookClubStore.toggleJoinChallenge(challenge.id);
    loadChallenge();
    showToast(challenge.joined ? 'You left the challenge' : 'Enrolled in challenge!');
  };

  const handleLogStep = () => {
    const newProgress = Math.min(challenge.target, challenge.progress + 1);
    BookClubStore.updateChallengeProgress(challenge.id, newProgress);
    loadChallenge();
    showToast(`Logged milestone: ${newProgress} / ${challenge.target} ${challenge.unit}`);
  };

  const handleMarkComplete = () => {
    BookClubStore.completeChallenge(challenge.id);
    loadChallenge();
    showToast('Challenge completed! You can now claim your official CRT Certificate.');
  };

  const handleClaimCertificate = () => {
    const cert = BookClubStore.generateChallengeCertificate(challenge.id, user?.name || 'Jordan Rivera');
    setActiveCert(cert);
  };

  const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  const isCompleted = pct >= 100;
  const existingCert = BookClubStore.getCertificates().find((c) => c.challengeId === challenge.id);

  return (
    <div>
      <Topbar
        title={challenge.title}
        subtitle={`Goal: ${challenge.target} ${challenge.unit} · Reward: +${challenge.rewardXp} XP · Badge: ${challenge.badgeName}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/challenges" className="btn btn-outline btn-sm">← Back to All Challenges</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* HERO PANEL */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, var(--brown-deep), #3E2712)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="flex gap-8 mb-0" style={{ alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)' }}>
                {isCompleted ? 'Completed' : challenge.joined ? 'Active' : 'Open'}
              </span>
              <span className="badge-xp-tag" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                +{challenge.rewardXp} XP
              </span>
            </div>
            <h1 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '2rem' }}>{challenge.title}</h1>
            <p style={{ color: '#DCC9AE', maxWidth: '580px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {challenge.description}
            </p>
            <div className="flex gap-16" style={{ fontSize: '0.88rem', color: '#E7D9C6' }}>
              <span>👥 {challenge.participants || 142} Readers Enrolled</span>
              <span>⏳ {challenge.daysRemaining} Days Remaining</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '20px 30px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '200px' }}>
            <div style={{ fontSize: '3rem' }}>{challenge.badgeIcon}</div>
            <div style={{ fontWeight: 700, color: 'var(--shell-gold)', margin: '6px 0 12px' }}>{challenge.badgeName}</div>
            <div className="flex gap-8" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${challenge.joined ? 'btn-outline' : 'btn-primary'}`}
                style={{ borderColor: '#fff', color: challenge.joined ? '#fff' : undefined }}
                onClick={handleToggleJoin}
              >
                {challenge.joined ? 'Leave Quest' : 'Join Challenge'}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: isCompleted || existingCert ? 'var(--shell-gold)' : 'rgba(217, 164, 65, 0.2)', color: isCompleted || existingCert ? 'var(--brown-deep)' : 'var(--shell-gold)', border: '1px solid var(--shell-gold)', fontWeight: 700 }}
                onClick={handleClaimCertificate}
              >
                {isCompleted || existingCert ? '🎓 View Certificate (Verified)' : '📜 View Certificate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* LEFT: Rules & Timeline */}
        <div>
          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 12px 0' }}>Challenge Rules & Guidelines</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-soft)', lineHeight: 1.8, margin: 0 }}>
              <li>All registered books must be logged through your personal reader library or progress tracker.</li>
              <li>Audiobooks and graphic novels qualify towards total page milestone counts.</li>
              <li>Complete all milestones before the deadline to earn the verified certificate.</li>
              <li>Engage with the weekly community thread to unlock bonus guild achievements.</li>
            </ul>
          </div>

          <div className="card panel">
            <h3 style={{ margin: '0 0 14px 0' }}>Milestone Timeline</h3>
            <div className="feed-list">
              {[
                { title: 'Checkpoint 1: 25% Goal Reached', desc: 'Unlocks Novice Explorer XP badge.', date: 'Oct 8' },
                { title: 'Checkpoint 2: 50% Goal Reached', desc: 'Midway momentum recognition and circle spotlight.', date: 'Oct 15' },
                { title: 'Checkpoint 3: 75% Goal Reached', desc: 'Final sprint milestone.', date: 'Oct 22' },
                { title: 'Goal Complete: 100%!', desc: 'Claim official certificate and permanent trophy.', date: 'Oct 31' }
              ].map((m, idx) => (
                <div key={idx} className="list-row" style={{ padding: '10px 0', borderBottom: idx < 3 ? '1px solid var(--line)' : 'none' }}>
                  <div className="flex-between">
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem' }}>{m.title}</h4>
                      <p className="text-soft" style={{ margin: 0, fontSize: '0.82rem' }}>{m.desc}</p>
                    </div>
                    <span className="text-soft" style={{ fontSize: '0.78rem' }}>{m.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Leaderboard & Progress & Certificate */}
        <div>
          <div className="card panel mb-30">
            <div className="panel-head flex-between" style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Progress & Certificate</h3>
              <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-active'}`}>
                {isCompleted ? 'Goal Complete ✓' : 'In Progress'}
              </span>
            </div>

            <p className="text-soft" style={{ fontSize: '0.88rem', margin: '4px 0 16px' }}>
              Complete your reading target to earn and download your official verified Certificate of Challenge Completion.
            </p>

            <div className="progress-track" style={{ height: '12px', margin: '16px 0 8px' }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: isCompleted ? 'var(--green-shelf)' : 'var(--shell-gold)' }}></div>
            </div>

            <div className="flex-between" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: '16px' }}>
              <span>{challenge.progress} / {challenge.target} {challenge.unit}</span>
              <strong style={{ color: 'var(--brown-deep)' }}>{pct}%</strong>
            </div>

            {/* Quick log & mark complete buttons */}
            <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap', marginBottom: '16px' }}>
              <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleLogStep}>
                +1 Step / Log
              </button>
              <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleMarkComplete}>
                Mark Complete ✓
              </button>
            </div>

            {/* Action Buttons */}
            <div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={!isCompleted}
                onClick={handleClaimCertificate}
              >
                🎓 {existingCert ? 'View My Verified Certificate' : 'Generate Certificate'}
              </button>
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <Link to="/reading-progress" className="text-soft" style={{ fontSize: '0.82rem' }}>
                Open Reading Tracker →
              </Link>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Standings & Leaderboard</h3>
              <Link to="/leaderboards" style={{ fontSize: '0.82rem', color: 'var(--clay)' }}>All Standings →</Link>
            </div>
            <div className="feed-list">
              {[
                { rank: 1, name: 'Marcus Brody', score: `${challenge.target} ${challenge.unit}`, badge: '👑' },
                { rank: 2, name: `${user?.name || 'Jordan Rivera'} (You)`, score: `${challenge.progress} ${challenge.unit}`, badge: '🥈' },
                { rank: 3, name: 'Aditi Krishnan', score: `${Math.max(1, challenge.target - 1)} ${challenge.unit}`, badge: '🥉' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < 2 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--clay)', minWidth: '24px' }}>#{item.rank}</span>
                    <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginRight: '6px' }}>{item.score}</span>
                    <span>{item.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeCert && (
        <CertificateModal cert={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
}

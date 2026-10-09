import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import CertificateModal from '../components/CertificateModal';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';

export default function Challenges() {
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [activeCert, setActiveCert] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const [allChallenges, setAllChallenges] = useState(() => BookClubStore.getChallenges());
  const [certs, setCerts] = useState(() => BookClubStore.getCertificates());

  const handleToggleJoin = (challengeId) => {
    BookClubStore.toggleJoinChallenge(challengeId);
    setAllChallenges([...BookClubStore.getChallenges()]);
    showToast('Challenge enrollment status updated!');
  };

  const handleCertificateClick = (challenge) => {
    let currentCerts = BookClubStore.getCertificates();
    let cert = currentCerts.find((crt) => crt.challengeId === challenge.id);
    if (!cert) {
      cert = BookClubStore.generateChallengeCertificate(challenge.id, user?.name || 'Jordan Rivera');
      currentCerts = BookClubStore.getCertificates();
      setCerts([...currentCerts]);
      showToast('Certificate generated successfully! 🎓');
    }
    setActiveCert(cert);
  };

  const handleQuickComplete = (challenge) => {
    BookClubStore.completeChallenge(challenge.id);
    const updatedChallenges = BookClubStore.getChallenges();
    setAllChallenges([...updatedChallenges]);
    let cert = BookClubStore.generateChallengeCertificate(challenge.id, user?.name || 'Jordan Rivera');
    setCerts([...BookClubStore.getCertificates()]);
    setActiveCert(cert);
    showToast('Challenge completed! Credential awarded! 🎓');
  };

  let filtered = allChallenges;
  if (filter === 'joined') {
    filtered = allChallenges.filter((c) => c.joined);
  } else if (filter === 'completed') {
    filtered = allChallenges.filter((c) => c.progress >= c.target || certs.some((crt) => crt.challengeId === c.id));
  } else if (filter === 'available') {
    filtered = allChallenges.filter((c) => !c.joined);
  }

  return (
    <div>
      <Topbar
        title="Reading Challenges"
        subtitle="Join community reading quests, earn reward XP, and collect official completion certificates."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <div className="flex gap-8">
            {certs.length > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveCert(certs[0])}
              >
                🎓 View Active Certificate ({certs.length})
              </button>
            )}
            <Link to="/competitions" className="btn btn-outline btn-sm">Reading Competitions 🏁</Link>
          </div>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* TOP CERTIFICATE SHOWCASE BANNER */}
      <div
        className="card panel"
        style={{
          marginBottom: '22px',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(217, 164, 65, 0.12), rgba(30, 58, 46, 0.08))',
          border: '1.5px solid var(--shell-gold)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '2.4rem' }}>🎓</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Official Reading Guild Certificates Portal</h3>
            <p className="text-soft" style={{ margin: '3px 0 0', fontSize: '0.85rem' }}>
              Complete milestones to earn authenticated, printable certificates with tamper-proof IDs & verification codes.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {certs.length > 0 ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveCert(certs[0])}
              style={{ fontWeight: 700 }}
            >
              👁️ View Earned Certificate ({certs.length})
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                const c1 = allChallenges[0];
                if (c1) handleQuickComplete(c1);
              }}
              style={{ fontWeight: 700 }}
            >
              🎓 Claim Sample Certificate Now
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const c = allChallenges[0];
              if (c) handleCertificateClick(c);
            }}
          >
            📜 Certificate Preview
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'joined', label: 'My Joined Challenges' },
          { id: 'completed', label: `Completed & Certificates 🏆 (${certs.length})` },
          { id: 'available', label: 'Available to Join' }
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

      {/* CHALLENGES GRID */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
              <h3>No challenges in this view</h3>
              <p className="text-soft">Explore all community challenges and start a reading quest today.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setFilter('all')}>Show All</button>
            </div>
          </div>
        ) : (
          filtered.map((c) => {
            const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
            const isCompleted = pct >= 100 || certs.some((crt) => crt.challengeId === c.id);
            const cert = certs.find((crt) => crt.challengeId === c.id);

            return (
              <div
                key={c.id}
                className="card panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  border: isCompleted ? '1.5px solid var(--shell-gold)' : '1px solid var(--line)',
                  boxShadow: isCompleted ? '0 4px 14px rgba(217, 164, 65, 0.15)' : 'none'
                }}
              >
                <div>
                  <div className="flex-between mb-0" style={{ marginBottom: '10px' }}>
                    {isCompleted ? (
                      <span className="badge badge-completed" style={{ background: '#D8F3DC', color: '#1B4332', fontWeight: 700 }}>
                        Completed ✓ (Certificate Ready)
                      </span>
                    ) : (
                      <span className={`badge ${c.joined ? 'badge-active' : 'badge-want'}`}>
                        {c.joined ? 'Joined' : 'Open'}
                      </span>
                    )}
                    <span className="badge-xp-tag" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      +{c.rewardXp} XP
                    </span>
                  </div>

                  <div style={{ fontSize: '2.2rem', margin: '12px 0 6px' }}>{c.badgeIcon}</div>
                  <h3 style={{ margin: '0 0 4px 0' }}>
                    <Link to={`/challenges/${c.id}`}>{c.title}</Link>
                  </h3>
                  <p className="text-soft" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
                    Badge: <strong>{c.badgeName}</strong>
                  </p>

                  <p style={{ fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '18px', lineHeight: 1.4 }}>
                    {c.description}
                  </p>

                  <div className="progress-track" style={{ height: '8px', marginBottom: '6px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: isCompleted ? 'var(--green-shelf)' : 'var(--shell-gold)' }}></div>
                  </div>

                  <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginBottom: '18px' }}>
                    <span>{c.progress} / {c.target} {c.unit} ({pct}%)</span>
                    <span>⏳ {c.daysRemaining} days left</span>
                  </div>
                </div>

                <div className="flex gap-8" style={{ borderTop: '1px dashed var(--line)', paddingTop: '14px', flexWrap: 'wrap' }}>
                  {isCompleted ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontWeight: 700 }}
                      onClick={() => handleCertificateClick(c)}
                    >
                      👁️ View Certificate
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`btn ${c.joined ? 'btn-outline' : 'btn-primary'} btn-sm`}
                        style={{ flex: 1 }}
                        onClick={() => handleToggleJoin(c.id)}
                      >
                        {c.joined ? 'Leave' : 'Join'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                        title="View completion certificate credential for this quest"
                        onClick={() => handleCertificateClick(c)}
                      >
                        📜 Certificate
                      </button>
                    </>
                  )}
                  <Link to={`/challenges/${c.id}`} className="btn btn-outline btn-sm">Details →</Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeCert && (
        <CertificateModal cert={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
}

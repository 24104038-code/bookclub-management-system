import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function ReadingGoals() {
  const outletCtx = useOutletContext() || {};
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('Annual Challenge');
  const [goalTarget, setGoalTarget] = useState(12);
  const [goalUnit, setGoalUnit] = useState('books');
  const [goalDeadline, setGoalDeadline] = useState('Dec 31, 2026');
  const [toastMsg, setToastMsg] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadGoals = () => {
    setGoals(BookClubStore.getGoals());
  };

  useEffect(() => {
    loadGoals();
    const handleQuestUpdate = () => setRefreshTick((t) => t + 1);
    window.addEventListener('bookclub_quest_claimed', handleQuestUpdate);
    return () => window.removeEventListener('bookclub_quest_claimed', handleQuestUpdate);
  }, []);

  const quests = BookClubStore.getUserQuests ? BookClubStore.getUserQuests() : [];
  const stats = BookClubStore.getUserStats();

  const handleClaimQuest = (bookId) => {
    const res = BookClubStore.claimQuestAndUnlockBook(bookId);
    if (res && res.success) {
      showToast(`🎉 UNLOCKED! "${res.book.title}" is now open! +${res.rewardXP} XP Earned!`);
      setRefreshTick((t) => t + 1);
      window.dispatchEvent(new CustomEvent('bookclub_quest_claimed', { detail: res }));
    }
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    BookClubStore.addGoal({
      title: goalTitle,
      type: goalType,
      target: Number(goalTarget) || 10,
      current: 0,
      unit: goalUnit,
      deadline: goalDeadline,
      percentage: 0,
      daysRemaining: 120,
      color: 'var(--clay)'
    });
    setShowGoalModal(false);
    setGoalTitle('');
    loadGoals();
    showToast('Goal created successfully!');
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to remove this reading goal?')) {
      BookClubStore.deleteGoal(goalId);
      loadGoals();
      showToast('Goal removed');
    }
  };

  return (
    <div>
      <Topbar
        title="Reading Goals"
        subtitle="Set ambitious reading targets, build steady habits, and watch your achievements grow."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowGoalModal(true)}>
            + Create Goal
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* HERO HEADER BANNER */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, var(--brown-deep), #3E2712)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--shell-gold)' }}>Annual Reading Target</span>
            <h1 style={{ color: '#fff', margin: '6px 0' }}>50 Books in 2026</h1>
            <p style={{ color: '#DCC9AE', margin: 0, maxWidth: '500px' }}>
              You've finished 28 books so far (56%). You are 2 books ahead of your annual schedule!
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowGoalModal(true)}
            style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)' }}
          >
            + Set New Reading Goal
          </button>
        </div>
      </div>

      {/* ACTIVE GOALS GRID */}
      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Active Goals</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>Manage your monthly milestones, genre quests, and daily page habits.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '40px' }}>
        {goals.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎯</div>
              <h3>No active reading goals</h3>
              <p className="text-soft">Set a book target for the month or year to keep your reading momentum alive.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowGoalModal(true)}>Create First Goal</button>
            </div>
          </div>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="card panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex-between mb-0" style={{ marginBottom: '8px' }}>
                  <span className="badge badge-want">{g.type}</span>
                  <span className="text-soft" style={{ fontSize: '0.8rem' }}>⏳ {g.daysRemaining} days left</span>
                </div>
                <h3 style={{ margin: '8px 0 6px' }}>{g.title}</h3>
                <p className="text-soft" style={{ fontSize: '0.88rem', marginBottom: '16px' }}>Deadline: {g.deadline}</p>

                <div className="progress-track" style={{ height: '10px', marginBottom: '8px' }}>
                  <div className="progress-fill" style={{ width: `${g.percentage}%;`, background: g.color || 'var(--clay)' }}></div>
                </div>

                <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '18px' }}>
                  <span>Current: <strong>{g.current}</strong> / {g.target} {g.unit}</span>
                  <strong style={{ color: 'var(--brown-deep)' }}>{g.percentage}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => handleDeleteGoal(g.id)}
                  style={{ color: '#C0554A' }}
                >
                  Delete Goal 🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QUEST MILESTONES & LOCKED BOOK REWARD VAULT */}
      <div className="beginner-rewards-vault" style={{ marginBottom: '40px' }}>
        <div className="vault-header">
          <div className="vault-title-wrap">
            <h3>🎁 Goal Milestones &amp; Locked Book Vault (Progressive XP)</h3>
            <p>
              Complete your reading goals and platform challenges to unlock prestigious reward books with increasing XP: <strong>100 → 150 → 250 → 350 → 500 → 750 XP</strong>!
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
                    <span>Goal Progress: {q.current} / {q.target}</span>
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

      {/* COMPLETED GOALS & ACHIEVEMENTS */}
      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Completed Goals & History</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>Celebrating the milestones you've conquered this season.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '40px' }}>
        <div className="card panel">
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span className="badge badge-completed">Completed 100%</span>
            <span className="text-soft" style={{ fontSize: '0.78rem' }}>April 30, 2026</span>
          </div>
          <h3 style={{ margin: '10px 0 4px' }}>Spring Reading Sprint 2026</h3>
          <p className="text-soft" style={{ marginBottom: '12px' }}>Target: 8 books in 30 days · Final score: 8/8 books</p>
          <div className="badge badge-reading">🌸 Spring Bloom Master Badge Awarded</div>
        </div>

        <div className="card panel">
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span className="badge badge-completed">Completed 100%</span>
            <span className="text-soft" style={{ fontSize: '0.78rem' }}>June 15, 2026</span>
          </div>
          <h3 style={{ margin: '10px 0 4px' }}>Non-Fiction Broadening Quest</h3>
          <p className="text-soft" style={{ marginBottom: '12px' }}>Target: 5 books outside fiction · Final score: 5/5 books</p>
          <div className="badge badge-reading">🧠 Truth Seeker Badge Awarded</div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay show" onClick={() => setShowGoalModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Set Reading Goal</h3>
              <button className="modal-close" onClick={() => setShowGoalModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateGoal} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="goalTitleInput">Goal Title</label>
                <input
                  type="text"
                  id="goalTitleInput"
                  placeholder="e.g. Read 15 Classics this Autumn"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="goalTypeSelect">Goal Type</label>
                  <select id="goalTypeSelect" value={goalType} onChange={(e) => setGoalType(e.target.value)}>
                    <option value="Annual Challenge">Annual Challenge</option>
                    <option value="Monthly Sprint">Monthly Sprint</option>
                    <option value="Genre Broadening">Genre Broadening</option>
                    <option value="Daily Habit">Daily Habit</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="goalTargetInput">Target Quantity</label>
                  <input
                    type="number"
                    id="goalTargetInput"
                    min="1"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="goalUnitSelect">Unit</label>
                  <select id="goalUnitSelect" value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)}>
                    <option value="books">Books</option>
                    <option value="pages">Pages</option>
                    <option value="hours">Hours</option>
                    <option value="chapters">Chapters</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="goalDeadlineInput">Target Date</label>
                  <input
                    type="text"
                    id="goalDeadlineInput"
                    placeholder="e.g. Dec 31, 2026"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowGoalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Set Goal 🎯</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

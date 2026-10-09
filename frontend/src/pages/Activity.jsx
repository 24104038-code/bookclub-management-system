import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Activity() {
  const outletCtx = useOutletContext() || {};
  const [filter, setFilter] = useState('all');

  const activities = BookClubStore.getActivities();

  return (
    <div>
      <Topbar
        title="Social Activity Stream"
        subtitle="Follow what fellow readers are finishing, reviewing, and discussing right now."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/discussions" className="btn btn-primary btn-sm">+ Share Thought</Link>
        }
      />

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        <span
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: filter === 'all' ? 700 : 500 }}
        >
          Global Community Feed
        </span>
        <span
          className={`tab ${filter === 'circle' ? 'active' : ''}`}
          onClick={() => setFilter('circle')}
          style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: filter === 'circle' ? 700 : 500 }}
        >
          My Circles & Friends
        </span>
      </div>

      <div className="card panel mb-30" style={{ maxWidth: '800px', padding: '24px' }}>
        <div className="panel-head flex-between" style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Live Reading Stream</h2>
          <span className="badge badge-active">Live Updates</span>
        </div>

        <div className="feed-list">
          {activities.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚡</div>
              <h3>No recent activity</h3>
              <p className="text-soft">Start reading or join a circle to trigger social events.</p>
              <Link to="/books" className="btn btn-primary btn-sm">Explore Books</Link>
            </div>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="feed-row" style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                <div
                  className="feed-ico"
                  style={{
                    background: a.avatarBg || 'var(--clay)',
                    width: '44px',
                    height: '44px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {a.avatar || 'JR'}
                </div>
                <div className="feed-body" style={{ flex: 1, minWidth: 0 }}>
                  <div className="feed-title" style={{ fontSize: '0.95rem' }}>
                    <strong>{a.user}</strong>{' '}
                    <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal' }}>
                      {a.action?.replace('_', ' ')}
                    </span>{' '}
                    <span style={{ color: 'var(--clay)', fontWeight: 700 }}>
                      {a.targetTitle}
                    </span>
                  </div>
                  <div className="feed-time" style={{ fontSize: '0.82rem', margin: '4px 0 0 0', color: 'var(--ink-soft)' }}>
                    {a.time} · {a.details || ''}
                  </div>
                </div>
                <div>
                  <Link to="/books" className="btn btn-outline btn-sm">View →</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

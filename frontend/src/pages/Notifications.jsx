import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookClubStore from '../services/store';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadNotifications = () => {
    const list = BookClubStore.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    BookClubStore.markAllNotificationsRead();
    showToast('All notifications marked as read! ✓');
    loadNotifications();
  };

  const handleMarkSingleRead = (id) => {
    BookClubStore.markNotificationRead(id);
    loadNotifications();
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--brown-deep, #3D2314)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Notifications</h1>
          <p className="text-soft" style={{ margin: '4px 0 0' }}>
            Stay current with your reading circle updates.
          </p>
        </div>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <Link to="/activity" className="btn btn-outline btn-sm">Community Activity ⚡</Link>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs" id="notifTabs">
        <span 
          className={`tab ${filter === 'all' ? 'active' : ''}`} 
          onClick={() => setFilter('all')}
          style={{ cursor: 'pointer' }}
        >
          All Notifications
        </span>
        <span 
          className={`tab ${filter === 'unread' ? 'active' : ''}`} 
          onClick={() => setFilter('unread')}
          style={{ cursor: 'pointer' }}
        >
          Unread Only
        </span>
      </div>

      <div className="flex-between mb-30">
        <div>
          <h2 style={{ margin: 0 }}>Notification Center</h2>
          <p className="text-soft" style={{ margin: '4px 0 0 0' }}>
            Stay up to date on circle discussions, challenge milestones, and event reminders.
          </p>
        </div>
        <button 
          type="button" 
          className="btn btn-outline btn-sm" 
          onClick={handleMarkAllRead}
        >
          ✓ Mark All as Read
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="grid" style={{ gap: '14px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔔</div>
            <h3 style={{ margin: '0 0 8px 0' }}>You are all caught up!</h3>
            <p className="text-soft" style={{ margin: '0 0 20px 0' }}>No new notifications right now.</p>
            <Link to="/discussions" className="btn btn-primary btn-sm">Explore Discussions</Link>
          </div>
        ) : (
          filtered.map(n => (
            <div 
              key={n.id} 
              className={`notif-card ${n.isRead ? '' : 'unread'}`}
            >
              <div className="notif-icon">{n.icon || '🔔'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex-between" style={{ marginBottom: 2 }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--brown-deep)' }}>{n.title}</strong>
                  <span className="text-soft" style={{ fontSize: '0.75rem' }}>{n.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{n.message}</p>
              </div>
              <div className="flex gap-8">
                {n.link && (
                  <Link 
                    to={n.link.replace('.html', '')} 
                    className="btn btn-outline btn-sm" 
                    onClick={() => handleMarkSingleRead(n.id)}
                  >
                    View
                  </Link>
                )}
                {!n.isRead && (
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => handleMarkSingleRead(n.id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

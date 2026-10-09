import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/dashboard', i18nKey: 'nav.dashboard' },
  { id: 'books', label: 'Books', icon: '📖', href: '/books', i18nKey: 'nav.books' },
  { id: 'library', label: 'My Library', icon: '📚', href: '/library', i18nKey: 'nav.library' },
  { id: 'reading-progress', label: 'Reading Progress', icon: '📈', href: '/reading-progress', i18nKey: 'nav.readingProgress' },
  { id: 'reading-goals', label: 'Reading Goals', icon: '🎯', href: '/reading-goals', i18nKey: 'nav.readingGoals' },
  { id: 'groups', label: 'Reading Groups', icon: '👥', href: '/groups', i18nKey: 'nav.groups' },
  { id: 'discussions', label: 'Discussions', icon: '💬', href: '/discussions', i18nKey: 'nav.discussions' },
  { id: 'events', label: 'Events', icon: '📅', href: '/events', i18nKey: 'nav.events' },
  { id: 'competitions', label: 'Competitions', icon: '🏁', href: '/competitions', i18nKey: 'nav.competitions' },
  { id: 'challenges', label: 'Challenges', icon: '🏆', href: '/challenges', i18nKey: 'nav.challenges' },
  { id: 'leaderboards', label: 'Leaderboards', icon: '🏅', href: '/leaderboards', i18nKey: 'nav.leaderboards' },
  { id: 'reviews', label: 'Reviews', icon: '⭐', href: '/reviews', i18nKey: 'nav.reviews' },
  { id: 'recommendations', label: 'Recommendations', icon: '✨', href: '/recommendations', i18nKey: 'nav.recommendations' },
  { id: 'notes', label: 'Notes', icon: '📝', href: '/notes', i18nKey: 'nav.notes' },
  { id: 'highlights', label: 'Highlights & Quotes', icon: '💡', href: '/highlights', i18nKey: 'nav.highlights' },
  { id: 'journal', label: 'Reading Journal', icon: '📓', href: '/journal', i18nKey: 'nav.journal' },
  { id: 'calendar', label: 'Calendar', icon: '📆', href: '/calendar', i18nKey: 'nav.calendar' },
  { id: 'activity', label: 'Activity Feed', icon: '⚡', href: '/activity', i18nKey: 'nav.activity' },
  { id: 'messages', label: 'Messages & Chat', icon: '💬', href: '/messages', i18nKey: 'nav.messages' },
  { id: 'notifications', label: 'Notifications', icon: '🔔', href: '/notifications', badge: true, i18nKey: 'nav.notifications' },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', i18nKey: 'nav.settings' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/profile', i18nKey: 'nav.profile' }
];

const MANAGEMENT_ITEMS = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '🛠️', href: '/admin-dashboard', role: 'admin', i18nKey: 'nav.adminDashboard' },
  { id: 'organizer-dashboard', label: 'Organizer Console', icon: '📋', href: '/organizer-dashboard', role: ['admin', 'organizer'], i18nKey: 'nav.organizerConsole' },
  { id: 'reports', label: 'Moderation Reports', icon: '🛡️', href: '/reports', role: 'admin', i18nKey: 'nav.reports' }
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, quickLogin } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!user) return null;

  const handleRoleSwitch = (role) => {
    quickLogin(role);
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'organizer') navigate('/organizer-dashboard');
    else navigate('/dashboard');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const visibleManagementItems = MANAGEMENT_ITEMS.filter(item => {
    if (Array.isArray(item.role)) return item.role.includes(user.role);
    return item.role === user.role;
  });

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand">
            <span className="mark">📖</span>
            <span className="brand-text">
              <span className="brand-book">BOOK</span> <span className="brand-forge">FORGE</span>
            </span>
          </Link>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">&times;</button>
        </div>

        <div className="sidebar-role-badge">
          <span className={`role-indicator role-${user.role}`}>{(user.role || 'user').toUpperCase()}</span>
          <Link to="/" className="public-home-link" title="Go to Public Landing Page">
            {t('nav.publicSite', '🏠 Public Site')}
          </Link>
        </div>

        <ul className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <NavLink
                to={item.href}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={onClose}
              >
                <span className="nav-ico">{item.icon}</span>
                <span className="nav-label">{t(item.i18nKey, item.label)}</span>
                {item.badge && <span className="nav-badge-pill">3</span>}
              </NavLink>
            </li>
          ))}

          {visibleManagementItems.length > 0 && (
            <>
              <li className="nav-group-title">{t('nav.management', 'Management')}</li>
              {visibleManagementItems.map(item => (
                <li key={item.id}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={onClose}
                  >
                    <span className="nav-ico">{item.icon}</span>
                    <span className="nav-label">{t(item.i18nKey, item.label)}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>



        {/* User Footer */}
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user-link" onClick={onClose}>
            <span className="avatar-chip-sm" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.avatar || 'JR'
              )}
            </span>
            <div className="who">
              <div className="name">{user.name}</div>
              <div className="role">@{user.username}</div>
            </div>
          </Link>
          <button type="button" className="logout-ico" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            ↩
          </button>
        </div>
      </aside>

      {isOpen && (
        <div className="sidebar-backdrop show" id="sidebarBackdrop" onClick={onClose} />
      )}
    </>
  );
}

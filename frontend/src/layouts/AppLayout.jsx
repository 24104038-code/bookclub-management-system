import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AIAssistant from '../components/AIAssistant';
import WhatsAppLiveNotificationToast from '../components/WhatsAppLiveNotificationToast';
import { useAuth } from '../context/AuthContext';
import BookClubAPI from '../services/api';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await BookClubAPI.search.query(q);
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
          <h3>Loading BOOK FORGE...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isMessagesPage = location.pathname === '/messages';

  return (
    <div className="app-shell">
      <a href="#mainContent" className="skip-link">Skip to main content</a>

      {/* SIDEBAR */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* MAIN CONTENT OUTLET */}
      <main className="main-content" id="mainContent">
        <Outlet context={{ onMobileMenuToggle: () => setMobileMenuOpen(!mobileMenuOpen), onOpenSearch: () => setSearchModalOpen(true) }} />
      </main>

      {/* Floating Chat & WhatsApp dock */}
      {!isMessagesPage && (
        <div className="floating-comm-dock" id="floatingCommDock">
          <Link to="/messages" className="floating-comm-btn" title="Open Messages, Chat & WhatsApp Hub">
            <span className="floating-comm-ico">💬</span>
            <span className="floating-comm-label">Chat & WhatsApp</span>
          </Link>
        </div>
      )}

      {/* Forge AI Assistant widget */}
      <AIAssistant />

      {/* Floating Amazon-style WhatsApp notification toast */}
      <WhatsAppLiveNotificationToast />

      {/* Global Search Modal (Ctrl + K) */}
      {searchModalOpen && (
        <div className="modal-overlay show" onClick={() => setSearchModalOpen(false)} style={{ zIndex: 10001 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div className="modal-head">
              <h3 style={{ margin: 0 }}>Search BOOK FORGE</h3>
              <button className="modal-close" onClick={() => setSearchModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '16px' }}>
              <input
                type="text"
                autoFocus
                placeholder="Search books, authors, genres, reading groups, events..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', borderRadius: '8px', border: '1.5px solid var(--line)' }}
              />
              <div style={{ marginTop: '16px', maxHeight: '350px', overflowY: 'auto' }}>
                {searchResults && (
                  <div>
                    {searchResults.books && searchResults.books.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--clay)' }}>BOOKS</h4>
                        {searchResults.books.map(b => (
                          <div
                            key={b.id || b._id}
                            style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                            onClick={() => {
                              setSearchModalOpen(false);
                              navigate(`/books/${b.id || b._id}`);
                            }}
                          >
                            <strong>{b.title}</strong>
                            <span className="text-soft">by {b.author}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.groups && searchResults.groups.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--clay)' }}>GROUPS</h4>
                        {searchResults.groups.map(g => (
                          <div
                            key={g.id || g._id}
                            style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                            onClick={() => {
                              setSearchModalOpen(false);
                              navigate(`/groups/${g.id || g._id}`);
                            }}
                          >
                            <strong>{g.name}</strong> · <span className="text-soft">{g.category}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!searchResults && searchQuery && (
                  <p className="text-soft" style={{ textAlign: 'center', padding: '20px 0' }}>No matching items found for "{searchQuery}".</p>
                )}
                {!searchQuery && (
                  <p className="text-soft" style={{ textAlign: 'center', padding: '20px 0' }}>Type any keywords to search catalog, circles, and discussions.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

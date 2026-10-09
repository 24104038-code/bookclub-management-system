import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function AdminDashboard() {
  const outletCtx = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('Fiction');
  const [newBookPages, setNewBookPages] = useState(300);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = () => {
    setBooksList(BookClubStore.getBooks());
    setGroupsList(BookClubStore.getGroups());
    setEventsList(BookClubStore.getEvents());
    setReportsList(BookClubStore.getReports());

    // Mock users or from store
    const storedUsers = [
      { id: 1, name: 'Elena Ramos', email: 'elena@bookforge.internal', role: 'admin', genre: 'Fiction', status: 'Active' },
      { id: 2, name: 'Marcus Brody', email: 'marcus@bookforge.internal', role: 'organizer', genre: 'Mystery', status: 'Active' },
      { id: 3, name: 'Jordan Rivera', email: 'jordan@bookforge.internal', role: 'user', genre: 'Fantasy', status: 'Active' },
      { id: 4, name: 'Aditi Krishnan', email: 'aditi@bookforge.internal', role: 'organizer', genre: 'Mystery', status: 'Active' },
      { id: 5, name: 'Wren Achebe', email: 'wren@bookforge.internal', role: 'user', genre: 'Fantasy', status: 'Active' }
    ];
    setUsersList(storedUsers);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newUser = {
      id: usersList.length + 1,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      genre: 'General',
      status: 'Active'
    };
    setUsersList([...usersList, newUser]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Added user ${newUserName} as ${newUserRole}`);
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;
    const newBook = {
      id: booksList.length + 1,
      title: newBookTitle,
      author: newBookAuthor,
      genre: newBookGenre,
      totalPages: Number(newBookPages) || 300,
      rating: 4.5,
      coverImage: 'images/books/default-cover.jpg',
      publicationYear: 2026
    };
    const updated = [newBook, ...booksList];
    setBooksList(updated);
    localStorage.setItem('bookclub_books_data', JSON.stringify(updated));
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    showToast(`Book "${newBookTitle}" added to catalog!`);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Delete this user?')) {
      setUsersList(usersList.filter((u) => u.id !== id));
      showToast('User removed');
    }
  };

  const handleDeleteBook = (id) => {
    if (window.confirm('Remove this book from catalog?')) {
      const updated = booksList.filter((b) => b.id !== id);
      setBooksList(updated);
      localStorage.setItem('bookclub_books_data', JSON.stringify(updated));
      showToast('Book removed from catalog');
    }
  };

  return (
    <div>
      <Topbar
        title="Admin Command Console"
        subtitle="Platform governance, members, books catalog, and system oversight."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/reports" className="btn btn-outline btn-sm">Moderation Reports 🛡️</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* KPI STATS CARDS */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value tone-gold">{usersList.length * 250}</div>
          <div className="stat-delta up">↑ 48 this month</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Catalog Books</div>
          <div className="stat-value tone-green">{booksList.length}</div>
          <div className="stat-delta">Across 6 genres</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Active Circles</div>
          <div className="stat-value tone-blue">{groupsList.length}</div>
          <div className="stat-delta">4 new forming</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Open Reports</div>
          <div className="stat-value" style={{ color: '#C0554A' }}>{reportsList.filter((r) => r.status === 'Pending').length}</div>
          <div className="stat-delta">Requires attention</div>
        </div>
      </div>

      {/* ADMIN SECTION TABS */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '2px solid var(--line)', marginBottom: '24px', paddingBottom: '4px' }}>
        {[
          { id: 'users', label: 'Users Management' },
          { id: 'books', label: 'Books Catalog' },
          { id: 'groups', label: 'Reading Circles' },
          { id: 'events', label: 'Events & Salons' },
          { id: 'reports', label: 'Moderation Queue' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === tab.id ? 'var(--brown-deep)' : 'var(--paper)',
              color: activeTab === tab.id ? '#fff' : 'var(--ink-soft)',
              border: '1px solid var(--line)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="card panel">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Platform Registered Users</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}>+ Add New User</button>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Genre</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>#{u.id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'organizer' ? 'badge-completed' : 'badge-member'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{u.genre}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-completed">{u.status}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button type="button" className="btn btn-ghost btn-xs" style={{ color: '#C0554A' }} onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKS */}
      {activeTab === 'books' && (
        <div className="card panel">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Catalog Management</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddBookModal(true)}>+ Add Book to Catalog</button>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Cover</th>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Author</th>
                  <th style={{ padding: '10px' }}>Genre</th>
                  <th style={{ padding: '10px' }}>Pages</th>
                  <th style={{ padding: '10px' }}>Rating</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {booksList.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px' }}>
                      <img
                        src={getBookCoverUrl(b)}
                        alt={b.title}
                        style={{ width: '36px', height: '54px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '4px', display: 'block', background: 'var(--cream-deep)' }}
                        onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                      />
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/books/${b.id}`}>{b.title}</Link>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{b.author}</td>
                    <td style={{ padding: '10px' }}>{b.genre}</td>
                    <td style={{ padding: '10px' }}>{b.totalPages}</td>
                    <td style={{ padding: '10px', color: 'var(--gold)' }}>★ {b.rating}</td>
                    <td style={{ padding: '10px' }}>
                      <button type="button" className="btn btn-ghost btn-xs" style={{ color: '#C0554A' }} onClick={() => handleDeleteBook(b.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GROUPS */}
      {activeTab === 'groups' && (
        <div className="card panel">
          <h3 style={{ margin: '0 0 20px 0' }}>Reading Circles Overview</h3>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Group Name</th>
                  <th style={{ padding: '10px' }}>Genre</th>
                  <th style={{ padding: '10px' }}>Lead Organizer</th>
                  <th style={{ padding: '10px' }}>Members</th>
                  <th style={{ padding: '10px' }}>Schedule</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupsList.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/groups/${g.id}`}>{g.name}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>{g.genre}</td>
                    <td style={{ padding: '10px' }}>{g.organizer || 'Lead'}</td>
                    <td style={{ padding: '10px' }}>{g.membersCount || g.members?.length || 0}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{g.schedule}</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/groups/${g.id}`} className="btn btn-outline btn-xs">View Portal</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EVENTS */}
      {activeTab === 'events' && (
        <div className="card panel">
          <h3 style={{ margin: '0 0 20px 0' }}>Scheduled Events & Gatherings</h3>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Event</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Date & Time</th>
                  <th style={{ padding: '10px' }}>Location</th>
                  <th style={{ padding: '10px' }}>Attendees</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsList.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/events/${e.id}`}>{e.title}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>{e.type}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{e.month} {e.day} · {e.time}</td>
                    <td style={{ padding: '10px' }}>{e.location}</td>
                    <td style={{ padding: '10px' }}>{e.participants}</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/events/${e.id}`} className="btn btn-outline btn-xs">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeTab === 'reports' && (
        <div className="card panel">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Moderation Queue</h3>
            <Link to="/reports" className="btn btn-primary btn-sm">Open Full Moderation Hub →</Link>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Target Title</th>
                  <th style={{ padding: '10px' }}>Reason</th>
                  <th style={{ padding: '10px' }}>Reporter</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{r.targetTitle}</td>
                    <td style={{ padding: '10px', color: 'var(--clay)' }}>{r.reason}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{r.reporter}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${r.status === 'Resolved' ? 'badge-completed' : r.status === 'Pending' ? 'badge-active' : 'badge-member'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Link to="/reports" className="btn btn-outline btn-xs">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay show" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Add New User</h3>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '20px' }}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                  <option value="user">User (Reader)</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="modal-overlay show" onClick={() => setShowAddBookModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Add Book to Catalog</h3>
              <button className="modal-close" onClick={() => setShowAddBookModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddBook} style={{ padding: '20px' }}>
              <div className="field">
                <label>Book Title</label>
                <input type="text" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label>Author</label>
                <input type="text" value={newBookAuthor} onChange={(e) => setNewBookAuthor(e.target.value)} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Genre</label>
                  <select value={newBookGenre} onChange={(e) => setNewBookGenre(e.target.value)}>
                    <option value="Fiction">Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Classic">Classic Literature</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Sci-Tech">Science & Technology</option>
                  </select>
                </div>
                <div className="field">
                  <label>Total Pages</label>
                  <input type="number" value={newBookPages} onChange={(e) => setNewBookPages(e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

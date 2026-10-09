import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function OrganizerDashboard() {
  const outletCtx = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [groups, setGroups] = useState([]);

  // Modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('Book Club Meeting');
  const [eventDate, setEventDate] = useState('Nov 5, 2026');
  const [eventTime, setEventTime] = useState('7:00 PM EST');

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = () => {
    setEvents(BookClubStore.getEvents());
    setCompetitions(BookClubStore.getCompetitions());
    setChallenges(BookClubStore.getChallenges());
    setGroups(BookClubStore.getGroups());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    BookClubStore.createEvent({
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime,
      location: 'Virtual Reading Salon / Zoom',
      description: 'Organizer scheduled discussion and salon reading check-in.',
      month: 'NOV',
      day: '05',
      participants: 1,
      maxSeats: 40,
      rsvpd: true
    });
    setShowEventModal(false);
    setEventTitle('');
    loadData();
    showToast('Event created and published to circle members!');
  };

  return (
    <div>
      <Topbar
        title="Organizer Operations Hub"
        subtitle="Manage community gatherings, seasonal challenges, and member engagement."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowEventModal(true)}>
            + Host Event
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* QUICK ACTION BANNER */}
      <div className="action-banner" style={{ background: 'linear-gradient(135deg, var(--forest-deep, #1E3A2E), #2A4230)', color: '#fff', padding: '24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', color: '#fff' }}>Organizer Workspace & Operations</h3>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.9rem' }}>
            Coordinate reading groups, host salons, curate book selections, and oversee member attendance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm" style={{ background: 'var(--shell-gold)', color: '#1A1A1A', fontWeight: 600 }} onClick={() => setShowEventModal(true)}>
            + Host New Event
          </button>
          <Link to="/competitions" className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            + Tournaments
          </Link>
          <Link to="/challenges" className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
            + Challenges
          </Link>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-title">Hosted Events</div>
          <div className="stat-value tone-green">{events.length}</div>
          <div className="stat-delta up">↑ 3 scheduled this month</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Total RSVPs Received</div>
          <div className="stat-value tone-gold">142</div>
          <div className="stat-delta">88% average turnout rate</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Active Competitions</div>
          <div className="stat-value tone-blue">{competitions.length}</div>
          <div className="stat-delta">279 total competitors</div>
        </div>
        <div className="card stat-card">
          <div className="stat-title">Community Challenges</div>
          <div className="stat-value tone-clay">{challenges.length}</div>
          <div className="stat-delta">372 active readers enrolled</div>
        </div>
      </div>

      {/* ORGANIZER TABS */}
      <div className="organizer-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '2px solid var(--line)', marginBottom: '24px', paddingBottom: '4px' }}>
        {[
          { id: 'events', label: 'Events & Gatherings' },
          { id: 'competitions', label: 'Reading Competitions' },
          { id: 'challenges', label: 'Reading Challenges' },
          { id: 'groups', label: 'Circles Roster' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`organizer-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeTab === tab.id ? 'var(--brown-deep)' : 'var(--paper)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--ink-soft)',
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

      {/* TAB: Events */}
      {activeTab === 'events' && (
        <div className="card panel">
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Community Gatherings Under Your Supervision</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowEventModal(true)}>+ Host Event</button>
          </div>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Date & Time</th>
                  <th style={{ padding: '10px' }}>Seats Reserved</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/events/${e.id}`}>{e.title}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>{e.type}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{e.month} {e.day} · {e.time}</td>
                    <td style={{ padding: '10px' }}>{e.participants} / {e.maxSeats || 50}</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/events/${e.id}`} className="btn btn-outline btn-xs">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Competitions */}
      {activeTab === 'competitions' && (
        <div className="card panel">
          <h3 style={{ margin: '0 0 20px 0' }}>Tournaments Overview</h3>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Tournament</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Competitors</th>
                  <th style={{ padding: '10px' }}>Grand Prize</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/competitions/${c.id}`}>{c.title}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${c.status === 'Active' ? 'badge-completed' : 'badge-want'}`}>{c.status}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{c.participants}</td>
                    <td style={{ padding: '10px', color: 'var(--clay)' }}>{c.prize}</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/competitions/${c.id}`} className="btn btn-outline btn-xs">Arena</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Challenges */}
      {activeTab === 'challenges' && (
        <div className="card panel">
          <h3 style={{ margin: '0 0 20px 0' }}>Active Challenges</h3>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Challenge</th>
                  <th style={{ padding: '10px' }}>Target</th>
                  <th style={{ padding: '10px' }}>Enrolled</th>
                  <th style={{ padding: '10px' }}>Reward</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((ch) => (
                  <tr key={ch.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/challenges/${ch.id}`}>{ch.title}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>{ch.target} {ch.unit}</td>
                    <td style={{ padding: '10px' }}>{ch.participants || 140}</td>
                    <td style={{ padding: '10px', color: 'var(--gold)' }}>+{ch.rewardXp} XP</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/challenges/${ch.id}`} className="btn btn-outline btn-xs">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Groups */}
      {activeTab === 'groups' && (
        <div className="card panel">
          <h3 style={{ margin: '0 0 20px 0' }}>Reading Circles Directory</h3>
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '10px' }}>Group</th>
                  <th style={{ padding: '10px' }}>Genre</th>
                  <th style={{ padding: '10px' }}>Members</th>
                  <th style={{ padding: '10px' }}>Schedule</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      <Link to={`/groups/${g.id}`}>{g.name}</Link>
                    </td>
                    <td style={{ padding: '10px' }}>{g.genre}</td>
                    <td style={{ padding: '10px' }}>{g.membersCount || g.members?.length || 0}</td>
                    <td style={{ padding: '10px', color: 'var(--ink-soft)' }}>{g.schedule}</td>
                    <td style={{ padding: '10px' }}>
                      <Link to={`/groups/${g.id}`} className="btn btn-outline btn-xs">Portal</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="modal-overlay show" onClick={() => setShowEventModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Host New Salon Gathering</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateEvent} style={{ padding: '20px' }}>
              <div className="field">
                <label>Event Title</label>
                <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  <option value="Book Club Meeting">Book Club Meeting</option>
                  <option value="Author Talk">Author Talk</option>
                  <option value="Reading Session">Reading Session</option>
                  <option value="Writing Workshop">Writing Workshop</option>
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Date</label>
                  <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div className="field">
                  <label>Time</label>
                  <input type="text" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Publish Event 📅</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Events() {
  const outletCtx = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showHostModal, setShowHostModal] = useState(false);

  // New event state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Book Club Meeting');
  const [newDate, setNewDate] = useState('Oct 24, 2026');
  const [newTime, setNewTime] = useState('6:00 PM EST');
  const [newLocation, setNewLocation] = useState('Virtual Room / Zoom');
  const [newDesc, setNewDesc] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const allEvents = BookClubStore.getEvents();

  let filtered = allEvents;
  if (activeTab === 'my-rsvps') {
    filtered = filtered.filter((e) => e.rsvpd);
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }

  if (typeFilter !== 'all') {
    filtered = filtered.filter((e) => e.type === typeFilter);
  }

  const handleToggleRSVP = (eventId) => {
    BookClubStore.toggleRSVP(eventId);
    showToast('RSVP attendance status updated!');
  };

  const handleHostEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    BookClubStore.createEvent({
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      location: newLocation,
      description: newDesc,
      month: 'OCT',
      day: '24',
      participants: 1,
      maxSeats: 50,
      rsvpd: true
    });
    setShowHostModal(false);
    setNewTitle('');
    setNewDesc('');
    showToast('Event created and posted to community calendar!');
  };

  return (
    <div>
      <Topbar
        title="Community Events & Salons"
        subtitle="Join live author Q&As, scheduled group discussions, and silent reading rooms."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowHostModal(true)}>
            + Host Event
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'upcoming', label: 'Upcoming Gatherings' },
          { id: 'my-rsvps', label: 'My RSVPs & Attendance' },
          { id: 'all', label: 'All Events' }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: activeTab === tab.id ? 700 : 500 }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Search events by title, organizer, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Event Types</option>
          <option value="Book Club Meeting">Book Club Meeting</option>
          <option value="Author Talk">Author Talk</option>
          <option value="Reading Session">Reading Session</option>
          <option value="Writing Workshop">Writing Workshop</option>
          <option value="Social Event">Social Event</option>
        </select>

        <Link to="/calendar" className="btn btn-outline btn-sm">Interactive Calendar View 📆</Link>
      </div>

      {/* EVENTS GRID */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📅</div>
              <h3>No events found</h3>
              <p className="text-soft">Try choosing a different category or clear your search terms.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { setActiveTab('all'); setSearchQuery(''); setTypeFilter('all'); }}>
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          filtered.map((e) => (
            <div key={e.id} className="card event-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
              <div>
                <div className="flex-between" style={{ marginBottom: '14px' }}>
                  <div className="event-date-badge">
                    <span className="mon" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{e.month}</span>
                    <span className="day" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>{e.day}</span>
                  </div>
                  <span className={`badge ${e.rsvpd ? 'badge-completed' : 'badge-reading'}`}>
                    {e.rsvpd ? '✓ Registered' : e.type}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem' }}>
                  <Link to={`/events/${e.id}`}>{e.title}</Link>
                </h3>

                <p className="event-meta" style={{ margin: '3px 0', fontSize: '0.84rem', color: 'var(--ink-soft)' }}>🕒 {e.time}</p>
                <p className="event-meta" style={{ margin: '3px 0', fontSize: '0.84rem', color: 'var(--ink-soft)' }}>📍 {e.location}</p>
                <p className="event-meta" style={{ margin: '3px 0', fontSize: '0.84rem', color: 'var(--ink-soft)' }}>🎤 Host: {e.organizer}</p>
                <p className="event-meta" style={{ margin: '3px 0', fontSize: '0.84rem', color: 'var(--ink-soft)' }}>👥 {e.participants} / {e.maxSeats || 50} seats reserved</p>

                <p style={{ fontSize: '0.88rem', color: 'var(--ink)', marginTop: '10px', lineHeight: 1.4 }}>
                  {e.description?.slice(0, 95)}...
                </p>
              </div>

              <div className="flex gap-8" style={{ marginTop: '18px', borderTop: '1px dashed var(--line)', paddingTop: '14px' }}>
                <button
                  type="button"
                  className={`btn ${e.rsvpd ? 'btn-danger' : 'btn-primary'} btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => handleToggleRSVP(e.id)}
                >
                  {e.rsvpd ? 'Cancel RSVP' : 'RSVP Now'}
                </button>
                <Link to={`/events/${e.id}`} className="btn btn-outline btn-sm">Details →</Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Host Event Modal */}
      {showHostModal && (
        <div className="modal-overlay show" onClick={() => setShowHostModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Host Community Event</h3>
              <button className="modal-close" onClick={() => setShowHostModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleHostEvent} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="modalEventTitle">Event Title</label>
                <input
                  type="text"
                  id="modalEventTitle"
                  placeholder="e.g. Elena Marsh Fireside Chat"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="modalEventType">Event Type</label>
                  <select id="modalEventType" value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="Book Club Meeting">Book Club Meeting</option>
                    <option value="Author Talk">Author Talk</option>
                    <option value="Reading Session">Reading Session</option>
                    <option value="Writing Workshop">Writing Workshop</option>
                    <option value="Social Event">Social Event</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="modalEventDate">Date</label>
                  <input type="text" id="modalEventDate" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="modalEventTime">Time</label>
                  <input type="text" id="modalEventTime" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="modalEventLocation">Platform / Place</label>
                  <input type="text" id="modalEventLocation" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="modalEventDesc">Description & Agenda</label>
                <textarea
                  id="modalEventDesc"
                  rows="3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What will readers discuss during this session?"
                ></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHostModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Host Gathering 📅</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

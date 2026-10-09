import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';

export default function Calendar() {
  const outletCtx = useOutletContext() || {};
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = BookClubStore.getEvents();

  // Days of month
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Map events to days
  const eventsByDay = {};
  events.forEach((e) => {
    const d = parseInt(e.day, 10);
    if (!isNaN(d)) {
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(e);
    }
  });

  return (
    <div>
      <Topbar
        title="Community Reading Calendar"
        subtitle="Schedule and synchronize book club salons, reading sprints, and author Q&As."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/events" className="btn btn-outline btn-sm">Events Hub 📅</Link>
        }
      />

      <div className="calendar-controls flex-between mb-30" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="cal-nav-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="cal-nav-btn btn btn-outline btn-sm" onClick={() => setCurrentMonth('September 2026')}>← Prev</button>
          <span className="cal-current-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700 }}>
            {currentMonth}
          </span>
          <button type="button" className="cal-nav-btn btn btn-outline btn-sm" onClick={() => setCurrentMonth('November 2026')}>Next →</button>
        </div>

        <div className="flex gap-8">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCurrentMonth('October 2026')}>Today</button>
          <Link to="/events" className="btn btn-outline btn-sm">+ Host Salon</Link>
        </div>
      </div>

      {/* MONTH GRID */}
      <div className="calendar-month-grid card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--line)', background: 'var(--cream-deep)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {/* Faint padding for starting day of month (Thursday start) */}
          {[1, 2, 3, 4].map((pad) => (
            <div key={`pad-${pad}`} style={{ minHeight: '110px', padding: '8px', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'rgba(0,0,0,0.02)', opacity: 0.45 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{27 + pad}</div>
            </div>
          ))}

          {daysInMonth.map((day) => {
            const dayEvents = eventsByDay[day] || [];
            const isToday = day === 5;
            return (
              <div
                key={day}
                style={{
                  minHeight: '110px',
                  padding: '8px',
                  borderRight: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                  background: isToday ? 'rgba(44, 76, 52, 0.04)' : '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      width: '24px',
                      height: '24px',
                      borderRadius: isToday ? '50%' : 'none',
                      background: isToday ? 'var(--forest)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--clay)', fontWeight: 700 }}>
                      {dayEvents.length} event
                    </span>
                  )}
                </div>

                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      background: ev.rsvpd ? '#D8F3DC' : 'rgba(44, 76, 52, 0.12)',
                      color: ev.rsvpd ? '#1B4332' : 'var(--forest-deep)'
                    }}
                    title={`${ev.title} (${ev.time})`}
                  >
                    🕒 {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay show" onClick={() => setSelectedEvent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>{selectedEvent.title}</h3>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <span className="badge badge-reading" style={{ marginBottom: '10px' }}>{selectedEvent.type}</span>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--ink)' }}>{selectedEvent.description}</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '12px' }}>
                <div>📅 Date: {selectedEvent.month} {selectedEvent.day}, 2026</div>
                <div>🕒 Time: {selectedEvent.time}</div>
                <div>📍 Location: {selectedEvent.location}</div>
                <div>🎤 Host: {selectedEvent.organizer}</div>
              </div>
              <div className="flex gap-8" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>Close</button>
                <Link to={`/events/${selectedEvent.id}`} className="btn btn-primary btn-sm">Full Event Page →</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

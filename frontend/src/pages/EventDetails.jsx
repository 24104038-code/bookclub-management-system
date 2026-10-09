import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import CertificateModal from '../components/CertificateModal';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = Number(paramId || searchParams.get('id') || 1);
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Register and confirm event RSVP', done: true },
    { id: 2, label: 'Read Chapters 1–6 prior to gathering', done: true },
    { id: 3, label: 'Attend live salon discussion session', done: false },
    { id: 4, label: 'Post 1 reflection or question in thread', done: false }
  ]);
  const [activeCert, setActiveCert] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadEvent = () => {
    const ev = BookClubStore.getEventById(eventId);
    setEvent(ev);
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  if (!event) {
    return (
      <div>
        <Topbar title="Event Details" subtitle="Loading community salon..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Event Not Found</h3>
          <p className="text-soft">The gathering you requested does not exist or has already completed.</p>
          <Link to="/events" className="btn btn-primary btn-sm">Return to Events Hub</Link>
        </div>
      </div>
    );
  }

  const handleToggleRSVP = () => {
    BookClubStore.toggleRSVP(event.id);
    loadEvent();
    showToast(event.rsvpd ? 'RSVP cancelled' : 'You are now confirmed for this event!');
  };

  const handleTrackWhatsApp = () => {
    const msg = BookClubStore.formatWhatsAppEventText({
      groupName: 'Book Club',
      title: event.title,
      schedule: event.date || `${event.month} ${event.day}, 2026`,
      time: event.time,
      location: event.location,
      milestone: 'Discussion Session',
      url: window.location.href
    });
    BookClubStore.trackGatheringOrEvent({
      type: 'event',
      id: event.id,
      method: 'whatsapp',
      contact: user?.phone || '',
      details: { title: event.title }
    });
    BookClubStore.openWhatsAppTracker(msg, user?.phone);
    showToast('📲 Opened event in WhatsApp! Reminder active.');
  };

  const handleTrackEmail = () => {
    const emailVal = user?.email || 'reader@bookclub.com';
    BookClubStore.trackGatheringOrEvent({
      type: 'event',
      id: event.id,
      method: 'email',
      contact: emailVal,
      details: { title: event.title, schedule: event.date, location: event.location }
    });
    BookClubStore.downloadICSFile({
      title: event.title,
      description: event.description || 'BookClub gathering session',
      location: event.location,
      filename: `event-${event.id}`
    });
    showToast(`✉️ Event details & .ics calendar invite sent to ${emailVal}!`);
  };

  const handleDownloadICS = () => {
    BookClubStore.downloadICSFile({
      title: event.title,
      description: event.description || 'BookClub gathering session',
      location: event.location,
      filename: `event-${event.id}`
    });
    showToast('📅 Calendar invite (.ics) downloaded!');
  };

  const handleToggleTask = (taskId) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
    setTasks(updated);
  };

  const allTasksDone = tasks.every((t) => t.done);

  const handleGenerateCertificate = () => {
    const cert = {
      id: `CERT-EVT-${event.id}-${Date.now().toString(36).toUpperCase()}`,
      title: `${event.title} — Verified Salon Participation`,
      recipient: user?.name || 'Jordan Rivera',
      type: 'event',
      eventName: event.title,
      eventDate: `${event.month} ${event.day}, 2026`,
      issuer: event.organizer || 'BOOK FORGE Reading Guild',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Officially awarded for active literary participation, critical analysis, and collaborative dialogue during the live ${event.title} hosted by ${event.organizer}.`,
      verificationCode: `BF-V${Math.floor(Math.random() * 89999 + 10000)}`
    };

    BookClubStore.addCertificate(cert);
    setActiveCert(cert);
  };

  return (
    <div>
      <Topbar
        title={event.title}
        subtitle={`${event.type} · ${event.date || `${event.month} ${event.day}, 2026`} · Hosted by ${event.organizer}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/events" className="btn btn-outline btn-sm">← Back to All Events</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* EVENT HERO CARD */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, #16291F, #33473A)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)', marginBottom: '8px' }}>
              {event.type}
            </span>
            <h1 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '2rem' }}>{event.title}</h1>
            <p style={{ color: '#B9C7BC', maxWidth: '600px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {event.description}
            </p>

            <div className="flex gap-16" style={{ fontSize: '0.9rem', color: '#E7D9C6', flexWrap: 'wrap' }}>
              <span>📅 {event.date || `${event.month} ${event.day}, 2026`}</span>
              <span>🕒 {event.time}</span>
              <span>📍 {event.location}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '20px 24px', textAlign: 'center', minWidth: '220px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--shell-text-dim)', marginBottom: '4px' }}>
              Attendance Status
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--shell-gold)', marginBottom: '12px' }}>
              {event.rsvpd ? '✓ Confirmed RSVP' : 'Not Registered'}
            </div>
            <button
              type="button"
              className={`btn ${event.rsvpd ? 'btn-danger' : 'btn-primary'} btn-sm btn-block`}
              onClick={handleToggleRSVP}
            >
              {event.rsvpd ? 'Cancel RSVP' : 'RSVP Now'}
            </button>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#25D366', fontSize: '0.78rem' }}
                onClick={handleTrackWhatsApp}
              >
                📲 WhatsApp
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#fff', fontSize: '0.78rem' }}
                onClick={handleTrackEmail}
              >
                ✉️ Email
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#fff', fontSize: '0.78rem' }}
                onClick={handleDownloadICS}
              >
                📅 .ics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN */}
      <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        {/* LEFT: Schedule & Meeting Link */}
        <div>
          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 12px 0' }}>Virtual Salon Meeting Link</h3>
            <div className="card" style={{ background: 'var(--cream-deep)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brown-deep)', wordBreak: 'break-all' }}>
                  {event.meetingLink || 'https://meet.bookclub.internal/salon'}
                </div>
                <span className="text-soft" style={{ fontSize: '0.8rem' }}>Room opens 10 minutes before kickoff</span>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const link = event.meetingLink || 'https://meet.bookclub.internal/salon';
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(link);
                    showToast('Meeting link copied! 📋');
                  } else {
                    prompt('Copy meeting link:', link);
                  }
                }}
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="card panel mb-30">
            <h3 style={{ margin: '0 0 14px 0' }}>Event Agenda & Schedule</h3>
            <div className="feed-list">
              {(event.schedule && event.schedule.length > 0 ? event.schedule : [
                { time: '6:00 PM', activity: 'Welcome & Icebreaker' },
                { time: '6:20 PM', activity: 'Key Thematic Discussion & Book Breakdown' },
                { time: '7:00 PM', activity: 'Open Q&A & Salon Debate' },
                { time: '7:25 PM', activity: 'Wrap-up & Next Chapters Target' }
              ]).map((item, idx, arr) => (
                <div key={idx} className="list-row" style={{ padding: '10px 0', borderBottom: idx < arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <strong style={{ color: 'var(--clay)', fontSize: '0.88rem', minWidth: '85px' }}>{item.time}</strong>
                    <div>
                      <div style={{ margin: '0 0 2px 0', fontSize: '0.92rem', color: 'var(--ink)' }}>{item.activity || item.title || ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card panel">
            <h3 style={{ margin: '0 0 12px 0' }}>Discussion Guidelines</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-soft)', lineHeight: 1.8, margin: 0 }}>
              {(event.rules && event.rules.length > 0 ? event.rules : [
                'Be respectful of diverse viewpoints and literary interpretations.',
                'Please keep your microphone muted during introductory remarks.',
                'Tag spoiler questions appropriately in the chat pane.',
                'Have fun and share the joy of books!'
              ]).map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Host & Participants & Certificate */}
        <div>
          {/* EVENT PARTICIPATION & CERTIFICATE */}
          <div className="card panel mb-30">
            <div className="panel-head flex-between" style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Participation & Certificate</h3>
              <span className={`badge ${allTasksDone ? 'badge-completed' : 'badge-active'}`}>
                {allTasksDone ? 'Ready to Claim' : 'In Progress'}
              </span>
            </div>

            <p className="text-soft" style={{ fontSize: '0.88rem', margin: '4px 0 16px' }}>
              Complete all event participation milestones to earn your official verified CRT certificate.
            </p>

            {/* Tasks List */}
            <div style={{ marginBottom: '16px' }}>
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: t.done ? '#F0FDF4' : 'var(--cream-deep)',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{t.done ? '✅' : '⬜'}</span>
                  <span style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--ink-soft)' : 'var(--ink)' }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!allTasksDone}
              onClick={handleGenerateCertificate}
            >
              🎓 Generate Official Certificate
            </button>
          </div>

          <div className="card panel mb-30">
            <div className="flex-between">
              <h3 style={{ margin: 0 }}>Event Host</h3>
              <Link to="/profile" className="btn btn-outline btn-sm">Host Profile</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
              <span style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {event.organizerAvatar || event.organizer?.slice(0, 2).toUpperCase() || 'AK'}
              </span>
              <div>
                <h4 style={{ margin: 0 }}>{event.organizer}</h4>
                <p className="text-soft" style={{ margin: '2px 0 0 0', fontSize: '0.82rem' }}>{event.organizerRole || 'Lead Salon Organizer · Guild Curator'}</p>
              </div>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0 }}>Confirmed Attendees</h3>
              <span className="text-soft">{event.participants} Attending</span>
            </div>
            <div className="feed-list">
              {[
                { name: `${user?.name || 'Jordan Rivera'} (You)`, time: 'Registered RSVP', tag: 'Confirmed', bg: 'var(--clay)' },
                { name: 'Rahul Thomas', time: 'Registered 2 days ago', tag: 'Confirmed', bg: 'var(--green-shelf)' },
                { name: 'Meera Joseph', time: 'Registered 4 days ago', tag: 'Confirmed', bg: 'var(--gold)' },
                { name: 'Elena Ramos', time: 'Registered 5 days ago', tag: 'Confirmed', bg: '#B5652F' }
              ].map((att, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: idx < 3 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: att.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {att.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.86rem' }}>{att.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{att.time}</div>
                  </div>
                  <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>{att.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {activeCert && (
        <CertificateModal cert={activeCert} onClose={() => setActiveCert(null)} />
      )}
    </div>
  );
}

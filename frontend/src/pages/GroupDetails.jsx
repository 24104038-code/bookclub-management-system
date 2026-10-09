import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';
import { getBookCoverUrl } from '../utils/bookCovers';

export default function GroupDetails() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const groupId = Number(paramId || searchParams.get('id') || 1);
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadGroup = () => {
    const g = BookClubStore.getGroupById(groupId);
    setGroup(g);
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  if (!group) {
    return (
      <div>
        <Topbar title="Group Details" subtitle="Loading reading circle..." />
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Reading Group Not Found</h3>
          <p className="text-soft">The reading circle you requested does not exist or has been archived.</p>
          <Link to="/groups" className="btn btn-primary btn-sm">Return to Groups Hub</Link>
        </div>
      </div>
    );
  }

  const curBook = BookClubStore.getBookById(group.currentBookId) || { title: 'The Silent Orchard', author: 'Elena Marsh', coverImage: 'images/books/silent-orchard.jpg', id: 1 };
  const upcomingBook = BookClubStore.getBookById(group.upcomingBookId || 2) || { title: "Winter's Ledger", author: 'Colin Reyes', coverImage: 'images/books/winters-ledger.jpg', id: 2 };
  const userName = user?.name || 'Reader';
  const isMember = (group.members || []).some((m) => m.name === userName);

  // Tracking State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackModalMode, setTrackModalMode] = useState('choice'); // 'choice' | 'whatsapp' | 'email'
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [whatsAppPhoneInput, setWhatsAppPhoneInput] = useState(user?.phone || '9876543210');
  const [whatsAppCountryCode, setWhatsAppCountryCode] = useState('+91');
  const [includeOfferBonus, setIncludeOfferBonus] = useState(true);
  const [selectedEventForTrack, setSelectedEventForTrack] = useState(null);
  const [, setTrackCounter] = useState(0);

  // Group Multi-Member WhatsApp Broadcast State
  const [broadcastScope, setBroadcastScope] = useState('group'); // 'group' (all members) | 'channel' (chat room) | 'single' (individual)
  const [selectedMemberNames, setSelectedMemberNames] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [dispatchDone, setDispatchDone] = useState(false);

  const gatheringStatus = BookClubStore.getTrackingStatus('group', groupId);

  const getGroupMembersRoster = (g) => {
    if (!g) return [];
    const host = g.organizer || g.organizerName || 'Aditi Krishnan';
    const base = [
      { id: 101, name: host, role: '👑 Circle Host', phone: '+91 98765 43210', status: 'Host Sender' },
      { id: 102, name: 'Jordan Rivera', role: '📖 Active Reader', phone: '+91 98401 22345', status: 'Auto-Track Active' },
      { id: 103, name: 'Rahul Thomas', role: '📖 Active Reader', phone: '+91 91234 56789', status: 'Auto-Track Active' },
      { id: 104, name: 'Meera Joseph', role: '💬 Discussion Lead', phone: '+91 94421 88301', status: 'Auto-Track Active' },
      { id: 105, name: 'Sam Park', role: '📖 Active Reader', phone: '+91 97890 11223', status: 'Auto-Track Active' }
    ];

    if (userName && !base.some(m => m.name === userName)) {
      base.push({
        id: 106,
        name: userName,
        role: '🌟 Member (You)',
        phone: `${whatsAppCountryCode} ${whatsAppPhoneInput}`,
        status: 'Auto-Track Active'
      });
    }

    if (g.members && g.members.length > 0) {
      const existingNames = new Set(base.map(b => b.name));
      g.members.forEach((m, idx) => {
        if (!existingNames.has(m.name)) {
          base.push({
            id: 200 + idx,
            name: m.name,
            role: m.role || 'Member',
            phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999).toString().slice(0, 8)}`,
            status: 'Auto-Track Active'
          });
        }
      });
    }
    return base;
  };

  const handleJoinToggle = () => {
    const willBeMember = !isMember;
    BookClubStore.joinGroup(group.id);
    loadGroup();
    if (willBeMember) {
      showToast('Welcome to the circle! You can now track upcoming gatherings.');
      setSelectedEventForTrack(null);
      setTrackModalMode('choice');
      setBroadcastScope('group');
      const roster = getGroupMembersRoster(group);
      setSelectedMemberNames(roster.map(m => m.name));
      setDispatchDone(false);
      setDispatchLogs([]);
      setIsDispatching(false);
      setShowTrackModal(true);
    } else {
      showToast('You have left this group');
    }
  };

  const handleTrackWhatsApp = (customEvent) => {
    setSelectedEventForTrack(customEvent || null);
    setTrackModalMode('whatsapp');
    setBroadcastScope('group');
    const roster = getGroupMembersRoster(group);
    setSelectedMemberNames(roster.map(m => m.name));
    setDispatchDone(false);
    setDispatchLogs([]);
    setIsDispatching(false);
    setShowTrackModal(true);
  };

  // Group of Members Automated Dispatch
  const handleConfirmGroupBroadcast = async (customEvent) => {
    const isCustom = Boolean(customEvent || selectedEventForTrack);
    const ev = customEvent || selectedEventForTrack;
    const roster = getGroupMembersRoster(group);
    const targetMembers = roster.filter(m => selectedMemberNames.includes(m.name));
    if (targetMembers.length === 0) {
      showToast('⚠️ Please select at least one member to receive the alert.');
      return;
    }
    const hostName = group.organizer || group.organizerName || 'Aditi Krishnan';
    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member'
      : '';

    setIsDispatching(true);
    setDispatchDone(false);

    // Staggered simulation to group members
    const logs = [];
    for (let i = 0; i < targetMembers.length; i++) {
      const m = targetMembers[i];
      await new Promise(res => setTimeout(res, 220));
      logs.push({
        name: m.name,
        role: m.role,
        phone: m.phone,
        status: 'Delivered ✓',
        time: 'Just now'
      });
      setDispatchLogs([...logs]);
    }

    BookClubStore.dispatchGroupWhatsAppNotification(group.id, {
      hostName,
      members: targetMembers,
      offer: offerText,
      title: isCustom ? ev.title : 'Weekly Salon'
    });

    setIsDispatching(false);
    setDispatchDone(true);
    setTrackCounter(c => c + 1);
    showToast(`⚡ Automated WhatsApp broadcast delivered to all ${targetMembers.length} members of ${group.name}!`);
  };

  const handleConfirmChannelWhatsApp = (customEvent) => {
    const isCustom = Boolean(customEvent || selectedEventForTrack);
    const ev = customEvent || selectedEventForTrack;
    const hostName = group.organizer || group.organizerName || 'Aditi Krishnan';
    const roster = getGroupMembersRoster(group);
    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member'
      : '';

    const text = BookClubStore.formatGroupWhatsAppEventText({
      groupName: group.name,
      title: isCustom ? ev.title : 'Weekly Salon',
      schedule: isCustom ? `${ev.month} ${ev.day}` : (group.schedule || 'Every Saturday'),
      time: isCustom ? ev.time : '5:00 PM',
      location: isCustom ? ev.location : (group.location || 'Community Library Hall & Online'),
      hostName,
      membersList: roster.map(m => m.name),
      memberCount: roster.length,
      offer: offerText,
      url: window.location.href
    });

    BookClubStore.dispatchGroupWhatsAppNotification(group.id, {
      hostName,
      members: roster,
      offer: offerText,
      title: isCustom ? ev.title : 'Weekly Salon'
    });

    BookClubStore.openWhatsAppTracker(text, '');
    setShowTrackModal(false);
    setTrackCounter(c => c + 1);
    showToast(`💬 Automated message prepared for ${group.name} WhatsApp Group Chat!`);
  };

  const handleConfirmSingleWhatsApp = (customEvent) => {
    const isCustom = Boolean(customEvent || selectedEventForTrack);
    const ev = customEvent || selectedEventForTrack;
    const cleanDigits = whatsAppPhoneInput.replace(/\D/g, '');
    const fullPhone = `${whatsAppCountryCode}${cleanDigits}`;
    const hostName = group.organizer || group.organizerName || 'Aditi Krishnan';
    const targetTitle = isCustom ? ev.title : `${group.name} — Gathering`;

    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Chapter Badge & Discussion Pass'
      : '';

    const msg = BookClubStore.formatWhatsAppEventText({
      groupName: group.name,
      title: isCustom ? ev.title : 'Weekly Salon',
      schedule: isCustom ? `${ev.month} ${ev.day}` : (group.schedule || 'Every Saturday'),
      time: isCustom ? ev.time : '5:00 PM',
      location: isCustom ? ev.location : (group.location || 'Community Library Hall & Online'),
      bookTitle: curBook.title,
      bookAuthor: curBook.author,
      hostName: hostName,
      memberName: userName,
      offerText: offerText,
      milestone: 'Chapters 12–15 before Saturday session',
      url: window.location.href
    });

    BookClubStore.trackGatheringOrEvent({
      type: isCustom ? 'event' : 'group',
      id: isCustom ? ev.id : group.id,
      method: 'whatsapp',
      contact: fullPhone,
      details: { title: targetTitle, hostName, offerText }
    });

    BookClubStore.dispatchHostWhatsAppNotification(group.id, {
      hostName,
      memberName: userName,
      phone: fullPhone,
      offerText,
      customText: msg
    });

    BookClubStore.openWhatsAppTracker(msg, fullPhone);

    setTrackCounter(c => c + 1);
    setShowTrackModal(false);
    showToast(`📲 Automated WhatsApp alert dispatched by Host ${hostName}!`);
  };

  const handleTrackEmailSubmit = (customEvent) => {
    const isCustom = Boolean(customEvent || selectedEventForTrack);
    const ev = customEvent || selectedEventForTrack;
    const targetId = isCustom ? ev.id : group.id;
    const targetType = isCustom ? 'event' : 'group';
    const targetTitle = isCustom ? ev.title : `${group.name} - Gathering`;
    const targetSchedule = isCustom ? `${ev.month} ${ev.day} at ${ev.time}` : (group.schedule || 'Every Saturday 5:00 PM');
    const targetLocation = isCustom ? ev.location : (group.location || 'Community Library Hall, Room 2 & Online');

    const emailVal = emailInput.trim() || user?.email || 'reader@bookclub.com';

    BookClubStore.trackGatheringOrEvent({
      type: targetType,
      id: targetId,
      method: 'email',
      contact: emailVal,
      details: {
        title: targetTitle,
        schedule: targetSchedule,
        location: targetLocation,
        milestone: 'Chapters 12–15 before session'
      }
    });

    BookClubStore.downloadICSFile({
      title: targetTitle,
      description: `Gathering for ${group.name}. Target milestone: Chapters 12–15.`,
      location: targetLocation,
      filename: `${group.name}-event`
    });

    setTrackCounter(c => c + 1);
    setShowTrackModal(false);
    showToast(`✉️ Gathering details & calendar invite sent to ${emailVal}!`);
  };

  const handleDownloadICS = (customEvent) => {
    const isCustom = Boolean(customEvent);
    const targetTitle = isCustom ? customEvent.title : `${group.name} - Gathering`;
    const targetLocation = isCustom ? customEvent.location : (group.location || 'Community Library Hall, Room 2 & Online');
    BookClubStore.downloadICSFile({
      title: targetTitle,
      description: `Gathering for ${group.name}. Target: Chapters 12–15 before Saturday session.`,
      location: targetLocation,
      filename: `${group.name}-gathering`
    });
    showToast('📅 Calendar invite (.ics) downloaded!');
  };

  const handleVote = (pollId, optionIndex) => {
    BookClubStore.voteGroupPoll(group.id, pollId, optionIndex);
    loadGroup();
    showToast('Your vote has been counted!');
  };

  const discussions = BookClubStore.getDiscussions().slice(0, 3);
  const events = BookClubStore.getEvents().slice(0, 2);

  return (
    <div>
      <Topbar
        title={group.name}
        subtitle={`Organized by ${group.organizer || 'Aditi Krishnan'} · ${group.schedule}`}
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <Link to="/groups" className="btn btn-outline btn-sm">← Back to All Groups</Link>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* GROUP HEADER HERO */}
      <div className="card panel mb-30" style={{ background: 'linear-gradient(135deg, #16291F, #33473A)', color: '#fff', padding: '28px' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="flex gap-8 mb-0" style={{ alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'var(--shell-gold)', color: 'var(--shell-green-deep)' }}>
                {group.genre}
              </span>
              <span className="badge badge-member">{group.privacy || 'Public'} Group</span>
            </div>
            <h1 style={{ color: '#fff', margin: '6px 0 8px 0', fontSize: '2rem' }}>{group.name}</h1>
            <p style={{ color: '#B9C7BC', maxWidth: '600px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {group.description}
            </p>
            <div className="flex gap-16" style={{ fontSize: '0.9rem', color: '#E7D9C6', flexWrap: 'wrap' }}>
              <span>👥 {group.membersCount || group.members?.length || 0} Members</span>
              <span>📅 {group.schedule}</span>
              <span>🎤 Lead: {group.organizer || 'Aditi Krishnan'}</span>
            </div>
          </div>

          <div className="flex gap-8" style={{ flexDirection: 'column' }}>
            <button
              type="button"
              className={`btn btn-sm ${isMember ? 'btn-outline' : 'btn-primary'}`}
              style={{ minWidth: '130px', borderColor: '#fff', color: isMember ? '#fff' : undefined }}
              onClick={handleJoinToggle}
            >
              {isMember ? 'Leave Circle' : 'Join Group'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: '#fff', borderColor: '#fff' }}
              onClick={() => setActiveTab('polls')}
            >
              Active Polls 🗳️
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'books', label: 'Book Shelf' },
          { id: 'members', label: `Members (${group.members?.length || 0})` },
          { id: 'discussions', label: 'Discussions' },
          { id: 'events', label: 'Events' },
          { id: 'progress', label: 'Reading Pace' },
          { id: 'polls', label: 'Polls & Votes 🗳️' }
        ].map((tab) => (
          <span
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: activeTab === tab.id ? 700 : 500, whiteSpace: 'nowrap' }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-2" style={{ gap: '30px', alignItems: 'start' }}>
          <div>
            <div className="card panel mb-30">
              <div className="panel-head" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Current Reading Selection</h3>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '120px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 3px 8px rgba(0,0,0,0.18)', background: 'var(--cream-deep)' }}>
                  <img
                    src={getBookCoverUrl(curBook)}
                    alt={curBook.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                    onError={(e) => { e.target.src = '/images/books/default-cover.jpg'; }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0' }}><Link to={`/books/${curBook.id}`}>{curBook.title}</Link></h4>
                  <p className="text-soft" style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>by {curBook.author}</p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: 'var(--ink)' }}>Current goal: Read up to Chapter 14 before this week's discussion.</p>
                  <Link to={`/books/${curBook.id}`} className="btn btn-outline btn-xs">Book Notes & Overview →</Link>
                </div>
              </div>
            </div>

            <div className="card panel">
              <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Next Gathering Schedule</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {gatheringStatus.whatsapp && (
                    <span className="badge" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', border: '1px solid #86EFAC' }}>
                      ✓ WhatsApp
                    </span>
                  )}
                  {gatheringStatus.email && (
                    <span className="badge" style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '0.75rem', border: '1px solid #A5B4FC' }}>
                      ✓ Email
                    </span>
                  )}
                </div>
              </div>
              <div className="list-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div><h4>Weekly Salon</h4><div className="meta" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{group.schedule}</div></div>
                <div className="meta" style={{ fontSize: '0.85rem', fontWeight: 600 }}>5:00 PM</div>
              </div>
              <div className="list-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div><h4>Location / Platform</h4><div className="meta" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{group.meetingLink || group.location || 'Community Library Hall, Room 2 & Online'}</div></div>
              </div>
              <div className="list-row" style={{ padding: '10px 0' }}>
                <div><h4>Current Target Milestone</h4><div className="meta" style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Chapters 12–15 before Saturday session</div></div>
              </div>

              {/* Event & Gathering Tracking Actions */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Track Gathering Event:</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                    {gatheringStatus.whatsapp && gatheringStatus.email ? 'Tracking active via WhatsApp & Email' : gatheringStatus.whatsapp ? 'Tracking active on WhatsApp' : gatheringStatus.email ? 'Tracking active on Email' : 'Never miss a session'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#25D366', color: '#128C7E', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleTrackWhatsApp()}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Track on WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      setSelectedEventForTrack(null);
                      setTrackModalMode('email');
                      setShowTrackModal(true);
                    }}
                  >
                    ✉️ Track via Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="Download Calendar Invite (.ics)"
                    onClick={() => handleDownloadICS()}
                  >
                    📅 .ics Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Host Automated WhatsApp Notification Hub */}
            <div className="card panel mb-30" style={{ border: '1.5px solid #86EFAC', background: '#F0FDF4' }}>
              <div className="panel-head flex-between" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>📢</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#166534' }}>
                      Host Automated WhatsApp Dispatcher
                    </h3>
                    <small style={{ color: '#15803D' }}>Amazon-Style Live Event & Milestone Alerts</small>
                  </div>
                </div>
                <span className="badge" style={{ background: '#25D366', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                  Active System
                </span>
              </div>

              <div style={{ background: '#fff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#166534', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    {(group.organizer || 'H').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{group.organizer || 'Aditi Krishnan'}</strong> (Host / Circle Lead)
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified Host Notification Sender</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  The host automatically dispatches gathering reminders, schedule updates, and exclusive reading bonuses (+150 XP) directly to members' WhatsApp, matching official Amazon notification standards.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#fff', border: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleTrackWhatsApp()}
                >
                  <span>📢</span>
                  <span>Broadcast Automated WhatsApp Alert to All Group Members</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#128C7E', color: '#128C7E', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleConfirmChannelWhatsApp()}
                >
                  <span>💬</span>
                  <span>Post to Group WhatsApp Chat</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#166534', fontWeight: 600 }}
                  onClick={() => {
                    const roster = getGroupMembersRoster(group);
                    BookClubStore.dispatchGroupWhatsAppNotification(group.id, {
                      hostName: group.organizer || 'Aditi Krishnan',
                      members: roster,
                      offer: '🎁 FLASH OFFER: +150 Bonus XP & Attendance Badge for all members'
                    });
                    showToast(`⚡ Multi-Member Flash Offer dispatched to all ${roster.length} circle members!`);
                  }}
                >
                  ⚡ Fast 1-Click Broadcast Simulation
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="card panel mb-30">
              <div className="panel-head flex-between" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Next Book Voting Spotlight</h3>
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setActiveTab('polls')}>Vote Now →</button>
              </div>
              <p className="text-soft" style={{ fontSize: '0.9rem', marginBottom: '14px' }}>What should we read after finishing the current book?</p>
              {(group.polls && group.polls.length > 0 ? group.polls[0].options : [
                { text: "Winter's Ledger by Colin Reyes", votes: 8 },
                { text: 'Salt & Story by Priya Nandan', votes: 5 },
                { text: 'Paper Lanterns by Wren Achebe', votes: 4 }
              ]).map((opt, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{opt.text}</span>
                    <strong>{opt.votes} votes</strong>
                  </div>
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, opt.votes * 10)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card panel">
              <div className="panel-head" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Recent Group Chatter</h3>
              </div>
              <div className="feed-list">
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: '0.85rem' }}>
                  <strong>Maya Lin:</strong> "Just reached chapter 12 — what an incredible twist with the orchard deed!"
                </div>
                <div style={{ padding: '8px 0', fontSize: '0.85rem' }}>
                  <strong>Marcus Brody:</strong> "Remember everyone, tomorrow evening at 5:00 PM is our salon check-in."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Books */}
      {activeTab === 'books' && (
        <div>
          <h3 style={{ marginBottom: '20px' }}>Group Reading Curriculum</h3>
          <div className="grid grid-3">
            <div className="card panel">
              <span className="badge badge-active" style={{ marginBottom: '12px' }}>Currently Reading</span>
              <h4>{curBook.title}</h4>
              <p className="text-soft" style={{ fontSize: '0.85rem' }}>by {curBook.author}</p>
              <Link to={`/books/${curBook.id}`} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>Book Details</Link>
            </div>
            <div className="card panel">
              <span className="badge badge-want" style={{ marginBottom: '12px' }}>Upcoming Selection</span>
              <h4>{upcomingBook.title}</h4>
              <p className="text-soft" style={{ fontSize: '0.85rem' }}>by {upcomingBook.author}</p>
              <Link to={`/books/${upcomingBook.id}`} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>Book Details</Link>
            </div>
            <div className="card panel">
              <span className="badge badge-completed" style={{ marginBottom: '12px' }}>Past Finished Reads</span>
              <h4>The Cartographer's Daughter</h4>
              <p className="text-soft" style={{ fontSize: '0.85rem' }}>by Mina Sterling · Finished May 2026</p>
              <Link to="/books/5" className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>Book Details</Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Members */}
      {activeTab === 'members' && (
        <div className="card panel">
          <div className="panel-head flex-between" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Circle Roster</h3>
            <span className="text-soft">{group.members?.length || 0} Members</span>
          </div>
          <div className="grid grid-2" style={{ gap: '14px' }}>
            {(group.members || []).map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--cream-deep)', borderRadius: '8px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {m.avatar || m.name?.slice(0, 2).toUpperCase() || 'U'}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{m.name}</strong>
                  <div className="text-soft" style={{ fontSize: '0.78rem' }}>{m.role || 'Member'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Discussions */}
      {activeTab === 'discussions' && (
        <div>
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Group Threads</h3>
            <Link to="/discussions" className="btn btn-primary btn-sm">+ Start Discussion</Link>
          </div>
          <div className="grid" style={{ gap: '16px' }}>
            {discussions.map((d) => (
              <div key={d.id} className="card" style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0' }}><Link to={`/discussions/${d.id}`}>{d.title}</Link></h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{d.snippet || d.content?.slice(0, 100)}...</p>
                <span className="text-soft" style={{ fontSize: '0.75rem' }}>{d.repliesCount || 0} replies · Active 2 hours ago</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Events */}
      {activeTab === 'events' && (
        <div>
          <div className="flex-between mb-30">
            <h3 style={{ margin: 0 }}>Gatherings for {group.name}</h3>
            <Link to="/events" className="btn btn-primary btn-sm">+ Schedule Gathering</Link>
          </div>
          <div className="grid" style={{ gap: '16px' }}>
            {events.map((e) => {
              const evTrack = BookClubStore.getTrackingStatus('event', e.id);
              return (
                <div key={e.id} className="event-row card" style={{ padding: '16px' }}>
                  <div className="event-date-badge">
                    <span className="mon">{e.month}</span>
                    <span className="day">{e.day}</span>
                  </div>
                  <div className="event-body" style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0' }}><Link to={`/events/${e.id}`}>{e.title}</Link></h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>🕒 {e.time} · 👥 {e.participants} attending · 📍 {e.location || 'Online Salon'}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        className={`btn btn-xs ${evTrack.whatsapp ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', borderColor: '#25D366', color: evTrack.whatsapp ? '#fff' : '#128C7E' }}
                        onClick={() => handleTrackWhatsApp(e)}
                      >
                        {evTrack.whatsapp ? '✓ WhatsApp Active' : '📲 WhatsApp'}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs ${evTrack.email ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedEventForTrack(e);
                          setTrackModalMode('email');
                          setShowTrackModal(true);
                        }}
                      >
                        {evTrack.email ? '✓ Email Active' : '✉️ Email'}
                      </button>
                    </div>
                  </div>
                  <Link to={`/events/${e.id}`} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>RSVP</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Progress */}
      {activeTab === 'progress' && (
        <div className="card panel">
          <h3 style={{ marginBottom: '16px' }}>Reading Pace of Group Members</h3>
          <p className="text-soft" style={{ marginBottom: '20px' }}>Current target: Chapter 14 (Page 180 of {curBook.title})</p>
          {(group.members || []).map((m, idx) => {
            const p = m.progress || Math.floor(Math.random() * 60 + 30);
            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>{m.name}</span>
                  <strong>{p}%</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${p}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: Polls */}
      {activeTab === 'polls' && (
        <div>
          <h3 style={{ marginBottom: '20px' }}>Active Circle Polls</h3>
          {(group.polls || [
            {
              id: 1,
              question: 'Which book should we read next month?',
              options: [
                { text: "Winter's Ledger by Colin Reyes", votes: 8 },
                { text: 'Salt & Story by Priya Nandan', votes: 5 },
                { text: 'Paper Lanterns by Wren Achebe', votes: 4 }
              ]
            }
          ]).map((poll) => (
            <div key={poll.id} className="card panel mb-30">
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>🗳️ {poll.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {poll.options.map((opt, oIdx) => (
                  <div key={oIdx} className="card" style={{ padding: '14px', background: 'var(--cream-deep)' }}>
                    <div className="flex-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{opt.text}</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => handleVote(poll.id, oIdx)}
                      >
                        Vote ({opt.votes})
                      </button>
                    </div>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, opt.votes * 10)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GATHERING & EVENT TRACKING MODAL WITH AMAZON-STYLE HOST WHATSAPP DISPATCH */}
      {showTrackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: trackModalMode === 'whatsapp' ? '560px' : '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', padding: '24px', borderRadius: '14px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
            
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>
                  {trackModalMode === 'whatsapp' ? '📲' : trackModalMode === 'email' ? '✉️' : '🎉'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {trackModalMode === 'whatsapp'
                    ? 'Automated WhatsApp Host Notification (Group Broadcast)'
                    : trackModalMode === 'email'
                    ? `Track via Email: ${selectedEventForTrack ? selectedEventForTrack.title : group.name}`
                    : `Track Gathering: ${group.name}`}
                </h3>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTrackModal(false)} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
            </div>

            <div style={{ background: 'var(--cream-deep)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem', lineHeight: 1.6, border: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 700, color: 'var(--brown-deep)', marginBottom: '4px' }}>
                {selectedEventForTrack ? selectedEventForTrack.title : `${group.name} — Gathering`}
              </div>
              <div>🗓️ <strong>Schedule:</strong> {selectedEventForTrack ? `${selectedEventForTrack.month} ${selectedEventForTrack.day} at ${selectedEventForTrack.time}` : `${group.schedule || 'Every Saturday'} at 5:00 PM`}</div>
              <div>📍 <strong>Location:</strong> {selectedEventForTrack ? (selectedEventForTrack.location || 'Online Salon') : (group.location || 'Community Library Hall, Room 2 & Online')}</div>
              <div>👤 <strong>Group Host:</strong> <span style={{ color: '#166534', fontWeight: 600 }}>{group.organizer || 'Aditi Krishnan'}</span></div>
              <div>📖 <strong>Current Book:</strong> {curBook.title}</div>
              <div>🎯 <strong>Milestone Target:</strong> Chapters 12–15 before Saturday session</div>
            </div>

            {/* MODE 1: CHOICE SELECTION */}
            {trackModalMode === 'choice' ? (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '16px' }}>
                  Choose your preferred channel to receive automated gathering reminders, schedule updates, and exclusive host reading offers:
                </p>

                {/* WhatsApp Highlight Box */}
                <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '1.8rem' }}>📦</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong style={{ color: '#166534', display: 'block' }}>Amazon-Style WhatsApp Group Broadcast</strong>
                    <span style={{ color: '#15803D' }}>
                      Host <strong>{group.organizer || 'Host'}</strong> sends automated WhatsApp gathering countdowns, venue links, and exclusive +150 XP bonus vouchers to all group members.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTrackModal(false)}>
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 600 }}
                    onClick={() => {
                      setTrackModalMode('whatsapp');
                      setBroadcastScope('group');
                      const roster = getGroupMembersRoster(group);
                      setSelectedMemberNames(roster.map(m => m.name));
                      setDispatchDone(false);
                      setDispatchLogs([]);
                      setIsDispatching(false);
                    }}
                  >
                    📲 Track on WhatsApp (Group Broadcast)
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setTrackModalMode('email')}
                  >
                    ✉️ Track via Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDownloadICS(selectedEventForTrack)}
                  >
                    📅 .ics Calendar
                  </button>
                </div>
              </div>
            ) : trackModalMode === 'whatsapp' ? (
              <div>
                {/* Host Info Header */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                    {(group.organizer || 'H').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Host: {group.organizer || 'Aditi Krishnan'}</span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px' }}>Verified Host</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Automated Amazon-style gathering alert & exclusive book offer dispatcher for all group members
                    </div>
                  </div>
                </div>

                {/* Scope Selector Tabs */}
                <div style={{ display: 'flex', gap: '6px', background: 'var(--cream-deep)', padding: '4px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    onClick={() => { setBroadcastScope('group'); setDispatchDone(false); }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: broadcastScope === 'group' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      background: broadcastScope === 'group' ? '#25D366' : 'transparent',
                      color: broadcastScope === 'group' ? '#fff' : 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    👥 Group of Members ({getGroupMembersRoster(group).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBroadcastScope('channel'); setDispatchDone(false); }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: broadcastScope === 'channel' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      background: broadcastScope === 'channel' ? '#25D366' : 'transparent',
                      color: broadcastScope === 'channel' ? '#fff' : 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    💬 Group Chat Room
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBroadcastScope('single'); setDispatchDone(false); }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: broadcastScope === 'single' ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      background: broadcastScope === 'single' ? '#25D366' : 'transparent',
                      color: broadcastScope === 'single' ? '#fff' : 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    👤 Single Member
                  </button>
                </div>

                {/* SCOPE A: GROUP OF MEMBERS (AUTOMATED BATCH DISPATCH) */}
                {broadcastScope === 'group' && (
                  <div>
                    {/* Dispatch In-Progress or Done Banner */}
                    {isDispatching && (
                      <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: '8px', padding: '12px', marginBottom: '14px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.9rem', marginBottom: '4px' }}>
                          ⚡ Automated WhatsApp dispatch in progress to group members...
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
                          Delivering Amazon-style gathering alert & offer voucher to {dispatchLogs.length} of {selectedMemberNames.length} members
                        </div>
                        <div className="progress-track" style={{ height: '6px', marginTop: '8px' }}>
                          <div className="progress-fill" style={{ width: `${Math.round((dispatchLogs.length / Math.max(1, selectedMemberNames.length)) * 100)}%`, background: '#25D366' }}></div>
                        </div>
                      </div>
                    )}

                    {dispatchDone && (
                      <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span>✅</span>
                          <span>Automated Group WhatsApp Messages Delivered Successfully!</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                          All {dispatchLogs.length} group members received their personalized session alert and exclusive +150 XP bonus voucher.
                        </div>
                      </div>
                    )}

                    {/* Member Selection Roster */}
                    <div style={{ marginBottom: '14px' }}>
                      <div className="flex-between" style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                          <input
                            type="checkbox"
                            checked={selectedMemberNames.length === getGroupMembersRoster(group).length}
                            onChange={(e) => {
                              const roster = getGroupMembersRoster(group);
                              setSelectedMemberNames(e.target.checked ? roster.map(m => m.name) : []);
                            }}
                            style={{ accentColor: '#25D366' }}
                          />
                          <span>Select All Group Members ({getGroupMembersRoster(group).length})</span>
                        </label>
                        <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                          {selectedMemberNames.length} of {getGroupMembersRoster(group).length} Selected
                        </span>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)', padding: '6px' }}>
                        {getGroupMembersRoster(group).map((member) => {
                          const isSelected = selectedMemberNames.includes(member.name);
                          const isDelivered = dispatchLogs.some(l => l.name === member.name);
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                if (isDispatching) return;
                                setSelectedMemberNames(prev =>
                                  prev.includes(member.name)
                                    ? prev.filter(n => n !== member.name)
                                    : [...prev, member.name]
                                );
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: isSelected ? 'var(--cream-deep)' : 'transparent',
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                marginBottom: '2px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  style={{ accentColor: '#25D366' }}
                                />
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                  {member.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--ink)' }}>
                                    {member.name}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                                    {member.role} · {member.phone}
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                background: isDelivered ? '#DCFCE7' : isSelected ? '#EFF6FF' : 'var(--cream)',
                                color: isDelivered ? '#166534' : isSelected ? '#1D4ED8' : 'var(--ink-soft)'
                              }}>
                                {isDelivered ? 'Delivered ✓' : member.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Offer Toggle */}
                    <div style={{ marginBottom: '14px', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#92400E' }}>
                        <input
                          type="checkbox"
                          checked={includeOfferBonus}
                          onChange={(e) => setIncludeOfferBonus(e.target.checked)}
                          style={{ accentColor: '#D97706', width: '16px', height: '16px' }}
                        />
                        <span>Include Group Event Offer (+150 Bonus XP & Verified Reader Badge for each member)</span>
                      </label>
                      <p style={{ margin: '4px 0 0 24px', fontSize: '0.76rem', color: '#B45309' }}>
                        Each attending group member automatically receives a verified discussion pass and XP multiplier.
                      </p>
                    </div>

                    {/* Live Preview (Formatted for Group of Members) */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Automated WhatsApp Message Preview (To All {selectedMemberNames.length} Group Members):
                      </div>
                      <div style={{ background: '#DCF8C6', color: '#075E54', padding: '12px 14px', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'monospace, sans-serif', border: '1px solid #C4E9B3', lineHeight: 1.55 }}>
                        <div style={{ fontWeight: 800, color: '#128C7E', marginBottom: '4px' }}>📦 BOOK FORGE | OFFICIAL GROUP GATHERING BROADCAST</div>
                        <div>👑 Host Dispatcher: <strong>{group.organizer || 'Aditi Krishnan'}</strong></div>
                        <div>👥 Target: <strong>All {selectedMemberNames.length} Confirmed Group Members</strong></div>
                        <div style={{ fontSize: '0.76rem', color: '#15803D', margin: '2px 0 6px 0' }}>
                          Recipients: {selectedMemberNames.slice(0, 4).join(', ')}{selectedMemberNames.length > 4 ? ` +${selectedMemberNames.length - 4} more` : ''}
                        </div>
                        <div>Hello readers! 👋 Your reading circle is gathering soon:</div>
                        <div>📚 <strong>Circle:</strong> {group.name} — {selectedEventForTrack ? selectedEventForTrack.title : 'Weekly Salon'}</div>
                        <div>🗓️ <strong>Gathering:</strong> {selectedEventForTrack ? `${selectedEventForTrack.month} ${selectedEventForTrack.day} at ${selectedEventForTrack.time}` : `${group.schedule || 'Every Saturday'} at 5:00 PM`}</div>
                        <div>📍 <strong>Venue:</strong> {selectedEventForTrack ? (selectedEventForTrack.location || 'Online Salon') : (group.location || 'Community Library Hall & Online')}</div>
                        {includeOfferBonus && (
                          <div style={{ margin: '6px 0', padding: '4px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', color: '#B45309', fontWeight: 700 }}>
                            🎁 GROUP OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member!
                          </div>
                        )}
                        <div style={{ fontSize: '0.74rem', color: '#0F5132', marginTop: '4px' }}>🔖 Batch ID: BF-GRP-{group.id}-{Date.now().toString().slice(-4)}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setTrackModalMode('choice')}>
                        ← Back
                      </button>

                      {dispatchDone && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ background: '#128C7E', borderColor: '#128C7E', color: '#fff', fontWeight: 600 }}
                          onClick={() => handleConfirmChannelWhatsApp(selectedEventForTrack)}
                        >
                          💬 Open Group WhatsApp Chat
                        </button>
                      )}

                      {!dispatchDone ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isDispatching || selectedMemberNames.length === 0}
                          style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700 }}
                          onClick={() => handleConfirmGroupBroadcast(selectedEventForTrack)}
                        >
                          {isDispatching
                            ? `⚡ Dispatching (${dispatchLogs.length}/${selectedMemberNames.length})...`
                            : `🚀 Broadcast Automated Alert to Group (${selectedMemberNames.length} Members)`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ background: '#166534', borderColor: '#166534', color: '#fff', fontWeight: 700 }}
                          onClick={() => setShowTrackModal(false)}
                        >
                          ✅ Done
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* SCOPE B: GROUP WHATSAPP COMMUNITY CHAT */}
                {broadcastScope === 'channel' && (
                  <div>
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', color: '#166534' }}>
                      💬 <strong>Official Group WhatsApp Chat Room Broadcast:</strong> Post an automated announcement and offer pass directly to the group discussion channel where all members participate.
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Message to Group WhatsApp Room:
                      </div>
                      <div style={{ background: '#DCF8C6', color: '#075E54', padding: '12px 14px', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'monospace, sans-serif', border: '1px solid #C4E9B3', lineHeight: 1.55 }}>
                        <div style={{ fontWeight: 800, color: '#128C7E', marginBottom: '4px' }}>📢 {group.name} · OFFICIAL GATHERING NOTIFICATION</div>
                        <div>Host: <strong>{group.organizer || 'Aditi Krishnan'}</strong></div>
                        <div>Attention all circle members! Our next session is scheduled:</div>
                        <div>🗓️ <strong>{selectedEventForTrack ? `${selectedEventForTrack.month} ${selectedEventForTrack.day} at ${selectedEventForTrack.time}` : `${group.schedule || 'Every Saturday'} at 5:00 PM`}</strong></div>
                        <div>📍 <strong>{selectedEventForTrack ? (selectedEventForTrack.location || 'Online Salon') : (group.location || 'Community Library Hall & Online')}</strong></div>
                        <div style={{ margin: '6px 0', padding: '4px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', color: '#B45309', fontWeight: 700 }}>
                          🎁 ALL MEMBERS OFFER: +150 Bonus XP, Chapter Badge & Early RSVP Pass
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setBroadcastScope('group')}>
                        ← Back to Members
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700 }}
                        onClick={() => handleConfirmChannelWhatsApp(selectedEventForTrack)}
                      >
                        💬 Post Automated Alert to Group WhatsApp Chat
                      </button>
                    </div>
                  </div>
                )}

                {/* SCOPE C: SINGLE MEMBER DIRECT ALERT */}
                {broadcastScope === 'single' && (
                  <div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                        Recipient WhatsApp Mobile Number:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={whatsAppCountryCode}
                          onChange={(e) => setWhatsAppCountryCode(e.target.value)}
                          style={{ padding: '9px 10px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--surface)', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <option value="+91">🇮🇳 +91 (India)</option>
                          <option value="+1">🇺🇸 +1 (US/CA)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                          <option value="+971">🇦🇪 +971 (UAE)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                        </select>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="9876543210"
                          value={whatsAppPhoneInput}
                          onChange={(e) => setWhatsAppPhoneInput(e.target.value)}
                          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setBroadcastScope('group')}>
                        ← Back to Group of Members
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 700 }}
                        onClick={() => handleConfirmSingleWhatsApp(selectedEventForTrack)}
                      >
                        ⚡ Send WhatsApp Alert to My Mobile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                    Email Address for Calendar Invite & Notifications:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <small className="text-soft" style={{ display: 'block', marginTop: '4px' }}>
                    We'll email you gathering details and download an .ics calendar invite.
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setTrackModalMode('choice')}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleTrackEmailSubmit(selectedEventForTrack)}>
                    Confirm & Send Invite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import BookClubStore from '../services/store';
import { useAuth } from '../context/AuthContext';

export default function Groups() {
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New group form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGenre, setNewGroupGenre] = useState('Fantasy');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupSchedule, setNewGroupSchedule] = useState('Every Sunday, 4:00 PM');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const allGroups = BookClubStore.getGroups();
  const userName = user?.name || 'Reader';

  let filtered = allGroups;
  if (activeTab === 'my-groups') {
    filtered = filtered.filter((g) => (g.members || []).some((m) => m.name === userName));
  } else if (activeTab === 'popular') {
    filtered = filtered.filter((g) => (g.membersCount || g.members?.length || 0) >= 16);
  } else if (activeTab === 'recommended') {
    filtered = filtered.filter((g) => g.genre === (user?.favoriteGenre || 'Fantasy'));
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.genre?.toLowerCase().includes(q)
    );
  }

  if (genreFilter !== 'all') {
    filtered = filtered.filter((g) => g.genre?.toLowerCase() === genreFilter.toLowerCase());
  }

  const [trackedGroupPrompt, setTrackedGroupPrompt] = useState(null);
  const [trackModalMode, setTrackModalMode] = useState('choice'); // 'choice' | 'whatsapp' | 'email'
  const [trackingEmailInput, setTrackingEmailInput] = useState('');
  const [whatsAppPhoneInput, setWhatsAppPhoneInput] = useState(user?.phone || '9876543210');
  const [whatsAppCountryCode, setWhatsAppCountryCode] = useState('+91');
  const [includeOfferBonus, setIncludeOfferBonus] = useState(true);

  // Group Multi-Member WhatsApp Broadcast State
  const [broadcastScope, setBroadcastScope] = useState('group'); // 'group' (all members) | 'channel' (chat room) | 'single' (individual)
  const [selectedMemberNames, setSelectedMemberNames] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [dispatchDone, setDispatchDone] = useState(false);

  // Helper to build group member list with simulated phone numbers
  const getGroupMembersRoster = (g) => {
    if (!g) return [];
    const host = g.organizerName || g.organizer || 'Aditi Krishnan';
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

  const handleJoinToggle = (groupId) => {
    const g = BookClubStore.getGroupById(groupId);
    const isMember = (g?.members || []).some((m) => m.name === userName);
    BookClubStore.joinGroup(groupId);
    if (!isMember && g) {
      showToast(`Joined ${g.name}! 🎉`);
      setTrackedGroupPrompt(g);
      setTrackModalMode('choice');
      setTrackingEmailInput('');
      setBroadcastScope('group');
      const roster = getGroupMembersRoster(g);
      setSelectedMemberNames(roster.map(m => m.name));
      setDispatchDone(false);
      setDispatchLogs([]);
      setIsDispatching(false);
    } else {
      showToast('Left group.');
    }
  };

  const openWhatsAppModalForGroup = (g) => {
    setTrackedGroupPrompt(g);
    setTrackModalMode('whatsapp');
    setBroadcastScope('group');
    const roster = getGroupMembersRoster(g);
    setSelectedMemberNames(roster.map(m => m.name));
    setDispatchDone(false);
    setDispatchLogs([]);
    setIsDispatching(false);
  };

  // Group of Members Automated Dispatch Handler
  const handleConfirmGroupBroadcast = async (g) => {
    if (!g) return;
    const roster = getGroupMembersRoster(g);
    const targetMembers = roster.filter(m => selectedMemberNames.includes(m.name));
    if (targetMembers.length === 0) {
      showToast('⚠️ Please select at least one group member.');
      return;
    }
    const hostName = g.organizerName || g.organizer || 'Aditi Krishnan';
    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member'
      : '';

    setIsDispatching(true);
    setDispatchDone(false);

    // Live stagger animation to simulate automated dispatch to group members
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

    // Call store group dispatch
    const groupResult = BookClubStore.dispatchGroupWhatsAppNotification(g.id, {
      hostName,
      members: targetMembers,
      offer: offerText,
      title: 'Weekly Salon'
    });

    setIsDispatching(false);
    setDispatchDone(true);
    showToast(`⚡ Automated WhatsApp broadcast delivered to all ${targetMembers.length} members of ${g.name}!`);
  };

  // Single Member Automated Dispatch Handler
  const handleConfirmSingleWhatsApp = (g) => {
    if (!g) return;
    const cleanDigits = whatsAppPhoneInput.replace(/\D/g, '');
    const fullPhone = `${whatsAppCountryCode}${cleanDigits}`;
    const hostName = g.organizerName || g.organizer || 'Aditi Krishnan';
    const curBook = BookClubStore.getBookById(g.currentBookId) || { title: 'The Silent Orchard', author: 'Elena Marsh' };

    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Verified Attendee Badge & Exclusive Discussion Guide'
      : '';

    const msg = BookClubStore.formatWhatsAppEventText({
      groupName: g.name,
      title: 'Weekly Salon',
      schedule: g.meetingSchedule || g.schedule || 'Every Saturday',
      time: '5:00 PM',
      location: g.location || 'Online Salon',
      bookTitle: curBook.title,
      bookAuthor: curBook.author,
      hostName: hostName,
      memberName: userName,
      offerText: offerText,
      url: `${window.location.origin}/groups/${g.id}`
    });

    BookClubStore.trackGatheringOrEvent({
      type: 'group',
      id: g.id,
      method: 'whatsapp',
      contact: fullPhone,
      details: { title: `${g.name} Gathering`, hostName, offerText }
    });

    BookClubStore.dispatchHostWhatsAppNotification(g.id, {
      hostName,
      memberName: userName,
      phone: fullPhone,
      offerText,
      customText: msg
    });

    BookClubStore.openWhatsAppTracker(msg, fullPhone);
    setTrackedGroupPrompt(null);
    showToast(`📲 Automated WhatsApp notification dispatched by Host ${hostName}!`);
  };

  // Channel / Community Automated Dispatch Handler
  const handleConfirmChannelWhatsApp = (g) => {
    if (!g) return;
    const hostName = g.organizerName || g.organizer || 'Aditi Krishnan';
    const roster = getGroupMembersRoster(g);
    const offerText = includeOfferBonus
      ? '🎁 GUILD GATHERING OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member'
      : '';

    const text = BookClubStore.formatGroupWhatsAppEventText({
      groupName: g.name,
      title: 'Weekly Salon',
      schedule: g.meetingSchedule || g.schedule || 'Every Saturday',
      time: '5:00 PM',
      location: g.location || 'Online Salon',
      hostName: hostName,
      membersList: roster.map(m => m.name),
      memberCount: roster.length,
      offer: offerText,
      url: `${window.location.origin}/groups/${g.id}`
    });

    BookClubStore.dispatchGroupWhatsAppNotification(g.id, {
      hostName,
      members: roster,
      offer: offerText,
      title: 'Weekly Salon'
    });

    BookClubStore.openWhatsAppTracker(text, '');
    setTrackedGroupPrompt(null);
    showToast(`💬 Automated message prepared for ${g.name} WhatsApp Group Chat!`);
  };

  const handleTrackEmail = (g) => {
    if (!g) return;
    const emailVal = trackingEmailInput.trim() || user?.email || 'reader@bookclub.com';
    BookClubStore.trackGatheringOrEvent({
      type: 'group',
      id: g.id,
      method: 'email',
      contact: emailVal,
      details: { title: `${g.name} Gathering` }
    });
    BookClubStore.downloadICSFile({
      title: `${g.name} Gathering`,
      description: `Reading Salon for ${g.name}`,
      location: g.location || 'Online Salon',
      filename: `${g.name}-gathering`
    });
    setTrackedGroupPrompt(null);
    showToast(`✉️ Gathering details & calendar invite sent to ${emailVal}!`);
  };

  const handleDownloadICS = (g) => {
    if (!g) return;
    BookClubStore.downloadICSFile({
      title: `${g.name} Gathering`,
      description: `Reading Salon for ${g.name}`,
      location: g.location || 'Online Salon',
      filename: `${g.name}-gathering`
    });
    showToast('📅 Calendar invite (.ics) downloaded!');
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    BookClubStore.createGroup({
      name: newGroupName,
      genre: newGroupGenre,
      description: newGroupDesc,
      schedule: newGroupSchedule,
      privacy: 'Public',
      activityLevel: 'Active',
      currentBookId: 1
    });
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    showToast('Reading group created successfully!');
  };

  return (
    <div>
      <Topbar
        title="Reading Circles & Groups"
        subtitle="Find your literary tribe — read chapters on schedule, share theories, and meet weekly."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            + Start Group
          </button>
        }
      />

      {toastMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>
          {toastMsg}
        </div>
      )}

      {/* TABS */}
      <div className="tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
        {[
          { id: 'discover', label: 'Discover Groups' },
          { id: 'my-groups', label: 'My Groups' },
          { id: 'popular', label: 'Popular Groups' },
          { id: 'recommended', label: 'Recommended For You' }
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

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <span>🔎</span>
          <input
            type="text"
            placeholder="Search groups by name, genre, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="all">All Genres</option>
          <option value="Mystery">Mystery</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Classic">Classic Literature</option>
          <option value="Non-Fiction">Non-Fiction</option>
        </select>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          + Create Reading Group
        </button>
      </div>

      {/* GROUPS GRID */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👥</div>
              <h3>No reading groups found</h3>
              <p className="text-soft">Try selecting a different filter or create your own book circle.</p>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>Create Group</button>
            </div>
          </div>
        ) : (
          filtered.map((g) => {
            const curBook = BookClubStore.getBookById(g.currentBookId) || { title: 'Selected Title', author: 'Author' };
            const isMember = (g.members || []).some((m) => m.name === userName);

            return (
              <div key={g.id} className="card group-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                <div>
                  <div className="flex-between mb-0" style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className="badge badge-active">{g.activityLevel || 'Active'}</span>
                      <span className="badge badge-member">{g.privacy || 'Public'}</span>
                    </div>
                    {BookClubStore.getTrackingStatus('group', g.id).whatsapp && (
                      <span className="badge" style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        🟢 Host Alerts Active
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.25rem' }}>
                    <Link to={`/groups/${g.id}`}>{g.name}</Link>
                  </h3>

                  <p className="group-current-book" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '10px' }}>
                    📖 Currently Reading: <Link to={`/books/${curBook.id || 1}`} style={{ textDecoration: 'underline', color: 'var(--clay)' }}>{curBook.title}</Link>
                  </p>

                  <p className="group-desc" style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--ink)' }}>
                    {g.description}
                  </p>

                  <div className="member-avatars" style={{ display: 'flex', gap: '4px', margin: '14px 0' }}>
                    {(g.members || []).slice(0, 5).map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--clay)',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}
                      >
                        {m.avatar || m.name?.slice(0, 2).toUpperCase() || 'U'}
                      </span>
                    ))}
                    {(g.membersCount || g.members?.length || 0) > 5 && (
                      <span style={{ fontSize: '0.75rem', alignSelf: 'center', marginLeft: '6px', color: 'var(--ink-soft)' }}>
                        +{(g.membersCount || g.members?.length || 0) - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="group-card-footer flex-between" style={{ borderTop: '1px solid var(--line)', paddingTop: '14px', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    👥 {g.membersCount || g.members?.length || 0} Members
                  </span>
                  <div className="flex gap-8" style={{ alignItems: 'center' }}>
                    {isMember && (
                      <button
                        type="button"
                        className="btn btn-xs"
                        style={{
                          background: BookClubStore.getTrackingStatus('group', g.id).whatsapp ? '#25D366' : 'transparent',
                          borderColor: '#25D366',
                          color: BookClubStore.getTrackingStatus('group', g.id).whatsapp ? '#fff' : '#128C7E',
                          padding: '4px 8px',
                          fontSize: '0.75rem'
                        }}
                        title="Configure WhatsApp Automated Alerts"
                        onClick={() => openWhatsAppModalForGroup(g)}
                      >
                        📲 {BookClubStore.getTrackingStatus('group', g.id).whatsapp ? 'WhatsApp Active' : 'WhatsApp Track'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn btn-sm ${isMember ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleJoinToggle(g.id)}
                    >
                      {isMember ? 'Leave Group' : 'Join Group'}
                    </button>
                    <Link to={`/groups/${g.id}`} className="btn btn-ghost btn-sm">Portal →</Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay show" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-head flex-between">
              <h3 style={{ margin: 0 }}>Start New Reading Circle</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateGroup} style={{ padding: '20px' }}>
              <div className="field">
                <label htmlFor="modalGroupName">Group Name</label>
                <input
                  type="text"
                  id="modalGroupName"
                  placeholder="e.g. Victorian Mystery Society"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="modalGroupGenre">Primary Genre</label>
                  <select id="modalGroupGenre" value={newGroupGenre} onChange={(e) => setNewGroupGenre(e.target.value)}>
                    <option value="Fiction">Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Classic">Classic Literature</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="modalGroupSchedule">Meeting Schedule</label>
                  <input
                    type="text"
                    id="modalGroupSchedule"
                    value={newGroupSchedule}
                    onChange={(e) => setNewGroupSchedule(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="modalGroupDesc">Description & Charter</label>
                <textarea
                  id="modalGroupDesc"
                  rows="3"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What kinds of books does this group explore? How often do you meet?"
                ></textarea>
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Circle 👥</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK JOIN / TRACKING DIALOG WITH AMAZON-STYLE HOST WHATSAPP DISPATCH */}
      {trackedGroupPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ maxWidth: trackModalMode === 'whatsapp' ? '560px' : '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', padding: '24px', borderRadius: '14px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)', border: '1px solid var(--line)' }}>
            
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>
                  {trackModalMode === 'whatsapp' ? '📲' : trackModalMode === 'email' ? '✉️' : '🎉'}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {trackModalMode === 'whatsapp'
                    ? 'Automated WhatsApp Host Notification'
                    : trackModalMode === 'email'
                    ? `Track via Email: ${trackedGroupPrompt.name}`
                    : `Joined ${trackedGroupPrompt.name}!`}
                </h3>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTrackedGroupPrompt(null)} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
            </div>

            {/* Gathering Overview Pill */}
            <div style={{ background: 'var(--cream-deep)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem', lineHeight: 1.6, border: '1px solid var(--line)' }}>
              <div>🗓️ <strong>Next Gathering:</strong> {trackedGroupPrompt.meetingSchedule || trackedGroupPrompt.schedule || 'Every Saturday'} at 5:00 PM</div>
              <div>📍 <strong>Location:</strong> {trackedGroupPrompt.location || 'Online Salon & Discussion Room'}</div>
              <div>👤 <strong>Group Host:</strong> <span style={{ color: '#166534', fontWeight: 600 }}>{trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'Rahul Thomas'}</span></div>
              <div>🎯 <strong>Focus:</strong> Group Reading & Chapter Milestone Discussion</div>
            </div>

            {/* MODE 1: CHOICE SELECTION */}
            {trackModalMode === 'choice' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Choose how you want to track upcoming gatherings, live schedule changes, and exclusive host reading offers:
                </p>

                {/* WhatsApp Highlight Box */}
                <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '1.8rem' }}>📦</div>
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong style={{ color: '#166534', display: 'block' }}>Amazon-Style WhatsApp Tracking</strong>
                    <span style={{ color: '#15803D' }}>
                      Host <strong>{trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'Organizer'}</strong> sends automated WhatsApp gathering alerts and +150 XP bonus event passes.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setTrackedGroupPrompt(null)}>
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', fontWeight: 600 }}
                    onClick={() => setTrackModalMode('whatsapp')}
                  >
                    📲 Track on WhatsApp
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
                    onClick={() => handleDownloadICS(trackedGroupPrompt)}
                  >
                    📅 .ics Calendar
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: WHATSAPP HOST DISPATCH (GROUP BROADCAST & SINGLE) */}
            {trackModalMode === 'whatsapp' && (
              <div>
                {/* Host Info Header */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                    {(trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'H').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Host: {trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'Aditi Krishnan'}</span>
                      <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Verified Host</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Automated Amazon-style gathering alert & multi-member group broadcast engine
                    </div>
                  </div>
                </div>

                {/* Broadcast Scope Selector */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'var(--cream-deep)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
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
                    👥 Group of Members ({getGroupMembersRoster(trackedGroupPrompt).length})
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
                            checked={selectedMemberNames.length === getGroupMembersRoster(trackedGroupPrompt).length}
                            onChange={(e) => {
                              const roster = getGroupMembersRoster(trackedGroupPrompt);
                              setSelectedMemberNames(e.target.checked ? roster.map(m => m.name) : []);
                            }}
                            style={{ accentColor: '#25D366' }}
                          />
                          <span>Select All Group Members ({getGroupMembersRoster(trackedGroupPrompt).length})</span>
                        </label>
                        <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                          {selectedMemberNames.length} of {getGroupMembersRoster(trackedGroupPrompt).length} Selected
                        </span>
                      </div>

                      <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)', padding: '6px' }}>
                        {getGroupMembersRoster(trackedGroupPrompt).map((member) => {
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
                        <div>👑 Host Dispatcher: <strong>{trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'Aditi Krishnan'}</strong></div>
                        <div>👥 Target: <strong>All {selectedMemberNames.length} Confirmed Group Members</strong></div>
                        <div style={{ fontSize: '0.76rem', color: '#15803D', margin: '2px 0 6px 0' }}>
                          Recipients: {selectedMemberNames.slice(0, 4).join(', ')}{selectedMemberNames.length > 4 ? ` +${selectedMemberNames.length - 4} more` : ''}
                        </div>
                        <div>Hello readers! 👋 Your reading circle is gathering soon:</div>
                        <div>📚 <strong>Circle:</strong> {trackedGroupPrompt.name} — Weekly Salon</div>
                        <div>🗓️ <strong>Gathering:</strong> {trackedGroupPrompt.meetingSchedule || trackedGroupPrompt.schedule || 'Every Saturday'} at 5:00 PM</div>
                        <div>📍 <strong>Venue:</strong> {trackedGroupPrompt.location || 'Community Library Hall & Online'}</div>
                        {includeOfferBonus && (
                          <div style={{ margin: '6px 0', padding: '4px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', color: '#B45309', fontWeight: 700 }}>
                            🎁 GROUP OFFER: +150 Bonus XP, Attendance Badge & Discussion Pass for each attending member!
                          </div>
                        )}
                        <div style={{ fontSize: '0.74rem', color: '#0F5132', marginTop: '4px' }}>🔖 Batch ID: BF-GRP-{trackedGroupPrompt.id}-{Date.now().toString().slice(-4)}</div>
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
                          onClick={() => handleConfirmChannelWhatsApp(trackedGroupPrompt)}
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
                          onClick={() => handleConfirmGroupBroadcast(trackedGroupPrompt)}
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
                          onClick={() => setTrackedGroupPrompt(null)}
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
                        <div style={{ fontWeight: 800, color: '#128C7E', marginBottom: '4px' }}>📢 {trackedGroupPrompt.name} · OFFICIAL GATHERING NOTIFICATION</div>
                        <div>Host: <strong>{trackedGroupPrompt.organizerName || trackedGroupPrompt.organizer || 'Aditi Krishnan'}</strong></div>
                        <div>Attention all circle members! Our next session is scheduled:</div>
                        <div>🗓️ <strong>{trackedGroupPrompt.meetingSchedule || trackedGroupPrompt.schedule || 'Every Saturday'} at 5:00 PM</strong></div>
                        <div>📍 <strong>{trackedGroupPrompt.location || 'Community Library Hall & Online'}</strong></div>
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
                        onClick={() => handleConfirmChannelWhatsApp(trackedGroupPrompt)}
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
                        onClick={() => handleConfirmSingleWhatsApp(trackedGroupPrompt)}
                      >
                        ⚡ Send WhatsApp Alert to My Mobile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: EMAIL TRACKING */}
            {trackModalMode === 'email' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--ink)' }}>
                    Email Address for Gathering & Calendar Invite:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.9rem' }}
                    placeholder="you@example.com"
                    value={trackingEmailInput}
                    onChange={(e) => setTrackingEmailInput(e.target.value)}
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: 'var(--ink-soft)', fontSize: '0.78rem' }}>
                    We'll email you gathering details and download an .ics calendar invite.
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setTrackModalMode('choice')}>
                    ← Back
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleTrackEmail(trackedGroupPrompt)}>
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

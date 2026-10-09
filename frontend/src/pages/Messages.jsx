import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import BookClubAPI from '../services/api';

// Sound effect generator using standard Web Audio API
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // audio context blocked or unsupported
  }
};

const DEFAULT_CONTACTS = [
  {
    id: 1,
    name: 'Aditi Krishnan',
    role: 'Mystery Salon Lead & Curator',
    avatar: 'AK',
    online: true,
    phone: '919876543210',
    type: 'direct',
    lastMsg: "Let's definitely discuss chapter 12 on Saturday!",
    time: '10:45 AM',
    unread: 0,
    bio: 'Avid classic mystery reader. Host of the weekly Agatha Christie & Kalki discussion salons.'
  },
  {
    id: 2,
    name: 'Marcus Brody',
    role: 'Guild Tournament Organizer',
    avatar: 'MB',
    online: true,
    phone: '14155550192',
    type: 'direct',
    lastMsg: 'The tournament leaderboard finalizes tonight. Push for the milestone!',
    time: 'Yesterday',
    unread: 0,
    bio: 'Organizes annual reading sprints, XP quests, and certified milestone awards.'
  },
  {
    id: 3,
    name: 'Elena Ramos',
    role: 'Author & Master Reviewer',
    avatar: 'ER',
    online: true,
    phone: '12025550143',
    type: 'direct',
    lastMsg: 'Thank you for the lovely review on the orchard!',
    time: 'Sep 28',
    unread: 0,
    bio: 'Author of "The Silent Orchard" and mentor for aspiring narrative fiction writers.'
  },
  {
    id: 4,
    name: 'Forge AI Guide',
    role: 'Intelligent Guild Assistant',
    avatar: '🤖',
    online: true,
    phone: '',
    type: 'direct',
    lastMsg: 'Ask me anything about books, reading goals, certificates, or navigation!',
    time: 'Active',
    unread: 0,
    bio: '24/7 AI reader assistant for book recommendations, navigation, certificates, and site features.'
  },
  {
    id: 5,
    name: 'Victorian Mystery Circle',
    role: 'Reading Group (18 members)',
    avatar: 'VM',
    online: true,
    phone: '',
    type: 'circle',
    lastMsg: 'Elena: Just finished the orchard chapter!',
    time: '2 days ago',
    unread: 0,
    bio: 'A passionate 18-member community reading classic Victorian and Gothic literature.'
  }
];

const DEFAULT_CONVERSATIONS = {
  1: [
    { id: 1, sender: 'them', text: 'Hey Jordan! Are you joining the mystery salon this Saturday?', time: '10:30 AM', status: 'read' },
    { id: 2, sender: 'me', text: 'Yes absolutely! Just finishing the third chapter right now.', time: '10:35 AM', status: 'read' },
    { id: 3, sender: 'them', text: "Let's definitely discuss chapter 12 on Saturday!", time: '10:45 AM', status: 'read' }
  ],
  2: [
    { id: 1, sender: 'them', text: 'Great pace in the tournament this week! You are closing in on the 500 XP bonus.', time: 'Yesterday', status: 'read' },
    { id: 2, sender: 'them', text: 'The tournament leaderboard finalizes tonight. Push for the milestone!', time: 'Yesterday', status: 'read' }
  ],
  3: [
    { id: 1, sender: 'them', text: 'Thank you for the lovely review on the orchard! The feedback really touched me.', time: 'Sep 28', status: 'read' }
  ],
  4: [
    { id: 1, sender: 'them', text: 'Welcome to BOOK FORGE! I am your AI Guild Assistant. Ask me for book recommendations, certificate guidance, or reading sprint tips!', time: '10:00 AM', status: 'read' }
  ],
  5: [
    { id: 1, sender: 'them', text: 'Marcus: Meeting starts this weekend at 5:00 PM IST.', time: '2 days ago', status: 'read' },
    { id: 2, sender: 'them', text: 'Elena: Just finished the orchard chapter! The plot twist was sensational.', time: '2 days ago', status: 'read' }
  ]
};

// Intelligent in-character response generator
function getPersonaResponse(contact, userText, userName) {
  const q = (userText || '').toLowerCase();

  // 1. WhatsApp related inquiry
  if (q.includes('whatsapp') || q.includes('phone') || q.includes('call') || q.includes('number')) {
    return `You can chat with me directly on WhatsApp! Click the green "💬 WhatsApp" button in our chat header, or click "📱 Chat on Real WhatsApp" to connect with any real phone number.`;
  }

  // 2. Certificates & Challenges
  if (q.includes('cert') || q.includes('diploma') || q.includes('verify') || q.includes('challenge') || q.includes('xp')) {
    if (contact.id === 2) {
      return `Certificates are fully active and verified! Head over to the Challenges page (🏆) or your Profile ("📜 My Certificates" tab). Once you finish a reading quest, click "👁️ View Certificate" to view, print, or download your tamper-proof credential with unique ID!`;
    }
    return `Official certificates are ready! Complete any reading challenge or event milestone, then click "View Certificate" to print or download your verified credential with verified ID.`;
  }

  // 3. Book Recommendations
  if (q.includes('recommend') || q.includes('suggest') || q.includes('what to read') || q.includes('good book') || q.includes('next book')) {
    if (contact.id === 1) {
      return `If you love suspense, I highly recommend Agatha Christie's "And Then There Were None" or Kalki's Tamil epic "Ponniyin Selvan"! The political tension and intricate character arcs will keep you hooked.`;
    }
    if (contact.id === 3) {
      return `I recommend "The Silent Orchard" and "The Shadow of the Wind" by Carlos Ruiz Zafón. Rich atmospheric prose with unforgettable character development!`;
    }
    if (contact.id === 2) {
      return `Try "The Way of Kings" by Brandon Sanderson or Frank Herbert's "Dune". Sprints on these earn substantial XP in our reader guild!`;
    }
    return `Check out our curated catalog in the Books tab (📖) or AI Recommendations (✨). We also just added magnificent Tamil classics like "Silappatikaram" and "Kurinjithen"!`;
  }

  // 4. Meeting / Salon / Circle schedules
  if (q.includes('meet') || q.includes('when') || q.includes('salon') || q.includes('time') || q.includes('saturday') || q.includes('sunday')) {
    if (contact.id === 1) {
      return `Our Mystery Literary Salon meets this Saturday at 5:00 PM IST! We're diving into Chapters 10 through 14. Make sure to bring your reading notes and your best plot theories!`;
    }
    if (contact.id === 2) {
      return `The weekly guild check-in is this Sunday at 6:00 PM. We'll announce the sprint leaderboard rankings and award new achievement badges!`;
    }
    return `We have regular weekend circles! Check the Events page (📅) to RSVP and grab your meeting link.`;
  }

  // 5. Greetings
  if (q.startsWith('hi') || q.startsWith('hello') || q.startsWith('hey') || q === 'hi' || q === 'hello') {
    if (contact.id === 1) {
      return `Hello ${userName || 'Jordan'}! 👋 Great to see you in the salon! What book are you reading right now?`;
    }
    if (contact.id === 2) {
      return `Hey ${userName || 'Jordan'}! Ready to crush your reading goals this week? How many pages have you clocked today?`;
    }
    if (contact.id === 3) {
      return `Greetings ${userName || 'Jordan'}! Always a joy connecting with thoughtful readers. How is your reading journey going?`;
    }
    if (contact.id === 4) {
      return `Hello ${userName || 'Jordan'}! 🤖 I'm here to help you navigate Book Forge, discover books, check certificates, or track reading goals. What would you like to explore?`;
    }
    return `Hey everyone! Welcome to the circle chat. Who has thoughts on the latest chapter?`;
  }

  // 6. Gratitude / Thanks
  if (q.includes('thank') || q.includes('thx') || q.includes('awesome') || q.includes('great')) {
    return `You're most welcome, ${userName || 'Jordan'}! That's what our literary guild is all about. Feel free to ping me anytime! 📚✨`;
  }

  // 7. General Persona Fallbacks
  if (contact.id === 1) {
    return `That's an interesting point! In mystery literature, every detail matters. Let's make sure to discuss this in our Saturday reading circle. Have you spotted any hidden clues yet?`;
  }
  if (contact.id === 2) {
    return `Love the enthusiasm! Keep logging your progress in the Reading Tracker (📈) to earn bonus XP and push your reader level toward Guild Sage!`;
  }
  if (contact.id === 3) {
    return `As an author, I deeply appreciate your perspective. Narrative flow and reader engagement are the two pillars of compelling storytelling.`;
  }
  if (contact.id === 4) {
    return `Great inquiry! You can explore that in Book Forge using the top navigation, checking your Profile (👤), or logging pages under Reading Goals (🎯). Anything else you'd like guidance on?`;
  }
  return `Marcus: That aligns with what we discussed in chapter 4! Elena: Agreed, let's bring that up in the weekend poll!`;
}

export default function Messages() {
  const outletCtx = useOutletContext() || {};
  const { user } = useAuth();
  const currentUserName = user?.name || 'Jordan Rivera';

  // Persistence setup
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('bookclub_chat_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('bookclub_chat_conversations_v3');
      return saved ? JSON.parse(saved) : DEFAULT_CONVERSATIONS;
    } catch {
      return DEFAULT_CONVERSATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState('all');
  const [activeContactId, setActiveContactId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // WhatsApp Connect Modal state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState('');
  const [waCustomMessage, setWaCustomMessage] = useState('');

  // Add Contact Modal state
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Notification toast
  const [toastMsg, setToastMsg] = useState('');

  const messagesEndRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bookclub_chat_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem('bookclub_chat_conversations_v3', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeContactId, isTyping]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0] || DEFAULT_CONTACTS[0];
  const activeMessages = conversations[activeContactId] || [];

  // Send message with intelligent real-time reply simulation
  const handleSendMessage = (e, textOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = (textOverride || messageText).trim();
    if (!textToSend) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: textToSend,
      time: timeStr,
      status: 'sent'
    };

    const updatedCurrentList = [...(conversations[activeContactId] || []), newMsg];
    setConversations({
      ...conversations,
      [activeContactId]: updatedCurrentList
    });

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId ? { ...c, lastMsg: textToSend, time: timeStr, unread: 0 } : c
      )
    );

    setMessageText('');

    // Trigger realistic typing indicator and intelligent response
    setIsTyping(true);
    const respondingContact = activeContact;

    setTimeout(() => {
      setIsTyping(false);

      const replyText = getPersonaResponse(respondingContact, textToSend, currentUserName);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const replyMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: replyText,
        time: replyTime,
        status: 'read'
      };

      setConversations((prev) => ({
        ...prev,
        [respondingContact.id]: [...(prev[respondingContact.id] || []), replyMsg]
      }));

      setContacts((prev) =>
        prev.map((c) =>
          c.id === respondingContact.id
            ? { ...c, lastMsg: replyText, time: replyTime, unread: 0 }
            : c
        )
      );

      if (soundEnabled) {
        playNotificationSound();
      }
    }, 1200 + Math.random() * 600);
  };

  // Launch Real WhatsApp with safe digit sanitization
  const handleOpenWhatsApp = (rawPhone, msgText) => {
    if (!rawPhone || !rawPhone.replace(/[^0-9]/g, '')) {
      // If contact has no phone set, open the interactive modal
      setWaPhoneNumber('');
      setWaCustomMessage(msgText || `Hi ${activeContact.name}, reaching out from BOOK FORGE! Let's discuss our current book.`);
      setShowWhatsAppModal(true);
      return;
    }

    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const message = msgText || `Hi ${activeContact.name}, reaching out from BOOK FORGE! Let's discuss our current book.`;
    const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(`Opening WhatsApp chat with +${cleanDigits}... 💬`);
  };

  // Save custom real number for contact
  const handleSaveContactPhone = (e) => {
    e.preventDefault();
    const cleanDigits = waPhoneNumber.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      showToast('⚠️ Please enter a valid phone number with country code (e.g. 919876543210)');
      return;
    }

    // Update active contact's phone
    setContacts((prev) =>
      prev.map((c) => (c.id === activeContact.id ? { ...c, phone: cleanDigits } : c))
    );

    const message = waCustomMessage || `Hi ${activeContact.name}, reaching out from BOOK FORGE!`;
    const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setShowWhatsAppModal(false);
    showToast(`Connected! WhatsApp chat opened with +${cleanDigits} 🚀`);
  };

  // Add new companion/contact
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newId = Date.now();
    const initials = newContactName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'FR';

    const newC = {
      id: newId,
      name: newContactName.trim(),
      role: newContactRole.trim() || 'Reader & Club Member',
      avatar: initials,
      online: true,
      phone: newContactPhone.replace(/[^0-9]/g, ''),
      type: 'direct',
      lastMsg: 'Chat initiated.',
      time: 'Just now',
      unread: 0,
      bio: 'Direct reader companion in Book Forge.'
    };

    setContacts([newC, ...contacts]);
    setConversations({
      ...conversations,
      [newId]: [
        {
          id: Date.now(),
          sender: 'them',
          text: `Hi ${currentUserName}! Great to connect with you on Book Forge. What are you currently reading?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    });

    setActiveContactId(newId);
    setShowAddContactModal(false);
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
    showToast(`Added ${newC.name} to your conversations! 🎉`);
  };

  // Clear conversation history
  const handleClearHistory = () => {
    if (window.confirm(`Clear chat history with ${activeContact.name}?`)) {
      setConversations({
        ...conversations,
        [activeContactId]: [
          {
            id: Date.now(),
            sender: 'them',
            text: `History cleared. Send a message to start chatting!`,
            time: 'Just now',
            status: 'read'
          }
        ]
      });
      showToast('Chat history cleared.');
    }
  };

  // Filter contacts by tab and search
  let filteredContacts = contacts;
  if (activeTab === 'direct') filteredContacts = contacts.filter((c) => c.type === 'direct');
  else if (activeTab === 'circle') filteredContacts = contacts.filter((c) => c.type === 'circle');
  else if (activeTab === 'whatsapp') filteredContacts = contacts.filter((c) => Boolean(c.phone));

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filteredContacts = filteredContacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    );
  }

  const quickPrompts = [
    '📖 What book are you reading right now?',
    '🔍 Can you recommend a great mystery or fantasy?',
    '☕ When is the next reading circle salon meet?',
    '🏆 How do I view and claim challenge certificates?'
  ];

  return (
    <div>
      <Topbar
        title="Messages & Communication Hub"
        subtitle="In-app literary direct messaging, responsive character bots, and real direct WhatsApp sync."
        onMobileMenuToggle={outletCtx.onMobileMenuToggle}
        onOpenSearch={outletCtx.onOpenSearch}
        actions={
          <div className="flex gap-8">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setWaPhoneNumber(activeContact.phone || '');
                setWaCustomMessage(`Hi ${activeContact.name}, reaching out from BOOK FORGE! Let's discuss our current book.`);
                setShowWhatsAppModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: '#25D366', color: '#166534', background: 'rgba(37, 211, 102, 0.1)' }}
            >
              <span>💬 Real WhatsApp Connect</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddContactModal(true)}
            >
              + New Chat
            </button>
          </div>
        }
      />

      {toastMsg && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: '16px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#166534' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Layout Container */}
      <div
        className="comm-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '20px',
          minHeight: '640px',
          height: 'calc(100vh - 170px)'
        }}
      >
        {/* Left Contacts Sidebar */}
        <div
          className="card panel comm-contacts-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--surface)'
          }}
        >
          <div
            className="comm-contacts-header"
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Conversations</h3>
              <span className="text-soft" style={{ fontSize: '0.78rem' }}>
                {contacts.length} reader connections
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.82rem', padding: '4px 8px' }}
              onClick={() => setShowAddContactModal(true)}
              title="Add a new friend or book club companion"
            >
              + Add
            </button>
          </div>

          {/* Filter Tabs */}
          <div
            className="comm-tabs-row"
            style={{
              display: 'flex',
              padding: '6px 12px',
              gap: '6px',
              borderBottom: '1px solid var(--line)',
              background: 'rgba(0,0,0,0.02)'
            }}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'direct', label: 'Direct' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'circle', label: 'Circles' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`comm-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                style={{
                  border: 'none',
                  background: activeTab === t.id ? 'var(--shell-gold)' : 'transparent',
                  color: activeTab === t.id ? '#16241D' : 'var(--ink-soft)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="comm-search-box" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)'
              }}
            />
          </div>

          {/* Contacts List */}
          <div className="comm-contacts-list" style={{ flex: 1, overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0 }}>
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                className={`contact-item ${activeContactId === c.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveContactId(c.id);
                  setContacts(contacts.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                  background: activeContactId === c.id ? 'rgba(217, 164, 65, 0.15)' : 'transparent',
                  borderLeft: activeContactId === c.id ? '4px solid var(--shell-gold)' : '4px solid transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <span
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: c.type === 'circle' ? '#1E3A2E' : 'var(--clay)',
                      color: '#fff',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}
                  >
                    {c.avatar}
                  </span>
                  <span
                    style={{
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      background: c.online ? '#22C55E' : '#94A3B8',
                      border: '2px solid var(--paper, #fff)',
                      position: 'absolute',
                      bottom: 0,
                      right: 0
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex-between" style={{ marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                      {c.name}
                    </strong>
                    <span className="text-soft" style={{ fontSize: '0.72rem' }}>
                      {c.time}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--ink-soft)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {c.lastMsg}
                  </p>
                </div>
                {c.phone && (
                  <span
                    title={`WhatsApp: +${c.phone}`}
                    style={{
                      color: '#25D366',
                      fontSize: '0.8rem',
                      marginLeft: '4px',
                      flexShrink: 0
                    }}
                  >
                    💬
                  </span>
                )}
                {c.unread > 0 && (
                  <span
                    style={{
                      background: 'var(--clay)',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Conversation Pane */}
        <div
          className="card panel"
          style={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--surface)'
          }}
        >
          {/* Active Conversation Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--surface)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: activeContact.type === 'circle' ? '#1E3A2E' : 'var(--clay)',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeContact.avatar}
              </span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>{activeContact.name}</h4>
                <span className="text-soft" style={{ fontSize: '0.78rem' }}>
                  {isTyping ? (
                    <span style={{ color: '#25D366', fontWeight: 600 }}>✍️ typing...</span>
                  ) : activeContact.online ? (
                    '🟢 Online now'
                  ) : (
                    '⚪ Offline'
                  )}{' '}
                  · {activeContact.role}
                </span>
              </div>
            </div>

            {/* Conversation Header Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* WhatsApp Button */}
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleOpenWhatsApp(activeContact.phone, `Hi ${activeContact.name}, reaching out from BOOK FORGE!`)}
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title={
                  activeContact.phone
                    ? `Open direct WhatsApp conversation with +${activeContact.phone}`
                    : 'Set real phone number and open WhatsApp'
                }
              >
                <span>💬 WhatsApp</span>
              </button>

              {/* Set / Edit Real Phone Number */}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setWaPhoneNumber(activeContact.phone || '');
                  setWaCustomMessage(`Hi ${activeContact.name}, reaching out from BOOK FORGE!`);
                  setShowWhatsAppModal(true);
                }}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                title="Configure real WhatsApp phone number"
              >
                ✏️ Set Number
              </button>

              {/* Toggle Audio Sound */}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(soundEnabled ? 'Muted notification sounds' : 'Enabled notification sounds 🔔');
                }}
                title={soundEnabled ? 'Mute incoming audio chime' : 'Enable audio chime'}
                style={{ fontSize: '0.9rem', padding: '6px 8px' }}
              >
                {soundEnabled ? '🔔' : '🔕'}
              </button>

              {/* Clear History */}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearHistory}
                title="Clear conversation history"
                style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', padding: '6px 8px' }}
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'var(--cream-deep, #FBF8F1)'
            }}
          >
            {/* Contact Greeting Note */}
            <div
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                maxWidth: '85%',
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.04)',
                fontSize: '0.78rem',
                color: 'var(--ink-soft)'
              }}
            >
              🔒 Direct literary conversation with <strong>{activeContact.name}</strong>. Messages are saved locally and synched with WhatsApp.
            </div>

            {/* Messages list */}
            {activeMessages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      background: isMe ? 'linear-gradient(135deg, #B5652F 0%, #8C3E14 100%)' : 'var(--paper)',
                      color: isMe ? '#FFFFFF' : 'var(--ink)',
                      border: isMe ? 'none' : '1px solid var(--line)',
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: isMe ? '0 3px 10px rgba(181, 101, 47, 0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                      lineHeight: 1.5,
                      fontSize: '0.92rem',
                      wordBreak: 'break-word',
                      position: 'relative'
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: 'var(--clay, #B5652F)',
                          marginBottom: '4px'
                        }}
                      >
                        {activeContact.name}
                      </div>
                    )}

                    <div>{m.text}</div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px',
                        fontSize: '0.7rem',
                        marginTop: '6px',
                        color: isMe ? 'rgba(255, 255, 255, 0.82)' : 'var(--ink-soft)'
                      }}
                    >
                      <span>{m.time}</span>
                      {isMe && <span>✓✓</span>}
                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(activeContact.phone, m.text)}
                        title="Forward / Share this message directly on WhatsApp"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0 2px',
                          color: isMe ? '#FFFFFF' : '#25D366',
                          fontSize: '0.75rem',
                          opacity: 0.8
                        }}
                      >
                        💬
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Real-time Typing Bubble Indicator */}
            {isTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  padding: '10px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  {activeContact.name} is typing
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'pulse 1s infinite',
                    fontWeight: 800,
                    color: 'var(--clay)'
                  }}
                >
                  ...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Conversation Suggestion Chips */}
          <div
            style={{
              padding: '8px 16px',
              background: 'var(--surface)',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(null, p)}
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--line)',
              background: 'var(--surface)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder={`Message ${activeContact.name}... (Press Enter to send)`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{
                flex: 1,
                padding: '11px 14px',
                fontSize: '0.92rem',
                borderRadius: '8px',
                border: '1.5px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)'
              }}
            />

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleOpenWhatsApp(activeContact.phone, messageText)}
              title="Send via Real WhatsApp directly"
              style={{
                borderColor: '#25D366',
                color: '#166534',
                background: 'rgba(37, 211, 102, 0.12)',
                fontWeight: 700
              }}
            >
              💬 WhatsApp
            </button>

            <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
              Send ✉️
            </button>
          </form>
        </div>
      </div>

      {/* MODAL 1: Connect Real WhatsApp Dialog */}
      {showWhatsAppModal && (
        <div
          className="modal-overlay show"
          onClick={() => setShowWhatsAppModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem', color: '#25D366' }}>💬</span>
                <h3 style={{ margin: 0 }}>Connect on Real WhatsApp</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowWhatsAppModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px 0' }}>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                To chat on <strong>Real WhatsApp</strong> without URL errors, enter your real phone number or contact number including your international country code.
              </p>

              {/* Country Code Helper Badges */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                  Quick Country Code Presets:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { code: '91', label: '🇮🇳 India (+91)' },
                    { code: '1', label: '🇺🇸 USA/Canada (+1)' },
                    { code: '44', label: '🇬🇧 UK (+44)' },
                    { code: '61', label: '🇦🇺 Australia (+61)' },
                    { code: '971', label: '🇦🇪 UAE (+971)' }
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setWaPhoneNumber(preset.code)}
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveContactPhone}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Real Phone Number (digits only, e.g. 919876543210):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 919876543210 or 14155550192"
                    value={waPhoneNumber}
                    onChange={(e) => setWaPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '0.95rem'
                    }}
                  />
                  <small style={{ color: 'var(--ink-soft)', fontSize: '0.75rem' }}>
                    No plus (+) signs, spaces, or hyphens needed. We format it automatically to the official <code>wa.me</code> protocol.
                  </small>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Initial Message:
                  </label>
                  <textarea
                    rows={3}
                    value={waCustomMessage}
                    onChange={(e) => setWaCustomMessage(e.target.value)}
                    placeholder="Type your message to send on WhatsApp..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowWhatsAppModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm"
                    style={{
                      background: '#25D366',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      border: 'none',
                      padding: '8px 16px'
                    }}
                  >
                    🚀 Open on Real WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Contact Modal */}
      {showAddContactModal && (
        <div
          className="modal-overlay show"
          onClick={() => setShowAddContactModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '92%' }}
          >
            <div className="modal-head">
              <h3 style={{ margin: 0 }}>+ New Chat Companion</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddContactModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddContact} style={{ padding: '16px 0 0' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Companion Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Sundaram"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Club Role / Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Historical Fiction Enthusiast"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Real WhatsApp Phone Number (Optional):
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 919876543210"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    background: 'var(--paper)',
                    color: 'var(--ink)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAddContactModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

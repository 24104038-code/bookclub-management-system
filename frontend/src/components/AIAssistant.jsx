import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BookClubAPI from '../services/api';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'bookforge_ai_history';

export default function AIAssistant({ onOpenEditProfile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        role: 'bot',
        content: `### 🤖 Welcome to BOOK FORGE Assistant!\n\nHello **${user?.name || 'Fellow Reader'}**! I am **Forge AI**, your intelligent guide.\n\nI can help you **view and customize your profile**, upload photos, track your reading progress, unlock **event certificates**, switch between Light/Dark themes and custom Color Palettes, and more!\n\nWhat would you like assistance with today?`,
        actions: [
          { label: '👤 View Profile', url: '/profile', icon: '👤' },
          { label: '✏️ Edit Profile', trigger: 'openEditProfile', icon: '✏️' },
          { label: '📜 My Certificates', url: '/profile#certificates', icon: '📜' }
        ],
        suggestions: [
          'How do I view and set my profile?',
          'How to upload a profile photo?',
          'Where do I find my certificates?',
          'How do I change the website theme?'
        ]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch (e) {}
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleAction = (act) => {
    if (act.trigger === 'openEditProfile') {
      setIsOpen(false);
      if (onOpenEditProfile) {
        onOpenEditProfile();
      } else {
        navigate('/profile?openEdit=true');
      }
      return;
    }
    if (act.url) {
      setIsOpen(false);
      navigate(act.url);
    }
  };

  const handleSend = async (text) => {
    const trimmed = (text || inputVal).trim();
    if (!trimmed || isGenerating) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);

    try {
      const res = await BookClubAPI.ai.chat({
        message: trimmed,
        history: messages.slice(-8),
        userContext: {
          name: user?.name,
          username: user?.username,
          role: user?.role,
          favoriteGenre: user?.favoriteGenre
        }
      });

      if (res && res.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            content: res.reply,
            actions: res.actions || [],
            suggestions: res.suggestions || [],
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error(res?.message || 'Failed to get answer');
      }
    } catch (err) {
      // Offline fallback
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: `### 🤖 Forge AI Guide\nTo view your profile, click **Profile (👤)** in the sidebar. To edit your name, bio, favorite genre, or upload a custom photo, click **"Edit Profile"** on that page!`,
          actions: [
            { label: '👤 Open Profile Page', url: '/profile', icon: '👤' },
            { label: '✏️ Edit Profile Now', trigger: 'openEditProfile', icon: '✏️' }
          ],
          suggestions: [
            'How to view and set my profile?',
            'How to upload a profile photo?',
            'Where do I view certificates?'
          ],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        role: 'bot',
        content: `### 🤖 Welcome to BOOK FORGE Assistant!\n\nHello **${user?.name || 'Fellow Reader'}**! How can I assist you with your reading journey, profile, certificates, or book goals today?`,
        actions: [
          { label: '👤 View Profile', url: '/profile', icon: '👤' },
          { label: '✏️ Edit Profile', trigger: 'openEditProfile', icon: '✏️' }
        ],
        suggestions: [
          'How do I view and set my profile?',
          'How to upload a profile photo?'
        ]
      }
    ]);
  };

  // Safe formatting helper for bold, lists, and headers
  const formatText = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
      if (line.startsWith('#### ')) return <h4 key={i}>{line.replace('#### ', '')}</h4>;
      if (line.startsWith('---')) return <hr key={i} />;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} style={{ marginLeft: '16px' }}>{line.slice(2)}</li>;
      }
      if (/^\d+\.\s+/.test(line)) {
        return <li key={i} style={{ marginLeft: '16px' }}>{line.replace(/^\d+\.\s+/, '')}</li>;
      }
      if (!line.trim()) return null;
      return <p key={i} style={{ margin: '4px 0' }}>{line}</p>;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="forge-ai-trigger"
          onClick={() => setIsOpen(true)}
          title="Ask Forge AI: Profile, Photos, Books & More"
          aria-label="Open Forge AI Assistant"
        >
          <span className="forge-ai-trigger-icon">🤖</span>
          <span className="forge-ai-trigger-label">Ask Forge AI</span>
          <span className="forge-ai-trigger-sparkle">✨</span>
        </button>
      )}

      {/* Flyout Chat Window */}
      <div className={`forge-ai-window ${isOpen ? 'open' : ''}`} role="dialog" aria-label="Forge AI Assistant">
        <div className="forge-ai-header">
          <div className="forge-ai-header-left">
            <div className="forge-ai-avatar">🤖</div>
            <div className="forge-ai-meta">
              <h3>Forge AI <span>✨</span></h3>
              <p><span className="forge-ai-status-dot"></span> Online • Intelligent Guide</p>
            </div>
          </div>
          <div className="forge-ai-header-actions">
            <button type="button" className="forge-ai-tool-btn" onClick={clearChat} title="Clear Conversation">🔄</button>
            <button type="button" className="forge-ai-tool-btn" onClick={() => setIsOpen(false)} title="Minimize Assistant">✕</button>
          </div>
        </div>

        {/* Quick Prompts Ribbon */}
        <div className="forge-ai-quick-prompts">
          <button type="button" className="forge-ai-quick-btn" onClick={() => handleSend('How to view and set my profile?')}>👤 View & Set Profile</button>
          <button type="button" className="forge-ai-quick-btn" onClick={() => handleSend('How do I change my profile photo?')}>📸 Change Photo</button>
          <button type="button" className="forge-ai-quick-btn" onClick={() => handleSend('Where do I view my certificates?')}>📜 Certificates</button>
          <button type="button" className="forge-ai-quick-btn" onClick={() => handleSend('How do I switch themes or change the color palette?')}>🎨 Color Themes</button>
          <button type="button" className="forge-ai-quick-btn" onClick={() => handleSend('How to set my annual reading goal?')}>🎯 Goals</button>
        </div>

        {/* Message Stream */}
        <div className="forge-ai-messages">
          {messages.map((m, idx) => {
            const isBot = m.role === 'bot';
            return (
              <div key={idx} className={`forge-ai-msg ${isBot ? 'bot' : 'user'}`}>
                <div className="forge-ai-msg-avatar">{isBot ? '🤖' : '👤'}</div>
                <div>
                  <div className="forge-ai-bubble">
                    {formatText(m.content)}

                    {isBot && m.actions && m.actions.length > 0 && (
                      <div className="forge-ai-actions">
                        {m.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            className="forge-ai-action-btn"
                            onClick={() => handleAction(act)}
                          >
                            {act.icon || '👉'} {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isBot && m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                    <div className="forge-ai-chips-wrap">
                      {m.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          className="forge-ai-chip"
                          onClick={() => handleSend(s)}
                        >
                          💬 {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="forge-ai-typing">
              <span className="forge-ai-typing-dot"></span>
              <span className="forge-ai-typing-dot"></span>
              <span className="forge-ai-typing-dot"></span>
              <span style={{ fontSize: '0.76rem', color: 'var(--ink-soft)', marginLeft: '6px' }}>Forge AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="forge-ai-footer">
          <form
            className="forge-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="forge-ai-input"
              placeholder="Ask me anything (e.g. 'how to view set profile')..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isGenerating}
            />
            <button type="submit" className="forge-ai-send-btn" disabled={!inputVal.trim() || isGenerating} title="Send">
              ➤
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

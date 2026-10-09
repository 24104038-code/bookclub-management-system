/**
 * =========================================================
 * BOOK FORGE — Forge AI Assistant Client (js/ai-assistant.js)
 * Intelligent, dynamic conversational AI assistant widget.
 * =========================================================
 */

const BookForgeAI = (function () {
  const STORAGE_KEY = 'bookforge_ai_history';
  let isOpen = false;
  let isGenerating = false;
  let messages = [];

  // Helper to escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  // Safe client-side markdown formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Horizontal dividers
    html = html.replace(/^---$/gim, '<hr>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid var(--clay); margin:6px 0; padding-left:10px; color:var(--ink-soft);">$1</blockquote>');

    // Ordered & Unordered lists
    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    const formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isBullet = line.startsWith('- ') || line.startsWith('* ');
      const isNumbered = /^\d+\.\s+/.test(line);

      if (isBullet || isNumbered) {
        const currentType = isBullet ? 'ul' : 'ol';
        if (!inList) {
          inList = true;
          listType = currentType;
          formattedLines.push(`<${listType}>`);
        } else if (listType !== currentType) {
          formattedLines.push(`</${listType}>`);
          listType = currentType;
          formattedLines.push(`<${listType}>`);
        }
        const itemContent = isBullet ? line.substring(2) : line.replace(/^\d+\.\s+/, '');
        formattedLines.push(`<li>${itemContent}</li>`);
      } else {
        if (inList) {
          formattedLines.push(`</${listType}>`);
          inList = false;
        }
        if (line.length > 0) {
          // If not a heading or tag, wrap in p
          if (!line.startsWith('<h') && !line.startsWith('<hr') && !line.startsWith('<blockquote')) {
            formattedLines.push(`<p>${line}</p>`);
          } else {
            formattedLines.push(line);
          }
        }
      }
    }
    if (inList) {
      formattedLines.push(`</${listType}>`);
    }

    return formattedLines.join('');
  }

  // Current user context
  function getUserContext() {
    if (typeof BookClubAuth !== 'undefined') {
      const u = BookClubAuth.getCurrentUser();
      if (u) {
        return {
          name: u.name,
          username: u.username,
          role: u.role,
          favoriteGenre: u.favoriteGenre,
          bio: u.bio
        };
      }
    }
    return { name: 'Reader', role: 'user', username: 'reader' };
  }

  // Load chat history from localStorage
  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        messages = JSON.parse(saved);
      }
    } catch (e) {
      messages = [];
    }

    if (!messages || messages.length === 0) {
      const user = getUserContext();
      messages = [
        {
          role: 'bot',
          content: `### 🤖 Welcome to BOOK FORGE Assistant!\n\nHello **${escapeHtml(user.name || 'Fellow Reader')}**! I am **Forge AI**, your intelligent guide.\n\nI can help you **view and customize your profile**, upload photos, track your reading progress, unlock **event certificates**, switch between Light/Dark/3D themes, and more!\n\nWhat would you like assistance with today?`,
          actions: [
            { label: '👤 View Profile', url: 'profile.html', icon: '👤' },
            { label: '✏️ Edit Profile', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' },
            { label: '📜 My Certificates', url: 'profile.html#certificates', icon: '📜' }
          ],
          suggestions: [
            'How do I view and set my profile?',
            'How to upload a profile photo?',
            'Where do I find my certificates?',
            'How do I change the website theme?'
          ],
          timestamp: new Date().toISOString()
        }
      ];
      saveHistory();
    }
  }

  function saveHistory() {
    try {
      // Keep last 30 messages
      if (messages.length > 30) {
        messages = messages.slice(-30);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }

  // Render DOM elements
  function mount() {
    if (document.getElementById('forgeAiWindow')) return;

    // Do NOT mount on login, register, or public landing pages
    const isAuthPage = document.body && (
      document.body.classList.contains('auth-page') ||
      window.location.pathname.endsWith('login.html') ||
      window.location.pathname.endsWith('register.html') ||
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('index.html')
    );
    if (isAuthPage) return;

    // Only mount when a user is actually logged in
    const user = (typeof BookClubAuth !== 'undefined') ? BookClubAuth.getCurrentUser() : null;
    if (!user) return;

    // 1. Floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'forgeAiTrigger';
    trigger.className = 'forge-ai-trigger';
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-label', 'Open Forge AI Assistant');
    trigger.title = 'Ask Forge AI: Profile, Photos, Books & More';
    trigger.innerHTML = `
      <span class="forge-ai-trigger-icon">🤖</span>
      <span class="forge-ai-trigger-label">Ask Forge AI</span>
      <span class="forge-ai-trigger-sparkle">✨</span>
    `;
    trigger.addEventListener('click', () => toggle());
    document.body.appendChild(trigger);

    // If on messages.html where floating comm dock is omitted, position trigger at bottom 24px
    if (window.location.pathname.includes('messages.html')) {
      trigger.style.bottom = '24px';
    }

    // 2. Chat Window
    const win = document.createElement('div');
    win.id = 'forgeAiWindow';
    win.className = 'forge-ai-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Forge AI Assistant');

    win.innerHTML = `
      <!-- Header -->
      <div class="forge-ai-header">
        <div class="forge-ai-header-left">
          <div class="forge-ai-avatar">🤖</div>
          <div class="forge-ai-meta">
            <h3>Forge AI <span>✨</span></h3>
            <p><span class="forge-ai-status-dot"></span> Online • Intelligent Guide</p>
          </div>
        </div>
        <div class="forge-ai-header-actions">
          <button type="button" class="forge-ai-tool-btn" id="forgeAiClearBtn" title="Clear Conversation">🔄</button>
          <button type="button" class="forge-ai-tool-btn" id="forgeAiCloseBtn" title="Minimize Assistant">✕</button>
        </div>
      </div>

      <!-- Quick Prompts Ribbon -->
      <div class="forge-ai-quick-prompts" id="forgeAiQuickPrompts">
        <button type="button" class="forge-ai-quick-btn" data-query="How to view and set my profile?">👤 View & Set Profile</button>
        <button type="button" class="forge-ai-quick-btn" data-query="How do I change my profile photo?">📸 Change Photo</button>
        <button type="button" class="forge-ai-quick-btn" data-query="Where do I view my certificates?">📜 Certificates</button>
        <button type="button" class="forge-ai-quick-btn" data-query="How to switch to 3D or Dark theme?">🎨 Themes</button>
        <button type="button" class="forge-ai-quick-btn" data-query="How to set my annual reading goal?">🎯 Goals</button>
      </div>

      <!-- Messages Stream -->
      <div class="forge-ai-messages" id="forgeAiMessages"></div>

      <!-- Typing Indicator -->
      <div class="forge-ai-typing" id="forgeAiTyping" style="display: none;">
        <span class="forge-ai-typing-dot"></span>
        <span class="forge-ai-typing-dot"></span>
        <span class="forge-ai-typing-dot"></span>
        <span style="font-size: 0.76rem; color: var(--ink-soft); margin-left: 6px;">Forge AI is formulating response...</span>
      </div>

      <!-- Input Footer -->
      <div class="forge-ai-footer">
        <form class="forge-ai-input-form" id="forgeAiForm">
          <input 
            type="text" 
            id="forgeAiInput" 
            class="forge-ai-input" 
            placeholder="Ask me anything (e.g. 'how to view set profile')..." 
            autocomplete="off"
            maxlength="400"
          >
          <button type="submit" class="forge-ai-send-btn" id="forgeAiSendBtn" title="Send Question" aria-label="Send">
            ➤
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(win);

    // Wire up events
    document.getElementById('forgeAiCloseBtn').addEventListener('click', () => close());
    document.getElementById('forgeAiClearBtn').addEventListener('click', () => clearHistory());

    const form = document.getElementById('forgeAiForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('forgeAiInput');
      const text = input.value.trim();
      if (text) {
        input.value = '';
        sendMessage(text);
      }
    });

    // Quick prompts click delegation
    const quickBar = document.getElementById('forgeAiQuickPrompts');
    quickBar.querySelectorAll('.forge-ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        if (q) sendMessage(q);
      });
    });

    // Escape key closes window
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });

    renderMessages();
  }

  function renderMessages() {
    const container = document.getElementById('forgeAiMessages');
    if (!container) return;

    container.innerHTML = messages.map((m, idx) => {
      const isBot = m.role === 'bot';
      const formattedHtml = formatMarkdown(m.content);

      let actionsHtml = '';
      if (isBot && Array.isArray(m.actions) && m.actions.length > 0) {
        actionsHtml = `
          <div class="forge-ai-actions">
            ${m.actions.map(act => `
              <button 
                type="button" 
                class="forge-ai-action-btn" 
                data-action-url="${escapeHtml(act.url || '')}" 
                data-action-trigger="${escapeHtml(act.trigger || '')}"
              >
                ${act.icon || '👉'} ${escapeHtml(act.label)}
              </button>
            `).join('')}
          </div>
        `;
      }

      let chipsHtml = '';
      if (isBot && Array.isArray(m.suggestions) && m.suggestions.length > 0 && idx === messages.length - 1) {
        chipsHtml = `
          <div class="forge-ai-chips-wrap">
            ${m.suggestions.map(s => `
              <button type="button" class="forge-ai-chip" data-chip-query="${escapeHtml(s)}">
                💬 ${escapeHtml(s)}
              </button>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="forge-ai-msg ${isBot ? 'bot' : 'user'}">
          <div class="forge-ai-msg-avatar">${isBot ? '🤖' : '👤'}</div>
          <div>
            <div class="forge-ai-bubble">
              ${formattedHtml}
              ${actionsHtml}
            </div>
            ${chipsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners for action buttons
    container.querySelectorAll('.forge-ai-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-action-url');
        const trigger = btn.getAttribute('data-action-trigger');
        handleAction(url, trigger);
      });
    });

    // Attach listeners for chips
    container.querySelectorAll('.forge-ai-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-chip-query');
        if (q) sendMessage(q);
      });
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  // Handle Action Trigger Execution
  function handleAction(url, trigger) {
    if (trigger === 'openEditProfile') {
      if (window.location.pathname.includes('profile.html')) {
        close();
        if (typeof window.openEditProfileModal === 'function') {
          window.openEditProfileModal();
        } else {
          const btn = document.getElementById('btnEditProfileModal');
          if (btn) btn.click();
        }
        return;
      }
    }

    if (url) {
      window.location.href = url;
    }
  }

  // Send message to server or fallback
  async function sendMessage(text) {
    if (!text || !text.trim() || isGenerating) return;

    const trimmed = text.trim();
    // Add user message
    messages.push({
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    });
    saveHistory();
    renderMessages();

    // Show typing indicator
    isGenerating = true;
    const typingEl = document.getElementById('forgeAiTyping');
    const sendBtn = document.getElementById('forgeAiSendBtn');
    if (typingEl) typingEl.style.display = 'inline-flex';
    if (sendBtn) sendBtn.disabled = true;

    const container = document.getElementById('forgeAiMessages');
    if (container) container.scrollTop = container.scrollHeight;

    const userContext = getUserContext();
    const token = (typeof BookClubAPI !== 'undefined' && BookClubAPI.getToken) ? BookClubAPI.getToken() : localStorage.getItem('token');

    try {
      let data = null;
      if (typeof BookClubAPI !== 'undefined' && BookClubAPI.ai && typeof BookClubAPI.ai.chat === 'function') {
        try {
          const res = await BookClubAPI.ai.chat({
            message: trimmed,
            history: messages.slice(-8),
            userContext
          });
          if (res && res.success) {
            data = res;
          }
        } catch (apiErr) {
          console.warn('[BookClubAPI AI Chat]', apiErr.message);
        }
      }

      if (!data) {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: trimmed,
            history: messages.slice(-8),
            userContext
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        data = await response.json();
      }

      if (data && data.success) {
        messages.push({
          role: 'bot',
          content: data.reply,
          actions: data.actions || [],
          suggestions: data.suggestions || [],
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(data.message || 'Unable to get response');
      }
    } catch (err) {
      console.warn('[Forge AI API Fallback]:', err.message);
      // Resilient client-side fallback
      const fallback = generateClientFallback(trimmed, userContext);
      messages.push({
        role: 'bot',
        content: fallback.reply,
        actions: fallback.actions,
        suggestions: fallback.suggestions,
        timestamp: new Date().toISOString()
      });
    } finally {
      isGenerating = false;
      if (typingEl) typingEl.style.display = 'none';
      if (sendBtn) sendBtn.disabled = false;
      saveHistory();
      renderMessages();
    }
  }

  // Client-side instant semantic reasoning fallback if offline
  function generateClientFallback(rawQuery, userContext) {
    const q = rawQuery.toLowerCase();
    const isProfileViewSet = /(view\s*(and|&)?\s*set\s*profile)|(set\s*(and|&)?\s*view\s*profile)|(how\s*(to\s*)?(view|see|check|open)\s*(and|&)?\s*(set|edit|update|change)\s*(my\s*)?profile)|(how\s*(to\s*)?view\s*set\s*profile)|(how\s*(to\s*)?set\s*view\s*profile)/i.test(q);
    const isPhoto = /photo|avatar|pic|picture|image|upload photo/i.test(q);
    const isProfileSet = /set profile|edit profile|update profile|change name|update bio/i.test(q);
    const isProfileView = /view profile|see profile|where is my profile|stats|streak|xp/i.test(q);
    const isCert = /cert|certificate|diploma|participation/i.test(q);
    const isTheme = /theme|dark mode|light mode|3d/i.test(q);

    if (isProfileViewSet) {
      return {
        reply: `### 👤 Complete Guide: How to View and Set Your Profile in BOOK FORGE

Here is how you can view your reader identity and personalize your settings:

#### 👁️ Part 1: How to View Your Profile
1. **Navigate**: Click **"Profile" (👤)** in the sidebar or the bottom user pill.
2. **What You See**:
   - **Hero Banner**: Your Avatar picture, Display Name, Username, Rank badge, and Bio.
   - **Guild Rank & Streak**: Level (e.g. *Level 8 Sage*), Daily Streak (🔥), and XP.
   - **Metrics**: Books Read, Pages Read, Reviews Shared.
   - **Tabs**: Overview (goal pace), Completed Books, and **My Certificates**!

#### ✏️ Part 2: How to Set & Edit Your Profile
1. **Open Editor**: Click the **"✏️ Edit Profile"** button at the top-right of your profile banner.
2. **Settings**:
   - 📸 **Profile Photo**: Click **"📷 Choose Photo"** to upload any image file from your device, or paste a photo link.
   - 🏷️ **Name & Bio**: Update your display name and share your literary interests.
   - 📚 **Favorite Genre**: Select Fantasy, Mystery, Fiction, Non-Fiction, or Classics.
3. **Save**: Click **"Save Changes"** to save to the database!`,
        actions: [
          { label: '👤 Open Profile Page', url: 'profile.html', icon: '👤' },
          { label: '✏️ Edit Profile Now', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' }
        ],
        suggestions: [
          'How to upload a profile photo?',
          'Where do I find my certificates?',
          'How to switch themes?'
        ]
      };
    }

    if (isPhoto) {
      return {
        reply: `### 📸 How to Set & Change Your Profile Photo:
1. Go to your **Profile (👤)** page.
2. Click **"✏️ Edit Profile"**.
3. Click the **"📷 Choose Photo"** button to select any image from your computer or phone.
4. Click **"Save Changes"** to save it to your account!`,
        actions: [
          { label: '👤 Open Profile', url: 'profile.html', icon: '👤' },
          { label: '✏️ Edit Profile', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' }
        ],
        suggestions: ['How to view and set my profile?', 'Where are my certificates?']
      };
    }

    if (isProfileSet) {
      return {
        reply: `### ✏️ How to Set & Edit Your Profile:
1. Open **Profile (👤)** and click **"✏️ Edit Profile"**.
2. Modify your **Full Name**, **Favorite Genre**, **Bio**, or **Profile Photo**.
3. Click **"Save Changes"** to update your account!`,
        actions: [
          { label: '✏️ Edit Profile Now', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' },
          { label: '⚙️ Settings', url: 'settings.html', icon: '⚙️' }
        ],
        suggestions: ['How to view my profile?', 'How to upload photo?']
      };
    }

    if (isProfileView) {
      return {
        reply: `### 👤 Viewing Your Profile & Stats:
- Click **"Profile" (👤)** in the left sidebar menu.
- View your **Guild Level**, **Reading Streak (🔥)**, **XP**, **Finished Books**, and **My Certificates**!`,
        actions: [
          { label: '👤 Open Profile', url: 'profile.html', icon: '👤' }
        ],
        suggestions: ['How to edit my profile?', 'Where are my certificates?']
      };
    }

    if (isCert) {
      return {
        reply: `### 📜 Certificates in BOOK FORGE:
- Earn participation & achievement certificates by finishing event tasks or reading challenges.
- Access earned certificates under **Profile → "My Certificates" Tab** to view, print, or download PDF!`,
        actions: [
          { label: '📜 My Certificates', url: 'profile.html#certificates', icon: '📜' }
        ],
        suggestions: ['How to view and set profile?', 'Browse events']
      };
    }

    if (isTheme) {
      return {
        reply: `### 🎨 Switching Themes:
- Click the **☀️ Light**, **🌙 Dark**, or **🧊 3D** theme buttons in the top navigation bar or go to **Settings (⚙️)**.`,
        actions: [
          { label: '⚙️ Settings', url: 'settings.html', icon: '⚙️' }
        ],
        suggestions: ['How to view and set profile?']
      };
    }

    return {
      reply: `### 🤖 Forge AI Guidance
I can help you navigate BOOK FORGE, view or edit your profile, upload your profile photo, manage reading goals, or track certificates.

What specific information would you like to explore?`,
      actions: [
        { label: '👤 Open Profile', url: 'profile.html', icon: '👤' },
        { label: '✏️ Edit Profile', url: 'profile.html?openEdit=true', icon: '✏️', trigger: 'openEditProfile' }
      ],
      suggestions: [
        'How to view and set my profile?',
        'How do I change my profile photo?',
        'Where do I view certificates?'
      ]
    };
  }

  function open() {
    isOpen = true;
    const win = document.getElementById('forgeAiWindow');
    if (win) {
      win.classList.add('open');
      const input = document.getElementById('forgeAiInput');
      if (input) setTimeout(() => input.focus(), 200);
      const container = document.getElementById('forgeAiMessages');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  function close() {
    isOpen = false;
    const win = document.getElementById('forgeAiWindow');
    if (win) win.classList.remove('open');
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    loadHistory();
    renderMessages();
  }

  // Automatic bootstrap on DOM Ready
  function init() {
    loadHistory();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }

  return {
    init,
    mount,
    open,
    close,
    toggle,
    sendMessage,
    clearHistory
  };
})();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.BookForgeAI = BookForgeAI;
  BookForgeAI.init();
}

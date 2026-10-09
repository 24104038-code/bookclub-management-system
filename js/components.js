// Immediate Theme & Language Bootstrapper
(function () {
  try {
    const savedTheme = localStorage.getItem('bookforge_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (document.body) document.body.setAttribute('data-theme', savedTheme);

    const savedLang = localStorage.getItem('bookforge_lang') || 'en';
    document.documentElement.setAttribute('lang', savedLang);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    if (typeof BookForgeTheme === 'undefined') {
      const s1 = document.createElement('script');
      s1.src = 'js/theme.js';
      document.head.appendChild(s1);
    }
    if (typeof BookForgeI18n === 'undefined') {
      const s2 = document.createElement('script');
      s2.src = 'js/i18n.js';
      document.head.appendChild(s2);
    }
    if (typeof BookForgeAI === 'undefined' && !document.getElementById('forgeAiScript')) {
      const s3 = document.createElement('script');
      s3.id = 'forgeAiScript';
      s3.src = 'js/ai-assistant.js';
      document.head.appendChild(s3);
    }
  }
})();

const BookClubUI = (function () {
  /* ---------- Escape HTML Helper ---------- */
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* ---------- Global Nav Items Definition ---------- */
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: 'dashboard.html', i18nKey: 'nav.dashboard' },
    { id: 'books', label: 'Books', icon: '📖', href: 'books.html', i18nKey: 'nav.books' },
    { id: 'library', label: 'My Library', icon: '📚', href: 'library.html', i18nKey: 'nav.library' },
    { id: 'reading-progress', label: 'Reading Progress', icon: '📈', href: 'reading-progress.html', i18nKey: 'nav.readingProgress' },
    { id: 'reading-goals', label: 'Reading Goals', icon: '🎯', href: 'reading-goals.html', i18nKey: 'nav.readingGoals' },
    { id: 'groups', label: 'Reading Groups', icon: '👥', href: 'groups.html', i18nKey: 'nav.groups' },
    { id: 'discussions', label: 'Discussions', icon: '💬', href: 'discussions.html', i18nKey: 'nav.discussions' },
    { id: 'events', label: 'Events', icon: '📅', href: 'events.html', i18nKey: 'nav.events' },
    { id: 'competitions', label: 'Competitions', icon: '🏁', href: 'competitions.html', i18nKey: 'nav.competitions' },
    { id: 'challenges', label: 'Challenges', icon: '🏆', href: 'challenges.html', i18nKey: 'nav.challenges' },
    { id: 'leaderboards', label: 'Leaderboards', icon: '🏅', href: 'leaderboards.html', i18nKey: 'nav.leaderboards' },
    { id: 'reviews', label: 'Reviews', icon: '⭐', href: 'reviews.html', i18nKey: 'nav.reviews' },
    { id: 'recommendations', label: 'Recommendations', icon: '✨', href: 'recommendations.html', i18nKey: 'nav.recommendations' },
    { id: 'notes', label: 'Notes', icon: '📝', href: 'notes.html', i18nKey: 'nav.notes' },
    { id: 'highlights', label: 'Highlights & Quotes', icon: '💡', href: 'highlights.html', i18nKey: 'nav.highlights' },
    { id: 'journal', label: 'Reading Journal', icon: '📓', href: 'journal.html', i18nKey: 'nav.journal' },
    { id: 'calendar', label: 'Calendar', icon: '📆', href: 'calendar.html', i18nKey: 'nav.calendar' },
    { id: 'activity', label: 'Activity Feed', icon: '⚡', href: 'activity.html', i18nKey: 'nav.activity' },
    { id: 'messages', label: 'Messages & Chat', icon: '💬', href: 'messages.html', i18nKey: 'nav.messages' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', href: 'notifications.html', badge: true, i18nKey: 'nav.notifications' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.html', i18nKey: 'nav.settings' },
    { id: 'profile', label: 'Profile', icon: '👤', href: 'profile.html', i18nKey: 'nav.profile' }
  ];

  const MANAGEMENT_ITEMS = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '🛠️', href: 'admin-dashboard.html', role: 'admin', i18nKey: 'nav.adminDashboard' },
    { id: 'organizer-dashboard', label: 'Organizer Console', icon: '📋', href: 'organizer-dashboard.html', role: ['admin', 'organizer'], i18nKey: 'nav.organizerConsole' },
    { id: 'reports', label: 'Moderation Reports', icon: '🛡️', href: 'reports.html', role: 'admin', i18nKey: 'nav.reports' }
  ];

  /* ---------- Sidebar Component ---------- */
  function renderSidebar(activeId) {
    const sidebarEl = document.getElementById('sidebar');
    if (!sidebarEl) return;

    const user = (typeof BookClubAuth !== 'undefined') ? BookClubAuth.getCurrentUser() : null;
    if (!user) {
      if (typeof BookClubAuth !== 'undefined') {
        BookClubAuth.requireAuth('login.html');
      }
      return;
    }

    const unreadCount = (typeof BookClubStore !== 'undefined') ? BookClubStore.getUnreadNotificationsCount() : 3;

    let mainNavHtml = NAV_ITEMS.map(item => {
      const isActive = item.id === activeId ? 'class="active"' : '';
      const badgeHtml = (item.badge && unreadCount > 0)
        ? `<span class="nav-badge-pill">${unreadCount}</span>`
        : '';
      const displayLabel = (typeof BookForgeI18n !== 'undefined')
        ? BookForgeI18n.t(item.i18nKey || `nav.${item.id}`, item.label)
        : item.label;
      return `<li><a href="${item.href}" ${isActive}><span class="nav-ico">${item.icon}</span> <span class="nav-label" data-i18n="${item.i18nKey || 'nav.' + item.id}">${displayLabel}</span> ${badgeHtml}</a></li>`;
    }).join('');

    let mgmtNavHtml = MANAGEMENT_ITEMS.filter(item => {
      if (Array.isArray(item.role)) return item.role.includes(user.role);
      return item.role === user.role;
    }).map(item => {
      const isActive = item.id === activeId ? 'class="active"' : '';
      const displayLabel = (typeof BookForgeI18n !== 'undefined')
        ? BookForgeI18n.t(item.i18nKey || `nav.${item.id}`, item.label)
        : item.label;
      return `<li><a href="${item.href}" ${isActive}><span class="nav-ico">${item.icon}</span> <span class="nav-label" data-i18n="${item.i18nKey || 'nav.' + item.id}">${displayLabel}</span></a></li>`;
    }).join('');

    if (mgmtNavHtml) {
      mgmtNavHtml = `
        <li class="nav-group-title" data-i18n="nav.management">Management</li>
        ${mgmtNavHtml}
      `;
    }

    sidebarEl.innerHTML = `
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-brand">
          <span class="mark">📖</span>
          <span class="brand-text"><span class="brand-book">BOOK</span> <span class="brand-forge">FORGE</span></span>
        </a>
        <button class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Close menu">&times;</button>
      </div>

      <div class="sidebar-role-badge">
        <span class="role-indicator role-${user.role}">${user.role.toUpperCase()}</span>
        <a href="index.html" class="public-home-link" title="Go to Public Landing Page" data-i18n="nav.publicSite">🏠 Public Site</a>
      </div>

      <ul class="sidebar-nav">
        ${mainNavHtml}
        ${mgmtNavHtml}
      </ul>

      <!-- Quick Role Switcher for seamless evaluation -->
      <div class="role-switcher-box">
        <span class="role-switcher-label" data-i18n="topbar.roleSwitch">Demo Role Switch:</span>
        <div class="role-switcher-buttons">
          <button type="button" class="role-btn ${user.role === 'member' ? 'active' : ''}" data-switch-role="member" title="Switch to Reader Member">Member</button>
          <button type="button" class="role-btn ${user.role === 'organizer' ? 'active' : ''}" data-switch-role="organizer" title="Switch to Group Organizer">Organizer</button>
          <button type="button" class="role-btn ${user.role === 'admin' ? 'active' : ''}" data-switch-role="admin" title="Switch to Platform Admin">Admin</button>
        </div>
      </div>

      <div class="sidebar-footer">
        <a href="profile.html" class="sidebar-user-link">
          <span class="avatar-chip-sm" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
            ${(user.profileImage && user.profileImage.trim())
              ? `<img src="${escapeHtml(user.profileImage)}" alt="${escapeHtml(user.name)}" style="width:100%; height:100%; object-fit:cover; display:block;">`
              : escapeHtml(user.avatar || 'JR')}
          </span>
          <div class="who">
            <div class="name">${escapeHtml(user.name)}</div>
            <div class="role">@${escapeHtml(user.username)}</div>
          </div>
        </a>
        <button type="button" class="logout-ico" data-action="logout" title="Sign out" aria-label="Sign out">↩</button>
      </div>
    `;

    // Event listeners for role switcher
    sidebarEl.querySelectorAll('[data-switch-role]').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetRole = this.getAttribute('data-switch-role');
        BookClubAuth.quickLogin(targetRole);
        showToast(`Switched role to: ${targetRole.toUpperCase()}`, 'info');
        setTimeout(() => {
          if (targetRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else if (targetRole === 'organizer') {
            window.location.href = 'organizer-dashboard.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 350);
      });
    });

    // Mobile drawer close button
    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sidebarEl.classList.remove('open');
        const overlay = document.getElementById('sidebarBackdrop');
        if (overlay) overlay.classList.remove('show');
      });
    }

    // Attach logout
      sidebarEl.querySelectorAll('[data-action="logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        BookClubAuth.logout();
        showToast('You have been logged out.', 'success');
        setTimeout(() => window.location.replace('login.html'), 300);
      });
    });

    // Floating Communication & WhatsApp quick dock
    if (activeId !== 'messages' && !document.getElementById('floatingCommDock')) {
      const dock = document.createElement('div');
      dock.id = 'floatingCommDock';
      dock.className = 'floating-comm-dock';
      dock.innerHTML = `
        <a href="messages.html" class="floating-comm-btn" title="Open Messages, Chat &amp; WhatsApp Hub">
          <span class="floating-comm-ico">💬</span>
          <span class="floating-comm-label">Chat &amp; WhatsApp</span>
        </a>
      `;
      document.body.appendChild(dock);
    }

    // Ensure Forge AI assistant is mounted
    if (typeof BookForgeAI !== 'undefined' && typeof BookForgeAI.mount === 'function') {
      BookForgeAI.mount();
    }
  }

  /* ---------- Topbar Component ---------- */
  function renderTopbar(title, subtitle, actionsHtml) {
    const topbarEl = document.querySelector('.topbar');
    if (!topbarEl) return;

    const unreadCount = (typeof BookClubStore !== 'undefined') ? BookClubStore.getUnreadNotificationsCount() : 0;

    const currentTheme = (typeof BookForgeTheme !== 'undefined') ? BookForgeTheme.getTheme() : 'light';
    const currentLang = (typeof BookForgeI18n !== 'undefined') ? BookForgeI18n.getLanguage() : 'en';
    const allLangs = (typeof BookForgeI18n !== 'undefined') ? BookForgeI18n.getLanguages() : { en: { name: 'English', flag: '🇬🇧' } };
    const currLangInfo = allLangs[currentLang] || { name: 'English', flag: '🇬🇧' };

    topbarEl.innerHTML = `
      <div class="topbar-left">
        <button class="mobile-menu-btn" id="mobileMenuToggle" aria-label="Open navigation menu">
          <span></span><span></span><span></span>
        </button>
        <div>
          <h1>${title}</h1>
          ${subtitle ? `<p class="sub">${subtitle}</p>` : ''}
        </div>
      </div>
      <div class="topbar-right">
        <button type="button" class="search-trigger-btn" id="globalSearchBtn">
          <span>🔎</span>
          <span class="search-trigger-text" data-i18n="topbar.searchPlaceholder">Search catalog, groups, clubs in Book Forge...</span>
          <kbd class="search-kbd" data-i18n="topbar.ctrlK">Ctrl K</kbd>
        </button>

        <!-- Quick Theme Switcher Dock (Light, Dark, 3D) -->
        <div class="theme-switch-dock" title="Switch Theme (Light, Dark, 3D)">
          <button type="button" class="theme-switch-btn ${currentTheme === 'light' ? 'active' : ''}" data-set-theme="light" title="Light Parchment Theme">☀️ <span>Light</span></button>
          <button type="button" class="theme-switch-btn ${currentTheme === 'dark' ? 'active' : ''}" data-set-theme="dark" title="Dark Obsidian Theme">🌙 <span>Dark</span></button>
          <button type="button" class="theme-switch-btn ${currentTheme === '3d' ? 'active' : ''}" data-set-theme="3d" title="3D Spatial Tactile Theme">🧊 <span>3D</span></button>
        </div>

        <!-- Quick Language Switcher Dropdown -->
        <div class="lang-switch-dock">
          <button type="button" class="lang-select-trigger" title="Select Language">
            <span data-lang-current>${currLangInfo.flag} ${currLangInfo.name}</span> ▾
          </button>
          <ul class="lang-dropdown-menu">
            ${Object.entries(allLangs).map(([code, info]) => `
              <li class="lang-dropdown-item ${code === currentLang ? 'active' : ''}" data-select-lang="${code}">
                <span>${info.flag} ${info.name}</span>
                <span style="font-size:0.75rem; opacity:0.6;">${info.native || info.name}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <a href="messages.html" class="topbar-icon-btn" title="Messages & Chat" aria-label="Messages">
          <span>💬</span>
        </a>

        <a href="notifications.html" class="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <span>🔔</span>
          ${unreadCount > 0 ? `<span class="topbar-badge">${unreadCount}</span>` : ''}
        </a>

        <a href="settings.html" class="topbar-icon-btn" title="Settings" aria-label="Settings">
          <span>⚙️</span>
        </a>

        ${actionsHtml || ''}
      </div>
    `;

    if (typeof BookForgeTheme !== 'undefined') {
      BookForgeTheme.bindThemeButtons();
    }
    if (typeof BookForgeI18n !== 'undefined') {
      BookForgeI18n.bindLanguageEvents();
      BookForgeI18n.applyTranslations(topbarEl);
    }

    // Hook mobile drawer toggle
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const sidebarEl = document.getElementById('sidebar');
    if (toggleBtn && sidebarEl) {
      toggleBtn.addEventListener('click', () => {
        sidebarEl.classList.toggle('open');
        let backdrop = document.getElementById('sidebarBackdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'sidebarBackdrop';
          backdrop.className = 'sidebar-backdrop';
          document.body.appendChild(backdrop);
          backdrop.addEventListener('click', () => {
            sidebarEl.classList.remove('open');
            backdrop.classList.remove('show');
          });
        }
        backdrop.classList.toggle('show');
      });
    }

    // Hook global search button
    const searchBtn = document.getElementById('globalSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', openGlobalSearchModal);
    }
  }

  const DEFAULT_BOOK_COVER = 'images/default-book-cover.jpg';

  const BOOK_COVER_MAP = {
    1: 'images/books/silent-orchard.jpg',
    2: 'images/books/winters-ledger.jpg',
    3: 'images/books/salt-and-story.jpg',
    4: 'images/books/paper-lanterns.jpg',
    5: 'images/books/cartographers-daughter.jpg',
    6: 'images/books/iron-tide.jpg',
    7: 'images/books/high-weald.jpg',
    8: 'images/books/shadows-valdor.jpg',
    9: 'images/books/clockwork-astrolabe.jpg',
    10: 'images/books/gentle-treason.jpg',
    11: 'images/books/silk-path.jpg',
    12: 'images/books/autumn-garden.jpg',
    13: 'images/books/ponniyin-selvan.svg',
    14: 'images/books/sivagami.svg',
    15: 'images/books/parthiban-kanavu.svg',
    16: 'images/books/thirukkural.svg',
    17: 'images/books/velpari.svg',
    18: 'images/books/mogamul.svg',
    19: 'images/books/obsidian-codex.svg',
    20: 'images/books/banyan-whispers.svg',
    21: 'images/books/celestial-navigator.svg',
    22: 'images/books/veera-yugam.svg',
    23: 'images/books/alchemist-shadows.svg',
    24: 'images/books/thirukkural-gold.svg',
    // Fallback by title
    "The Silent Orchard": 'images/books/silent-orchard.jpg',
    "Winter's Ledger": 'images/books/winters-ledger.jpg',
    "Salt & Story": 'images/books/salt-and-story.jpg',
    "Paper Lanterns": 'images/books/paper-lanterns.jpg',
    "The Cartographer's Daughter": 'images/books/cartographers-daughter.jpg',
    "Iron Tide": 'images/books/iron-tide.jpg',
    "Echoes of the High Weald": 'images/books/high-weald.jpg',
    "Shadows Over Valdor": 'images/books/shadows-valdor.jpg',
    "The Clockwork Astrolabe": 'images/books/clockwork-astrolabe.jpg',
    "A Gentle Treason": 'images/books/gentle-treason.jpg',
    "Letters from the Old Silk Path": 'images/books/silk-path.jpg',
    "The Autumn Garden Society": 'images/books/autumn-garden.jpg',
    "Ponniyin Selvan": 'images/books/ponniyin-selvan.svg',
    "பொன்னியின் செல்வன்": 'images/books/ponniyin-selvan.svg',
    "Sivagamiyin Sabatham": 'images/books/sivagami.svg',
    "சிவகாமியின் சபதம்": 'images/books/sivagami.svg',
    "Parthiban Kanavu": 'images/books/parthiban-kanavu.svg',
    "பார்த்திபன் கனவு": 'images/books/parthiban-kanavu.svg',
    "Thirukkural": 'images/books/thirukkural.svg',
    "திருக்குறள்": 'images/books/thirukkural.svg',
    "Velpari": 'images/books/velpari.svg',
    "வேள்பாரி": 'images/books/velpari.svg',
    "Mogamul": 'images/books/mogamul.svg',
    "மோகமுள்": 'images/books/mogamul.svg',
    "The Obsidian Codex": 'images/books/obsidian-codex.svg',
    "Whispers of the Banyan Tree": 'images/books/banyan-whispers.svg',
    "The Celestial Navigator": 'images/books/celestial-navigator.svg',
    "Veera Yugam: Chronicles of the Lost Dynasty": 'images/books/veera-yugam.svg',
    "The Alchemist of Shadows": 'images/books/alchemist-shadows.svg',
    "Tirukkural: The Art of Living Master Gold Edition": 'images/books/thirukkural-gold.svg'
  };

  /* ---------- Book Cover Renderer (Unique Cover Images + Custom Image Support) ---------- */
  function renderBookCover(book, customClass) {
    const title = book ? escapeHtml(book.title || 'Book') : 'Book';
    const author = book ? escapeHtml(book.author || '') : '';
    
    // Check book properties, then BOOK_COVER_MAP by ID, then by title, with default fallback
    let coverUrl = null;
    if (book) {
      coverUrl = book.coverImage || book.image || book.cover || book.cover_image || BOOK_COVER_MAP[book.id] || BOOK_COVER_MAP[book.title];
    }
    if (!coverUrl) {
      coverUrl = DEFAULT_BOOK_COVER;
    }
    coverUrl = escapeHtml(coverUrl);

    return `
      <div class="book-cover-wrap book-cover-pro ${customClass || ''}">
        <img src="${coverUrl}" alt="${title} by ${author}" class="book-cover-img" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_BOOK_COVER}';">
      </div>
    `;
  }

  /* ---------- Book Card Renderer (Multilingual Book Descriptions & Actions) ---------- */
  function renderBookCard(book, options) {
    options = options || {};
    const userStatus = (typeof BookClubStore !== 'undefined')
      ? BookClubStore.getBookUserStatus(book.id)
      : { shelf: null, currentPage: 0, isFavorite: false };

    // Multilingual Book Fields
    const localizedTitle = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.getBookText)
      ? BookForgeI18n.getBookText(book, 'title')
      : (book.title_ta || book.title);
    const localizedAuthor = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.getBookText)
      ? BookForgeI18n.getBookText(book, 'author')
      : (book.author_ta || book.author);
    const localizedGenre = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.getBookText)
      ? BookForgeI18n.getBookText(book, 'genre')
      : (book.genre_ta || book.genre);
    const localizedDesc = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.getBookText)
      ? BookForgeI18n.getBookText(book, 'description')
      : (book.description_ta || book.description);

    const byPrefix = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t)
      ? BookForgeI18n.t('books.by', 'by')
      : 'by';
    const pagesSuffix = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t)
      ? BookForgeI18n.t('books.pages', 'pages')
      : 'pages';
    const detailsText = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t)
      ? BookForgeI18n.t('books.details', 'Details')
      : 'Details';
    const addShelfText = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t)
      ? BookForgeI18n.t('books.addToShelf', 'Add to Shelf')
      : 'Add to Shelf';

    const lblReading = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t) ? BookForgeI18n.t('books.currentlyReading', 'Currently Reading') : 'Currently Reading';
    const lblWant = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t) ? BookForgeI18n.t('books.wantToRead', 'Want to Read') : 'Want to Read';
    const lblRead = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t) ? BookForgeI18n.t('books.completed', 'Completed') : 'Completed';
    const lblDnf = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t) ? BookForgeI18n.t('books.didNotFinish', 'Did Not Finish') : 'Did Not Finish';
    const lblMarkRead = (typeof BookForgeI18n !== 'undefined' && BookForgeI18n.t) ? BookForgeI18n.t('books.markAsRead', 'Mark as Read') : 'Mark as Read';

    const shelfLabels = {
      reading: lblReading,
      want: lblWant,
      read: lblRead,
      dnf: lblDnf
    };

    const currentShelfLabel = userStatus.shelf ? (shelfLabels[userStatus.shelf] || userStatus.shelf) : addShelfText;

    const isLocked = (typeof BookClubStore !== 'undefined' && BookClubStore.isBookLocked)
      ? BookClubStore.isBookLocked(book.id)
      : !!book.isLocked;

    let quest = null;
    if (isLocked && typeof BookClubStore !== 'undefined' && BookClubStore.getUserQuests) {
      const quests = BookClubStore.getUserQuests();
      quest = quests.find(q => q.book.id === book.id);
    }

    if (isLocked) {
      return `
        <div class="card book-card book-card-locked" data-book-id="${book.id}">
          <div class="book-card-cover-wrap">
            <a href="book-details.html?id=${book.id}" class="book-cover-link" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
              ${renderBookCover(book)}
              <div class="book-locked-overlay">
                <div class="book-lock-icon">🔒</div>
                <div class="book-lock-tier">${escapeHtml(book.questTier ? book.questTier.replace('_', ' ').toUpperCase() : 'QUEST LOCKED')}</div>
              </div>
            </a>
            <button class="book-fav-btn ${userStatus.isFavorite ? 'favorited' : ''}" data-fav-id="${book.id}" title="Save to favorites">
              ${userStatus.isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <div class="book-card-body">
            <div class="book-card-top">
              <span class="badge-locked">🔒 ${escapeHtml(book.questTier ? book.questTier.replace('_', ' ').toUpperCase() : 'LOCKED')}</span>
              <span class="badge-xp-reward">+${book.rewardXP || 100} XP</span>
            </div>

            <h3 class="book-title">
              <a href="book-details.html?id=${book.id}" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
                ${escapeHtml(localizedTitle)}
              </a>
            </h3>
            <p class="book-author">${byPrefix} ${escapeHtml(localizedAuthor)}</p>

            <div class="quest-card-progress-box">
              <div class="quest-task-label">🎯 ${escapeHtml(quest ? quest.title : (book.unlockTask ? book.unlockTask.title : 'Unlock Quest'))}</div>
              <div class="quest-mini-bar-bg">
                <div class="quest-mini-bar-fill" style="width: ${quest ? quest.percentage : 0}%;"></div>
              </div>
              <div class="quest-mini-meta">
                <span>${quest ? `${quest.current} / ${quest.target}` : '0 / 1'} (${quest ? quest.percentage : 0}%)</span>
                <span>🏆 ${escapeHtml(book.rewardBadge || 'Reward Badge')}</span>
              </div>
            </div>

            <div class="book-meta-strip">
              <span>📄 ${book.totalPages} ${pagesSuffix}</span>
              <span>⭐ ${book.rating}</span>
            </div>

            <div class="book-card-footer">
              ${(quest && quest.isCompleted) ? `
                <button type="button" class="btn btn-warning btn-sm btn-claim-quest" data-unlock-quest="${book.id}" style="flex:1;">
                  🎁 Claim &amp; Unlock (+${book.rewardXP || 100} XP)
                </button>
              ` : `
                <a href="book-details.html?id=${book.id}" class="btn btn-outline btn-sm" style="flex:1; font-size:0.8rem;" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
                  🔒 View Quest
                </a>
              `}
              <a href="book-details.html?id=${book.id}" class="btn btn-primary btn-sm book-details-btn" data-book-id="${book.id}" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
                ${detailsText}
              </a>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card book-card" data-book-id="${book.id}">
        <div class="book-card-cover-wrap">
          <a href="book-details.html?id=${book.id}" class="book-cover-link" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
            ${renderBookCover(book)}
          </a>
          <button class="book-fav-btn ${userStatus.isFavorite ? 'favorited' : ''}" data-fav-id="${book.id}" title="Save to favorites">
            ${userStatus.isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="book-card-body">
          <div class="book-card-top">
            <span class="book-genre">${escapeHtml(localizedGenre)}</span>
            <span class="book-rating">★ ${book.rating}</span>
          </div>

          <h3 class="book-title">
            <a href="book-details.html?id=${book.id}" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
              ${escapeHtml(localizedTitle)}
            </a>
          </h3>
          <p class="book-author">${byPrefix} ${escapeHtml(localizedAuthor)}</p>

          <p class="book-desc">${escapeHtml((localizedDesc || '').slice(0, 100))}...</p>

          <div class="book-meta-strip">
            <span>📄 ${book.totalPages} ${pagesSuffix}</span>
            <span>📅 ${book.publicationYear}</span>
          </div>

          <div class="book-card-footer">
            <div class="shelf-dropdown-wrap">
              <button type="button" class="btn btn-outline btn-sm shelf-btn" data-shelf-toggle="${book.id}">
                <span>${currentShelfLabel}</span> ▾
              </button>
              <div class="shelf-menu" id="shelfMenu-${book.id}">
                <button type="button" data-set-shelf="${book.id}" data-shelf="reading">${lblReading}</button>
                <button type="button" data-set-shelf="${book.id}" data-shelf="want">${lblWant}</button>
                <button type="button" data-set-shelf="${book.id}" data-shelf="read">${lblMarkRead}</button>
                <button type="button" data-set-shelf="${book.id}" data-shelf="dnf">${lblDnf}</button>
              </div>
            </div>
            <a href="book-details.html?id=${book.id}" class="btn btn-primary btn-sm book-details-btn" data-book-id="${book.id}" onclick="try{sessionStorage.setItem('selectedBookId','${book.id}');localStorage.setItem('selectedBookId','${book.id}');}catch(e){}">
              ${detailsText}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- Modal Controller ---------- */
  function showModal(title, bodyHtml, footerHtml, modalClass = '') {
    let overlay = document.getElementById('globalModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'globalModalOverlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <div class="modal-head">
            <h3 id="globalModalTitle" style="margin:0;"></h3>
            <button class="modal-close" id="globalModalClose" aria-label="Close dialog">&times;</button>
          </div>
          <div class="modal-body" id="globalModalBody"></div>
          <div class="modal-foot" id="globalModalFoot"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#globalModalClose').addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    const box = overlay.querySelector('.modal-box');
    if (box) {
      box.className = 'modal-box' + (modalClass ? ' ' + modalClass : '');
    }

    document.getElementById('globalModalTitle').textContent = title;
    document.getElementById('globalModalBody').innerHTML = bodyHtml;
    const foot = document.getElementById('globalModalFoot');
    if (footerHtml) {
      foot.innerHTML = footerHtml;
      foot.style.display = 'flex';
    } else {
      foot.innerHTML = '';
      foot.style.display = 'none';
    }

    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  function closeModal() {
    const overlay = document.getElementById('globalModalOverlay');
    if (overlay) {
      overlay.classList.remove('show');
      const box = overlay.querySelector('.modal-box');
      if (box) {
        box.className = 'modal-box';
      }
    }
  }

  /* ---------- Toast Notification Controller ---------- */
  function showToast(message, type) {
    type = type || 'success';
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '✨'}</span>
      <span class="toast-msg">${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ---------- Global Omnisearch Modal ---------- */
  function openGlobalSearchModal() {
    const contentHtml = `
      <div class="omnisearch-input-wrap">
        <span>🔎</span>
        <input type="text" id="omniSearchInput" placeholder="Type a book title, author, group, challenge, or user..." autofocus>
      </div>
      <div class="omnisearch-categories-filter">
        <button type="button" class="omni-filter-pill active" data-omni-cat="all">All</button>
        <button type="button" class="omni-filter-pill" data-omni-cat="books">Books</button>
        <button type="button" class="omni-filter-pill" data-omni-cat="groups">Groups</button>
        <button type="button" class="omni-filter-pill" data-omni-cat="events">Events</button>
        <button type="button" class="omni-filter-pill" data-omni-cat="discussions">Discussions</button>
      </div>
      <div class="omnisearch-results-list" id="omniResultsList">
        <p class="text-soft text-center" style="padding: 24px 0;">Type to explore everything on BookClub.</p>
      </div>
    `;

    showModal('Global Platform Search', contentHtml);

    setTimeout(() => {
      const input = document.getElementById('omniSearchInput');
      if (input) {
        input.focus();
        input.addEventListener('input', () => runOmniSearch(input.value.trim()));
      }

      document.querySelectorAll('.omni-filter-pill').forEach(btn => {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.omni-filter-pill').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const query = (document.getElementById('omniSearchInput') || {}).value || '';
          runOmniSearch(query.trim());
        });
      });
    }, 50);
  }

  function runOmniSearch(query) {
    const resultsContainer = document.getElementById('omniResultsList');
    if (!resultsContainer) return;

    if (!query) {
      resultsContainer.innerHTML = '<p class="text-soft text-center" style="padding: 24px 0;">Type to explore books, groups, and discussions.</p>';
      return;
    }

    const activeCat = (document.querySelector('.omni-filter-pill.active') || {}).dataset.omniCat || 'all';
    const q = query.toLowerCase();

    const books = (typeof BookClubStore !== 'undefined') ? BookClubStore.getBooks() : [];
    const groups = (typeof BookClubStore !== 'undefined') ? BookClubStore.getGroups() : [];
    const events = (typeof BookClubStore !== 'undefined') ? BookClubStore.getEvents() : [];
    const discussions = (typeof BookClubStore !== 'undefined') ? BookClubStore.getDiscussions() : [];

    let matchedBooks = (activeCat === 'all' || activeCat === 'books')
      ? books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q))
      : [];

    let matchedGroups = (activeCat === 'all' || activeCat === 'groups')
      ? groups.filter(g => g.name.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q))
      : [];

    let matchedEvents = (activeCat === 'all' || activeCat === 'events')
      ? events.filter(e => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
      : [];

    let matchedDiscussions = (activeCat === 'all' || activeCat === 'discussions')
      ? discussions.filter(d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
      : [];

    if (!matchedBooks.length && !matchedGroups.length && !matchedEvents.length && !matchedDiscussions.length) {
      resultsContainer.innerHTML = `
        <div class="empty-state-mini">
          <div class="empty-icon">🔎</div>
          <h4>No results found for "${escapeHtml(query)}"</h4>
          <p class="text-soft">Try searching for keywords like "Mystery", "Lanterns", or "Elena".</p>
        </div>
      `;
      return;
    }

    let html = '';
    if (matchedBooks.length) {
      html += `<div class="omni-section-title">Books (${matchedBooks.length})</div>`;
      matchedBooks.slice(0, 4).forEach(b => {
        html += `
          <a href="book-details.html?id=${b.id}" class="omni-result-item">
            <span class="omni-ico">📖</span>
            <div class="omni-info">
              <strong>${escapeHtml(b.title)}</strong>
              <span class="omni-sub">by ${escapeHtml(b.author)} · ${b.genre}</span>
            </div>
            <span class="badge badge-want">★ ${b.rating}</span>
          </a>
        `;
      });
    }

    if (matchedGroups.length) {
      html += `<div class="omni-section-title">Reading Groups (${matchedGroups.length})</div>`;
      matchedGroups.slice(0, 3).forEach(g => {
        html += `
          <a href="group-details.html?id=${g.id}" class="omni-result-item">
            <span class="omni-ico">👥</span>
            <div class="omni-info">
              <strong>${escapeHtml(g.name)}</strong>
              <span class="omni-sub">${g.genre} · ${g.membersCount} members</span>
            </div>
            <span class="badge badge-active">${g.activityLevel}</span>
          </a>
        `;
      });
    }

    if (matchedEvents.length) {
      html += `<div class="omni-section-title">Events (${matchedEvents.length})</div>`;
      matchedEvents.slice(0, 3).forEach(e => {
        html += `
          <a href="event-details.html?id=${e.id}" class="omni-result-item">
            <span class="omni-ico">📅</span>
            <div class="omni-info">
              <strong>${escapeHtml(e.title)}</strong>
              <span class="omni-sub">${e.date} · ${e.time}</span>
            </div>
            <span class="badge badge-reading">${e.type}</span>
          </a>
        `;
      });
    }

    if (matchedDiscussions.length) {
      html += `<div class="omni-section-title">Discussions (${matchedDiscussions.length})</div>`;
      matchedDiscussions.slice(0, 3).forEach(d => {
        html += `
          <a href="discussion-details.html?id=${d.id}" class="omni-result-item">
            <span class="omni-ico">💬</span>
            <div class="omni-info">
              <strong>${escapeHtml(d.title)}</strong>
              <span class="omni-sub">in ${d.category} by ${d.author}</span>
            </div>
            <span class="badge badge-member">${d.likes} likes</span>
          </a>
        `;
      });
    }

    resultsContainer.innerHTML = html;
  }

  /* Keyboard shortcut Ctrl+K for omnisearch */
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearchModal();
    }
  });

  /* Global click handler for shelf dropdowns */
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-shelf-toggle]');
    if (toggleBtn) {
      e.stopPropagation();
      const id = toggleBtn.getAttribute('data-shelf-toggle');
      const menu = document.getElementById(`shelfMenu-${id}`);
      document.querySelectorAll('.shelf-menu.show').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      if (menu) menu.classList.toggle('show');
      return;
    }

    const setShelfBtn = e.target.closest('[data-set-shelf]');
    if (setShelfBtn) {
      e.stopPropagation();
      const bookId = setShelfBtn.getAttribute('data-set-shelf');
      const shelf = setShelfBtn.getAttribute('data-shelf');
      if (typeof BookClubStore !== 'undefined') {
        BookClubStore.setBookShelf(bookId, shelf);
        showToast(`Moved book to '${shelf.toUpperCase()}' shelf`, 'success');
        const shelfBtn = document.querySelector(`[data-shelf-toggle="${bookId}"] span`);
        if (shelfBtn) {
          const map = { reading: 'Currently Reading', want: 'Want to Read', read: 'Completed', dnf: 'Did Not Finish' };
          shelfBtn.textContent = map[shelf] || shelf;
        }
      }
      const menu = document.getElementById(`shelfMenu-${bookId}`);
      if (menu) menu.classList.remove('show');
      return;
    }

    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn) {
      e.preventDefault();
      const id = favBtn.getAttribute('data-fav-id');
      if (typeof BookClubStore !== 'undefined') {
        const isFav = BookClubStore.toggleBookFavorite(id);
        favBtn.classList.toggle('favorited', isFav);
        favBtn.textContent = isFav ? '❤️' : '🤍';
        showToast(isFav ? 'Added to your favorites' : 'Removed from favorites', 'info');
      }
      return;
    }

    // Close open shelf menus
    document.querySelectorAll('.shelf-menu.show').forEach(m => m.classList.remove('show'));
  });

  /* ---------- Empty State Generator ---------- */
  function renderEmptyState(icon, title, message, actionText, actionHref) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon || '📚'}</div>
        <h3>${escapeHtml(title || 'No items found')}</h3>
        <p>${escapeHtml(message || 'There is nothing here yet.')}</p>
        ${actionText && actionHref ? `<a href="${actionHref}" class="btn btn-primary btn-sm">${escapeHtml(actionText)}</a>` : ''}
      </div>
    `;
  }

  /* ---------- Skeleton Loader Cards ---------- */
  function renderSkeletonCards(count) {
    let html = '';
    for (let i = 0; i < (count || 4); i++) {
      html += `
        <div class="card skeleton-card">
          <div class="skeleton-shimmer skeleton-cover"></div>
          <div class="skeleton-body">
            <div class="skeleton-shimmer skeleton-line skeleton-w60"></div>
            <div class="skeleton-shimmer skeleton-line skeleton-w90"></div>
            <div class="skeleton-shimmer skeleton-line skeleton-w40"></div>
            <div class="skeleton-shimmer skeleton-line skeleton-btn"></div>
          </div>
        </div>
      `;
    }
    return html;
  }

  /* ---------- Certificate Modal Renderer ---------- */
  function showCertificateModal(cert) {
    if (!cert) return;
    const isChallenge = cert.type === 'challenge';
    const formattedDate = new Date(cert.issueDate || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const leadName = cert.organizerName || (isChallenge ? 'Sarah Jenkins' : 'Aditi Krishnan');
    const leadRole = cert.organizerRole || (isChallenge ? 'Lead Challenge Curator' : 'Lead Event Organizer');

    const certHtml = `
      <div id="printableCertificate" class="crt-certificate-mount">
        <div class="crt-certificate-sheet">
          <!-- 4 Classical Ornate Corner Accents -->
          <div class="crt-corner-ornament crt-corner-tl"><div class="crt-corner-dot"></div></div>
          <div class="crt-corner-ornament crt-corner-tr"><div class="crt-corner-dot"></div></div>
          <div class="crt-corner-ornament crt-corner-bl"><div class="crt-corner-dot"></div></div>
          <div class="crt-corner-ornament crt-corner-br"><div class="crt-corner-dot"></div></div>

          <!-- Top Header Row -->
          <div class="crt-header-row">
            <div class="crt-header-brand">
              <span>🏛️</span>
              <span>Book Forge Community Salon &middot; Est. 2026</span>
            </div>
            <div class="crt-header-badge">
              ${isChallenge ? '★ Official Challenge Credential ★' : '★ Official Participation Credential ★'}
            </div>
          </div>

          <!-- Main Title Block -->
          <div class="crt-title-block">
            <h2 class="crt-main-title">
              ${isChallenge ? 'Certificate of Achievement' : 'Certificate of Participation'}
            </h2>
            <div class="crt-flourish-divider">
              <span class="crt-flourish-line"></span>
              <span>✦ &nbsp; ◈ &nbsp; ✦</span>
              <span class="crt-flourish-line"></span>
            </div>
            
            <p class="crt-conferred-to">This certificate is proudly awarded to</p>
            
            <div class="crt-recipient-name">
              ${escapeHtml(cert.participantName)}
            </div>

            <p class="crt-statement-text">
              ${isChallenge 
                ? 'for outstanding reading dedication, perseverance, and successfully completing all milestones for the community reading quest' 
                : 'for successfully completing all discussion milestones and active reading participation in the community literary salon'}
            </p>

            <div class="crt-highlight-title">
              &ldquo;${escapeHtml(cert.challengeTitle || cert.eventName)}&rdquo;
            </div>

            <div class="crt-ribbon-bar">
              ${isChallenge
                ? `
                  <span class="crt-ribbon-item">🎯 <strong>Target Met:</strong> ${escapeHtml(cert.targetRequirement || '100%')}</span>
                  <span style="color:#C5A059;">&bull;</span>
                  <span class="crt-ribbon-item">🏅 <strong>Badge Earned:</strong> ${escapeHtml(cert.badgeIcon || '⚡')} ${escapeHtml(cert.badgeName || 'Finisher')}</span>
                  <span style="color:#C5A059;">&bull;</span>
                  <span class="crt-ribbon-item">✨ <strong>Honors XP:</strong> +${escapeHtml(String(cert.rewardXp || 500))} XP</span>
                `
                : `
                  <span class="crt-ribbon-item">📅 <strong>Event Date:</strong> ${escapeHtml(cert.eventDate)}</span>
                  <span style="color:#C5A059;">&bull;</span>
                  <span class="crt-ribbon-item">📍 <strong>Salon Location:</strong> ${escapeHtml(cert.eventLocation || 'Online Salon')}</span>
                  <span style="color:#C5A059;">&bull;</span>
                  <span class="crt-ribbon-item">🎖️ <strong>Status:</strong> Active Participant</span>
                `
              }
            </div>
          </div>

          <!-- Signatures & Official 3D Medallion Seal -->
          <div class="crt-signatures-row">
            <div class="crt-sign-col">
              <div class="crt-sign-script">${escapeHtml(leadName)}</div>
              <div class="crt-sign-rule"></div>
              <div class="crt-sign-name">${escapeHtml(leadName)}</div>
              <div class="crt-sign-title">${escapeHtml(leadRole)}</div>
            </div>

            <div class="crt-gold-seal">
              <span class="crt-seal-text-top">VERIFIED</span>
              <span class="crt-seal-star">★</span>
              <span class="crt-seal-text-bot">BOOK FORGE</span>
            </div>

            <div class="crt-sign-col">
              <div class="crt-sign-script">Elena Vance</div>
              <div class="crt-sign-rule"></div>
              <div class="crt-sign-name">Elena Vance</div>
              <div class="crt-sign-title">Platform Director</div>
            </div>
          </div>

          <!-- Security Verification Strip -->
          <div class="crt-security-strip">
            <span>CREDENTIAL ID: <strong>${escapeHtml(cert.certificateId)}</strong></span>
            <span>ISSUED: <strong>${formattedDate}</strong></span>
            <span>SECURITY HASH: <strong>${escapeHtml(cert.verificationCode || '')}</strong></span>
            <span>STATUS: <strong style="color:#2D6A4F;">OFFICIAL &amp; VERIFIED</strong></span>
          </div>
        </div>
      </div>
    `;

    const pdfUrl = (typeof BookClubAPI !== 'undefined' && BookClubAPI.certificates)
      ? BookClubAPI.certificates.getPdfUrl(cert.certificateId)
      : `/api/certificates/${cert.certificateId}/pdf`;

    const footerHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:12px;">
        <a href="verify-certificate.html?id=${encodeURIComponent(cert.certificateId)}" target="_blank" class="btn btn-outline btn-sm" style="color:#F4E8C1; border-color:#C5A059;">
          🔍 Public Verification Page
        </a>
        <div class="flex gap-8">
          <button type="button" class="btn btn-outline btn-sm" style="color:#F4E8C1; border-color:#C5A059;" onclick="window.print()">
            🖨️ Print Certificate
          </button>
          <a href="${pdfUrl}" target="_blank" download="Certificate-${cert.certificateId}.pdf" class="btn btn-primary btn-sm" style="background:#C5A059; color:#1C2B22; font-weight:700;">
            📥 Download PDF Certificate
          </a>
          <button type="button" class="btn btn-ghost btn-sm" style="color:#D5C8B2;" onclick="BookClubUI.closeModal()">
            ✕ Close
          </button>
        </div>
      </div>
    `;

    showModal(isChallenge ? 'Official Reading Challenge Certificate' : 'Official Event Certificate', certHtml, footerHtml, 'modal-certificate-box');
  }

  return {
    DEFAULT_BOOK_COVER,
    BOOK_COVER_MAP,
    renderSidebar,
    renderTopbar,
    renderBookCover,
    renderBookCard,
    showModal,
    closeModal,
    showToast,
    openGlobalSearchModal,
    renderEmptyState,
    renderSkeletonCards,
    showCertificateModal,
    escapeHtml
  };
})();

// Global alias for compatibility
const showToast = BookClubUI.showToast;
const showModal = BookClubUI.showModal;
const closeModal = BookClubUI.closeModal;

// Backward-compatible BookForge global aliases
if (typeof window !== 'undefined') {
  window.BookForgeUI = BookClubUI;
  Object.defineProperty(window, 'BookForgeStore', { get: () => (typeof BookClubStore !== 'undefined' ? BookClubStore : undefined) });
  Object.defineProperty(window, 'BookForgeAuth', { get: () => (typeof BookClubAuth !== 'undefined' ? BookClubAuth : undefined) });
  Object.defineProperty(window, 'BookForgeAPI', { get: () => (typeof BookClubAPI !== 'undefined' ? BookClubAPI : undefined) });

  window.addEventListener('bookforge_lang_change', () => {
    if (typeof BookForgeI18n !== 'undefined') {
      BookForgeI18n.applyTranslations(document);
    }
  });

  // Global quest claim button click delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-unlock-quest]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const bookId = Number(btn.getAttribute('data-unlock-quest'));
    if (typeof BookClubStore !== 'undefined' && BookClubStore.claimQuestAndUnlockBook) {
      const res = BookClubStore.claimQuestAndUnlockBook(bookId);
      if (res && res.success) {
        showToast(`🎉 UNLOCKED! "${res.book.title}" is now open! +${res.rewardXP} XP Earned!`, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        showToast(res.message || 'Unable to claim quest yet.', 'warning');
      }
    }
  });
}

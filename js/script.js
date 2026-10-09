/* =========================================================
   BOOKCLUB — Shared Script (UI interactions only, no backend)
   Auth logic itself lives in js/auth.js (BookClubAuth).
   ========================================================= */

/* ---------- Toast notifications ---------- */
function showToast(message, type) {
  type = type || 'success';
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<span class="toast-icon">' + (type === 'success' ? '✅' : '⚠️') + '</span>' +
    '<span class="toast-msg">' + escapeHtml(message) + '</span>';
  container.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('show'); });
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.remove(); }, 250);
  }, 3200);
}

/* ---------- Field-level error helper ---------- */
function setFieldError(fieldEl, message) {
  clearFieldError(fieldEl);
  if (!fieldEl) return;
  fieldEl.classList.add('field-invalid');
  const err = document.createElement('small');
  err.className = 'field-error';
  err.textContent = message;
  fieldEl.appendChild(err);
}
function clearFieldError(fieldEl) {
  if (!fieldEl) return;
  fieldEl.classList.remove('field-invalid');
  const existing = fieldEl.querySelector('.field-error');
  if (existing) existing.remove();
}
function clearAllFieldErrors(form) {
  form.querySelectorAll('.field-invalid').forEach(function (f) { clearFieldError(f); });
}

/* ---------- Render navbar / sidebar based on auth state ---------- */
function renderAuthState() {
  const user = (typeof BookClubAuth !== 'undefined') ? BookClubAuth.getCurrentUser() : null;

  // Public navbar auth area (Login/Register vs. user menu)
  const navAuth = document.querySelector('.navbar .nav-auth');
  if (navAuth) {
    if (user) {
      navAuth.innerHTML =
        '<div class="user-menu">' +
          '<a href="' + (user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html') + '" class="user-chip">' +
            '<span class="avatar-chip avatar-chip-sm">' + escapeHtml(initials(user.name)) + '</span>' +
            '<span class="user-chip-name">' + escapeHtml(user.name) + '</span>' +
          '</a>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="logout">Logout</button>' +
        '</div>';
    } else {
      navAuth.innerHTML =
        '<a href="login.html" class="btn btn-ghost btn-sm">Login</a>' +
        '<a href="register.html" class="btn btn-primary btn-sm">Register</a>';
    }
  }

  // Sidebar (dashboard/admin/profile/etc.) — fill in the logged-in user's name
  if (user) {
    document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = user.name; });
    document.querySelectorAll('[data-user-username]').forEach(function (el) { el.textContent = '@' + user.username; });
    document.querySelectorAll('[data-user-role]').forEach(function (el) { el.textContent = user.role; });
    document.querySelectorAll('[data-user-email]').forEach(function (el) { el.textContent = user.email; });
    document.querySelectorAll('[data-user-genre]').forEach(function (el) {
      el.textContent = user.favoriteGenre ? (user.favoriteGenre + ' Reader') : 'Member';
    });
    document.querySelectorAll('[data-user-bio]').forEach(function (el) { el.textContent = user.bio || ''; });
    document.querySelectorAll('[data-user-initials]').forEach(function (el) { el.textContent = initials(user.name); });

    // Profile page editable-looking fields (disabled inputs use .value, not textContent)
    var pfName = document.getElementById('profileFullName'); if (pfName) pfName.value = user.name;
    var pfUser = document.getElementById('profileUsername'); if (pfUser) pfUser.value = user.username;
    var pfEmail = document.getElementById('profileEmail'); if (pfEmail) pfEmail.value = user.email;
    var pfGenre = document.getElementById('profileGenre'); if (pfGenre) pfGenre.value = user.favoriteGenre || '';
  }

  // Elements only for a signed-in admin / signed-in user
  document.querySelectorAll('[data-role-visible]').forEach(function (el) {
    const allowed = el.getAttribute('data-role-visible').split(',').map(function (s) { return s.trim(); });
    el.style.display = (user && allowed.indexOf(user.role) !== -1) ? '' : 'none';
  });

  // Logout buttons/links anywhere on the page
  document.querySelectorAll('[data-action="logout"]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      BookClubAuth.logout();
      showToast('You have been logged out.', 'success');
      setTimeout(function () { window.location.href = 'index.html'; }, 500);
    });
  });
}

function initials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
}

/* Escape user-supplied text before it's ever placed into innerHTML */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

/* ---------- Page guards: <body data-auth-required="true" data-role-required="admin"> ---------- */
function enforcePageGuard() {
  if (typeof BookClubAuth === 'undefined') return true;
  const body = document.body;
  const needsAuth = body.getAttribute('data-auth-required') === 'true';
  const needsRole = body.getAttribute('data-role-required');
  if (needsRole) {
    return !!BookClubAuth.requireRole(needsRole, 'dashboard.html');
  }
  if (needsAuth) {
    return !!BookClubAuth.requireAuth('login.html');
  }
  return true;
}

/* Run the guard immediately (before DOMContentLoaded) so protected pages
   never flash their content before redirecting an unauthenticated visitor. */
(function () {
  if (typeof BookClubAuth !== 'undefined') {
    enforcePageGuard();
  }
})();

document.addEventListener('DOMContentLoaded', function () {

  renderAuthState();

  /* ---------- Show / hide password toggles ---------- */
  document.querySelectorAll('.toggle-password').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const input = document.getElementById(btn.getAttribute('data-target'));
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? '🙈' : '👁';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  /* ---------- Forgot password modal ---------- */
  const forgotLink = document.getElementById('forgotPasswordLink');
  const forgotModal = document.getElementById('forgotPasswordModal');
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      forgotModal.classList.add('show');
    });
    forgotModal.querySelectorAll('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', function () { forgotModal.classList.remove('show'); });
    });
    const forgotForm = forgotModal.querySelector('form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        forgotModal.classList.remove('show');
        showToast('If an account exists for that email, reset instructions have been sent.', 'success');
        forgotForm.reset();
      });
    }
  }

  /* ---------- Login form ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllFieldErrors(loginForm);

      const idInput = document.getElementById('loginId');
      const pwInput = document.getElementById('loginPassword');
      const remember = document.getElementById('remember');

      let valid = true;
      if (!idInput.value.trim()) {
        setFieldError(idInput.closest('.field'), 'Username or email is required.');
        valid = false;
      }
      if (!pwInput.value) {
        setFieldError(pwInput.closest('.field'), 'Password is required.');
        valid = false;
      }
      if (!valid) return;

      const result = BookClubAuth.login(idInput.value.trim(), pwInput.value, !!(remember && remember.checked));
      if (!result.success) {
        setFieldError(pwInput.closest('.field'), result.error);
        showToast(result.error, 'error');
        return;
      }

      showToast('Welcome back, ' + result.user.name + '!', 'success');
      setTimeout(function () {
        window.location.href = result.user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
      }, 600);
    });
  }

  /* ---------- Register form ---------- */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllFieldErrors(registerForm);

      const fullNameEl = document.getElementById('fullName');
      const usernameEl = document.getElementById('username');
      const emailEl = document.getElementById('email');
      const passwordEl = document.getElementById('password');
      const confirmEl = document.getElementById('confirmPassword');
      const genreEl = document.getElementById('favoriteGenre');

      const data = {
        fullName: fullNameEl.value,
        username: usernameEl.value,
        email: emailEl.value,
        password: passwordEl.value,
        confirmPassword: confirmEl.value,
        favoriteGenre: genreEl ? genreEl.value : ''
      };

      const result = BookClubAuth.register(data);
      if (!result.success) {
        const fieldMap = { email: emailEl, username: usernameEl, password: passwordEl, confirmPassword: confirmEl };
        const target = fieldMap[result.field];
        if (target) setFieldError(target.closest('.field'), result.error);
        showToast(result.error, 'error');
        return;
      }

      // Auto-login the newly created account
      BookClubAuth.login(data.email, data.password, false);
      showToast('Account created! Welcome to BookClub, ' + result.user.name + '.', 'success');
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 700);
    });
  }

  /* ---------- Mobile nav toggle (public pages) ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('show-mobile');
    });
  }

  /* ---------- Sidebar toggle (dashboard/admin pages) ---------- */
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  /* ---------- Tabs (e.g. Upcoming / Past events) ---------- */
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    const tabs = tabGroup.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetSelector = tab.getAttribute('data-target');
        if (!targetSelector) return;

        const panelGroupName = tab.closest('[data-panel-group]');
        const groupName = panelGroupName ? panelGroupName.getAttribute('data-panel-group') : null;

        document.querySelectorAll('[data-panel]' + (groupName ? `[data-panel-group-ref="${groupName}"]` : '')).forEach(function (panel) {
          panel.style.display = 'none';
        });
        const target = document.querySelector(targetSelector);
        if (target) target.style.display = '';
      });
    });
  });

  /* ---------- Star rating input (Write a Review) ---------- */
  document.querySelectorAll('.star-input').forEach(function (starGroup) {
    const stars = starGroup.querySelectorAll('span');
    const hiddenInput = document.querySelector(starGroup.getAttribute('data-input'));
    stars.forEach(function (star, idx) {
      star.addEventListener('click', function () {
        stars.forEach((s, i) => { s.textContent = i <= idx ? '★' : '☆'; });
        if (hiddenInput) hiddenInput.value = idx + 1;
      });
    });
  });

  /* ---------- Simple client-side search/filter (Books page demo) ---------- */
  const bookSearch = document.getElementById('bookSearchInput');
  const bookGrid = document.getElementById('bookGrid');
  if (bookSearch && bookGrid) {
    bookSearch.addEventListener('input', function () {
      const query = bookSearch.value.trim().toLowerCase();
      bookGrid.querySelectorAll('.book-card').forEach(function (card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const author = (card.getAttribute('data-author') || '').toLowerCase();
        const match = title.includes(query) || author.includes(query);
        card.style.display = match ? '' : 'none';
      });
    });
  }

  const genreFilter = document.getElementById('genreFilter');
  if (genreFilter && bookGrid) {
    genreFilter.addEventListener('change', function () {
      const val = genreFilter.value;
      bookGrid.querySelectorAll('.book-card').forEach(function (card) {
        const genre = card.getAttribute('data-genre');
        card.style.display = (val === 'all' || genre === val) ? '' : 'none';
      });
    });
  }

  /* ---------- Like button toggle (Discussions page, UI-only) ---------- */
  document.querySelectorAll('.like-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('liked');
      const countEl = btn.querySelector('.like-count');
      if (!countEl) return;
      let count = parseInt(countEl.textContent, 10) || 0;
      count = btn.classList.contains('liked') ? count + 1 : count - 1;
      countEl.textContent = count;
    });
  });

  /* ---------- Password confirm hint (Register page, UI-only) ---------- */
  const pw = document.getElementById('password');
  const pwConfirm = document.getElementById('confirmPassword');
  const pwHint = document.getElementById('passwordMatchHint');
  if (pw && pwConfirm && pwHint) {
    function checkMatch() {
      if (!pwConfirm.value) { pwHint.textContent = ''; return; }
      pwHint.textContent = pw.value === pwConfirm.value ? 'Passwords match' : 'Passwords do not match';
      pwHint.style.color = pw.value === pwConfirm.value ? '#4C6A50' : '#B23A2A';
    }
    pw.addEventListener('input', checkMatch);
    pwConfirm.addEventListener('input', checkMatch);
  }

  /* ---------- Prevent still-static (non-functional) forms from navigating away ---------- */
  document.querySelectorAll('form[data-static="true"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('This is a UI preview only — saving isn\'t connected yet.', 'error');
    });
  });

});

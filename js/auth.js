/* =========================================================
   BOOKCLUB — Centralized Auth & User Data Module
   Robust role-based authentication and route guard system.
   ========================================================= */

const BookClubAuth = (function () {
  const USERS_KEY = 'bookclub_users';
  const SESSION_KEY = 'bookclub_session';
  const SESSION_KEY_TEMP = 'bookclub_session_tmp';

  /* Centralized Demo Credentials Configuration */
  const DEMO_CREDENTIALS = {
    user: {
      role: 'user',
      email: 'user@bookclub.com',
      username: 'user',
      password: 'user123',
      name: 'Elena Ramos'
    },
    admin: {
      role: 'admin',
      email: 'admin@bookclub.com',
      username: 'admin',
      password: 'admin123',
      name: 'Admin User'
    }
  };

  function seedUsersIfNeeded() {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      users = [];
    }

    let changed = false;
    if (!users.length) {
      users = (typeof MOCK_USERS !== 'undefined') ? JSON.parse(JSON.stringify(MOCK_USERS)) : [];
      changed = true;
    }

    // Ensure Admin Demo User exists and has admin123 password
    let admin = users.find(u => u.email.toLowerCase() === 'admin@bookclub.com' || u.username === 'admin');
    if (!admin) {
      admin = {
        userId: 1,
        name: 'Admin User',
        username: 'admin',
        email: 'admin@bookclub.com',
        password: 'admin123',
        role: 'admin',
        favoriteGenre: 'Non-Fiction',
        bio: 'BookClub platform administrator.',
        avatar: 'AU'
      };
      users.unshift(admin);
      changed = true;
    } else {
      if (admin.password !== 'admin123' && admin.password !== 'Admin@123') {
        admin.password = 'admin123';
        changed = true;
      }
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        changed = true;
      }
    }

    // Ensure Normal User Demo exists and has user123 password
    let normalUser = users.find(u => u.email.toLowerCase() === 'user@bookclub.com' || u.username === 'user');
    if (!normalUser) {
      normalUser = {
        userId: 7,
        name: 'Elena Ramos',
        username: 'user',
        email: 'user@bookclub.com',
        password: 'user123',
        role: 'user',
        favoriteGenre: 'Fiction',
        bio: 'Avid book lover exploring fiction, reading streaks, and community discussions.',
        avatar: 'ER'
      };
      users.push(normalUser);
      changed = true;
    } else {
      if (normalUser.password !== 'user123') {
        normalUser.password = 'user123';
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  function getUsers() {
    seedUsersIfNeeded();
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function nextUserId(users) {
    return users.reduce((max, u) => Math.max(max, u.userId || 0), 0) + 1;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function findByIdentifier(users, identifier) {
    const val = (identifier || '').trim().toLowerCase();
    return users.find(function (u) {
      return (u.email && u.email.toLowerCase() === val) || 
             (u.username && u.username.toLowerCase() === val);
    });
  }

  /* ---------- Registration ---------- */
  function register(data) {
    const fullName = (data.fullName || '').trim();
    const username = (data.username || '').trim();
    const email = (data.email || '').trim();
    const password = data.password || '';
    const confirmPassword = data.confirmPassword || '';
    const favoriteGenre = data.favoriteGenre || 'Fiction';
    const bio = (data.bio || '').trim();
    const profileImage = data.profileImage || null;

    if (!fullName || !username || !email || !password || !confirmPassword) {
      return { success: false, field: null, error: 'Please fill in all required fields.' };
    }
    if (!isValidEmail(email)) {
      return { success: false, field: 'email', error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, field: 'password', error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { success: false, field: 'confirmPassword', error: 'Passwords do not match.' };
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, field: 'email', error: 'An account with this email already exists.' };
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, field: 'username', error: 'This username is already taken.' };
    }

    const initials = fullName.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    const newUser = {
      userId: nextUserId(users),
      name: fullName,
      username: username,
      email: email,
      password: password,
      role: 'user',
      favoriteGenre: favoriteGenre,
      bio: bio || 'Book enthusiast ready to discuss stories.',
      avatar: initials || 'U',
      profileImage: profileImage,
      level: 1,
      xp: 100,
      streak: 1,
      booksRead: 0,
      pagesRead: 0,
      reviewsCount: 0,
      followers: 0,
      following: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    createSession(newUser.userId, true);

    // Asynchronously register on backend if API is loaded
    if (typeof BookClubAPI !== 'undefined') {
      BookClubAPI.auth.register({
        name: fullName,
        username: username,
        email: email,
        password: password,
        role: 'user',
        favoriteGenre: favoriteGenre,
        bio: bio
      }).then(res => {
        if (res.success && res.data && res.data.token) {
          BookClubAPI.setToken(res.data.token, true);
        }
      }).catch(err => console.warn('[Auth Backend Sync]:', err));
    }

    return { success: true, user: newUser };
  }

  async function registerAsync(data) {
    if (typeof BookClubAPI !== 'undefined') {
      const res = await BookClubAPI.auth.register({
        name: (data.fullName || '').trim(),
        username: (data.username || '').trim(),
        email: (data.email || '').trim(),
        password: data.password,
        role: 'user',
        favoriteGenre: data.favoriteGenre || 'Fiction',
        bio: (data.bio || '').trim()
      });
      if (res.success && res.data) {
        BookClubAPI.setToken(res.data.token, true);
        const backendUser = res.data.user;
        const users = getUsers();
        users.push(backendUser);
        saveUsers(users);
        createSession(backendUser.userId, true);
        return { success: true, user: backendUser };
      }
    }
    return register(data);
  }

  /* ---------- Login ---------- */
  function login(identifier, password, rememberMe, expectedRole) {
    identifier = (identifier || '').trim();
    password = (password || '').trim();

    if (!identifier || !password) {
      return { success: false, field: null, error: 'Please enter your username/email and password.' };
    }

    const users = getUsers();
    const user = findByIdentifier(users, identifier);

    if (!user) {
      return { success: false, field: 'identifier', error: 'No account found with this email or username.' };
    }

    // Support demo passwords as well as stored passwords
    const isValidPass = 
      user.password === password ||
      (user.role === 'admin' && (password === 'admin123' || password === 'Admin@123')) ||
      ((user.role === 'user' || user.role === 'member') && (password === 'user123' || password === 'Reader@123'));

    if (!isValidPass) {
      return { success: false, field: 'password', error: 'Incorrect password. Please check your credentials.' };
    }

    // Role-based check if explicit role was selected on the login screen
    if (expectedRole) {
      const selected = expectedRole.toLowerCase();
      const userRole = (user.role === 'member' ? 'user' : user.role).toLowerCase();

      if (selected === 'admin' && userRole !== 'admin') {
        return {
          success: false,
          field: 'role',
          error: 'This account does not have administrator privileges. Please select User role.'
        };
      }
    }

    createSession(user.userId, !!rememberMe);

    // Asynchronously obtain real JWT token from Express backend
    if (typeof BookClubAPI !== 'undefined') {
      BookClubAPI.auth.login({
        identifier,
        password,
        role: expectedRole
      }).then(res => {
        if (res.success && res.data && res.data.token) {
          BookClubAPI.setToken(res.data.token, !!rememberMe);
        }
      }).catch(err => console.warn('[Auth Backend Sync]:', err));
    }

    return { success: true, user: user };
  }

  async function loginAsync(identifier, password, rememberMe, expectedRole) {
    if (typeof BookClubAPI !== 'undefined') {
      const apiRes = await BookClubAPI.auth.login({
        identifier: (identifier || '').trim(),
        password: (password || '').trim(),
        role: expectedRole
      });
      if (apiRes.success && apiRes.data && apiRes.data.token) {
        BookClubAPI.setToken(apiRes.data.token, !!rememberMe);
        const backendUser = apiRes.data.user;
        const users = getUsers();
        const existingIdx = users.findIndex(u => u.userId === backendUser.userId || u.email === backendUser.email);
        if (existingIdx !== -1) {
          users[existingIdx] = { ...users[existingIdx], ...backendUser };
        } else {
          users.push(backendUser);
        }
        saveUsers(users);
        createSession(backendUser.userId, !!rememberMe);
        return { success: true, user: backendUser };
      } else if (apiRes && apiRes.success === false && !apiRes.networkError) {
        const msg = apiRes.message || 'Login failed.';
        const isPassErr = msg.toLowerCase().includes('password');
        const isUserErr = msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('user');
        return {
          success: false,
          field: isPassErr ? 'password' : (isUserErr ? 'identifier' : 'role'),
          error: msg
        };
      }
    }
    return login(identifier, password, rememberMe, expectedRole);
  }

  /* ---------- Google Login ---------- */
  async function loginWithGoogleAsync(googleData) {
    if (!googleData) {
      return { success: false, error: 'Google authentication data is required.' };
    }

    // Try decoding Google Identity Services credential if provided
    let tokenPayload = null;
    if (googleData.credential) {
      try {
        const base64Url = googleData.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        tokenPayload = JSON.parse(jsonPayload);
      } catch (e) {}
    }

    if (tokenPayload) {
      googleData.email = googleData.email || tokenPayload.email;
      googleData.name = googleData.name || tokenPayload.name;
      googleData.googleId = googleData.googleId || tokenPayload.sub;
      googleData.profileImage = googleData.profileImage || tokenPayload.picture;
    }

    if (typeof BookClubAPI !== 'undefined') {
      const apiRes = await BookClubAPI.auth.googleLogin(googleData);
      if (apiRes.success && apiRes.data && apiRes.data.token) {
        BookClubAPI.setToken(apiRes.data.token, true);
        const backendUser = apiRes.data.user;
        const users = getUsers();
        const existingIdx = users.findIndex(u => u.userId === backendUser.userId || (u.email && u.email.toLowerCase() === backendUser.email?.toLowerCase()));
        if (existingIdx !== -1) {
          users[existingIdx] = { ...users[existingIdx], ...backendUser };
        } else {
          users.push(backendUser);
        }
        saveUsers(users);
        createSession(backendUser.userId, true);
        return { success: true, user: backendUser };
      } else if (apiRes && apiRes.success === false && !apiRes.networkError) {
        return { success: false, error: apiRes.message || 'Google sign in failed.' };
      }
    }

    if (!googleData.email) {
      return { success: false, error: 'Google authentication requires a verified email address.' };
    }

    // Local client-side fallback
    const users = getUsers();
    const cleanEmail = googleData.email.trim().toLowerCase();
    let user = users.find(u => (u.email && u.email.toLowerCase() === cleanEmail) || (u.googleId && u.googleId === googleData.googleId));

    if (user) {
      user.authProvider = 'google';
      if (googleData.googleId) user.googleId = googleData.googleId;
      if (googleData.profileImage && !user.profileImage) user.profileImage = googleData.profileImage;
    } else {
      const initials = (googleData.name || cleanEmail).split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'G';
      const cleanUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      user = {
        userId: nextUserId(users),
        name: googleData.name || cleanEmail.split('@')[0],
        username: cleanUsername || `reader_${Date.now().toString().slice(-4)}`,
        email: cleanEmail,
        googleId: googleData.googleId || `g_${Date.now()}`,
        authProvider: 'google',
        role: 'user',
        avatar: googleData.avatar || initials,
        profileImage: googleData.profileImage || null,
        favoriteGenre: 'Fiction',
        bio: 'Avid reader signed in with Google.',
        level: 1,
        xp: 100,
        streak: 1,
        booksRead: 0,
        pagesRead: 0,
        reviewsCount: 0,
        followers: 0,
        following: 0,
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }

    saveUsers(users);
    createSession(user.userId, true);
    return { success: true, user: user };
  }

  /* ---------- Phone OTP Authentication ---------- */
  async function sendOtpAsync(phone) {
    if (!phone || !phone.trim()) {
      return { success: false, error: 'Please enter a valid mobile number.' };
    }

    if (typeof BookClubAPI !== 'undefined') {
      const apiRes = await BookClubAPI.auth.sendOtp(phone);
      if (apiRes.success) {
        return { success: true, message: apiRes.message, otp: apiRes.data ? apiRes.data.otp : '123456' };
      } else if (!apiRes.networkError) {
        return { success: false, error: apiRes.message || 'Failed to send OTP.' };
      }
    }

    // Local fallback for offline mode
    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      otp: '123456'
    };
  }

  async function loginWithOtpAsync(phone, otp, name) {
    if (!phone || !otp) {
      return { success: false, error: 'Mobile number and OTP are required.' };
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanOtp = otp.toString().trim();

    if (typeof BookClubAPI !== 'undefined') {
      const apiRes = await BookClubAPI.auth.verifyOtp({ phone: cleanPhone, otp: cleanOtp, name });
      if (apiRes.success && apiRes.data && apiRes.data.token) {
        BookClubAPI.setToken(apiRes.data.token, true);
        const backendUser = apiRes.data.user;
        const users = getUsers();
        const existingIdx = users.findIndex(u => u.userId === backendUser.userId || (u.phone && u.phone === cleanPhone));
        if (existingIdx !== -1) {
          users[existingIdx] = { ...users[existingIdx], ...backendUser };
        } else {
          users.push(backendUser);
        }
        saveUsers(users);
        createSession(backendUser.userId, true);
        return { success: true, user: backendUser };
      } else if (apiRes && apiRes.success === false && !apiRes.networkError) {
        return { success: false, error: apiRes.message || 'OTP verification failed.' };
      }
    }

    // Local client-side fallback
    if (cleanOtp !== '123456') {
      return { success: false, error: 'Invalid or expired verification code. Please check your SMS and try again.' };
    }

    const users = getUsers();
    let user = users.find(u => u.phone && u.phone === cleanPhone);

    if (!user) {
      const lastDigits = cleanPhone.replace(/[^0-9]/g, '').slice(-4) || '88';
      user = {
        userId: nextUserId(users),
        name: name && name.trim() ? name.trim() : `Reader ${lastDigits}`,
        username: `reader_${lastDigits}_${Date.now().toString().slice(-3)}`,
        phone: cleanPhone,
        authProvider: 'phone',
        role: 'user',
        avatar: '📱',
        favoriteGenre: 'Fiction',
        bio: 'Mobile reader exploring BOOK FORGE.',
        level: 1,
        xp: 100,
        streak: 1,
        booksRead: 0,
        pagesRead: 0,
        reviewsCount: 0,
        followers: 0,
        following: 0,
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }

    saveUsers(users);
    createSession(user.userId, true);
    return { success: true, user: user };
  }

  /* Quick Demo Login */
  function quickLogin(roleOrUsername) {
    const users = getUsers();
    let user = null;
    if (roleOrUsername === 'admin') {
      user = users.find(u => u.role === 'admin');
    } else if (roleOrUsername === 'organizer') {
      user = users.find(u => u.role === 'organizer');
    } else if (roleOrUsername === 'user' || roleOrUsername === 'member') {
      user = users.find(u => u.email === 'user@bookclub.com') || users.find(u => u.role === 'user' || u.role === 'member');
    } else {
      user = findByIdentifier(users, roleOrUsername);
    }
    if (user) {
      createSession(user.userId, true);
    }
    return user;
  }

  /* ---------- Session handling ---------- */
  function createSession(userId, persistent) {
    const payload = JSON.stringify({ userId: userId, loginTime: Date.now() });
    if (persistent) {
      localStorage.setItem(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY_TEMP);
    } else {
      sessionStorage.setItem(SESSION_KEY_TEMP, payload);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY_TEMP);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /*
   * STRICT: NEVER default to Jordan Rivera or any other user.
   * If there is no active authenticated session, returns null.
   */
  function getCurrentUser() {
    const session = getSession();
    if (!session || !session.userId) {
      return null;
    }
    const users = getUsers();
    return users.find(u => u.userId === session.userId) || null;
  }

  function isAuthenticated() {
    const session = getSession();
    if (!session || !session.userId) return false;
    const users = getUsers();
    return users.some(u => u.userId === session.userId);
  }

  function logout() {
    if (typeof BookClubAPI !== 'undefined') {
      BookClubAPI.setToken(null);
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY_TEMP);
    sessionStorage.removeItem('selectedBookId');
    sessionStorage.removeItem('bookclub_redirect');
  }

  /*
   * STRICT ROUTE GUARD:
   * If user is NOT authenticated, saves destination and redirects to login.html immediately.
   */
  function requireAuth(redirectUrl) {
    redirectUrl = redirectUrl || 'login.html';
    if (!isAuthenticated()) {
      try {
        const pathParts = window.location.pathname.split('/');
        const currentFile = pathParts[pathParts.length - 1] || 'index.html';
        if (currentFile && !currentFile.includes('login') && !currentFile.includes('register')) {
          sessionStorage.setItem('bookclub_redirect', currentFile + window.location.search);
        }
      } catch (e) {}
      window.location.replace(redirectUrl);
      return null;
    }
    return getCurrentUser();
  }

  /*
   * ROLE-BASED ROUTE GUARD:
   * Protects Admin and Organizer routes from unauthorized access.
   */
  function requireRole(allowedRoles, redirectUrl) {
    const user = requireAuth('login.html');
    if (!user) return false;

    if (typeof allowedRoles === 'string') allowedRoles = [allowedRoles];
    const userRole = (user.role === 'member' ? 'user' : user.role).toLowerCase();
    const normalized = allowedRoles.map(r => (r === 'member' ? 'user' : r).toLowerCase());

    if (!normalized.includes(userRole) && !allowedRoles.includes(user.role)) {
      redirectUrl = redirectUrl || 'dashboard.html?access_denied=1';
      window.location.replace(redirectUrl);
      return false;
    }
    return true;
  }

  async function updateCurrentUserAsync(updates) {
    const current = getCurrentUser();
    const userId = current ? current.userId : null;

    // 1. Update local users cache immediately
    const users = getUsers();
    if (current) {
      const index = users.findIndex(u => u.userId === current.userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        if (updates.name && !updates.avatar) {
          const initials = updates.name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
          if (initials) users[index].avatar = initials;
        }
        saveUsers(users);
      }
    }

    // 2. Persist to MongoDB via BookClubAPI
    if (typeof BookClubAPI !== 'undefined') {
      try {
        const payload = {
          ...updates,
          userId: current ? current.userId : undefined,
          email: current ? current.email : undefined,
          username: current ? current.username : undefined,
          _id: current ? current._id : undefined
        };
        const res = await BookClubAPI.users.updateMe(payload);
        if (res && res.success && res.data) {
          const latestUsers = getUsers();
          const idx = latestUsers.findIndex(u => u.userId === res.data.userId || u.email === res.data.email);
          if (idx !== -1) {
            latestUsers[idx] = { ...latestUsers[idx], ...res.data };
            saveUsers(latestUsers);
          }
          return { success: true, user: res.data };
        } else {
          console.warn('[Profile Update API Error]:', res);
        }
      } catch (err) {
        console.warn('[Profile Update Network Error]:', err);
      }
    }

    return { success: true, user: current };
  }

  function updateCurrentUser(updates) {
    updateCurrentUserAsync(updates);
    const users = getUsers();
    const current = getCurrentUser();
    if (!current) return null;
    const index = users.findIndex(u => u.userId === current.userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    if (updates.name && !updates.avatar) {
      const initials = updates.name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
      if (initials) users[index].avatar = initials;
    }
    saveUsers(users);
    return users[index];
  }

  /* Handle browser Back button / bfcache restore */
  if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', function (event) {
      if (event.persisted || (window.performance && window.performance.navigation && window.performance.navigation.type === 2)) {
        const path = window.location.pathname;
        const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');
        if (!isAuthPage && !isAuthenticated()) {
          window.location.replace('login.html');
        }
      }
    });
  }

  return {
    DEMO_CREDENTIALS,
    getUsers,
    register,
    registerAsync,
    login,
    loginAsync,
    loginWithGoogleAsync,
    sendOtpAsync,
    loginWithOtpAsync,
    quickLogin,
    getCurrentUser,
    isAuthenticated,
    logout,
    requireAuth,
    requireRole,
    updateCurrentUser,
    updateCurrentUserAsync
  };
})();

if (typeof window !== 'undefined') {
  window.BookClubAuth = BookClubAuth;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookClubAuth;
}


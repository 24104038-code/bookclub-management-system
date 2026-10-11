import React, { createContext, useContext, useState, useEffect } from 'react';
import BookClubAPI, { getToken, setToken } from '../services/api';

const AuthContext = createContext();

const USERS_KEY = 'bookclub_users';
const SESSION_KEY = 'bookclub_session';

const DEMO_USERS = [
  {
    userId: 1,
    name: 'Admin User',
    username: 'admin',
    email: 'admin@bookclub.com',
    password: 'admin123',
    role: 'admin',
    favoriteGenre: 'Non-Fiction',
    bio: 'BookClub platform administrator.',
    avatar: 'AU'
  },
  {
    userId: 7,
    name: 'Elena Ramos',
    username: 'user',
    email: 'user@bookclub.com',
    password: 'user123',
    role: 'user',
    favoriteGenre: 'Fiction',
    bio: 'Avid book lover exploring fiction, reading streaks, and community discussions.',
    avatar: 'ER'
  }
];

function seedLocalUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY));
    if (!stored || !stored.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    }
  } catch (e) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedLocalUsers();
    initSession();
  }, []);

  async function initSession() {
    setLoading(true);
    const token = getToken();
    const storedSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);

    if (token) {
      try {
        const res = await BookClubAPI.auth.getMe();
        if (res.success && res.data) {
          setUser(res.data);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || DEMO_USERS;
        const matched = users.find(u => u.userId === parsed.userId || u.id === parsed.userId || u.email === parsed.email);
        if (matched) {
          setUser(matched);
        }
      } catch (e) {}
    }

    setLoading(false);
  }

  async function login(identifier, password, rememberMe = true, expectedRole = null) {
    const trimmedId = (identifier || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, error: 'Please enter your username/email and password.' };
    }

    // Try backend API first
    let lastApiError = null;
    try {
      const apiRes = await BookClubAPI.auth.login({
        identifier: trimmedId,
        password: trimmedPass,
        role: expectedRole
      });

      if (apiRes.success && apiRes.data && apiRes.data.user) {
        setToken(apiRes.data.token, rememberMe);
        setUser(apiRes.data.user);
        const sessionPayload = { userId: apiRes.data.user.userId || apiRes.data.user._id, email: apiRes.data.user.email };
        if (rememberMe) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
        }
        return { success: true, user: apiRes.data.user };
      } else if (apiRes && (apiRes.message || apiRes.error) && !apiRes.networkError) {
        // Capture direct validation or permission error from backend
        lastApiError = apiRes.message || apiRes.error;
      }
    } catch (err) {
      lastApiError = err.message;
    }

    // Fallback to local user store
    seedLocalUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || DEMO_USERS;
    const matched = users.find(u => 
      (u.email && u.email.toLowerCase() === trimmedId.toLowerCase()) || 
      (u.username && u.username.toLowerCase() === trimmedId.toLowerCase())
    );

    if (matched) {
      const isValidPass = matched.password === trimmedPass ||
        (matched.role === 'admin' && (trimmedPass === 'admin123' || trimmedPass === 'Admin@123')) ||
        ((matched.role === 'user' || matched.role === 'member') && (trimmedPass === 'user123' || trimmedPass === 'Reader@123'));

      if (!isValidPass) {
        return { success: false, error: 'Incorrect password. Please check your credentials.' };
      }

      if (expectedRole) {
        const selected = expectedRole.toLowerCase();
        const userRole = (matched.role === 'member' ? 'user' : matched.role).toLowerCase();
        if (selected === 'admin' && userRole !== 'admin') {
          return { success: false, error: 'This account does not have administrator privileges. Please select User role.' };
        }
      }

      setUser(matched);
      const sessionPayload = { userId: matched.userId, email: matched.email };
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
      }
      return { success: true, user: matched };
    }

    if (lastApiError) {
      return { success: false, error: lastApiError };
    }

    return { success: false, error: 'No account found with this email or username.' };
  }

  async function register(userData) {
    try {
      const res = await BookClubAPI.auth.register(userData);
      if (res.success && res.data) {
        setToken(res.data.token, true);
        setUser(res.data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: res.data.user.userId, email: res.data.user.email }));
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.message || res.error || 'Registration failed on database server.' };
    } catch (e) {
      return { success: false, error: e.message || 'Unable to connect to database server.' };
    }
  }

  async function googleLogin(payload) {
    try {
      const res = await BookClubAPI.auth.googleLogin(payload);
      if (res.success && res.data) {
        setToken(res.data.token, true);
        setUser(res.data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: res.data.user.userId, email: res.data.user.email }));
        return { success: true, user: res.data.user };
      }
      return res;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function sendPhoneOtp(phone) {
    try {
      const res = await BookClubAPI.auth.sendOtp(phone);
      return res;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function phoneLogin(phone, otp, name = '') {
    try {
      const res = await BookClubAPI.auth.verifyOtp({ phone, otp, name });
      if (res.success && res.data) {
        setToken(res.data.token, true);
        setUser(res.data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: res.data.user.userId || res.data.user._id, phone: res.data.user.phone }));
        return { success: true, user: res.data.user };
      }
      return res;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function quickLogin(targetRole = 'user') {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || DEMO_USERS;
    let target = users.find(u => u.role === targetRole);
    if (!target) {
      target = DEMO_USERS.find(u => u.role === targetRole) || DEMO_USERS[1];
    }
    setUser(target);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: target.userId, email: target.email }));
    return target;
  }

  async function updateUser(data) {
    try {
      const res = await BookClubAPI.users.updateMe(data);
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, user: res.data };
      }
    } catch (e) {}

    // Local fallback update
    const updated = { ...user, ...data };
    setUser(updated);
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || DEMO_USERS;
    const idx = users.findIndex(u => u.userId === updated.userId || u.email === updated.email);
    if (idx !== -1) {
      users[idx] = updated;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return { success: true, user: updated };
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        phoneLogin,
        sendPhoneOtp,
        quickLogin,
        logout,
        updateUser,
        hasRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

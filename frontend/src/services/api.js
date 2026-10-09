/**
 * =========================================================
 * BOOK FORGE — Centralized API Client Layer (frontend/src/services/api.js)
 * Connects React frontend smoothly to Node.js/Express REST backend.
 * =========================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'bookclub_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
}

export function setToken(token, persistent = true) {
  try {
    if (token) {
      if (persistent) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
}

export async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const url = `${BASE_URL}${cleanEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data.message || `Request failed with status ${res.status}`,
        error: data.message || 'Server error'
      };
    }

    return data;
  } catch (err) {
    // Automatic Direct Failover: If relative /api request failed (e.g. Vite dev proxy dropped),
    // retry directly to backend server at http://localhost:5000/api
    if (typeof window !== 'undefined' && !url.includes(':5000')) {
      try {
        const directUrl = `http://localhost:5000/api${cleanEndpoint}`;
        const directRes = await fetch(directUrl, config);
        const directData = await directRes.json().catch(() => ({}));

        if (!directRes.ok) {
          return {
            success: false,
            status: directRes.status,
            message: directData.message || `Request failed with status ${directRes.status}`,
            error: directData.message || 'Server error'
          };
        }

        return directData;
      } catch (directErr) {
        console.warn(`[API Direct Failover Notice]: Could not reach direct URL http://localhost:5000/api${cleanEndpoint}.`, directErr.message);
      }
    }

    console.warn(`[API Network Notice]: Could not reach ${url}.`, err.message);
    const userMessage = err.message === 'Failed to fetch'
      ? 'Unable to connect to the backend server. Please ensure the backend is running on port 5000.'
      : err.message;

    return {
      success: false,
      networkError: true,
      message: userMessage,
      error: userMessage
    };
  }
}

function toQueryString(params = {}) {
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? `?${q}` : '';
}

export const BookClubAPI = {
  BASE_URL,
  getToken,
  setToken,
  request,

  // Health
  health: () => request('/health'),

  // Auth
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    googleLogin: (payload) => request('/auth/google', { method: 'POST', body: payload }),
    getGoogleConfig: () => request('/auth/google-config'),
    sendOtp: (phone) => request('/auth/otp/send', { method: 'POST', body: { phone } }),
    verifyOtp: (payload) => request('/auth/otp/verify', { method: 'POST', body: payload }),
    getMe: () => request('/auth/me')
  },

  // Users
  users: {
    getMe: () => request('/users/me'),
    updateMe: (data) => request('/users/me', { method: 'PUT', body: data }),
    getAll: (params) => request(`/users${toQueryString(params)}`),
    getById: (id) => request(`/users/${id}`)
  },

  // Books
  books: {
    getAll: (params) => request(`/books${toQueryString(params)}`),
    getById: (id) => request(`/books/${id}`),
    create: (data) => request('/books', { method: 'POST', body: data }),
    update: (id, data) => request(`/books/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/books/${id}`, { method: 'DELETE' })
  },

  // Library Shelves & Reading Progress
  library: {
    getAll: (params) => request(`/library${toQueryString(params)}`),
    updateShelf: (bookId, data) => request(`/library/${bookId}`, { method: 'PUT', body: data }),
    remove: (bookId) => request(`/library/${bookId}`, { method: 'DELETE' }),
    getProgress: () => request('/reading-progress'),
    updateProgress: (bookId, currentPage) => request(`/reading-progress/${bookId}`, {
      method: 'PUT',
      body: { currentPage }
    })
  },

  // Reviews
  reviews: {
    getAll: (params) => request(`/reviews${toQueryString(params)}`),
    getById: (id) => request(`/reviews/${id}`),
    create: (data) => request('/reviews', { method: 'POST', body: data }),
    update: (id, data) => request(`/reviews/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
    toggleLike: (id) => request(`/reviews/${id}/like`, { method: 'POST' })
  },

  // Groups
  groups: {
    getAll: (params) => request(`/groups${toQueryString(params)}`),
    getById: (id) => request(`/groups/${id}`),
    create: (data) => request('/groups', { method: 'POST', body: data }),
    update: (id, data) => request(`/groups/${id}`, { method: 'PUT', body: data }),
    toggleJoin: (id) => request(`/groups/${id}/join`, { method: 'POST' }),
    trackEvent: (id, data) => request(`/groups/${id}/track-event`, { method: 'POST', body: data }),
    votePoll: (id, optionIndex) => request(`/groups/${id}/poll/vote`, {
      method: 'POST',
      body: { optionIndex }
    })
  },

  // Events
  events: {
    getAll: (params) => request(`/events${toQueryString(params)}`),
    getById: (id) => request(`/events/${id}`),
    create: (data) => request('/events', { method: 'POST', body: data }),
    update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: data }),
    toggleRSVP: (id) => request(`/events/${id}/rsvp`, { method: 'POST' }),
    track: (id, data) => request(`/events/${id}/track`, { method: 'POST', body: data }),
    getCertificateStatus: (id) => request(`/events/${id}/certificate-status`),
    generateCertificate: (id) => request(`/events/${id}/certificate`, { method: 'POST' }),
    completeTask: (id, taskId) => request(`/events/${id}/tasks/${taskId}/complete`, { method: 'POST' })
  },

  // Certificates
  certificates: {
    getAll: () => request('/certificates'),
    getById: (id) => request(`/certificates/${id}`),
    verify: (certificateId) => request(`/certificates/verify/${certificateId}`),
    getPdfUrl: (certificateId) => `${BASE_URL}/certificates/${certificateId}/pdf`
  },

  // Discussions
  discussions: {
    getAll: (params) => request(`/discussions${toQueryString(params)}`),
    getById: (id) => request(`/discussions/${id}`),
    create: (data) => request('/discussions', { method: 'POST', body: data }),
    reply: (id, content, hasSpoiler = false) => request(`/discussions/${id}/reply`, {
      method: 'POST',
      body: { content, hasSpoiler }
    }),
    toggleLike: (id) => request(`/discussions/${id}/like`, { method: 'POST' })
  },

  // Goals
  goals: {
    getAll: () => request('/goals'),
    create: (data) => request('/goals', { method: 'POST', body: data }),
    update: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/goals/${id}`, { method: 'DELETE' })
  },

  // Challenges
  challenges: {
    getAll: () => request('/challenges'),
    getById: (id) => request(`/challenges/${id}`),
    toggleJoin: (id) => request(`/challenges/${id}/join`, { method: 'POST' }),
    getCertificateStatus: (id) => request(`/challenges/${id}/certificate-status`),
    generateCertificate: (id) => request(`/challenges/${id}/certificate`, { method: 'POST' }),
    updateProgress: (id, progress) => request(`/challenges/${id}/progress`, { method: 'POST', body: { progress } }),
    complete: (id) => request(`/challenges/${id}/complete`, { method: 'POST' })
  },

  // Competitions
  competitions: {
    getAll: () => request('/competitions'),
    getById: (id) => request(`/competitions/${id}`),
    toggleJoin: (id) => request(`/competitions/${id}/join`, { method: 'POST' })
  },

  // Notes
  notes: {
    getAll: (bookId) => request(`/notes${toQueryString({ bookId })}`),
    create: (data) => request('/notes', { method: 'POST', body: data }),
    update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/notes/${id}`, { method: 'DELETE' })
  },

  // Highlights
  highlights: {
    getAll: (params) => request(`/highlights${toQueryString(params)}`),
    create: (data) => request('/highlights', { method: 'POST', body: data }),
    update: (id, data) => request(`/highlights/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/highlights/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id) => request(`/highlights/${id}/favorite`, { method: 'POST' })
  },

  // Journal
  journal: {
    getAll: () => request('/journal'),
    create: (data) => request('/journal', { method: 'POST', body: data }),
    delete: (id) => request(`/journal/${id}`, { method: 'DELETE' })
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
    delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' })
  },

  // Activity
  activities: {
    getAll: (limit = 20) => request(`/activities${toQueryString({ limit })}`),
    create: (data) => request('/activities', { method: 'POST', body: data })
  },

  // Reports
  reports: {
    getAll: (params) => request(`/reports${toQueryString(params)}`),
    create: (data) => request('/reports', { method: 'POST', body: data }),
    update: (id, data) => request(`/reports/${id}`, { method: 'PUT', body: data })
  },

  // Leaderboards
  leaderboards: {
    get: () => request('/leaderboards')
  },
  achievements: {
    getAll: (params) => request(`/achievements${toQueryString(params)}`)
  },

  // Recommendations & Search
  recommendations: {
    get: () => request('/recommendations')
  },
  search: {
    query: (q) => request(`/search${toQueryString({ q })}`)
  },

  // Messages
  messages: {
    getContacts: () => request('/messages/contacts'),
    getMessages: (contactId) => request(`/messages/${contactId}`),
    send: (data) => request('/messages', { method: 'POST', body: data }),
    markAsRead: (contactId) => request(`/messages/${contactId}/read`, { method: 'PUT' })
  },

  // AI Assistant
  ai: {
    chat: (data) => request('/ai/chat', { method: 'POST', body: data })
  }
};

export default BookClubAPI;

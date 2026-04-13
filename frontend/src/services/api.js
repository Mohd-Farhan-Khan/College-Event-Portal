/**
 * API Service
 *
 * Centralised HTTP helper that talks to the backend at
 * http://localhost:8000.  Every request automatically attaches the
 * JWT token (if present) from localStorage.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Generic fetch wrapper.
 *
 * @param {string}  endpoint  – path relative to API_BASE, e.g. '/api/auth/login'
 * @param {object}  options   – { method, body, headers, … }
 * @returns {Promise<object>}
 */
async function request(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  // Try to parse JSON regardless of status
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ───── Auth endpoints ───── */

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 */
export function login(credentials) {
  return request('/api/auth/login', { method: 'POST', body: credentials });
}

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, password: string, role?: string, college?: string }} userData
 */
export function register(userData) {
  return request('/api/auth/register', { method: 'POST', body: userData });
}

/**
 * GET /api/auth/me  – returns current authenticated user
 */
export function getMe() {
  return request('/api/auth/me');
}

/* ───── Events (will be used later) ───── */

export function getEvents() {
  return request('/api/events');
}

export function getEvent(id) {
  return request(`/api/events/${id}`);
}

/* ───── Generic export for future use ───── */
export { request };

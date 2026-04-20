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

/* ───── Registrations ───── */

/**
 * GET /api/registrations/me  – student's own registrations
 * @param {{ event_id?: string, status?: string }} [filters]
 */
export function getMyRegistrations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.event_id) params.append('event_id', filters.event_id);
  if (filters.status) params.append('status', filters.status);
  const q = params.toString();
  return request(`/api/registrations/me${q ? `?${q}` : ''}`);
}

/* ───── Colleges ───── */

export function getColleges() {
  return request('/api/colleges');
}

export function getCollege(id) {
  return request(`/api/colleges/${id}`);
}

/**
 * POST /api/colleges
 * @param {{ name: string, location?: string, description?: string, logo_url?: string }} data
 */
export function createCollege(data) {
  return request('/api/colleges', { method: 'POST', body: data });
}

export function deleteCollege(id) {
  return request(`/api/colleges/${id}`, { method: 'DELETE' });
}

/**
 * PUT /api/colleges/:id
 * @param {string} id
 * @param {{ name?: string, location?: string, description?: string, logo_url?: string }} data
 */
export function updateCollege(id, data) {
  return request(`/api/colleges/${id}`, { method: 'PUT', body: data });
}

export function getCollegeOverview(id) {
  return request(`/api/colleges/${id}/overview`);
}

export function getCollegeEvents(id) {
  return request(`/api/colleges/${id}/events`);
}

export function getCollegeUsers(id) {
  return request(`/api/colleges/${id}/users`);
}

/* ───── Analytics ───── */

/**
 * GET /api/analytics/admin
 * @param {{ college_id?: string }} [filters]
 */
export function getAdminAnalytics(filters = {}) {
  const params = new URLSearchParams();
  if (filters.college_id) params.append('college_id', filters.college_id);
  const q = params.toString();
  return request(`/api/analytics/admin${q ? `?${q}` : ''}`);
}

/**
 * GET /api/analytics/college
 */
export function getCollegeAnalytics() {
  return request('/api/analytics/college');
}

/* ───── Upload ───── */

/**
 * POST /api/upload  (multipart/form-data)
 * Uploads a file to the backend (Cloudinary or local storage).
 *
 * @param {File}   file  – the File object from an <input type="file">
 * @param {string} kind  – 'poster' | 'certificate' | 'generic'
 * @returns {Promise<{ url: string, publicId: string, filename: string, mimeType: string, size: number, storage: string }>}
 */
export async function uploadFile(file, kind = 'generic') {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Upload failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ───── Certificate Generation ───── */

/**
 * POST /api/results/:id/certificate
 * Triggers backend-side PDF certificate generation for a published result.
 *
 * @param {string} resultId – the Result document _id
 * @returns {Promise<object>} – the updated result with certificate_url
 */
export function generateCertificate(resultId) {
  return request(`/api/results/${resultId}/certificate`, { method: 'POST' });
}

/* ───── Generic export for future use ───── */
export { request };

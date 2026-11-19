import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ns_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid session -> clear it (AuthContext listens to this event)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/login') && localStorage.getItem('ns_token')) {
      localStorage.removeItem('ns_token');
      window.dispatchEvent(new Event('ns-logout'));
    }
    return Promise.reject(err);
  },
);

export const errMsg = (e, fallback = 'Something went wrong. Please try again.') => {
  const d = e?.response?.data;
  if (d?.error) return d.detail ? `${d.error} (${d.detail})` : d.error;
  if (e?.code === 'ERR_NETWORK') return 'Cannot reach the server. If it was idle, wait about 30 seconds and try again.';
  return fallback;
};

// Photos uploaded from the admin panel are saved as "/api/uploads/12"; online photos are full links
export const imgSrc = (u) => (!u ? '' : u.startsWith('/') ? `${API_URL}${u}` : u);

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const fmtDate = (d, withTime = false) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }) : '-';

export default api;

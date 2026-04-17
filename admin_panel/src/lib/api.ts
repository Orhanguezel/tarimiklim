import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8088/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Token'i Authorization header'a ekle
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 durumunda login'e yonlendir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/user'),
};

// Locations
export const locationsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/admin/locations', { params }),
  create: (body: unknown) => api.post('/admin/locations', body),
  update: (id: string, body: unknown) => api.put(`/admin/locations/${id}`, body),
  delete: (id: string) => api.delete(`/admin/locations/${id}`),
};

// Alerts
export const alertsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/admin/alerts', { params }),
  triggerFrostCheck: (locationId: string) =>
    api.post(`/admin/alerts/frost-check/${locationId}`),
  listRules: (params?: { userId?: string; all?: boolean }) =>
    api.get('/admin/alerts/rules', { params }),
  createRule: (body: unknown) => api.post('/admin/alerts/rules', body),
  deleteRule: (id: string) => api.delete(`/admin/alerts/rules/${id}`),
};

// Weather
export const weatherApi = {
  forecast: (lat: number, lon: number, days = 7) =>
    api.get('/weather', { params: { lat, lon, days } }),
  frostRisk: (location: string) =>
    api.get('/weather/frost-risk', { params: { location } }),
};

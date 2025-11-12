// src/services/api.js
import axios from 'axios';

// THIS IS RUNNING IN LOCALHOST. http://localhost:3000

// Root domain (Sanctum requires the csrf cookie endpoint at the root)
const API_ROOT = 'https://halobat-production.up.railway.app';
const API_PREFIX = '/api';

const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // needed for Sanctum cookie-based auth
});

// Request Interceptor: attach Bearer token for API authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  register: async (userData) => {
    return api.post(`${API_PREFIX}/register`, userData);
  },
  login: async (credentials) => {
    return api.post(`${API_PREFIX}/login`, credentials);
  },
  logout: async () => {
    return api.post(`${API_PREFIX}/logout`);
  },
  getCurrentUser: () => api.get(`${API_PREFIX}/user`),
};

// ==================== USER APIs ====================
export const userAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/users`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/users/${id}`),
  create: (userData) => api.post(`${API_PREFIX}/users`, userData),
  update: (id, userData) => api.put(`${API_PREFIX}/users/${id}`, userData),
  delete: (id) => api.delete(`${API_PREFIX}/users/${id}`),
};

// ==================== OBAT (DRUGS) APIs ====================
export const obatAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/drugs`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/drugs/${id}`),
  create: (obatData) => api.post(`${API_PREFIX}/drugs`, obatData),
  update: (id, obatData) => api.put(`${API_PREFIX}/drugs/${id}`, obatData),
  delete: (id) => api.delete(`${API_PREFIX}/drugs/${id}`),
};

// ==================== ROLES APIs ====================
export const roleAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/roles`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/roles/${id}`),
  create: (roleData) => api.post(`${API_PREFIX}/roles`, roleData),
  update: (id, roleData) => api.put(`${API_PREFIX}/roles/${id}`, roleData),
  delete: (id) => api.delete(`${API_PREFIX}/roles/${id}`),
};

// ==================== REPORTS APIs ====================
export const reportAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/reports`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/reports/${id}`),
};

export default api;
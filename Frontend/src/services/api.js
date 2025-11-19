import axios from 'axios';

const API_ROOT = 'https://halobat-production.up.railway.app';
const API_PREFIX = '/api';

const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Change to false for token-based auth
});

// Request Interceptor
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
  register: (userData) => api.post(`${API_PREFIX}/register`, userData),
  login: (credentials) => api.post(`${API_PREFIX}/login`, credentials),
  logout: () => api.post(`${API_PREFIX}/logout`),
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

// ==================== ADMIN APIs ====================
export const adminAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/admins`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/admins/${id}`),
  create: (adminData) => api.post(`${API_PREFIX}/admins`, adminData),
  update: (id, adminData) => api.put(`${API_PREFIX}/admins/${id}`, adminData),
  delete: (id) => api.delete(`${API_PREFIX}/admins/${id}`),
};

// ==================== ROLES APIs ====================
export const roleAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/roles`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/roles/${id}`),
  create: (roleData) => api.post(`${API_PREFIX}/roles`, roleData),
  update: (id, roleData) => api.put(`${API_PREFIX}/roles/${id}`, roleData),
  delete: (id) => api.delete(`${API_PREFIX}/roles/${id}`),
};

// ==================== DRUGS APIs ====================
export const drugAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/drugs`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/drugs/${id}`),
  create: (drugData) => api.post(`${API_PREFIX}/drugs`, drugData),
  update: (id, drugData) => api.put(`${API_PREFIX}/drugs/${id}`, drugData),
  delete: (id) => api.delete(`${API_PREFIX}/drugs/${id}`),
};

// ==================== BRANDS APIs ====================
export const brandAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/brands`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/brands/${id}`),
  create: (brandData) => api.post(`${API_PREFIX}/brands`, brandData),
  update: (id, brandData) => api.put(`${API_PREFIX}/brands/${id}`, brandData),
  delete: (id) => api.delete(`${API_PREFIX}/brands/${id}`),
};

// ==================== MANUFACTURERS APIs ====================
export const manufacturerAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/manufacturers`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/manufacturers/${id}`),
  create: (manufacturerData) => api.post(`${API_PREFIX}/manufacturers`, manufacturerData),
  update: (id, manufacturerData) => api.put(`${API_PREFIX}/manufacturers/${id}`, manufacturerData),
  delete: (id) => api.delete(`${API_PREFIX}/manufacturers/${id}`),
};

// ==================== DOSAGE FORMS APIs ====================
export const dosageFormAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/dosage-forms`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/dosage-forms/${id}`),
  create: (dosageFormData) => api.post(`${API_PREFIX}/dosage-forms`, dosageFormData),
  update: (id, dosageFormData) => api.put(`${API_PREFIX}/dosage-forms/${id}`, dosageFormData),
  delete: (id) => api.delete(`${API_PREFIX}/dosage-forms/${id}`),
};

// ==================== ACTIVE INGREDIENTS APIs ====================
export const activeIngredientAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/active_ingredients`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/active_ingredients/${id}`),
  create: (ingredientData) => api.post(`${API_PREFIX}/active_ingredients`, ingredientData),
  update: (id, ingredientData) => api.put(`${API_PREFIX}/active_ingredients/${id}`, ingredientData),
  delete: (id) => api.delete(`${API_PREFIX}/active_ingredients/${id}`),
};

// ==================== DIAGNOSES APIs ====================
export const diagnosesAPI = {
  getAll: (params) => api.get(`${API_PREFIX}/diagnoses`, { params }),
  getById: (id) => api.get(`${API_PREFIX}/diagnoses/${id}`),
};

export default api;
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
};

export const videoAPI = {
  getAll: (filters?: any) => api.get('/videos', { params: filters }),
  getById: (id: string) => api.get(`/videos/${id}`),
  create: (videoData: FormData) => api.post('/videos', videoData),
};

export const ebookAPI = {
  getAll: (filters?: any) => api.get('/ebooks', { params: filters }),
  getById: (id: string) => api.get(`/ebooks/${id}`),
  purchase: (ebookId: string) => api.post(`/ebooks/${ebookId}/purchase`),
};

export default api;
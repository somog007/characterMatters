import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
let csrfToken: string | null = null;

const fetchCsrfToken = async () => {
  if (!csrfToken) {
    const response = await axios.get(`${baseURL}/auth/csrf`, { withCredentials: true });
    csrfToken = response.data.csrfToken;
  }
  return csrfToken;
};

export const getCsrfToken = () => csrfToken;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const token = await fetchCsrfToken();
      config.headers['X-CSRF-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) csrfToken = response.data.csrfToken;
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

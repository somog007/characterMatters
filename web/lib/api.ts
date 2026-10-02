import axios from 'axios';

const configuredBaseURL = process.env.NEXT_PUBLIC_API_URL;
if (
  process.env.NODE_ENV === 'production'
  && configuredBaseURL
  && configuredBaseURL !== '/api'
) {
  throw new Error('NEXT_PUBLIC_API_URL must be the same-origin /api path in production');
}

export const API_BASE_URL = configuredBaseURL || '/api';
let csrfToken: string | null = null;

const fetchCsrfToken = async () => {
  if (!csrfToken) {
    const response = await axios.get(`${API_BASE_URL}/auth/csrf`, { withCredentials: true });
    csrfToken = response.data.csrfToken;
  }
  return csrfToken;
};

export const getCsrfToken = () => csrfToken;

export const resendVerificationEmail = async (email: string) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data as { message: string };
};

const api = axios.create({
  baseURL: API_BASE_URL,
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

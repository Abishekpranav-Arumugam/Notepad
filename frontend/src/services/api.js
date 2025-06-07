import axios from 'axios';

// CORRECT LOGIC:
// 1. Use the URL from the environment variable if it exists (for Vercel).
// 2. If not, it MUST be local development, so fall back to the localhost URL.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log(`API Base URL set to: ${API_BASE_URL}`); // This helps you debug!

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor (Adds Auth Token) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Your Response Interceptor can go here ---
// (The one you already have for handling 401 errors is good)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Redirecting to login.');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
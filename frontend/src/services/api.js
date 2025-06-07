import axios from 'axios';

// This logic now works for both local and production as per your requirement.
// It will always use the URL from an environment variable.
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Add a check to prevent the app from running without the URL configured.
if (!API_BASE_URL) {
  console.error("CRITICAL ERROR: REACT_APP_API_URL is not defined. The app cannot connect to the backend.");
  // You could also throw an error or display a message to the user.
}

console.log(`API Base URL set to: ${API_BASE_URL}`);

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
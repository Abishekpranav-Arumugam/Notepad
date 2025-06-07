// src/api.js
import axios from 'axios';

// Check if in development environment (common but not foolproof way)
const isDevelopment = process.env.NODE_ENV === 'development';

// Use environment variable if available, otherwise use NODE_ENV check
const API_BASE_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5000/api' : '/api');
console.log(`API Base URL set to: ${API_BASE_URL}`); // Log the final base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// --- Request Interceptor (Adds Auth Token) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Your custom JWT from backend
    console.log("api.js interceptor: Retrieved token from localStorage:", token); // ADD THIS LINE
    if (token && config.headers) { // Ensure headers object exists
      config.headers['Authorization'] = `Bearer ${token}`;
       // console.log('Authorization header IS being sent.'); // Uncomment for deep debug
    } else {
       console.warn('Authorization header WILL NOT be sent (no token found or headers missing).');
    }

    // Log the request being sent for debugging
    // console.log('Sending API request:', config.method?.toUpperCase(), config.url); // Log relative URL is often enough
    return config;
  },
  (error) => {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Handles 401 Unauthorized) ---
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do nothing, just return the response
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Response Error Status:', error.response.status);
      // console.error('API Response Error Data:', error.response.data); // Uncomment for detailed error data

      // --- Handle 401 Unauthorized specifically ---
      if (error.response.status === 401) {
        console.warn('API returned 401 Unauthorized. Token might be invalid or expired.');
        // 1. Remove the potentially invalid token
        localStorage.removeItem('token');

        // 2. Redirect to login page
        // Check if we are already on the login page to avoid infinite loops
        if (window.location.pathname !== '/login') {
          console.log('Redirecting to /login due to 401 error.');
          // Use window.location for a hard redirect.
          // If using React Router's useNavigate hook is feasible here, it's cleaner.
          window.location.href = '/login';
          // Optionally display a message to the user before redirecting
          // alert('Your session has expired. Please log in again.');
        }
      }
      // --- End 401 Handling ---

    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.error('API No Response Error:', error.request);
       // setError('Network Error: Could not connect to the server. Please check your connection.'); // Example of setting global error
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }

    // Return a rejected promise to propagate the error unless handled (like 401 redirect)
    return Promise.reject(error);
  }
);


export default api;
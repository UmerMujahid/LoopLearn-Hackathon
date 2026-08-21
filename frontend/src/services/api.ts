import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token and user's Groq API Key to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const groqKey = localStorage.getItem('foodloop_groq_api_key');
    if (groqKey && groqKey.trim()) {
      config.headers['X-Groq-Api-Key'] = groqKey.trim();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally (token expired / invalid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodloop_token');
      localStorage.removeItem('foodloop_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quizard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean token
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/student') ||
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/quiz/')
      ) {
        localStorage.removeItem('quizard_token');
        localStorage.removeItem('quizard_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

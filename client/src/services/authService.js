import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('quizard_token', response.data.token);
      localStorage.setItem('quizard_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(identifier, password) {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.token) {
      localStorage.setItem('quizard_token', response.data.token);
      localStorage.setItem('quizard_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async adminLogin(identifier, password) {
    const response = await api.post('/auth/admin/login', { identifier, password });
    if (response.data.token) {
      localStorage.setItem('quizard_token', response.data.token);
      localStorage.setItem('quizard_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('quizard_token');
    localStorage.removeItem('quizard_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('quizard_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('quizard_token');
  },
};

export default authService;

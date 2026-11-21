import api from './api';

export const attemptService = {
  async startAttempt(quizId) {
    const response = await api.post('/attempts/start', { quizId });
    return response.data;
  },

  async submitAttempt(attemptId, answers) {
    const response = await api.post('/attempts/submit', { attemptId, answers });
    return response.data;
  },

  async getMyAttempts(params = {}) {
    const response = await api.get('/attempts/my-attempts', { params });
    return response.data;
  },

  async getAttemptResult(attemptId) {
    const response = await api.get(`/attempts/${attemptId}/result`);
    return response.data;
  },
};

export default attemptService;

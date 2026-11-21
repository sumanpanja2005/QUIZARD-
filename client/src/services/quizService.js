import api from './api';

export const quizService = {
  async getQuizzes(params = {}) {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  async getQuiz(id) {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  async createQuiz(data) {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  async updateQuiz(id, data) {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  async deleteQuiz(id) {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  async addQuestion(quizId, data) {
    const response = await api.post(`/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  async updateQuestion(quizId, questionId, data) {
    const response = await api.put(`/quizzes/${quizId}/questions/${questionId}`, data);
    return response.data;
  },

  async deleteQuestion(quizId, questionId) {
    const response = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return response.data;
  },
};

export default quizService;

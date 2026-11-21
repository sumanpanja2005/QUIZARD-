import api from './api';

export const leaderboardService = {
  async getGlobalLeaderboard(params = {}) {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  },

  async getQuizLeaderboard(quizId, params = {}) {
    const response = await api.get(`/leaderboard/${quizId}`, { params });
    return response.data;
  },
};

export default leaderboardService;

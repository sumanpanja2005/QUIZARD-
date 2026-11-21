import api from './api';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getStudents(params = {}) {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  async toggleStudentStatus(id) {
    const response = await api.put(`/admin/students/${id}/status`);
    return response.data;
  },

  async getSubmissions(params = {}) {
    const response = await api.get('/admin/submissions', { params });
    return response.data;
  },
};

export default adminService;

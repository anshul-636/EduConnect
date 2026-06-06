import api from './api';
const authService = {
  register: async (data) => { const res = await api.post('/auth/register', data); return res.data; },
  login: async (data) => { const res = await api.post('/auth/login', data); return res.data; },
  getMe: async () => { const res = await api.get('/auth/me'); return res.data; },
  forgotPassword: async (email) => { const res = await api.post('/auth/forgot-password', { email }); return res.data; },
  resetPassword: async (token, newPassword) => { const res = await api.post('/auth/reset-password', { token, newPassword }); return res.data; },
  deactivateAccount: async () => { const res = await api.post('/auth/deactivate'); return res.data; },
  deleteAccount: async () => { const res = await api.delete('/auth/delete-me'); return res.data; },
  reactivateAccount: async (data) => { const res = await api.post('/auth/reactivate', data); return res.data; },
};
export default authService;
import api from './api';
const authService = {
  register: async (data) => { const res = await api.post('/auth/register', data); return res.data; },
  login: async (data) => { const res = await api.post('/auth/login', data); return res.data; },
  getMe: async () => { const res = await api.get('/auth/me'); return res.data; },
  forgotPassword: async (email) => { const res = await api.post('/auth/forgot-password', { email }); return res.data; },
  // NOTE: backend uses OTP-based reset, not token links.
  // This method is kept for potential direct use but the primary
  // flow lives in ForgotPassword.jsx (email → OTP → new password).
  resetPassword: async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },
  deactivateAccount: async () => { const res = await api.post('/auth/deactivate'); return res.data; },
  deleteAccount: async () => { const res = await api.delete('/auth/delete-me'); return res.data; },
  reactivateAccount: async (data) => { const res = await api.post('/auth/reactivate', data); return res.data; },
};
export default authService;
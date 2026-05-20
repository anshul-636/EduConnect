import api from './api';
const eventService = {
  getAll: async (params) => { const res = await api.get('/events', { params }); return res.data; },
  getById: async (id) => { const res = await api.get('/events/' + id); return res.data; },
  create: async (data) => { const res = await api.post('/events', data); return res.data; },
  update: async (id, data) => { const res = await api.put('/events/' + id, data); return res.data; },
  register: async (id, teamName, teamMembers = []) => { const res = await api.post('/events/' + id + '/register', { teamName, teamMembers }); return res.data; },
  getRegistrations: async (id) => { const res = await api.get('/events/' + id + '/registrations'); return res.data; },
  getMyRegistrations: async () => { const res = await api.get('/events/my'); return res.data; },
  submitResults: async (id, results) => { const res = await api.post('/events/' + id + '/results', { results }); return res.data; },
  getLeaderboard: async (id) => { const res = await api.get('/events/' + id + '/leaderboard'); return res.data; },
  updateAnswerKey: async (id, answerKey) => { const res = await api.put('/events/' + id + '/answer-key', { answerKey }); return res.data; },
  delete: async (id) => { const res = await api.delete('/events/' + id); return res.data; },
};
export default eventService;
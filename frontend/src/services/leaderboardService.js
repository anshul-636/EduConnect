import api from './api';

const leaderboardService = {
  getAll: async (params) => { const res = await api.get('/leaderboard', { params }); return res.data; },
  getByEvent: async (eventId) => { const res = await api.get('/leaderboard/event/' + eventId); return res.data; },
  getMyRank: async () => { const res = await api.get('/leaderboard/my'); return res.data; },
  setScore: async (data) => { const res = await api.post('/leaderboard/score', data); return res.data; },
};

export default leaderboardService;

import api from './api';
const forumService = {
  getAll: async (params) => { const res = await api.get('/forum', { params }); return res.data; },
  getById: async (id) => { const res = await api.get('/forum/' + id); return res.data; },
  create: async (data) => { const res = await api.post('/forum', data); return res.data; },
  reply: async (id, content) => { const res = await api.post('/forum/' + id + '/reply', { content }); return res.data; },
  delete: async (id) => { const res = await api.delete('/forum/' + id); return res.data; },
};
export default forumService;

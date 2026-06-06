import api from './api';

const resourceService = {
  getAll: async (params) => { const res = await api.get('/resources', { params }); return res.data; },
  getById: async (id) => { const res = await api.get('/resources/' + id); return res.data; },
  upload: async (formData) => {
    const res = await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  delete: async (id) => { const res = await api.delete('/resources/' + id); return res.data; },
  upvote: async (id) => { const res = await api.post('/resources/' + id + '/upvote'); return res.data; },
  incrementView: async (id) => { const res = await api.post('/resources/' + id + '/view'); return res.data; },
};


export default resourceService;

import api from './api';
const certificateService = {
  generate: async (eventId) => { const res = await api.post('/certificates/generate/' + eventId); return res.data; },
  getMyCertificates: async () => { const res = await api.get('/certificates/my'); return res.data; },
  getByEvent: async (eventId) => { const res = await api.get('/certificates/event/' + eventId); return res.data; },
  sendEmail: async (eventId) => { const res = await api.post('/certificates/send-email/' + eventId); return res.data; },
};
export default certificateService;

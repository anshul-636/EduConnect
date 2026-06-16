import api from './api';
const announcementService = {
  getAll:  (params) => api.get('/announcements', { params }),
  create:  (data)   => api.post('/announcements', data),
  delete:  (id)     => api.delete(`/announcements/${id}`),
};
export default announcementService;

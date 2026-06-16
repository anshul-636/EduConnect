import api from './api';
const notificationService = {
  getAll:      (params) => api.get('/notifications', { params }),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/notifications/read-all'),
  delete:      (id)     => api.delete(`/notifications/${id}`),
};
export default notificationService;

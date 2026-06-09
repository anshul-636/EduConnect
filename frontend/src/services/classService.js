import api from './api';
const classService = {
  getAll:       (params)          => api.get('/classes', { params }),
  getById:      (id)              => api.get(`/classes/${id}`),
  create:       (data)            => api.post('/classes', data),
  update:       (id, data)        => api.patch(`/classes/${id}`, data),
  delete:       (id)              => api.delete(`/classes/${id}`),
  enroll:       (id, studentId)   => api.post(`/classes/${id}/enroll`, { studentId }),
  unenroll:     (id, studentId)   => api.delete(`/classes/${id}/enroll`, { data: { studentId } }),
  addSlot:      (id, data)        => api.post(`/classes/${id}/timetable`, data),
  updateSlot:   (id, slotId, data)=> api.patch(`/classes/${id}/timetable/${slotId}`, data),
  deleteSlot:   (id, slotId)      => api.delete(`/classes/${id}/timetable/${slotId}`),
  getMyTimetable: ()              => api.get('/classes/my-timetable'),
};
export default classService;

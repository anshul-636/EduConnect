import api from './api';
const assignmentService = {
  getMine:      ()                     => api.get('/assignments/mine'),
  getForClass:  (classId)              => api.get(`/assignments/class/${classId}`),
  getById:      (id)                   => api.get(`/assignments/${id}`),
  create:       (data)                 => api.post('/assignments', data),
  delete:       (id)                   => api.delete(`/assignments/${id}`),
  submit:       (id, data)             => api.post(`/assignments/${id}/submit`, data),
  grade:        (submissionId, data)   => api.patch(`/assignments/submissions/${submissionId}/grade`, data),
};
export default assignmentService;

import api from './api';
const assignmentService = {
  getMine:      ()                     => api.get('/assignments/mine'),
  getForClass:  (classId)              => api.get(`/assignments/class/${classId}`),
  getById:      (id)                   => api.get(`/assignments/${id}`),
  create:       (data)                 => api.post('/assignments', data),
  delete:       (id)                   => api.delete(`/assignments/${id}`),
  submit: (id, content, file) => {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file)    formData.append('file', file);
    return api.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  grade: (submissionId, data) => api.patch(`/assignments/submissions/${submissionId}/grade`, data),
};
export default assignmentService;
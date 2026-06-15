import api from './api';

const timetableService = {
  getForClass:   (classId) => api.get(`/timetable/class/${classId}`),
  getForTeacher: ()        => api.get('/timetable/teacher/mine'),
  create:        (data)    => api.post('/timetable', data),
  update:        (id, data)=> api.patch(`/timetable/${id}`, data),
  delete:        (id)      => api.delete(`/timetable/${id}`),
};

export default timetableService;
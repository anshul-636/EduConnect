import api from './api';
const attendanceService = {
  markBulk:        (classId, date, records) => api.post(`/attendance/${classId}`, { date, records }),
  getByDate:       (classId, date)          => api.get(`/attendance/${classId}`, { params: { date } }),
  getMonthly:      (classId, year, month)   => api.get(`/attendance/${classId}/monthly`, { params: { year, month } }),
  getMyReport:     (classId)                => api.get(`/attendance/${classId}/my-report`),
};
export default attendanceService;

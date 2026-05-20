import api from './api';

const aiService = {
  // RAG Study Assistant
  ragChat: async (question, sessionId, resourceId = null, role = null) => {
    const res = await api.post('/ai/chat/rag', { 
      question, 
      session_id: sessionId, 
      resource_id: resourceId,
      role: role
    });
    return res.data;
  },

  // Platform Bot
  platformChat: async (message, sessionId) => {
    const res = await api.post('/ai/chat/platform', { message, session_id: sessionId });
    return res.data;
  },

  // Clear session
  clearSession: async (sessionId) => {
    const res = await api.delete('/ai/chat/session/' + sessionId);
    return res.data;
  },

  // Study Planner
  generatePlan: async (studentId, studentName, eventId, role = null) => {
    const res = await api.post('/ai/planner/generate', {
      student_id: studentId,
      student_name: studentName,
      event_id: eventId,
      role: role
    });
    return res.data;
  },

  // Recommendations
  recommendResources: async (query, limit = 5) => {
    const res = await api.get('/ai/recommend/resources', { params: { query, limit } });
    return res.data;
  },
};

export default aiService;

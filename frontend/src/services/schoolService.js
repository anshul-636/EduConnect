import api from "./api";
const schoolService = {
  getAll: async () => { const res = await api.get("/schools"); return res.data; },
  getById: async (id) => { const res = await api.get("/schools/" + id); return res.data; },
  create: async (data) => { const res = await api.post("/schools", data); return res.data; },
  update: async (id, data) => { const res = await api.put("/schools/" + id, data); return res.data; },
  getMySchool: async () => { const res = await api.get("/schools/my/school"); return res.data; },
  delete: async (id) => { const res = await api.delete("/schools/" + id); return res.data; },
  adminCreate: async (data) => { const res = await api.post("/schools/admin-create", data); return res.data; },
  join: async (id) => { const res = await api.post("/schools/" + id + "/join"); return res.data; },
};
export default schoolService;
const svc = require('../services/announcement.service');
const ok = (res, data, code = 200) => res.status(code).json({ success: true, data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

exports.create = async (req, res) => { try { ok(res, await svc.create(req.body, req.user.id, req.user.role), 201); } catch (e) { err(res, e); } };
exports.getAll = async (req, res) => { try { const r = await svc.getAll(req.query.schoolId, req.query); res.json({ success: true, ...r }); } catch (e) { err(res, e); } };
exports.remove = async (req, res) => { try { await svc.delete(req.params.id, req.user.id); ok(res, { deleted: true }); } catch (e) { err(res, e); } };
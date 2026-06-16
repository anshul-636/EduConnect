const svc = require('../services/timetable.service');
const ok  = (res, data, code = 200) => res.status(code).json({ success: true, data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

exports.getForClass   = async (req, res) => { try { ok(res, await svc.getForClass(req.params.classId)); } catch(e) { err(res, e); } };
exports.getForTeacher = async (req, res) => { try { ok(res, await svc.getForTeacher(req.user.id)); } catch(e) { err(res, e); } };
exports.create        = async (req, res) => { try { ok(res, await svc.create(req.body, req.user.id, req.user.role), 201); } catch(e) { err(res, e); } };
exports.update        = async (req, res) => { try { ok(res, await svc.update(req.params.id, req.body, req.user.id, req.user.role)); } catch(e) { err(res, e); } };
exports.remove        = async (req, res) => { try { await svc.delete(req.params.id, req.user.id, req.user.role); ok(res, { deleted: true }); } catch(e) { err(res, e); } };
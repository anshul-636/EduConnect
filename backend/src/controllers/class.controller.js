const svc = require('../services/class.service');
const ok  = (res, data, code = 200) => res.status(code).json({ success: true, data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

exports.create         = async (req, res) => { try { ok(res, await svc.create(req.body, req.user.id), 201); } catch(e) { err(res, e); } };
exports.getAll         = async (req, res) => { try { ok(res, await svc.getAll(req.query.schoolId, req.query)); } catch(e) { err(res, e); } };
exports.getById        = async (req, res) => { try { ok(res, await svc.getById(req.params.id)); } catch(e) { err(res, e); } };
exports.update         = async (req, res) => { try { ok(res, await svc.update(req.params.id, req.body)); } catch(e) { err(res, e); } };
exports.remove         = async (req, res) => { try { await svc.delete(req.params.id); ok(res, { deleted: true }); } catch(e) { err(res, e); } };
exports.enroll         = async (req, res) => { try { ok(res, await svc.enroll(req.params.id, req.body.studentId), 201); } catch(e) { err(res, e); } };
exports.unenroll       = async (req, res) => { try { await svc.unenroll(req.params.id, req.body.studentId); ok(res, { removed: true }); } catch(e) { err(res, e); } };
exports.addSlot        = async (req, res) => { try { ok(res, await svc.addTimetableSlot(req.params.id, req.body), 201); } catch(e) { err(res, e); } };
exports.updateSlot     = async (req, res) => { try { ok(res, await svc.updateTimetableSlot(req.params.slotId, req.body)); } catch(e) { err(res, e); } };
exports.deleteSlot     = async (req, res) => { try { await svc.deleteTimetableSlot(req.params.slotId); ok(res, { deleted: true }); } catch(e) { err(res, e); } };
exports.getMyTimetable = async (req, res) => { try { ok(res, await svc.getTimetableForTeacher(req.user.id)); } catch(e) { err(res, e); } };

const svc = require('../services/attendance.service');
const ok  = (res, data, code = 200) => res.status(code).json({ success: true, data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

exports.markBulk         = async (req, res) => { try { ok(res, await svc.markBulk(req.params.classId, req.body.date, req.body.records, req.user.id)); } catch(e) { err(res, e); } };
exports.getByDate        = async (req, res) => { try { ok(res, await svc.getByDate(req.params.classId, req.query.date)); } catch(e) { err(res, e); } };
exports.getMonthly       = async (req, res) => { try { ok(res, await svc.getMonthly(req.params.classId, parseInt(req.query.year), parseInt(req.query.month))); } catch(e) { err(res, e); } };
exports.getStudentReport = async (req, res) => { try { ok(res, await svc.getStudentReport(req.user.id, req.params.classId)); } catch(e) { err(res, e); } };

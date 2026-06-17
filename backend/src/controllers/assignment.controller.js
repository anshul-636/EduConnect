const svc = require('../services/assignment.service');
const ok  = (res, data, code = 200) => res.status(code).json({ success: true, data });
const err = (res, e) => res.status(e.statusCode || 500).json({ success: false, message: e.message });

exports.create      = async (req, res) => { try { ok(res, await svc.create(req.body, req.user.id), 201); } catch(e) { err(res, e); } };
exports.getForClass = async (req, res) => { try { ok(res, await svc.getForClass(req.params.classId, req.user.id, req.user.role)); } catch(e) { err(res, e); } };
exports.getById     = async (req, res) => { try { ok(res, await svc.getById(req.params.id, req.user.id, req.user.role)); } catch(e) { err(res, e); } };
exports.getMine     = async (req, res) => {
  try {
    const data = req.user.role === 'STUDENT'
      ? await svc.getForStudent(req.user.id)
      : await svc.getForTeacher(req.user.id);
    ok(res, data);
  } catch(e) { err(res, e); }
};
exports.submit = async (req, res) => { try { ok(res, await svc.submit(req.params.id, req.user.id, req.body, req.file)); } catch(e) { err(res, e); } };
exports.grade  = async (req, res) => { try { ok(res, await svc.grade(req.params.submissionId, req.body, req.user.id, req.user.role)); } catch(e) { err(res, e); } };
exports.remove = async (req, res) => { try { await svc.delete(req.params.id, req.user.id); ok(res, { deleted: true }); } catch(e) { err(res, e); } };

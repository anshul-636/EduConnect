const dashboardService = require('../services/dashboard.service');

const getSummary = async (req, res) => {
  try {
    const { role, id } = req.user;
    let summary;

    switch (role) {
      case 'STUDENT':
        summary = await dashboardService.getStudentSummary(id);
        break;
      case 'TEACHER':
        summary = await dashboardService.getTeacherSummary(id);
        break;
      case 'SCHOOL':
        summary = await dashboardService.getSchoolSummary(id);
        break;
      case 'ADMIN':
        summary = await dashboardService.getAdminSummary();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unknown role.' });
    }

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('[DASHBOARD]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSummary };

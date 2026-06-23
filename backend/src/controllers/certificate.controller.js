const certificateService = require('../services/certificate.service');
const { generateCertificatePDF } = require('../utils/generateCertificate');

const generate = async (req, res) => {
  try {
    const certs = await certificateService.generate(req.params.eventId, req.user.id, req.user.role);
    res.status(201).json({ success: true, data: certs, message: certs.length + ' certificates generated.' });
  } catch (err) { res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getMyCertificates = async (req, res) => {
  try {
    const certs = await certificateService.getMyCertificates(req.user.id);
    res.json({ success: true, data: certs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getByEvent = async (req, res) => {
  try {
    const certs = await certificateService.getByEvent(req.params.eventId);
    res.json({ success: true, data: certs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const download = async (req, res) => {
  try {
    const cert = await certificateService.getForDownload(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    generateCertificatePDF(res, {
      studentName: cert.student.name,
      eventTitle: cert.event.title,
      eventCategory: cert.event.category,
      eventDate: cert.event.eventDate,
      certType: cert.type,
      schoolName: cert.schoolName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendCertificatesByEmail = async (req, res) => {
  try {
    const results = await certificateService.sendCertificatesByEmail(req.params.eventId, req.user.id, req.user.role);
    res.json({ success: true, message: 'Certificates automatically generated and emailed to all participants!', data: results });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { generate, getMyCertificates, getByEvent, download, sendCertificatesByEmail };
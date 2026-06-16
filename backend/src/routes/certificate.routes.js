const { Router } = require('express');
const { generate, getMyCertificates, getByEvent, download, sendCertificatesByEmail } = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

const router = Router();

const downloadAuth = async (req, res, next) => {
  const token = req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ success: false, message: 'No token.' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ success: false, message: 'Invalid token.' });
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
  req.user = user;
  next();
};

router.post('/generate/:eventId', protect, restrictTo('SCHOOL'), generate);
router.post('/send-email/:eventId', protect, restrictTo('SCHOOL','ADMIN'), sendCertificatesByEmail);
router.get('/my', protect, restrictTo('STUDENT'), getMyCertificates);
router.get('/event/:eventId', protect, restrictTo('SCHOOL','ADMIN'), getByEvent);
router.get('/download/:id', downloadAuth, download);

module.exports = router;

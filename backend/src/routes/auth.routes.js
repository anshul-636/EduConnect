const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, getMe, verifyEmail, resendVerificationOTP, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('../utils/passport');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');

const router = Router();

const emailValidation = body('email')
  .trim()
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/)
  .withMessage('Please enter a valid email (e.g. name@gmail.com).');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  emailValidation,
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/).withMessage('Password must contain uppercase, lowercase and a number.'),
  body('role').isIn(['ADMIN','SCHOOL','TEACHER','STUDENT']).withMessage('Invalid role.'),
  body('schoolId').optional().isUUID().withMessage('Invalid school ID.'),
];

const loginValidation = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOTP);
router.post('/forgot-password', [emailValidation], forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/deactivate', protect, require('../controllers/auth.controller').deactivateAccount);
router.delete('/delete-me', protect, require('../controllers/auth.controller').deleteAccount);
router.post('/reactivate', require('../controllers/auth.controller').reactivateAccount);

router.get('/google', (req, res, next) => {
  req.session.role = req.query.role || 'STUDENT';
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed' }),
  (req, res) => {
    const user = req.user;
    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = createAccessToken(tokenPayload);
    const refreshToken = createRefreshToken(tokenPayload);
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id, email: user.email, name: user.name,
      role: user.role, schoolId: user.schoolId, isActive: user.isActive,
    }));
    res.redirect(process.env.FRONTEND_URL + '/auth/callback?accessToken=' + accessToken + '&refreshToken=' + refreshToken + '&user=' + userData);
  }
);

module.exports = router;

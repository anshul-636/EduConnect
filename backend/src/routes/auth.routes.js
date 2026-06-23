const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, getMe, verifyEmail, resendVerificationOTP, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('../utils/passport');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');
const { rateLimit } = require('../utils/redis');
const prisma = require('../utils/prisma');

const router = Router();

const emailValidation = body('email')
  .trim()
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .withMessage('Please enter a valid email (e.g. name@gmail.com).');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  emailValidation,
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/).withMessage('Password must contain uppercase, lowercase and a number.'),
  body('role').isIn(['ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT']).withMessage('Invalid role.'),
  body('schoolId').optional().isUUID().withMessage('Invalid school ID.'),
];

const loginValidation = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required.'),
];

// Rate-limit login attempts: max 10 per IP per 15 minutes
const loginRateLimiter = async (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const { allowed, remaining } = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  }
  res.setHeader('X-RateLimit-Remaining', remaining);
  next();
};

router.post('/register', registerValidation, register);
router.post('/login', loginRateLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOTP);
router.post('/forgot-password', [emailValidation], forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/deactivate', protect, require('../controllers/auth.controller').deactivateAccount);
router.delete('/delete-me', protect, require('../controllers/auth.controller').deleteAccount);
router.post('/reactivate', require('../controllers/auth.controller').reactivateAccount);

// ── Google OAuth ───────────────────────────────────────────────────────────────
const googleNotConfigured = (req, res) => res.status(503).json({
  success: false,
  message: 'Google sign-in is not configured on this server. See backend/.env.example for the required GOOGLE_* variables.',
});

router.get('/google', (req, res, next) => {
  if (!passport.googleConfigured) return googleNotConfigured(req, res);
  // We no longer pass role here — role is chosen AFTER OAuth on the frontend
  passport.authenticate('google', { scope: ['profile', 'email'], session: true })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!passport.googleConfigured) return googleNotConfigured(req, res);
    next();
  },
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed',
  }),
  (req, res) => {
    const result = req.user;

    if (result.isNewUser) {
      // New Google user — send them to frontend role-selection page
      const pending = encodeURIComponent(JSON.stringify(result.pendingProfile));
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/google-role?pending=${pending}`
      );
    }

    // Existing user — log them straight in
    const { user } = result;
    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = createAccessToken(tokenPayload);
    const refreshToken = createRefreshToken(tokenPayload);
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id, email: user.email, name: user.name,
      role: user.role, schoolId: user.schoolId, isActive: user.isActive,
    }));
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`
    );
  }
);

/**
 * POST /auth/google/complete
 * Called by the frontend role-selection page after a new Google user picks their role.
 * Body: { email, name, googleId, role, schoolId? }
 */
router.post('/google/complete', async (req, res) => {
  try {
    const { email, name, googleId, role, schoolId } = req.body;

    if (!email || !name || !googleId || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const validRoles = ['ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    // Guard: if they somehow already have an account, just log them in
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: 'GOOGLE_OAUTH_' + googleId,
          role,
          isActive: true,
          ...(schoolId ? { schoolId } : {}),
        },
      });
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = createAccessToken(tokenPayload);
    const refreshToken = createRefreshToken(tokenPayload);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id, email: user.email, name: user.name,
          role: user.role, schoolId: user.schoolId, isActive: user.isActive,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('google/complete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete sign-up.' });
  }
});

module.exports = router;
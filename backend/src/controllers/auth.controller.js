const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      data: user,
      message: 'Account created! Please check your email for the verification OTP.',
      requiresVerification: true,
    });
  } catch (err) { return res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    return res.status(200).json({ success: true, data: { user, accessToken, refreshToken, tokenType: 'Bearer' } });
  } catch (err) {
    if (err.message === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first.',
        requiresVerification: true,
        userId: err.userId,
        userEmail: err.userEmail,
        userName: err.userName,
      });
    }
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'refreshToken required.' });
  try {
    const tokens = await authService.refresh(refreshToken);
    return res.status(200).json({ success: true, data: tokens });
  } catch (err) { return res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

const getMe = (req, res) => res.status(200).json({ success: true, data: req.user });

// OTP: Verify email after registration
const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ success: false, message: 'userId and otp required.' });
  try {
    await otpService.verifyAndActivate(userId, otp);
    return res.status(200).json({ success: true, message: 'Email verified! You can now login.' });
  } catch (err) { return res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

// OTP: Resend verification OTP
const resendVerificationOTP = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId required.' });
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await otpService.sendVerificationOTP(user.id, user.email, user.name);
    return res.status(200).json({ success: true, message: 'OTP resent to your email.' });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

// OTP: Forgot password - send OTP
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });
  try {
    const result = await otpService.sendPasswordResetOTP(req.body.email);
    return res.status(200).json(result);
  } catch (err) { return res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

// OTP: Reset password with OTP
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'email, otp and newPassword required.' });
  if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  try {
    const result = await otpService.resetPasswordWithOTP(email, otp, newPassword);
    return res.status(200).json(result);
  } catch (err) { return res.status(err.statusCode || 500).json({ success: false, message: err.message }); }
};

module.exports = { register, login, refresh, getMe, verifyEmail, resendVerificationOTP, forgotPassword, resetPassword };

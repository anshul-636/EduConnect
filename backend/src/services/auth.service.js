const prisma = require('../utils/prisma');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');
const otpService = require('./otp.service');

class AuthService {

  async register({ name, email, password, role, schoolId }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409; throw err;
    }

    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) { const err = new Error('School not found.'); err.statusCode = 404; throw err; }
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, schoolId: schoolId || null, isVerified: false },
      select: { id: true, email: true, name: true, role: true, schoolId: true, isActive: true, isVerified: true, createdAt: true },
    });

    // Send verification OTP
    await otpService.sendVerificationOTP(user.id, user.email, user.name);

    return user;
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }
    if (!user.isActive) { const err = new Error('Account deactivated.'); err.statusCode = 403; throw err; }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }

    // Block login if email is not verified
    if (!user.isVerified) {
      const err = new Error('EMAIL_NOT_VERIFIED');
      err.statusCode = 403;
      err.userId = user.id;
      err.userEmail = user.email;
      err.userName = user.name;
      throw err;
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const { password: _pw, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: createAccessToken(tokenPayload),
      refreshToken: createRefreshToken(tokenPayload),
    };
  }

  async refresh(refreshToken) {
    const { verifyToken } = require('../utils/jwt');
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      const err = new Error('Invalid or expired refresh token.'); err.statusCode = 401; throw err;
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) { const err = new Error('User not found.'); err.statusCode = 401; throw err; }
    return { accessToken: createAccessToken({ userId: user.id, role: user.role }), refreshToken };
  }

  async deactivate(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async reactivate(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async delete(userId) {
    return prisma.user.delete({ where: { id: userId } });
  }

  async validateCredentials({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }

    return user;
  }
}

module.exports = new AuthService();

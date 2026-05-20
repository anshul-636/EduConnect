const prisma = require('../utils/prisma');
const sendEmail = require('../utils/email');

// Generate 6 digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP email template
function otpEmailTemplate(name, otp, purpose) {
  const purposeText = purpose === 'verify' ? 'verify your email address' : 'reset your password';
  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #a855f7; font-size: 28px; margin: 0;">EduConnect</h1>
        <p style="color: #64748b; margin: 8px 0 0;">School Collaboration Platform</p>
      </div>
      <div style="background: #1e293b; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h2 style="color: #f1f5f9; margin: 0 0 16px;">Hello, ${name}!</h2>
        <p style="color: #94a3b8; line-height: 1.6;">You requested to ${purposeText}. Use the OTP below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); padding: 16px 40px; border-radius: 12px;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white;">${otp}</span>
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">This OTP expires in <strong style="color: #a855f7;">10 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 14px; text-align: center;">If you did not request this, ignore this email.</p>
      </div>
      <p style="color: #475569; font-size: 12px; text-align: center;">© 2026 EduConnect. All rights reserved.</p>
    </div>
  `;
}

class OTPService {

  async sendVerificationOTP(userId, email, name) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this user
    await prisma.oTP.deleteMany({ where: { userId, purpose: 'verify' } });

    // Store new OTP
    await prisma.oTP.create({
      data: { userId, otp, purpose: 'verify', expiresAt },
    });

    // Send email
    await sendEmail({
      email,
      subject: 'EduConnect — Verify Your Email',
      html: otpEmailTemplate(name, otp, 'verify'),
    });

    return { success: true };
  }

  async sendPasswordResetOTP(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { success: true, message: 'If this email exists, an OTP has been sent.' };

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.deleteMany({ where: { userId: user.id, purpose: 'reset' } });
    await prisma.oTP.create({
      data: { userId: user.id, otp, purpose: 'reset', expiresAt },
    });

    await sendEmail({
      email,
      subject: 'EduConnect — Password Reset OTP',
      html: otpEmailTemplate(user.name, otp, 'reset'),
    });

    return { success: true, message: 'If this email exists, an OTP has been sent.' };
  }

  async verifyOTP(userId, otp, purpose) {
    const record = await prisma.oTP.findFirst({
      where: { userId, otp, purpose },
    });

    if (!record) {
      const err = new Error('Invalid OTP. Please try again.');
      err.statusCode = 400; throw err;
    }

    if (new Date() > record.expiresAt) {
      await prisma.oTP.delete({ where: { id: record.id } });
      const err = new Error('OTP has expired. Please request a new one.');
      err.statusCode = 400; throw err;
    }

    await prisma.oTP.delete({ where: { id: record.id } });
    return { success: true };
  }

  async verifyAndActivate(userId, otp) {
    await this.verifyOTP(userId, otp, 'verify');
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    return { success: true };
  }

  async verifyResetOTP(email, otp) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { const err = new Error('User not found.'); err.statusCode = 404; throw err; }

    await this.verifyOTP(user.id, otp, 'reset');
    return { success: true, userId: user.id };
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { const err = new Error('User not found.'); err.statusCode = 404; throw err; }

    await this.verifyOTP(user.id, otp, 'reset');

    const { hashPassword } = require('../utils/hash');
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return { success: true, message: 'Password reset successfully.' };
  }
}

module.exports = new OTPService();

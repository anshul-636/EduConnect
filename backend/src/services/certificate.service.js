/**
 * certificate.service.js
 *
 * FIX: generate() now calls generateCertificateBuffer() and uploads the PDF
 *      to Cloudinary before saving — so fileUrl is never null.
 */

const prisma = require('../utils/prisma');
const { cloudinary } = require('../utils/cloudinary');
const { generateCertificateBuffer } = require('../utils/generateCertificate');
const notificationService = require('./notification.service');

class CertificateService {

  // Upload PDF buffer to Cloudinary and return secure URL
  async _uploadBuffer(buffer, publicId) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'educonnect/certificates',
          public_id: publicId,
          format: 'pdf',
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  }

  /**
   * Generate + upload certificates for all registrants in an event.
   * Safe to call multiple times — skips already-generated certs.
   */
  async generate(eventId, userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) {
      const err = new Error('School not found.');
      err.statusCode = 404;
      throw err;
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const err = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }

    if (event.schoolId !== school.id) {
      const err = new Error('You can only generate certificates for your own events.');
      err.statusCode = 403;
      throw err;
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    if (registrations.length === 0) {
      const err = new Error('No registrations found for this event.');
      err.statusCode = 400;
      throw err;
    }

    const leaderboard = await prisma.leaderboard.findMany({ where: { eventId } });
    const rankMap = {};
    leaderboard.forEach((l) => {
      rankMap[l.studentId] = l.rank;
    });

    const certificates = [];

    for (const reg of registrations) {
      // Skip if already generated AND has a URL
      const existing = await prisma.certificate.findFirst({
        where: { eventId, studentId: reg.studentId },
      });

      if (existing && existing.fileUrl) {
        certificates.push(existing);
        continue;
      }

      const rank = rankMap[reg.studentId];
      let type = 'PARTICIPATION';
      if (rank === 1) type = 'WINNER';
      else if (rank === 2) type = 'RUNNER_UP';

      let fileUrl = null;

      // --- FIXED: Actually generate the PDF and upload it ---
      try {
        const pdfBuffer = await generateCertificateBuffer({
          studentName: reg.student.name,
          eventTitle: event.title,
          eventCategory: event.category,
          eventDate: event.eventDate,
          certType: type,
          schoolName: school.name,
        });

        const publicId = `cert_${eventId}_${reg.studentId}`;
        fileUrl = await this._uploadBuffer(pdfBuffer, publicId);
      } catch (uploadErr) {
        // Don't fail the whole batch if one upload fails; log and continue
        console.error(`[CERT] Upload failed for ${reg.student.name}:`, uploadErr.message);
      }

      let cert;
      if (existing) {
        // Update the null-URL record we found earlier
        cert = await prisma.certificate.update({
          where: { id: existing.id },
          data: { fileUrl, type },
          include: {
            student: { select: { id: true, name: true, email: true } },
            event: { select: { id: true, title: true, category: true } },
          },
        });
      } else {
        cert = await prisma.certificate.create({
          data: { studentId: reg.studentId, eventId, type, fileUrl },
          include: {
            student: { select: { id: true, name: true, email: true } },
            event: { select: { id: true, title: true, category: true } },
          },
        });
      }

      certificates.push(cert);

      // Notify student that their certificate is ready
      if (fileUrl) {
        await notificationService.create({
          userId: reg.studentId,
          type: 'CERTIFICATE_READY',
          title: 'Your certificate is ready!',
          message: `Download your ${type.toLowerCase()} certificate for "${event.title}".`,
          data: { certId: cert.id, eventId },
        });
      }
    }

    return certificates;
  }

  async getMyCertificates(studentId) {
    return prisma.certificate.findMany({
      where: { studentId },
      orderBy: { issuedAt: 'desc' },
      include: {
        event: {
          select: { id: true, title: true, category: true, eventDate: true },
        },
      },
    });
  }

  async getByEvent(eventId) {
    return prisma.certificate.findMany({
      where: { eventId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });
  }

  async getForDownload(certId) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        student: { select: { name: true } },
        event: {
          select: {
            title: true,
            category: true,
            eventDate: true,
            schoolId: true,
          },
        },
      },
    });
    if (!cert) return null;

    const school = await prisma.school.findUnique({
      where: { id: cert.event.schoolId },
      select: { name: true },
    });

    return { ...cert, schoolName: school ? school.name : 'EduConnect' };
  }

  async sendCertificatesByEmail(eventId, userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) {
      const err = new Error('School not found.');
      err.statusCode = 404;
      throw err;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { school: true },
    });
    if (!event) {
      const err = new Error('Event not found.');
      err.statusCode = 404;
      throw err;
    }
    if (event.schoolId !== school.id) {
      const err = new Error('You can only send certificates for your own events.');
      err.statusCode = 403;
      throw err;
    }

    // Ensure all certs exist + have files
    await this.generate(eventId, userId);

    const sendEmail = require('../utils/email');

    const certificates = await prisma.certificate.findMany({
      where: { eventId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            eventDate: true,
            firstPrize: true,
            secondPrize: true,
          },
        },
      },
    });

    const promises = certificates.map(async (cert) => {
      if (!cert.student?.email)
        return { email: 'unknown', success: false, error: 'No email address' };

      try {
        const isWinner = cert.type === 'WINNER';
        const isRunner = cert.type === 'RUNNER_UP';
        const honorsText = isWinner
          ? 'Winner (1st Place) 🥇'
          : isRunner
          ? 'Runner Up (2nd Place) 🥈'
          : 'Participation';
        const prizeDetails =
          isWinner && cert.event.firstPrize
            ? `<p style="color:#fbbf24;font-weight:bold;">🏆 Prize: ${cert.event.firstPrize}</p>`
            : isRunner && cert.event.secondPrize
            ? `<p style="color:#94a3b8;font-weight:bold;">🏆 Prize: ${cert.event.secondPrize}</p>`
            : '';

        const html = `
          <div style="font-family:sans-serif;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:16px;max-width:600px;margin:0 auto;border:1px solid #1e293b;">
            <h1 style="color:#c9a84c;text-align:center;">EduConnect</h1>
            <h2 style="text-align:center;">Congratulations, ${cert.student.name}!</h2>
            <p style="text-align:center;">Official certificate for <strong>${cert.event.title}</strong> by <strong>${school.name}</strong>.</p>
            <div style="background:#1e293b;border-radius:12px;padding:20px;text-align:center;">
              <p style="font-size:22px;font-weight:bold;">${honorsText}</p>
              ${prizeDetails}
            </div>
            ${
              cert.fileUrl
                ? `<p style="text-align:center;margin-top:20px;"><a href="${cert.fileUrl}" style="color:#60a5fa;">Download Certificate PDF</a></p>`
                : ''
            }
          </div>
        `;

        const emailPayload = {
          email: cert.student.email,
          subject: `🏆 Certificate Earned: ${cert.event.title}`,
          html,
          attachments: [],
        };

        // Attach the PDF if Cloudinary URL is available (send as link + attachment)
        if (cert.fileUrl) {
          emailPayload.attachments.push({
            filename: `${cert.student.name.split(' ')[0]}_Certificate.pdf`,
            path: cert.fileUrl,
          });
        }

        await sendEmail(emailPayload);
        return { email: cert.student.email, success: true };
      } catch (err) {
        console.error('Failed to send email to:', cert.student?.email, err);
        return {
          email: cert.student?.email,
          success: false,
          error: err.message,
        };
      }
    });

    return Promise.all(promises);
  }
}

module.exports = new CertificateService();

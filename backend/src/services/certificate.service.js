const prisma = require('../utils/prisma');

class CertificateService {

  async generate(eventId, userId) {
    const school = await prisma.school.findUnique({ where: { adminId: userId } });
    if (!school) { const err = new Error('School not found.'); err.statusCode = 404; throw err; }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.schoolId !== school.id) {
      const err = new Error('You can only generate certificates for your own events.'); err.statusCode = 403; throw err;
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    if (registrations.length === 0) {
      const err = new Error('No registrations found.'); err.statusCode = 400; throw err;
    }

    const leaderboard = await prisma.leaderboard.findMany({ where: { eventId } });
    const rankMap = {};
    leaderboard.forEach(l => { rankMap[l.studentId] = l.rank; });

    const certificates = [];
    for (const reg of registrations) {
      const existing = await prisma.certificate.findFirst({ where: { eventId, studentId: reg.studentId } });
      if (existing) { certificates.push(existing); continue; }

      const rank = rankMap[reg.studentId];
      let type = 'PARTICIPATION';
      if (rank === 1) type = 'WINNER';
      else if (rank === 2) type = 'RUNNER_UP';

      const cert = await prisma.certificate.create({
        data: { studentId: reg.studentId, eventId, type, fileUrl: null },
        include: {
          student: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, category: true } },
        },
      });
      certificates.push(cert);
    }
    return certificates;
  }

  async getMyCertificates(studentId) {
    return prisma.certificate.findMany({
      where: { studentId },
      orderBy: { issuedAt: 'desc' },
      include: {
        event: { select: { id: true, title: true, category: true, eventDate: true } },
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
        event: { select: { title: true, category: true, eventDate: true, schoolId: true } },
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
    if (!school) { const err = new Error('School not found.'); err.statusCode = 404; throw err; }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { school: true }
    });
    if (!event) { const err = new Error('Event not found.'); err.statusCode = 404; throw err; }
    if (event.schoolId !== school.id) {
      const err = new Error('You can only send certificates for your own events.'); err.statusCode = 403; throw err;
    }

    // Ensure certificates are generated first
    await this.generate(eventId, userId);

    const certificates = await prisma.certificate.findMany({
      where: { eventId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, category: true, eventDate: true, prizePool: true, firstPrize: true, secondPrize: true, thirdPrize: true } },
      },
    });

    const results = [];
    const sendEmail = require('../utils/email');
    const { generateCertificateBuffer } = require('../utils/generateCertificate');

    for (const cert of certificates) {
      if (!cert.student?.email) continue;
      
      try {
        const pdfBuffer = await generateCertificateBuffer({
          studentName: cert.student.name,
          eventTitle: cert.event.title,
          eventCategory: cert.event.category,
          eventDate: cert.event.eventDate,
          certType: cert.type,
          schoolName: school.name,
        });

        const isWinner = cert.type === 'WINNER';
        const isRunner = cert.type === 'RUNNER_UP';
        
        let honorsText = 'Participation';
        let prizeDetails = '';

        if (isWinner) {
          honorsText = 'Winner (1st Place) 🥇';
          if (cert.event.firstPrize) prizeDetails = `<p style="font-size: 15px; color: #fbbf24; font-weight: bold; margin-top: 10px;">🏆 Prize Awarded: ${cert.event.firstPrize}</p>`;
        } else if (isRunner) {
          honorsText = 'Runner Up (2nd Place) 🥈';
          if (cert.event.secondPrize) prizeDetails = `<p style="font-size: 15px; color: #94a3b8; font-weight: bold; margin-top: 10px;">🏆 Prize Awarded: ${cert.event.secondPrize}</p>`;
        }

        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #c9a84c; font-size: 28px; margin: 0; letter-spacing: 4px; text-transform: uppercase;">EduConnect</h1>
              <p style="color: #64748b; font-size: 12px; margin-top: 5px;">HONORING EXCELLENCE IN EDUCATION</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; text-align: center;">Congratulations, ${cert.student.name}!</h2>
            
            <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; text-align: center; margin: 20px 0 30px 0;">
              We are absolutely thrilled to present you with your official digital certificate for successfully participating in <strong>${cert.event.title}</strong> organized by <strong>${school.name}</strong>.
            </p>

            <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; margin-bottom: 30px; text-align: center;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0;">Achievement level</p>
              <p style="font-size: 22px; font-weight: bold; color: #ffffff; margin: 5px 0 0 0;">${honorsText}</p>
              ${prizeDetails}
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #64748b; text-align: center; margin-bottom: 25px;">
              Your official, high-resolution certificate is attached to this email as a PDF. You can also view it inside your EduConnect dashboard under "My Certificates" at any time.
            </p>

            <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 25px;">
              <p style="font-size: 12px; color: #475569; margin: 0;">&copy; ${new Date().getFullYear()} EduConnect. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail({
          email: cert.student.email,
          subject: `🏆 Certificate Earned: ${cert.event.title} (${cert.type})`,
          html,
          attachments: [
            {
              filename: `${cert.student.name.replace(/\\s+/g, '_')}_Certificate.pdf`,
              content: pdfBuffer,
            }
          ]
        });

        results.push({ email: cert.student.email, success: true });
      } catch (err) {
        console.error('Failed to send email to:', cert.student.email, err);
        results.push({ email: cert.student.email, success: false, error: err.message });
      }
    }

    return results;
  }
}

module.exports = new CertificateService();

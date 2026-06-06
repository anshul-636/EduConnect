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

    const sendEmail = require('../utils/email');
    const { generateCertificateBuffer } = require('../utils/generateCertificate');

    // Fetch the certificates with all necessary student and event data
    const certificates = await prisma.certificate.findMany({
      where: { eventId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, category: true, eventDate: true, firstPrize: true, secondPrize: true, thirdPrize: true } },
      },
    });

    const promises = certificates.map(async (cert) => {
      if (!cert.student?.email) return { email: 'unknown', success: false, error: 'No email address' };
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
        let honorsText = isWinner ? 'Winner (1st Place) 🥇' : isRunner ? 'Runner Up (2nd Place) 🥈' : 'Participation';
        let prizeDetails = (isWinner && cert.event.firstPrize) ? `<p style="font-size: 15px; color: #fbbf24; font-weight: bold; margin-top: 10px;">🏆 Prize Awarded: ${cert.event.firstPrize}</p>` : 
                           (isRunner && cert.event.secondPrize) ? `<p style="font-size: 15px; color: #94a3b8; font-weight: bold; margin-top: 10px;">🏆 Prize Awarded: ${cert.event.secondPrize}</p>` : '';

        const html = `
          <div style="font-family: sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
            <h1 style="color: #c9a84c; text-align: center;">EduConnect</h1>
            <h2 style="text-align: center;">Congratulations, ${cert.student.name}!</h2>
            <p style="text-align: center;">Official certificate for <strong>${cert.event.title}</strong> by <strong>${school.name}</strong>.</p>
            <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="font-size: 22px; font-weight: bold;">${honorsText}</p>
              ${prizeDetails}
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">PDF Attachment included. View in Dashboard > My Certificates.</p>
          </div>
        `;

        await sendEmail({
          email: cert.student.email,
          subject: `🏆 Certificate Earned: ${cert.event.title} (${cert.type === 'WINNER' ? '🥇' : cert.type === 'RUNNER_UP' ? '🥈' : '🏅'})`,
          html,
          attachments: [{
            filename: `${cert.student.name.split(' ')[0]}_Certificate.pdf`,
            content: pdfBuffer,
          }]
        });

        return { email: cert.student.email, success: true };
      } catch (err) {
        console.error('Failed to send email to:', cert.student?.email, err);
        return { email: cert.student?.email, success: false, error: err.message };
      }
    });

    const results = await Promise.all(promises);
    return results;
  }
}

module.exports = new CertificateService();

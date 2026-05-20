const PDFDocument = require('pdfkit');

function generateCertificatePDF(res, { studentName, eventTitle, eventCategory, eventDate, certType, schoolName }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="certificate.pdf"');
  doc.pipe(res);

  const W = doc.page.width;
  const H = doc.page.height;

  doc.rect(0, 0, W, H).fill('#0f172a');
  doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke('#C9A84C');
  doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke('#C9A84C');
  doc.moveTo(60, 80).lineTo(W - 60, 80).lineWidth(1).stroke('#C9A84C');
  doc.moveTo(60, 85).lineTo(W - 60, 85).lineWidth(0.5).stroke('#C9A84C');
  doc.moveTo(60, H - 80).lineTo(W - 60, H - 80).lineWidth(1).stroke('#C9A84C');
  doc.moveTo(60, H - 85).lineTo(W - 60, H - 85).lineWidth(0.5).stroke('#C9A84C');

  [[55,55],[W-55,55],[55,H-55],[W-55,H-55]].forEach(([x,y]) => doc.circle(x,y,5).fill('#C9A84C'));

  doc.fillColor('#C9A84C').fontSize(13).font('Helvetica')
     .text('EDUCONNECT', 0, 55, { align: 'center', characterSpacing: 8 });

  const certTypeText = certType === 'WINNER' ? 'Certificate of Excellence' :
    certType === 'RUNNER_UP' ? 'Certificate of Merit' : 'Certificate of Participation';

  doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
     .text(certTypeText.toUpperCase(), 0, 105, { align: 'center', characterSpacing: 4 });

  doc.fillColor('#64748b').fontSize(12).font('Helvetica-Oblique')
     .text('This is to certify that', 0, 155, { align: 'center' });

  doc.fillColor('#ffffff').fontSize(42).font('Helvetica-Bold')
     .text(studentName, 0, 175, { align: 'center' });

  const nameWidth = doc.widthOfString(studentName, { fontSize: 42 });
  const nameX = (W - nameWidth) / 2;
  doc.moveTo(nameX, 225).lineTo(nameX + nameWidth, 225).lineWidth(1).stroke('#C9A84C');

  const participationText = certType === 'WINNER' ? 'has won 1st place in' :
    certType === 'RUNNER_UP' ? 'has secured 2nd place in' : 'has successfully participated in';

  doc.fillColor('#94a3b8').fontSize(13).font('Helvetica-Oblique')
     .text(participationText, 0, 240, { align: 'center' });

  doc.fillColor('#C9A84C').fontSize(26).font('Helvetica-Bold')
     .text(eventTitle, 60, 265, { align: 'center', width: W - 120 });

  doc.fillColor('#64748b').fontSize(11).font('Helvetica')
     .text(eventCategory + '  -  ' + new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 0, 310, { align: 'center' });

  doc.fillColor('#475569').fontSize(10).font('Helvetica')
     .text('Organized by  ' + schoolName, 0, 330, { align: 'center' });

  doc.circle(W/2, H-55, 22).lineWidth(2).stroke('#C9A84C');
  doc.fillColor('#C9A84C').fontSize(8).font('Helvetica-Bold')
     .text('OFFICIAL', W/2-18, H-62).text('SEAL', W/2-8, H-53);

  doc.fillColor('#334155').fontSize(9).font('Helvetica')
     .text('Issued on ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 60, H-60, { align: 'left' });

  doc.end();
}

function generateCertificateBuffer({ studentName, eventTitle, eventCategory, eventDate, certType, schoolName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    const W = doc.page.width;
    const H = doc.page.height;

    doc.rect(0, 0, W, H).fill('#0f172a');
    doc.rect(20, 20, W - 40, H - 40).lineWidth(3).stroke('#C9A84C');
    doc.rect(30, 30, W - 60, H - 60).lineWidth(1).stroke('#C9A84C');
    doc.moveTo(60, 80).lineTo(W - 60, 80).lineWidth(1).stroke('#C9A84C');
    doc.moveTo(60, 85).lineTo(W - 60, 85).lineWidth(0.5).stroke('#C9A84C');
    doc.moveTo(60, H - 80).lineTo(W - 60, H - 80).lineWidth(1).stroke('#C9A84C');
    doc.moveTo(60, H - 85).lineTo(W - 60, H - 85).lineWidth(0.5).stroke('#C9A84C');

    [[55,55],[W-55,55],[55,H-55],[W-55,H-55]].forEach(([x,y]) => doc.circle(x,y,5).fill('#C9A84C'));

    doc.fillColor('#C9A84C').fontSize(13).font('Helvetica')
       .text('EDUCONNECT', 0, 55, { align: 'center', characterSpacing: 8 });

    const certTypeText = certType === 'WINNER' ? 'Certificate of Excellence' :
      certType === 'RUNNER_UP' ? 'Certificate of Merit' : 'Certificate of Participation';

    doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
       .text(certTypeText.toUpperCase(), 0, 105, { align: 'center', characterSpacing: 4 });

    doc.fillColor('#64748b').fontSize(12).font('Helvetica-Oblique')
       .text('This is to certify that', 0, 155, { align: 'center' });

    doc.fillColor('#ffffff').fontSize(42).font('Helvetica-Bold')
       .text(studentName, 0, 175, { align: 'center' });

    const nameWidth = doc.widthOfString(studentName, { fontSize: 42 });
    const nameX = (W - nameWidth) / 2;
    doc.moveTo(nameX, 225).lineTo(nameX + nameWidth, 225).lineWidth(1).stroke('#C9A84C');

    const participationText = certType === 'WINNER' ? 'has won 1st place in' :
      certType === 'RUNNER_UP' ? 'has secured 2nd place in' : 'has successfully participated in';

    doc.fillColor('#94a3b8').fontSize(13).font('Helvetica-Oblique')
       .text(participationText, 0, 240, { align: 'center' });

    doc.fillColor('#C9A84C').fontSize(26).font('Helvetica-Bold')
       .text(eventTitle, 60, 265, { align: 'center', width: W - 120 });

    doc.fillColor('#64748b').fontSize(11).font('Helvetica')
       .text(eventCategory + '  -  ' + new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 0, 310, { align: 'center' });

    doc.fillColor('#475569').fontSize(10).font('Helvetica')
       .text('Organized by  ' + schoolName, 0, 330, { align: 'center' });

    doc.circle(W/2, H-55, 22).lineWidth(2).stroke('#C9A84C');
    doc.fillColor('#C9A84C').fontSize(8).font('Helvetica-Bold')
       .text('OFFICIAL', W/2-18, H-62).text('SEAL', W/2-8, H-53);

    doc.fillColor('#334155').fontSize(9).font('Helvetica')
       .text('Issued on ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 60, H-60, { align: 'left' });

    doc.end();
  });
}

module.exports = { generateCertificatePDF, generateCertificateBuffer };

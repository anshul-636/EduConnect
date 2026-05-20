const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ email, subject, html, attachments }) => {
  const mailOptions = {
    from: '"EduConnect" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject,
    html,
    attachments,
  };
  await transporter.sendMail(mailOptions);
  console.log('✅ Email sent to:', email);
};

module.exports = sendEmail;

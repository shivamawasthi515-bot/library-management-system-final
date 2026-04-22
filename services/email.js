const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return _transporter;
}

/**
 * Send an email. Silently skips when EMAIL_USER/EMAIL_PASS are not configured.
 * @param {{ to: string, subject: string, text: string, html?: string }} opts
 */
async function sendMail({ to, subject, text, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set – skipping email to', to);
    return;
  }
  await getTransporter().sendMail({
    from: `"HLMS Library" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html || text
  });
}

module.exports = { sendMail };

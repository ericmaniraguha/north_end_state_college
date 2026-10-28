// Email through any SMTP server (Gmail, Outlook, the college's own mail server…).
const nodemailer = require('nodemailer');
const { email: cfg } = require('../config').messaging;

let transport;

const configured = () => Boolean(cfg.host && cfg.from);

async function send({ to, subject, body }) {
  transport ||= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.password } : undefined,
  });
  // A bare address in SMTP_FROM is shown with the college's name
  const from = cfg.from.includes('<') ? cfg.from : { name: cfg.fromName, address: cfg.from };
  await transport.sendMail({ from, to, subject: subject || 'North End College', text: body });
}

module.exports = { provider: () => 'smtp', configured, send };

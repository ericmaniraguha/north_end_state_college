// Validation and storage for applications, shared by the public form and the admin dashboard.
const db = require('../db');
const { clean, isEmail, normalizePhone } = require('./validate');

function validateApplication(body) {
  const data = {
    programmeId: Number(body.programme_id),
    fullName: clean(body.full_name),
    phone: normalizePhone(body.phone),
    nrc: clean(body.nrc),
    email: clean(body.email).toLowerCase(),
  };

  const errors = {};
  if (!db.prepare('SELECT 1 FROM programmes WHERE id = ? AND is_active = 1').get(data.programmeId)) {
    errors.programme_id = 'Choose a programme.';
  }
  if (data.fullName.length < 3) errors.full_name = 'Enter your full name.';
  if (!data.phone) errors.phone = 'Enter a valid phone number, e.g. +260 971 234 567.';
  if (!/^\d{6}\/\d{2}\/\d$/.test(data.nrc)) errors.nrc = 'NRC format: 123456/12/1';
  if (data.email && !isEmail(data.email)) errors.email = 'Enter a valid email address.';

  return { data, errors };
}

// emailVerified: the applicant has confirmed the email address with a one-time code
function createApplication({ programmeId, fullName, email, phone, nrc }, { emailVerified = false } = {}) {
  const { lastInsertRowid } = db.prepare(
    `INSERT INTO applications (programme_id, full_name, email, phone, nrc, email_verified_at)
     VALUES (?, ?, ?, ?, ?, CASE WHEN ? THEN datetime('now') END)`
  ).run(programmeId, fullName, email || null, phone, nrc, emailVerified ? 1 : 0);
  return Number(lastInsertRowid);
}

module.exports = { validateApplication, createApplication };

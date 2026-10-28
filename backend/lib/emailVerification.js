// One-time codes that confirm an applicant's email address the first time they use it.
// The application waits in email_verifications until the right code is entered; the
// address is then remembered in verified_emails, so later applications skip the step.
// Codes are stored only as hashes and are never written to the outbound_messages log.
const crypto = require('crypto');
const db = require('../db');
const email = require('../messaging/email');
const templates = require('../messaging/templates');
const { verification: cfg } = require('../config');

const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;
const MAX_SENDS = 5;
const GONE = 'This code is no longer valid. Please submit the application form again.';

// Verification needs email sending to be set up; without it applications are accepted as before
const active = () => cfg.applicantEmail && email.configured();

const isVerified = (address) => Boolean(db.prepare('SELECT 1 FROM verified_emails WHERE email = ?').get(address));

const newCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const hash = (token, code) => crypto.createHash('sha256').update(`${token}:${code}`).digest('hex');
const sameHash = (a, b) => crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));

function sendCode(address, code) {
  const { subject, body } = templates.verificationCode(code, CODE_MINUTES);
  return email.send({ to: address, subject, body });
}

function pending(token) {
  if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) return null;
  return db.prepare(
    `SELECT *, expires_at <= datetime('now') AS expired,
            CAST(strftime('%s', 'now') - strftime('%s', last_sent_at) AS INTEGER) AS since_sent
     FROM email_verifications WHERE token = ? AND verified_at IS NULL`
  ).get(token);
}

// Emails a code and keeps the application until it is confirmed. Throws if the email
// can't be sent, in which case nothing is stored.
async function start(address, payload) {
  db.prepare("DELETE FROM email_verifications WHERE verified_at IS NULL AND created_at < datetime('now', '-1 day')").run();
  const token = crypto.randomBytes(16).toString('hex');
  const code = newCode();
  await sendCode(address, code);
  db.prepare(
    `INSERT INTO email_verifications (token, email, code_hash, payload, expires_at)
     VALUES (?, ?, ?, ?, datetime('now', ?))`
  ).run(token, address, hash(token, code), JSON.stringify(payload), `+${CODE_MINUTES} minutes`);
  return { token, email: address, expires_in: CODE_MINUTES * 60, resend_in: RESEND_SECONDS };
}

// Returns [HTTP status, body]. Throws if the email can't be sent.
async function resend(token) {
  const v = pending(token);
  if (!v) return [404, { error: GONE }];
  if (v.since_sent < RESEND_SECONDS) {
    const wait = RESEND_SECONDS - v.since_sent;
    return [429, { error: `Please wait ${wait} seconds before asking for a new code.`, resend_in: wait }];
  }
  if (v.sends >= MAX_SENDS) return [429, { error: 'Too many codes requested. Please try again later or contact us on WhatsApp.' }];

  const code = newCode();
  await sendCode(v.email, code);
  db.prepare(
    `UPDATE email_verifications
     SET code_hash = ?, attempts = 0, sends = sends + 1, last_sent_at = datetime('now'), expires_at = datetime('now', ?)
     WHERE id = ?`
  ).run(hash(token, code), `+${CODE_MINUTES} minutes`, v.id);
  return [200, { message: `We sent a new code to ${v.email}.`, resend_in: RESEND_SECONDS, expires_in: CODE_MINUTES * 60 }];
}

// Checks a code. Returns { ok: true, verification, payload } or [HTTP status, body].
function check(token, code) {
  const v = pending(token);
  if (!v) return [404, { error: GONE }];
  if (v.expired) return [400, { error: 'This code has expired. Ask for a new code.', expired: true }];
  if (v.attempts >= MAX_ATTEMPTS) return [400, { error: 'Too many wrong codes. Ask for a new code.', expired: true }];

  const entered = String(code ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(entered) || !sameHash(hash(token, entered), v.code_hash)) {
    db.prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ?').run(v.id);
    const left = MAX_ATTEMPTS - v.attempts - 1;
    const message = left > 0 ? `That code is not correct. ${left} attempt${left === 1 ? '' : 's'} left.` : 'That code is not correct. Ask for a new code.';
    return [400, { errors: { code: message } }];
  }
  return { ok: true, verification: v, payload: JSON.parse(v.payload) };
}

function complete(verification, applicationId) {
  db.prepare("UPDATE email_verifications SET verified_at = datetime('now'), application_id = ? WHERE id = ?").run(applicationId, verification.id);
  db.prepare('INSERT OR IGNORE INTO verified_emails (email) VALUES (?)').run(verification.email);
}

module.exports = { active, isVerified, start, resend, check, complete };

// Admin API. Every request must send the X-Admin-Token header matching ADMIN_TOKEN.
const router = require('express').Router();
const db = require('../db');
const { adminToken } = require('../config');
const { clean } = require('../lib/validate');
const { validateApplication, createApplication } = require('../lib/applications');
const messaging = require('../messaging');

const STATUSES = ['pending', 'accepted', 'rejected'];

router.use((req, res, next) => {
  if (req.get('x-admin-token') !== adminToken) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

function inTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// Counts for the sidebar badges and notifications
router.get('/summary', (req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  const byStatus = Object.fromEntries(
    db.prepare('SELECT status, COUNT(*) AS n FROM applications GROUP BY status').all().map((r) => [r.status, r.n])
  );
  res.json({
    applications: {
      total: count('SELECT COUNT(*) AS n FROM applications'),
      pending: byStatus.pending || 0,
      accepted: byStatus.accepted || 0,
      rejected: byStatus.rejected || 0,
    },
    latestPending: db.prepare(
      `SELECT a.id, a.full_name, a.created_at, p.name AS programme
       FROM applications a JOIN programmes p ON p.id = a.programme_id
       WHERE a.status = 'pending' ORDER BY a.id DESC LIMIT 5`
    ).all(),
    messages: count('SELECT COUNT(*) AS n FROM contact_messages'),
    unreadMessages: count('SELECT COUNT(*) AS n FROM contact_messages WHERE read_at IS NULL'),
    subscribers: count('SELECT COUNT(*) AS n FROM newsletter_subscribers'),
    posts: count('SELECT COUNT(*) AS n FROM posts'),
    calendar: count('SELECT COUNT(*) AS n FROM calendar_dates'),
    testimonials: count('SELECT COUNT(*) AS n FROM testimonials'),
  });
});

// ---------- applications

const APPLICATIONS = `SELECT a.id, a.programme_id, a.full_name, a.email, a.phone, a.nrc, a.intake, a.status,
    a.notes, a.reviewed_at, a.created_at, p.name AS programme
  FROM applications a JOIN programmes p ON p.id = a.programme_id`;

router.get('/applications', (req, res) => {
  res.json(db.prepare(`${APPLICATIONS} ORDER BY a.id DESC`).all());
});

// Manual entry for applications received in person, by phone or on WhatsApp.
// The applicant gets the usual confirmation; staff are not alerted about their own entry.
router.post('/applications', (req, res) => {
  const { data, errors } = validateApplication(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const id = createApplication(data);
  messaging.events.applicationSubmitted(id, { alertStaff: false });
  res.status(201).json({ id });
});

// Bulk status change: { ids: [1, 2], status: 'accepted' }
router.patch('/applications', (req, res) => {
  const { ids, status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (!Array.isArray(ids) || !ids.length || ids.length > 500) return res.status(400).json({ error: 'Invalid ids' });

  const update = db.prepare(
    `UPDATE applications SET status = ?, reviewed_at = datetime('now') WHERE id = ? AND status != ?`
  );
  const changed = inTransaction(() => ids.map(Number).filter((id) => update.run(status, id, status).changes));
  messaging.events.statusChanged(changed);
  res.json({ updated: changed.length });
});

// Single application: { status } and/or { notes }
router.patch('/applications/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body;
  if (status === undefined && notes === undefined) return res.status(400).json({ error: 'Nothing to update' });
  if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (notes !== undefined && typeof notes !== 'string') return res.status(400).json({ error: 'Invalid notes' });

  const current = db.prepare('SELECT status FROM applications WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Not found' });

  const statusChanged = status !== undefined && status !== current.status;
  inTransaction(() => {
    if (statusChanged) {
      db.prepare(`UPDATE applications SET status = ?, reviewed_at = datetime('now') WHERE id = ?`).run(status, id);
    }
    if (notes !== undefined) {
      db.prepare('UPDATE applications SET notes = ? WHERE id = ?').run(notes.trim().slice(0, 5000) || null, id);
    }
  });
  if (statusChanged) messaging.events.statusChanged([id]);
  res.json(db.prepare(`${APPLICATIONS} WHERE a.id = ?`).get(id));
});

// ---------- sending messages

// Which channels are set up in .env, and which automatic messages are switched on
router.get('/messaging', (req, res) => res.json(messaging.status()));

router.get('/applications/:id/outbox', (req, res) => {
  res.json(db.prepare(
    `SELECT id, channel, recipient, subject, body, kind, status, error, created_at
     FROM outbound_messages WHERE application_id = ? AND kind != 'staff_alert' ORDER BY id DESC`
  ).all(Number(req.params.id)));
});

// Sends a message typed by staff: { channel, subject?, body }. Returns [HTTP status, body]:
// 201 when sent, 502 when the provider refused it (the attempt is recorded either way).
async function sendStaffMessage({ channel, subject, body }, person, links) {
  const problem = messaging.checkOutgoing({ channel, body }, person);
  if (problem) return [400, { error: problem }];
  const result = await messaging.send({
    channel,
    to: messaging.recipientFor(channel, person),
    subject: clean(subject) || 'Message from North End College',
    body: body.trim(),
    kind: 'reply',
    ...links,
  });
  return [result.status === 'sent' ? 201 : 502, result];
}

router.post('/applications/:id/send', async (req, res, next) => {
  try {
    const application = db.prepare('SELECT id, email, phone FROM applications WHERE id = ?').get(Number(req.params.id));
    if (!application) return res.status(404).json({ error: 'Not found' });
    const [code, result] = await sendStaffMessage(req.body, application, { applicationId: application.id });
    return res.status(code).json(result);
  } catch (err) {
    return next(err);
  }
});

// ---------- contact messages and subscribers

router.get('/messages', (req, res) => {
  res.json(db.prepare(
    `SELECT m.*, (SELECT MAX(created_at) FROM outbound_messages o
                  WHERE o.contact_message_id = m.id AND o.kind = 'reply' AND o.status = 'sent') AS replied_at
     FROM contact_messages m ORDER BY m.id DESC`
  ).all());
});

// Replying marks the message as read
router.post('/messages/:id/reply', async (req, res, next) => {
  try {
    const message = db.prepare('SELECT id, email, phone FROM contact_messages WHERE id = ?').get(Number(req.params.id));
    if (!message) return res.status(404).json({ error: 'Not found' });
    const [code, result] = await sendStaffMessage(req.body, message, { contactMessageId: message.id });
    if (code === 201) {
      db.prepare("UPDATE contact_messages SET read_at = COALESCE(read_at, datetime('now')) WHERE id = ?").run(message.id);
    }
    return res.status(code).json(result);
  } catch (err) {
    return next(err);
  }
});

router.patch('/messages/:id', (req, res) => {
  if (typeof req.body.read !== 'boolean') return res.status(400).json({ error: 'Send { read: true | false }' });
  const result = db.prepare(
    `UPDATE contact_messages SET read_at = ${req.body.read ? "COALESCE(read_at, datetime('now'))" : 'NULL'} WHERE id = ?`
  ).run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/messages/:id', (req, res) => {
  const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.get('/subscribers', (req, res) => {
  res.json(db.prepare('SELECT * FROM newsletter_subscribers ORDER BY id DESC').all());
});

router.delete('/subscribers/:id', (req, res) => {
  const result = db.prepare('DELETE FROM newsletter_subscribers WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- content shown on the public site. Only the listed fields can be written.

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const resources = {
  posts: {
    table: 'posts',
    fields: ['type', 'title', 'summary', 'body', 'event_date', 'location'],
    required: ['type', 'title', 'summary'],
    order: 'id DESC',
    validate(d, errors) {
      if (d.type && !['news', 'event'].includes(d.type)) errors.type = 'Choose news or event.';
      if (d.type === 'event' && !d.event_date) errors.event_date = 'Events need a date.';
      if (d.event_date && !isDate(d.event_date)) errors.event_date = 'Use YYYY-MM-DD.';
    },
  },
  calendar: {
    table: 'calendar_dates',
    fields: ['title', 'date', 'note'],
    required: ['title', 'date'],
    order: 'date',
    validate(d, errors) {
      if (d.date && !isDate(d.date)) errors.date = 'Use YYYY-MM-DD.';
    },
  },
  testimonials: {
    table: 'testimonials',
    fields: ['name', 'programme', 'quote'],
    required: ['name', 'quote'],
    order: 'id DESC',
  },
};

function findResource(req, res, next) {
  req.resource = resources[req.params.resource];
  if (!req.resource) return res.status(404).json({ error: 'Unknown resource' });
  next();
}

router.get('/content/:resource', findResource, (req, res) => {
  const { table, order } = req.resource;
  res.json(db.prepare(`SELECT * FROM ${table} ORDER BY ${order}`).all());
});

router.post('/content/:resource', findResource, (req, res) => {
  const { table, fields, required, validate } = req.resource;
  const data = Object.fromEntries(fields.map((f) => [f, clean(req.body[f]) || null]));

  const errors = {};
  for (const f of required) if (!data[f]) errors[f] = 'Required.';
  if (validate) validate(data, errors);
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const { lastInsertRowid } = db.prepare(
    `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`
  ).run(...Object.values(data));
  res.status(201).json({ id: Number(lastInsertRowid) });
});

router.delete('/content/:resource/:id', findResource, (req, res) => {
  const result = db.prepare(`DELETE FROM ${req.resource.table} WHERE id = ?`).run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;

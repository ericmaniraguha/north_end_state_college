// Outbound messages by email, WhatsApp and SMS. Every attempt, sent or failed, is
// recorded in outbound_messages so staff can see what reached people.
const db = require('../db');
const { messaging: cfg } = require('../config');
const templates = require('./templates');

const CHANNELS = {
  email: require('./email'),
  whatsapp: require('./whatsapp'),
  sms: require('./sms'),
};
const PHONE_CHANNELS = ['whatsapp', 'sms'];
const MAX_LENGTH = 1600;

const availableChannels = () => Object.keys(CHANNELS).filter((name) => CHANNELS[name].configured());

const recipientFor = (channel, person) => (channel === 'email' ? person.email : person.phone) || null;

// Sends one message and records the result. Never throws: failures come back as
// { status: 'failed', error }.
async function send({ channel, to, subject = null, body, kind, applicationId = null, contactMessageId = null }) {
  const service = CHANNELS[channel];
  let status = 'sent';
  let error = null;
  try {
    if (!service?.configured()) throw new Error(`${channel} is not set up in .env`);
    await service.send({ to, subject, body });
  } catch (err) {
    status = 'failed';
    error = String(err.message || err).slice(0, 500);
    console.error(`[messaging] ${channel} to ${to} failed: ${error}`);
  }
  const { lastInsertRowid } = db.prepare(
    `INSERT INTO outbound_messages (channel, provider, recipient, subject, body, kind, status, error, application_id, contact_message_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(channel, service?.provider() || null, to, channel === 'email' ? subject : null, body, kind, status, error, applicationId, contactMessageId);
  return { id: Number(lastInsertRowid), channel, to, status, error };
}

// Checks a message typed by staff. Returns an error message, or null if it can be sent.
function checkOutgoing({ channel, body }, person) {
  if (!availableChannels().includes(channel)) return 'Choose a channel that is set up.';
  if (!recipientFor(channel, person)) return channel === 'email' ? 'There is no email address to send to.' : 'There is no phone number to send to.';
  if (typeof body !== 'string' || !body.trim()) return 'Write a message.';
  if (body.length > MAX_LENGTH) return `Keep the message under ${MAX_LENGTH} characters.`;
  return null;
}

// Automatic messages go to every channel in NOTIFY_CHANNELS that is set up and for
// which the person has an address.
async function notify(person, kind, { subject, body }, links) {
  const results = [];
  for (const channel of cfg.channels) {
    const to = recipientFor(channel, person);
    if (to && CHANNELS[channel]?.configured()) results.push(await send({ channel, to, subject, body, kind, ...links }));
  }
  return results;
}

async function notifyStaff(message, links) {
  const sends = [];
  if (CHANNELS.email.configured()) {
    for (const email of cfg.staffEmails) sends.push(send({ channel: 'email', to: email, ...message, kind: 'staff_alert', ...links }));
  }
  const phoneChannel = cfg.channels.find((c) => PHONE_CHANNELS.includes(c) && CHANNELS[c].configured());
  if (phoneChannel) {
    for (const phone of cfg.staffPhones) sends.push(send({ channel: phoneChannel, to: phone, ...message, kind: 'staff_alert', ...links }));
  }
  return Promise.all(sends);
}

const APPLICATION = `SELECT a.*, p.name AS programme FROM applications a JOIN programmes p ON p.id = a.programme_id WHERE a.id = ?`;
const loadApplication = (id) => db.prepare(APPLICATION).get(id);

// Runs after the HTTP response so visitors and staff never wait for a mail server.
function later(task) {
  setImmediate(() => task().catch((err) => console.error('[messaging]', err)));
}

const events = {
  applicationSubmitted(id, { alertStaff = true } = {}) {
    later(async () => {
      const a = loadApplication(id);
      if (!a) return;
      if (cfg.confirmation) await notify(a, 'confirmation', templates.confirmation(a), { applicationId: id });
      if (cfg.staffAlerts && alertStaff) await notifyStaff(templates.staffApplication(a), { applicationId: id });
    });
  },

  statusChanged(ids) {
    if (!cfg.decision) return;
    later(async () => {
      for (const id of ids) {
        const a = loadApplication(id);
        if (a && a.status !== 'pending') await notify(a, 'decision', templates.decision(a), { applicationId: id });
      }
    });
  },

  contactReceived(id) {
    if (!cfg.staffAlerts) return;
    later(async () => {
      const m = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
      if (m) await notifyStaff(templates.staffContact(m), { contactMessageId: id });
    });
  },
};

function status() {
  return {
    channels: availableChannels(),
    sms: CHANNELS.sms.configured() ? CHANNELS.sms.provider() : null,
    automatic: {
      channels: cfg.channels.filter((c) => CHANNELS[c]?.configured()),
      confirmation: cfg.confirmation,
      decision: cfg.decision,
      staffAlerts: cfg.staffAlerts && (cfg.staffEmails.length + cfg.staffPhones.length > 0),
    },
  };
}

module.exports = { send, checkOutgoing, recipientFor, events, status };

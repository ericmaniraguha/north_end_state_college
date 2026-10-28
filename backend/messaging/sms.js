// SMS through Africa's Talking or Twilio. SMS_PROVIDER picks one; if it is empty,
// whichever has credentials is used (Africa's Talking first).
const { sms: cfg } = require('../config').messaging;

const { africastalking: at, twilio: tw } = cfg;
const atReady = () => Boolean(at.username && at.apiKey);
const twReady = () => Boolean(tw.accountSid && tw.authToken && (tw.from || tw.messagingServiceSid));

function provider() {
  if (cfg.provider) return cfg.provider;
  if (atReady()) return 'africastalking';
  if (twReady()) return 'twilio';
  return null;
}

function configured() {
  const p = provider();
  return (p === 'africastalking' && atReady()) || (p === 'twilio' && twReady());
}

async function sendAfricasTalking({ to, body }) {
  // The username "sandbox" uses Africa's Talking's free test environment
  const host = at.username === 'sandbox' ? 'https://api.sandbox.africastalking.com' : 'https://api.africastalking.com';
  const form = new URLSearchParams({ username: at.username, to, message: body });
  if (at.from) form.set('from', at.from);

  const res = await fetch(`${host}/version1/messaging`, {
    method: 'POST',
    headers: { apiKey: at.apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Africa's Talking: HTTP ${res.status} ${text.slice(0, 200)}`);
  let recipient;
  try { [recipient] = JSON.parse(text).SMSMessageData.Recipients; } catch { /* unexpected body */ }
  if (recipient?.status !== 'Success') throw new Error(`Africa's Talking: ${recipient?.status || text.slice(0, 200)}`);
}

async function sendTwilio({ to, body }) {
  const form = new URLSearchParams({ To: to, Body: body });
  if (tw.messagingServiceSid) form.set('MessagingServiceSid', tw.messagingServiceSid);
  else form.set('From', tw.from);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${tw.accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${tw.accountSid}:${tw.authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twilio: ${data.message || `HTTP ${res.status}`}`);
}

async function send(message) {
  if (provider() === 'twilio') return sendTwilio(message);
  return sendAfricasTalking(message);
}

module.exports = { provider, configured, send };

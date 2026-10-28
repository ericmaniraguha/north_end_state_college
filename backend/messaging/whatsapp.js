// WhatsApp through Meta's WhatsApp Cloud API.
// Free-form text only reaches people who messaged the college in the last 24 hours.
// To message anyone else (e.g. automatic confirmations), set WHATSAPP_TEMPLATE to an
// approved template whose body has one variable, {{1}}, which receives the message text.
const { whatsapp: cfg } = require('../config').messaging;

const configured = () => Boolean(cfg.token && cfg.phoneNumberId);

async function send({ to, body }) {
  const recipient = to.replace(/\D/g, '');
  const message = cfg.template
    ? {
      type: 'template',
      template: {
        name: cfg.template,
        language: { code: cfg.templateLanguage },
        components: [{ type: 'body', parameters: [{ type: 'text', text: body }] }],
      },
    }
    : { type: 'text', text: { body } };

  const res = await fetch(`https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: recipient, ...message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp: ${data.error?.message || `HTTP ${res.status}`}`);
}

module.exports = { provider: () => 'whatsapp-cloud', configured, send };

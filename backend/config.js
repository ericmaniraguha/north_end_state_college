const path = require('path');
const fs = require('fs');

// Minimal .env loader so we don't need an extra dependency. Supports KEY=value and
// KEY="value with spaces"; lines starting with # are comments. Real environment
// variables take precedence over .env.
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || m[1] in process.env) continue;
    process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
  }
}

const env = (key, fallback = '') => process.env[key] || fallback;
const list = (key) => env(key).split(',').map((s) => s.trim()).filter(Boolean);
const flag = (key, fallback) => (env(key) ? /^(1|true|yes|on)$/i.test(env(key)) : fallback);

module.exports = {
  port: Number(env('PORT')) || 3000,
  dbPath: path.resolve(__dirname, '..', env('DB_PATH', 'data/college.db')),
  adminToken: env('ADMIN_TOKEN', 'change-me'),
  // Public address used in sitemap.xml, e.g. https://northendcollege.ac.zm
  siteUrl: env('SITE_URL').replace(/\/$/, ''),

  verification: {
    // Email a one-time code to confirm an applicant's address the first time it is used
    applicantEmail: flag('VERIFY_APPLICANT_EMAIL', true),
  },

  messaging: {
    // Channels used for automatic messages, in this order; unconfigured ones are skipped
    channels: env('NOTIFY_CHANNELS') ? list('NOTIFY_CHANNELS') : ['email', 'whatsapp', 'sms'],
    confirmation: flag('NOTIFY_APPLICANT_CONFIRMATION', true),
    decision: flag('NOTIFY_APPLICANT_DECISION', true),
    staffAlerts: flag('NOTIFY_STAFF', true),
    staffEmails: list('STAFF_ALERT_EMAILS'),
    staffPhones: list('STAFF_ALERT_PHONES'),

    email: {
      host: env('SMTP_SERVER'),
      port: Number(env('SMTP_PORT')) || 587,
      // Port 465 uses TLS from the start; 587 upgrades with STARTTLS
      secure: flag('SMTP_SECURE', Number(env('SMTP_PORT')) === 465),
      user: env('SMTP_USER'),
      password: env('SMTP_PASSWORD'),
      from: env('SMTP_FROM'),
      fromName: env('SMTP_FROM_NAME', 'North End College'),
    },
    whatsapp: {
      token: env('WHATSAPP_ACCESS_TOKEN'),
      phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID'),
      apiVersion: env('WHATSAPP_API_VERSION', 'v23.0'),
      template: env('WHATSAPP_TEMPLATE'),
      templateLanguage: env('WHATSAPP_TEMPLATE_LANGUAGE', 'en'),
    },
    sms: {
      provider: env('SMS_PROVIDER').toLowerCase(),
      africastalking: {
        username: env('AFRICASTALKING_USERNAME'),
        apiKey: env('AFRICASTALKING_API_KEY'),
        from: env('AFRICASTALKING_SENDER_ID'),
      },
      twilio: {
        accountSid: env('TWILIO_ACCOUNT_SID'),
        authToken: env('TWILIO_AUTH_TOKEN'),
        from: env('TWILIO_FROM_NUMBER'),
        messagingServiceSid: env('TWILIO_MESSAGING_SERVICE_SID'),
      },
    },
  },
};

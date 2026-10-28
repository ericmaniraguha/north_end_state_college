// Text of the automatic messages. Kept short and on one line so they fit in an SMS
// (about two segments) and in a WhatsApp template variable.

// Same numbers as frontend/src/config/site.js
const COLLEGE = 'North End College';
const PHONES = '+260 771 413 910 or +260 977 494 707';

const ref = (id) => `NEC-${String(id).padStart(5, '0')}`;
const firstName = (name) => name.split(/\s+/)[0];

const confirmation = (a) => ({
  subject: `Application received (${ref(a.id)})`,
  body: `Hello ${firstName(a.full_name)}, thank you for applying for ${a.programme} (${a.intake} intake) at ${COLLEGE}. Your reference is ${ref(a.id)}. Please send your Grade 12 results and NRC on WhatsApp to ${PHONES} to receive your acceptance letter.`,
});

const decision = (a) => (a.status === 'accepted'
  ? {
    subject: `Congratulations, you have been accepted (${ref(a.id)})`,
    body: `Hello ${firstName(a.full_name)}, congratulations! Your application for ${a.programme} (${a.intake} intake) at ${COLLEGE} has been accepted. Reference: ${ref(a.id)}. We will contact you with the next steps.`,
  }
  : {
    subject: `Your application to ${COLLEGE} (${ref(a.id)})`,
    body: `Hello ${firstName(a.full_name)}, thank you for applying for ${a.programme} at ${COLLEGE}. Unfortunately we cannot offer you a place at this time. Please call ${PHONES} if you would like to discuss your application. Reference: ${ref(a.id)}.`,
  });

const staffApplication = (a) => ({
  subject: `New application: ${a.full_name} (${ref(a.id)})`,
  body: `New application ${ref(a.id)} for ${a.programme}: ${a.full_name}, ${a.phone}${a.email ? `, ${a.email}` : ''}, NRC ${a.nrc}. Review it in the admin dashboard.`,
});

const staffContact = (m) => ({
  subject: `New message from ${m.name}`,
  body: `New website message from ${m.name}${m.email ? ` (${m.email})` : ''}${m.phone ? ` ${m.phone}` : ''}: ${m.message.replace(/\s+/g, ' ').slice(0, 300)}`,
});

module.exports = { confirmation, decision, staffApplication, staffContact };

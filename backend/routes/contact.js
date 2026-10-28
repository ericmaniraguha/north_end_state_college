const router = require('express').Router();
const db = require('../db');
const { clean, isEmail, normalizePhone } = require('../lib/validate');

router.post('/', (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email);
  const rawPhone = clean(req.body.phone);
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  const message = clean(req.body.message);

  const errors = {};
  if (name.length < 2) errors.name = 'Enter your name.';
  if (email && !isEmail(email)) errors.email = 'Enter a valid email address.';
  if (rawPhone && !phone) errors.phone = 'Enter a valid phone number, e.g. +260 971 234 567.';
  if (!email && !rawPhone) errors.email = 'Provide an email or phone number.';
  if (message.length < 5) errors.message = 'Enter a message.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  db.prepare('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)')
    .run(name, email || null, phone, message);
  res.status(201).json({ message: 'Thank you. We will get back to you soon.' });
});

module.exports = router;

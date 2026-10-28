const router = require('express').Router();
const db = require('../db');
const { clean, isEmail } = require('../lib/validate');

router.post('/', (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ errors: { email: 'Enter a valid email address.' } });

  db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(email);
  res.status(201).json({ message: 'Thank you for subscribing.' });
});

module.exports = router;

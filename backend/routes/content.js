// Public read-only content: news, events, important dates and testimonials.
const router = require('express').Router();
const db = require('../db');

const limitOf = (value, fallback = 20) => Math.min(Math.max(Number(value) || fallback, 1), 100);

router.get('/posts', (req, res) => {
  const limit = limitOf(req.query.limit);
  if (req.query.type === 'event') {
    return res.json(db.prepare(
      `SELECT * FROM posts WHERE type = 'event' AND event_date >= date('now') ORDER BY event_date LIMIT ?`
    ).all(limit));
  }
  res.json(db.prepare(
    `SELECT * FROM posts WHERE type = 'news' ORDER BY published_at DESC, id DESC LIMIT ?`
  ).all(limit));
});

router.get('/calendar', (req, res) => {
  res.json(db.prepare(
    `SELECT id, title, date, note FROM calendar_dates WHERE date >= date('now') ORDER BY date LIMIT ?`
  ).all(limitOf(req.query.limit)));
});

router.get('/testimonials', (req, res) => {
  res.json(db.prepare('SELECT id, name, programme, quote FROM testimonials ORDER BY id DESC LIMIT ?')
    .all(limitOf(req.query.limit)));
});

module.exports = router;

const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare(
    `SELECT s.id, s.slug, s.name, s.description, COUNT(p.id) AS programme_count
     FROM schools s
     LEFT JOIN programmes p ON p.school_id = s.id AND p.is_active = 1
     GROUP BY s.id
     ORDER BY s.sort_order, s.name`
  ).all());
});

module.exports = router;

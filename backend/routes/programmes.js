const router = require('express').Router();
const db = require('../db');

const SELECT = `SELECT p.id, p.slug, p.name, p.level, p.study_mode, p.description, p.entry_requirements,
    s.slug AS school_slug, s.name AS school_name
  FROM programmes p
  LEFT JOIN schools s ON s.id = p.school_id
  WHERE p.is_active = 1`;

router.get('/', (req, res) => {
  const school = typeof req.query.school === 'string' ? req.query.school : '';
  res.json(school
    ? db.prepare(`${SELECT} AND s.slug = ? ORDER BY p.name`).all(school)
    : db.prepare(`${SELECT} ORDER BY s.sort_order, p.name`).all());
});

router.get('/:slug', (req, res) => {
  const programme = db.prepare(`${SELECT} AND p.slug = ?`).get(req.params.slug);
  if (!programme) return res.status(404).json({ error: 'Programme not found' });

  const related = programme.school_slug
    ? db.prepare(`${SELECT} AND s.slug = ? AND p.id != ? ORDER BY p.name`).all(programme.school_slug, programme.id)
    : [];
  res.json({ ...programme, related });
});

module.exports = router;

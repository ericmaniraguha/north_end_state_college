// robots.txt and sitemap.xml, generated so new programmes are listed automatically.
const router = require('express').Router();
const db = require('../db');
const { siteUrl } = require('../config');

const origin = (req) => siteUrl || `${req.protocol}://${req.get('host')}`;

const PAGES = ['/', '/about', '/admissions', '/programmes', '/news', '/contact'];

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${origin(req)}/sitemap.xml\n`
  );
});

router.get('/sitemap.xml', (req, res) => {
  const base = origin(req);
  const programmes = db.prepare('SELECT slug FROM programmes WHERE is_active = 1').all()
    .map((p) => `/programmes/${p.slug}`);
  const urls = [...PAGES, ...programmes].map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
});

module.exports = router;

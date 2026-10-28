// Serves the React app. In development (npm run dev) Vite runs inside Express with live
// reload; otherwise the built files in frontend/dist are served (npm run build, npm start).
const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('./db');

const root = path.join(__dirname, '..', 'frontend');
const dist = path.join(root, 'dist');

// Public pages handled by the React router (frontend/src/App.jsx)
const PAGES = new Set(['/', '/about', '/admissions', '/programmes', '/news', '/contact']);

// Addresses of the original HTML pages, kept working for old links and bookmarks
const LEGACY = {
  '/index.html': '/',
  '/about.html': '/about',
  '/admissions.html': '/admissions',
  '/programmes.html': '/programmes',
  '/news.html': '/news',
  '/contact.html': '/contact',
  '/admin.html': '/admin',
};

// Unknown URLs still get the React app, which shows its not-found page, but with a
// 404 status so search engines don't index them.
function statusFor(urlPath) {
  const p = urlPath.length > 1 ? urlPath.replace(/\/+$/, '') : urlPath;
  if (PAGES.has(p) || p === '/admin' || p.startsWith('/admin/')) return 200;
  const programme = p.match(/^\/programmes\/([a-z0-9-]+)$/);
  if (programme && db.prepare('SELECT 1 FROM programmes WHERE slug = ? AND is_active = 1').get(programme[1])) return 200;
  return 404;
}

const wantsPage = (req) => (req.method === 'GET' || req.method === 'HEAD') && req.accepts('html');

async function attachFrontend(app, { dev = false } = {}) {
  app.get(Object.keys(LEGACY), (req, res) => res.redirect(301, LEGACY[req.path]));

  if (dev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      configFile: path.join(root, 'vite.config.mjs'),
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (!wantsPage(req)) return next();
      try {
        const html = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
        return res.status(statusFor(req.path)).type('html').send(html);
      } catch (err) {
        vite.ssrFixStacktrace(err);
        return next(err);
      }
    });
    return;
  }

  // Built assets have content hashes in their names, so they can be cached for a year
  app.use(express.static(dist, {
    index: false,
    setHeaders(res, file) {
      const hashed = file.includes(`${path.sep}assets${path.sep}`);
      res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=86400');
    },
  }));

  const index = path.join(dist, 'index.html');
  app.use((req, res, next) => {
    if (!wantsPage(req)) return next();
    if (!fs.existsSync(index)) {
      return res.status(503).type('text').send('The frontend has not been built. Run "npm run build", or use "npm run dev" while developing.');
    }
    return res.status(statusFor(req.path)).set('Cache-Control', 'no-cache').sendFile(index);
  });
}

module.exports = { attachFrontend, statusFor };

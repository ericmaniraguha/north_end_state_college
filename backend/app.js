const express = require('express');
const rateLimit = require('./middleware/rateLimit');
const { attachFrontend } = require('./frontend');

// Builds the Express app: API, SEO routes and the React frontend.
// dev: true runs Vite inside Express with live reload (npm run dev).
async function createApp({ dev = false } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    next();
  });
  app.use(express.json({ limit: '50kb' }));

  // Limit public form submissions per IP
  const formLimit = rateLimit();
  app.use(['/api/applications', '/api/contact', '/api/newsletter'], (req, res, next) =>
    (req.method === 'POST' ? formLimit(req, res, next) : next()));

  app.use('/api/schools', require('./routes/schools'));
  app.use('/api/programmes', require('./routes/programmes'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/contact', require('./routes/contact'));
  app.use('/api/newsletter', require('./routes/newsletter'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api', require('./routes/content'));
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  app.use(require('./routes/seo'));

  await attachFrontend(app, { dev });

  app.use((req, res) => res.status(404).type('text').send('Not found'));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  });

  return app;
}

module.exports = { createApp };

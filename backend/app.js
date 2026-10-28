const path = require('path');
const express = require('express');
const rateLimit = require('./middleware/rateLimit');

const app = express();
const frontend = path.join(__dirname, '..', 'frontend');

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

// Clean URLs: /programmes/<slug> renders the programme page; /about serves about.html
app.get('/programmes/:slug', (req, res) => res.sendFile(path.join(frontend, 'programme.html')));
app.use(express.static(frontend, {
  extensions: ['html'],
  maxAge: '7d',
  setHeaders(res, file) {
    // Pages, styles and scripts revalidate on every visit (a cheap 304) so updates show at once;
    // images and other assets are cached for a week.
    if (/\.(html|css|js)$/.test(file)) res.setHeader('Cache-Control', 'no-cache');
  },
}));

app.use((req, res) => res.status(404).sendFile(path.join(frontend, '404.html')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;

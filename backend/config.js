const path = require('path');
const fs = require('fs');

// Minimal .env loader so we don't need an extra dependency
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || 'data/college.db'),
  adminToken: process.env.ADMIN_TOKEN || 'change-me',
  // Public address used in sitemap.xml, e.g. https://northendcollege.ac.zm
  siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
};

// Backs up the database to backups/ with a timestamp in the file name.
//   npm run db:backup
// Uses SQLite's VACUUM INTO, which makes a consistent copy even while the server is running.
const fs = require('fs');
const path = require('path');
const config = require('../backend/config');
const db = require('../backend/db');

const dir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const file = path.join(dir, `college-${stamp}.db`);

db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
db.close();

const kb = (fs.statSync(file).size / 1024).toFixed(0);
console.log(`Backed up ${config.dbPath}\n       to ${file} (${kb} KB)`);

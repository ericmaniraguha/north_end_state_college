// Restores a database backup made by `npm run db:backup`. Stop the server first.
//   npm run db:restore -- backups/college-20261028-101500.db --yes
// The current database is itself backed up to backups/ before it is replaced.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../backend/config');

const args = process.argv.slice(2);
const source = args.find((a) => !a.startsWith('--'));
if (!source || !args.includes('--yes')) {
  console.error('Usage: npm run db:restore -- <backup file> --yes');
  console.error('This replaces the current database. Stop the server first.');
  process.exit(1);
}

const backupFile = path.resolve(source);
if (!fs.existsSync(backupFile)) {
  console.error(`Backup not found: ${backupFile}`);
  process.exit(1);
}

// Refuse to restore a damaged or non-SQLite file
try {
  const check = new DatabaseSync(backupFile, { readOnly: true });
  const { integrity_check: result } = check.prepare('PRAGMA integrity_check').get();
  const tables = check.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table'").get().n;
  check.close();
  if (result !== 'ok') throw new Error(`integrity check failed: ${result}`);
  console.log(`Backup is valid (${tables} tables).`);
} catch (err) {
  console.error(`Not a usable backup: ${err.message}`);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const dir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(config.dbPath)) {
  const safety = path.join(dir, `before-restore-${stamp}.db`);
  const current = new DatabaseSync(config.dbPath);
  current.exec(`VACUUM INTO '${safety.replace(/'/g, "''")}'`);
  current.close();
  console.log(`Saved the current database to ${safety}`);
}

try {
  for (const suffix of ['-wal', '-shm', '']) fs.rmSync(config.dbPath + suffix, { force: true });
  fs.copyFileSync(backupFile, config.dbPath);
} catch (err) {
  console.error(`Could not replace the database (${err.code}). Is the server still running? Stop it and try again.`);
  process.exit(1);
}
console.log(`Restored ${backupFile}\n      to ${config.dbPath}`);

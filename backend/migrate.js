// SQL-file migration runner.
// Each file in backend/migrations is named NNN_description.sql and has two
// sections marked by the comments "-- +up" and "-- +down".
//
//   node backend/migrate.js up       apply all pending migrations
//   node backend/migrate.js down     roll back the most recent migration
//   node backend/migrate.js status   list migrations and whether they ran
const fs = require('fs');
const path = require('path');
const db = require('./db');

const dir = path.join(__dirname, 'migrations');

db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

function loadMigrations() {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((name) => {
      const sql = fs.readFileSync(path.join(dir, name), 'utf8');
      const up = sql.split('-- +down')[0].replace('-- +up', '').trim();
      const down = (sql.split('-- +down')[1] || '').trim();
      return { name, up, down };
    });
}

function appliedNames() {
  return new Set(db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name));
}

function inTransaction(fn) {
  db.exec('BEGIN');
  try {
    fn();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function up() {
  const applied = appliedNames();
  const pending = loadMigrations().filter((m) => !applied.has(m.name));
  if (!pending.length) return console.log('Nothing to migrate.');
  for (const m of pending) {
    inTransaction(() => {
      db.exec(m.up);
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(m.name);
    });
    console.log('applied     ', m.name);
  }
}

function down() {
  const last = db.prepare('SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1').get();
  if (!last) return console.log('Nothing to roll back.');
  const m = loadMigrations().find((x) => x.name === last.name);
  if (!m || !m.down) throw new Error(`No down section for ${last.name}`);
  inTransaction(() => {
    db.exec(m.down);
    db.prepare('DELETE FROM schema_migrations WHERE name = ?').run(m.name);
  });
  console.log('rolled back ', m.name);
}

function status() {
  const applied = appliedNames();
  for (const m of loadMigrations()) console.log(applied.has(m.name) ? '[x]' : '[ ]', m.name);
}

const commands = { up, down, status };
const cmd = process.argv[2] || 'up';
if (!commands[cmd]) {
  console.error('Usage: node backend/migrate.js [up|down|status]');
  process.exit(1);
}
commands[cmd]();

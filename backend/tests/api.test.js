// API and routing tests. They run against a throwaway database in the system temp folder,
// never data/college.db, and record the behaviour the React frontend relies on.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..', '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nec-test-'));
const TOKEN = 'test-admin-token';
process.env.DB_PATH = path.join(tmp, 'test.db');
process.env.ADMIN_TOKEN = TOKEN;
process.env.SITE_URL = 'https://example.test';

for (const args of [['backend/migrate.js', 'up'], ['backend/seeds/seed.js']]) {
  execFileSync(process.execPath, args, { cwd: root, env: process.env, stdio: 'ignore' });
}

const { createApp } = require('../app');
const db = require('../db');

let server;
let base;

before(async () => {
  const app = await createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
  db.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function call(method, url, { body, token, accept } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['X-Admin-Token'] = token;
  if (accept) headers.Accept = accept;
  const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  const type = res.headers.get('content-type') || '';
  return { status: res.status, headers: res.headers, body: type.includes('json') ? await res.json() : await res.text() };
}
const get = (url, opts) => call('GET', url, opts);
const post = (url, body) => call('POST', url, { body });
const admin = {
  get: (url) => call('GET', `/api/admin${url}`, { token: TOKEN }),
  post: (url, body) => call('POST', `/api/admin${url}`, { body, token: TOKEN }),
  patch: (url, body) => call('PATCH', `/api/admin${url}`, { body, token: TOKEN }),
  del: (url) => call('DELETE', `/api/admin${url}`, { token: TOKEN }),
};
const isoDay = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const VALID = { programme_id: 9, full_name: 'Test Student', phone: '0977 494 707', nrc: '123456/12/1' };

describe('public catalogue', () => {
  test('lists the four schools with programme counts', async () => {
    const { status, body } = await get('/api/schools');
    assert.equal(status, 200);
    assert.equal(body.length, 4);
    assert.equal(body.reduce((n, s) => n + s.programme_count, 0), 10);
  });

  test('lists programmes, optionally by school', async () => {
    assert.equal((await get('/api/programmes')).body.length, 10);
    const education = (await get('/api/programmes?school=education')).body;
    assert.equal(education.length, 3);
    assert.ok(education.every((p) => p.school_slug === 'education'));
  });

  test('returns a programme with related programmes, or 404', async () => {
    const { body } = await get('/api/programmes/journalism');
    assert.equal(body.name, 'Journalism');
    assert.deepEqual(body.related.map((r) => r.name), ['Public Relations']);
    assert.equal((await get('/api/programmes/not-a-programme')).status, 404);
  });

  test('serves the seeded news post and empty lists', async () => {
    const news = (await get('/api/posts?type=news')).body;
    assert.equal(news[0].title, 'Applications open for the January 2027 intake');
    assert.deepEqual((await get('/api/calendar')).body, []);
    assert.deepEqual((await get('/api/testimonials')).body, []);
  });

  test('unknown API routes return JSON 404', async () => {
    const { status, body } = await get('/api/nothing-here');
    assert.equal(status, 404);
    assert.equal(body.error, 'Not found');
  });
});

describe('applications', () => {
  test('rejects invalid input with field errors', async () => {
    const { status, body } = await post('/api/applications', { programme_id: 999, full_name: 'A', phone: 'x', nrc: '1' });
    assert.equal(status, 400);
    assert.deepEqual(Object.keys(body.errors).sort(), ['full_name', 'nrc', 'phone', 'programme_id']);
  });

  test('accepts a valid application and stores the phone as +260…', async () => {
    const { status, body } = await post('/api/applications', VALID);
    assert.equal(status, 201);
    const stored = (await admin.get('/applications')).body.find((a) => a.id === body.id);
    assert.equal(stored.phone, '+260977494707');
    assert.equal(stored.status, 'pending');
    assert.equal(stored.intake, 'January 2027');
  });

  test('normalises 260… numbers and accepts other international numbers', async () => {
    const zm = await post('/api/applications', { ...VALID, phone: '260971234567' });
    const intl = await post('/api/applications', { ...VALID, phone: '+44 7700 900123' });
    const apps = (await admin.get('/applications')).body;
    assert.equal(apps.find((a) => a.id === zm.body.id).phone, '+260971234567');
    assert.equal(apps.find((a) => a.id === intl.body.id).phone, '+447700900123');
  });

  test('rejects a short +260 number and a bad email', async () => {
    const short = await post('/api/applications', { ...VALID, phone: '+26097749' });
    assert.ok(short.body.errors.phone);
    const email = await post('/api/applications', { ...VALID, email: 'not-an-email' });
    assert.ok(email.body.errors.email);
  });
});

describe('contact and newsletter', () => {
  test('contact needs a name, a way to reply and a message', async () => {
    const { status, body } = await post('/api/contact', {});
    assert.equal(status, 400);
    assert.ok(body.errors.name && body.errors.email && body.errors.message);
    assert.equal((await post('/api/contact', { name: 'Jo', email: 'jo@example.com', message: 'Hello there' })).status, 201);
    assert.ok((await post('/api/contact', { name: 'Jo', phone: '12', message: 'Hello there' })).body.errors.phone);
  });

  test('newsletter stores each address once, ignoring case', async () => {
    assert.equal((await post('/api/newsletter', { email: 'Parent@Example.com' })).status, 201);
    assert.equal((await post('/api/newsletter', { email: 'parent@example.com' })).status, 201);
    assert.equal((await post('/api/newsletter', { email: 'bad' })).status, 400);
    const subs = (await admin.get('/subscribers')).body;
    assert.deepEqual(subs.map((s) => s.email), ['parent@example.com']);
  });
});

describe('admin', () => {
  test('requires the admin token', async () => {
    assert.equal((await get('/api/admin/summary')).status, 401);
    assert.equal((await call('GET', '/api/admin/summary', { token: 'wrong' })).status, 401);
  });

  test('summary counts applications, unread messages and content', async () => {
    const { body } = await admin.get('/summary');
    assert.equal(body.applications.total, 3);
    assert.equal(body.applications.pending, 3);
    assert.equal(body.unreadMessages, 1);
    assert.equal(body.subscribers, 1);
    assert.equal(body.posts, 1);
    assert.equal(body.latestPending.length, 3);
  });

  test('bulk status change sets reviewed_at and validates input', async () => {
    const ids = (await admin.get('/applications')).body.map((a) => a.id).slice(0, 2);
    assert.equal((await admin.patch('/applications', { ids, status: 'accepted' })).body.updated, 2);
    assert.equal((await admin.patch('/applications', { ids, status: 'accepted' })).body.updated, 0);
    const apps = (await admin.get('/applications')).body;
    assert.ok(apps.filter((a) => ids.includes(a.id)).every((a) => a.status === 'accepted' && a.reviewed_at));
    assert.equal((await admin.patch('/applications', { ids, status: 'maybe' })).status, 400);
    assert.equal((await admin.patch('/applications', { ids: [], status: 'accepted' })).status, 400);
  });

  test('notes are trimmed and saving notes does not mark a review', async () => {
    const pending = (await admin.get('/applications')).body.find((a) => a.status === 'pending');
    const { body } = await admin.patch(`/applications/${pending.id}`, { notes: '  Results received  ' });
    assert.equal(body.notes, 'Results received');
    assert.equal(body.reviewed_at, null);
    assert.equal((await admin.patch(`/applications/${pending.id}`, {})).status, 400);
    assert.equal((await admin.patch('/applications/99999', { status: 'accepted' })).status, 404);
  });

  test('manual applications use the same validation', async () => {
    assert.equal((await admin.post('/applications', { full_name: 'X' })).status, 400);
    assert.equal((await admin.post('/applications', { ...VALID, full_name: 'Walk In' })).status, 201);
  });

  test('messages can be marked read, unread and deleted', async () => {
    const [message] = (await admin.get('/messages')).body;
    await admin.patch(`/messages/${message.id}`, { read: true });
    assert.ok((await admin.get('/messages')).body[0].read_at);
    await admin.patch(`/messages/${message.id}`, { read: false });
    assert.equal((await admin.get('/messages')).body[0].read_at, null);
    assert.equal((await admin.patch(`/messages/${message.id}`, { read: 'yes' })).status, 400);
    assert.equal((await admin.del(`/messages/${message.id}`)).status, 200);
    assert.equal((await admin.del(`/messages/${message.id}`)).status, 404);
  });

  test('content: events need a date and only upcoming items are public', async () => {
    assert.ok((await admin.post('/content/posts', { type: 'event', title: 'Open day', summary: 'Visit us' })).body.errors.event_date);
    await admin.post('/content/posts', { type: 'event', title: 'Orientation', summary: 'Welcome', event_date: isoDay(30) });
    await admin.post('/content/posts', { type: 'event', title: 'Last year', summary: 'Past', event_date: isoDay(-30) });
    assert.deepEqual((await get('/api/posts?type=event')).body.map((e) => e.title), ['Orientation']);

    await admin.post('/content/calendar', { title: 'Classes begin', date: isoDay(40) });
    assert.equal((await admin.post('/content/calendar', { title: 'Bad', date: '18/01/2027' })).status, 400);
    assert.deepEqual((await get('/api/calendar')).body.map((d) => d.title), ['Classes begin']);

    const created = await admin.post('/content/testimonials', { name: 'A Student', quote: 'Great lecturers' });
    assert.equal((await get('/api/testimonials')).body.length, 1);
    assert.equal((await admin.del(`/content/testimonials/${created.body.id}`)).status, 200);
    assert.equal((await admin.get('/content/unknown')).status, 404);
  });
});

describe('pages and SEO', () => {
  const built = fs.existsSync(path.join(root, 'frontend', 'dist', 'index.html'));
  const skip = !built && 'frontend not built (run npm run build)';

  test('React pages return 200, unknown pages and programmes 404', { skip }, async () => {
    for (const url of ['/', '/about', '/admissions', '/programmes', '/programmes/journalism', '/news', '/contact', '/admin', '/admin/applications']) {
      const res = await get(url, { accept: 'text/html' });
      assert.equal(res.status, 200, url);
      assert.match(res.body, /<div id="root">/, url);
    }
    assert.equal((await get('/nowhere', { accept: 'text/html' })).status, 404);
    assert.equal((await get('/programmes/not-a-programme', { accept: 'text/html' })).status, 404);
  });

  test('old .html addresses redirect to the new pages', async () => {
    const res = await get('/admissions.html');
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), '/admissions');
  });

  test('robots.txt and sitemap.xml list the public pages', async () => {
    const robots = (await get('/robots.txt')).body;
    assert.match(robots, /Disallow: \/admin/);
    assert.match(robots, /Sitemap: https:\/\/example\.test\/sitemap\.xml/);
    const sitemap = (await get('/sitemap.xml')).body;
    assert.equal((sitemap.match(/<loc>/g) || []).length, 16);
    assert.match(sitemap, /https:\/\/example\.test\/programmes\/journalism/);
  });

  test('security headers are set', async () => {
    const res = await get('/api/schools');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('x-powered-by'), null);
  });
});

// Runs last: it uses up the per-IP allowance for public form submissions
describe('rate limiting', () => {
  test('public forms are limited to 20 submissions per IP', async () => {
    let status;
    for (let i = 0; i < 25 && status !== 429; i++) status = (await post('/api/newsletter', { email: 'bad' })).status;
    assert.equal(status, 429);
  });
});

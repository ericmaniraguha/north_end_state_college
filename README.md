# North End College website

Website and admin dashboard for North End College, Lusaka, Zambia: "Championing Quality Education".

- **Frontend:** React 19, React Router and Vite, in `frontend/`. Brand colours: forest green `#005B2E`, golden yellow `#FFD500`, white, and charcoal `#111827`.
- **Backend:** Node.js and Express, in `backend/`. A REST API that also serves the React app.
- **Database:** SQLite through Node's built-in `node:sqlite` module, with versioned SQL migrations in `backend/migrations/`.

Migration documents: [audit and plan](docs/migration/01-audit-and-plan.md) and [React migration progress and test results](docs/migration/02-react-migration.md).

## Getting started

Requires Node.js 22.22 or later.

```bash
npm install
cp .env.example .env        # then set ADMIN_TOKEN to a strong secret
npm run setup               # run migrations and seed schools, programmes and the first news post
npm run dev                 # http://localhost:3000, with live reload
```

`npm run dev` runs Vite inside Express, so the site and the API share port 3000. Changes to React files appear straight away, and changes to backend files restart the server.

**Production:**

```bash
npm run build               # builds the React app into frontend/dist
npm start                   # serves the API and frontend/dist on PORT
```

The admin dashboard is at `/admin`. Sign in with the `ADMIN_TOKEN` value, and restart the server after changing it.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm run build` | Build the React app |
| `npm start` | Production server (run `npm run build` first) |
| `npm test` | API tests, then frontend tests |
| `npm run test:api` | API, routing and SEO tests against a throwaway database |
| `npm run test:web` | React component and utility tests (Vitest) |
| `npm run migrate` | Apply pending migrations |
| `npm run migrate:status` | List migrations and whether each has run |
| `npm run migrate:rollback` | Roll back the most recent migration |
| `npm run seed` | Insert schools, programmes and the first news post (safe to repeat) |
| `npm run db:backup` | Copy the database to `backups/` with a timestamp |
| `npm run db:restore -- <file> --yes` | Restore a backup (stop the server first) |

## Pages

| URL | Page |
| --- | --- |
| `/` | Home |
| `/about` | Our story, why NEC, student support |
| `/admissions` | How to apply, entry requirements, application form, FAQs |
| `/programmes` | All programmes, filter by school (`?school=`) and search |
| `/programmes/<slug>` | Programme detail |
| `/news` | News, upcoming events, important dates |
| `/contact` | Contact details, message form, campus map |
| `/admin/…` | Admin dashboard (see below) |

Unknown pages and programmes return a real 404 status. Old `.html` addresses redirect to the new ones.

## Editing site details

Contact details, the intake, menus and social links are in [frontend/src/config/site.js](frontend/src/config/site.js):

```js
phones: ['+260 771 413 910', '+260 977 494 707'],
address: ['Findeco House, Floor No. 17', 'Lusaka, Zambia'],
email: '',   // shown everywhere once set
social: { Facebook: '', Instagram: '', ... },  // shown in the footer once set
```

The structured data in `frontend/index.html` also lists the phone numbers.

Placeholder content to replace with the college's own:
- the story in `frontend/src/pages/public/AboutPage.jsx`
- the grouping of programmes into four schools in `backend/seeds/seed.js`

## Admin dashboard

| Address | Section |
| --- | --- |
| `/admin` | Sign in |
| `/admin/applications` | Applications |
| `/admin/messages` | Messages (`?filter=unread`) |
| `/admin/subscribers` | Newsletter subscribers |
| `/admin/content/posts`, `/calendar`, `/testimonials` | Website content |

**Applications**
- Count cards for total, pending, accepted and rejected; click a card to filter by that status.
- Search by name, NRC, phone (`0977…` finds `+260977…`), email or reference (`NEC-00012`), and filter by programme and status.
- Bulk accept, reject or reset to pending, and pagination.
- The review drawer has a status switch, internal notes, and WhatsApp, call and email buttons with messages pre-filled for the current status.
- **New application** records walk-in, phone or WhatsApp applications.
- **Export CSV** downloads the current filtered list.

Filters and the open applicant are kept in the URL (`?status=pending&open=12`), so they survive a refresh.

**Messages:** unread tracking, reply by email or WhatsApp (which marks the message read), and delete.

**Subscribers:** search, remove, copy all addresses, or export as CSV.

**Website content:** add or delete news and events, important dates and testimonials. Home page sections appear only once they have content, and only upcoming events and dates are shown.

The sidebar shows pending and unread counts, and the bell lists the newest items. Ctrl+K (⌘K on a Mac) jumps to search.

## Phone numbers

Applications and contact messages accept Zambian numbers in any common format (`0971234567`, `260971234567`, `+260 971 234 567`) and store them as `+260971234567`. Other international `+` numbers are stored as entered.

## Migrations

To change the schema, add a new numbered file, such as `backend/migrations/011_add_programme_fees.sql`:

```sql
-- +up
ALTER TABLE programmes ADD COLUMN annual_fee INTEGER;

-- +down
ALTER TABLE programmes DROP COLUMN annual_fee;
```

Applied migrations are recorded in `schema_migrations`. Don't edit a migration after it has run; add a new one. Run `npm run db:backup` before migrating a database that holds real data.

## Backups

`npm run db:backup` writes a consistent copy to `backups/college-YYYYMMDD-HHMMSS.db`, and works while the server is running.

To restore:
1. Stop the server.
2. Run `npm run db:restore -- backups/<file> --yes`. It checks that the backup is a valid database, and saves the current database to `backups/before-restore-…` first.

The `backups/` folder is not in git. Copy backups somewhere safe.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/schools` | Schools with programme counts |
| GET | `/api/programmes?school=<slug>` | Active programmes |
| GET | `/api/programmes/:slug` | One programme plus related programmes |
| GET | `/api/posts?type=news\|event&limit=` | News (newest first) or upcoming events |
| GET | `/api/calendar?limit=` | Upcoming important dates |
| GET | `/api/testimonials?limit=` | Testimonials |
| POST | `/api/applications` | Submit an application (`programme_id`, `full_name`, `phone`, `nrc`, optional `email`) |
| POST | `/api/contact` | Send a contact message |
| POST | `/api/newsletter` | Subscribe an email address |
| GET | `/api/admin/summary` | Counts for the dashboard badges and notifications |
| GET / POST | `/api/admin/applications` | List applications, or add one manually |
| PATCH | `/api/admin/applications` | Bulk status change: `{ ids, status }` |
| PATCH | `/api/admin/applications/:id` | Set `status` and/or `notes` |
| GET / PATCH / DELETE | `/api/admin/messages[/:id]` | List messages, mark `{ read: true \| false }`, delete |
| GET / DELETE | `/api/admin/subscribers[/:id]` | List or remove subscribers |
| GET / POST / DELETE | `/api/admin/content/:resource[/:id]` | Manage `posts`, `calendar` or `testimonials` |

Admin routes require the `X-Admin-Token` header. Public form submissions are limited to 20 per IP every 15 minutes.

## SEO and performance

- A title and meta description per page, plus `CollegeOrUniversity` and `Course` structured data.
- `/sitemap.xml` (including every programme) and `/robots.txt` are generated automatically. Set `SITE_URL` in `.env` for production.
- Built JS and CSS files have content hashes and are cached for a year. HTML is revalidated on every visit.
- The admin dashboard is a separate bundle that public visitors don't download.
- Security headers, responsive layout, skip link and keyboard-accessible menus.

## Project structure

```
backend/
  app.js              createApp(): middleware, API routes, SEO, frontend
  frontend.js         serves React (Vite in dev, frontend/dist in production), page status codes
  server.js           entry point (--dev for live reload)
  config.js           reads .env
  db.js               SQLite connection
  migrate.js          migration runner
  migrations/         numbered SQL migrations (001–010)
  routes/             API, admin and SEO route handlers
  lib/                validation and shared application logic
  middleware/         rate limiter
  seeds/seed.js       schools, programmes and first news post
  tests/              API tests (node:test)
frontend/
  index.html          page shell
  vite.config.mjs
  public/img/         logo.png, favicon.png, apple-touch-icon.png
  src/                React app (see docs/migration/02-react-migration.md)
scripts/              database backup and restore
docs/migration/       audit, plan and migration progress
data/                 SQLite database (not in git)
```

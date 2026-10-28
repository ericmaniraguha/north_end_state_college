# North End College website

Full-stack website for North End College, Lusaka, Zambia: "Championing Quality Education".

- **Frontend:** plain HTML, CSS and JavaScript in `frontend/`. Brand colours: forest green `#005B2E`, golden yellow `#FFD500`, white, and charcoal `#111827`.
- **Backend:** Node.js and Express in `backend/`
- **Database:** SQLite through Node's built-in `node:sqlite` module (Node 22.5 or later), with SQL migrations in `backend/migrations/`

## Getting started

```bash
npm install
cp .env.example .env        # then set ADMIN_TOKEN to a strong secret
npm run setup               # run migrations and seed schools, programmes and the first news post
npm run dev                 # http://localhost:3000
```

The admin dashboard is at `/admin`. Sign in with the `ADMIN_TOKEN` value.

## Pages

| URL | Page |
| --- | --- |
| `/` | Home: hero, quick links, schools, programme tabs, about and stats, why NEC, news and events, student voices, call to action, contact |
| `/about` | Our story, why NEC, student support |
| `/admissions` | Overview, how to apply, entry requirements, application form, FAQs |
| `/programmes` | All programmes, filterable by school and searchable |
| `/programmes/<slug>` | Programme detail with related programmes |
| `/news` | News, upcoming events, important dates |
| `/contact` | Contact details, message form, campus map |
| `/admin` | Admin dashboard |

The header (top bar and dropdown menus), footer, newsletter form and floating WhatsApp button are rendered on every page by `frontend/js/site.js`.

## Editing site details

Contact details, the intake and social links live in the `SITE` object at the top of `frontend/js/site.js`:

```js
phones: ['+260 771 413 910', '+260 977 494 707'],
address: ['Findeco House, Floor No. 17', 'Lusaka, Zambia'],
email: '',   // shown everywhere once set
social: { Facebook: '', Instagram: '', ... },  // shown in the footer once set
```

Menus are in `NAV` in the same file. A few phone numbers are also written into page text for search engines: the meta description in `contact.html`, the FAQ in `admissions.html`, and the structured data in `index.html`.

Placeholder content to replace with the college's own: the story on `about.html`, and the grouping of programmes into four schools in `backend/seeds/seed.js`.

## Admin dashboard

Open `/admin` and sign in with `ADMIN_TOKEN`. After changing the token in `.env`, restart the server.

**Applications**
- Cards show total, pending, accepted and rejected counts. Click a card to filter by that status.
- Search by name, NRC, phone (`0977…` also finds `+260977…`), email or reference (`NEC-00012`), and filter by programme and status.
- Select rows to accept, reject or reset many applications at once.
- Click a name to open the review panel. There you can change the status, keep internal notes, and contact the applicant by WhatsApp, phone or email. Messages are pre-filled for the current status, so you can check them before sending.
- Use **New application** to record walk-in, phone or WhatsApp applications.
- **Export CSV** downloads the current filtered list, including notes.

**Messages:** an inbox with unread tracking, reply by email or WhatsApp (which marks the message read), and delete.

**Subscribers:** search, remove, copy all addresses, or export as CSV.

**Website content:** add or delete **News & Events**, **Important Dates** and **Testimonials**. Each home page section appears only once it has content, and the homepage and `/news` show only upcoming events and dates.

The sidebar shows how many applications are pending and how many messages are unread, and the bell lists the latest ones. Press Ctrl+K (⌘K on a Mac) to search from anywhere in the dashboard.

## Phone numbers

Applications and contact messages accept Zambian numbers in any common format (`0971234567`, `260971234567`, `+260 971 234 567`) and store them as `+260971234567`. Other international numbers starting with `+` are accepted as they are.

## Migrations

| Command | What it does |
| --- | --- |
| `npm run migrate` | Apply all pending migrations |
| `npm run migrate:status` | List migrations and whether each has run |
| `npm run migrate:rollback` | Roll back the most recent migration |
| `npm run seed` | Insert schools, programmes and the first news post (safe to repeat) |

To change the schema, add a new numbered file, such as `backend/migrations/009_add_programme_fees.sql`:

```sql
-- +up
ALTER TABLE programmes ADD COLUMN annual_fee INTEGER;

-- +down
ALTER TABLE programmes DROP COLUMN annual_fee;
```

Applied migrations are recorded in the `schema_migrations` table. Don't edit a migration after it has run; add a new one instead.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/schools` | Schools with programme counts |
| GET | `/api/programmes?school=<slug>` | Active programmes, optionally for one school |
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

- Descriptive titles and meta descriptions on every page, plus `CollegeOrUniversity` and `Course` structured data
- `/sitemap.xml` (includes every programme page) and `/robots.txt` are generated automatically. Set `SITE_URL` in `.env` for production.
- Clean URLs (`/about` rather than `/about.html`) and a custom 404 page
- HTML, CSS and JS are rechecked with the server on every visit, so updates show at once; images are cached for a week
- Basic security headers, mobile-first responsive layout, and skip-to-content and keyboard-accessible menus

## Project structure

```
backend/
  app.js              Express app, middleware and routes
  server.js           Entry point
  config.js           Reads .env
  db.js               SQLite connection
  migrate.js          Migration runner
  migrations/         Numbered SQL migrations (001–010)
  routes/             API, admin and SEO route handlers
  lib/validate.js     Input and phone number helpers
  lib/applications.js Application validation shared by the public form and admin
  middleware/         Rate limiter
  seeds/seed.js       Schools, programmes and first news post
frontend/
  index.html, about.html, admissions.html, programmes.html,
  programme.html, news.html, contact.html, 404.html, admin.html
  css/styles.css      Public site styles
  css/admin.css       Admin dashboard styles
  js/site.js          Shared layout, helpers and forms
  js/home.js, programmes.js, programme.js, news.js, admin.js
  img/logo.svg
data/                 SQLite database file (ignored by git)
```

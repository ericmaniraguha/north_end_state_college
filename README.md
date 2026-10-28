# North End College

Website and admissions system for **North End College**, Findeco House, Lusaka, Zambia: *"Championing Quality Education"*.

- **Public website:** programmes, admissions with online applications, news and events, and a contact form.
- **Admin dashboard:** review applications, record decisions, reply to messages, and manage website content.
- **Messaging:** automatic and manual messages to applicants and staff by **email, WhatsApp and SMS**.

| Part | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite (`frontend/`) |
| Backend | Node.js, Express (`backend/`) |
| Database | SQLite through Node's built-in `node:sqlite`, with versioned migrations |
| Messaging | Nodemailer (SMTP email), Meta WhatsApp Cloud API, Africa's Talking or Twilio (SMS) |

---

## Quick start

You need **Node.js 22.22 or later**.

```bash
npm install
cp .env.example .env     # then edit .env (see Configuration below)
npm run setup            # create the database tables and add the programmes
npm run dev              # open http://localhost:3000
```

The admin dashboard is at **http://localhost:3000/admin**. Sign in with the `ADMIN_TOKEN` from `.env`.

`npm run dev` reloads the page when you change frontend files and restarts the server when you change backend files. **After editing `.env`, stop the server (Ctrl+C) and start it again.**

### Running in production

```bash
npm run build            # builds the website into frontend/dist
npm start                # serves the website and API on PORT
```

Before going live:
- Set a long random `ADMIN_TOKEN`.
- Set `SITE_URL` to the public address.
- Serve the site over HTTPS, for example behind Nginx or a hosting provider's proxy.

---

## Configuration (`.env`)

All settings live in `.env`. Git ignores this file, so never share it. `.env.example` lists every setting with empty values.

Write values as `KEY=value`, with no spaces around `=`. Quotes are optional. Put comments on their own line, starting with `#`.

### General

| Setting | Example | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on |
| `DB_PATH` | `data/college.db` | Database file |
| `ADMIN_TOKEN` | a long random string | Password for `/admin` |
| `SITE_URL` | `https://northendcollege.ac.zm` | Used in `sitemap.xml`; leave empty locally |

### Email (SMTP)

| Setting | Gmail example |
| --- | --- |
| `SMTP_SERVER` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` (`465` also works) |
| `SMTP_USER` | `you@gmail.com` |
| `SMTP_PASSWORD` | a 16-character **app password** |
| `SMTP_FROM` | `you@gmail.com` |
| `SMTP_FROM_NAME` | `North End College` (the sender name people see) |

**Gmail:** your normal password won't work. Turn on 2-Step Verification, then create an app password under Google Account → Security → App passwords. Gmail limits how many emails an account can send per day. For high volumes, use the college's own mail server or a service such as Brevo or Mailgun; they work with the same settings.

### WhatsApp (Meta WhatsApp Cloud API)

| Setting | Where to find it |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Meta for Developers → your app → WhatsApp → API Setup (use a permanent system-user token for production) |
| `WHATSAPP_PHONE_NUMBER_ID` | The same page, under the sending number |
| `WHATSAPP_TEMPLATE` | Name of an approved message template (see below) |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Template language code, for example `en` |
| `WHATSAPP_API_VERSION` | Graph API version, default `v23.0`. Meta retires old versions, so update this when yours is deprecated. |

WhatsApp only allows free-form messages to people who have messaged the college's WhatsApp number in the last 24 hours. To reach anyone else, including automatic confirmations and decisions, Meta requires an **approved template**:
1. In WhatsApp Manager, create a *Utility* template whose body contains one variable, for example `{{1}}`, or `North End College: {{1}}`.
2. Once Meta approves it, put its name in `WHATSAPP_TEMPLATE`.

The system then sends every WhatsApp message through that template, with the message text as `{{1}}`.

### SMS

Choose one provider with `SMS_PROVIDER=africastalking` or `SMS_PROVIDER=twilio`. If you leave it empty, whichever provider has credentials is used.

| Africa's Talking | Twilio |
| --- | --- |
| `AFRICASTALKING_USERNAME`: your app username, or `sandbox` for free testing | `TWILIO_ACCOUNT_SID` |
| `AFRICASTALKING_API_KEY` | `TWILIO_AUTH_TOKEN` |
| `AFRICASTALKING_SENDER_ID`: optional registered sender name, for example `NEC` | `TWILIO_FROM_NUMBER`, or `TWILIO_MESSAGING_SERVICE_SID` |

Africa's Talking is usually the cheaper choice for Zambian numbers. A custom sender ID has to be registered with them first.

### Automatic messages

| Setting | Default | Purpose |
| --- | --- | --- |
| `NOTIFY_CHANNELS` | `email,whatsapp,sms` | Channels used for automatic messages. Channels without settings are skipped. Remove one if you set up both WhatsApp and SMS and don't want people to get two texts. |
| `NOTIFY_APPLICANT_CONFIRMATION` | `true` | Message applicants after they apply |
| `NOTIFY_APPLICANT_DECISION` | `true` | Message applicants when they are accepted or rejected |
| `NOTIFY_STAFF` | `true` | Alert staff about new applications and contact messages |
| `STAFF_ALERT_EMAILS` | | Comma-separated staff emails for alerts |
| `STAFF_ALERT_PHONES` | | Comma-separated staff phone numbers (`+260…`) for alerts |

---

## Messaging

### What gets sent

| Message | When | To |
| --- | --- | --- |
| Confirmation, with the reference number | An applicant submits the form, or staff add an application | Applicant |
| Decision | Staff set an application to **accepted** or **rejected** | Applicant |
| New application alert | Someone applies on the website | Staff (`STAFF_ALERT_*`) |
| New message alert | Someone uses the contact form | Staff |
| Message from staff | Staff send it from the dashboard | Applicant or contact-form sender |

- **Channels:** automatic messages go to every channel in `NOTIFY_CHANNELS` that is set up and for which the person has an address. Email needs an email address; WhatsApp and SMS use the phone number.
- **No waiting:** automatic messages are sent in the background, so nobody waits for the mail server.
- **Wording:** the text of the automatic messages is in [backend/messaging/templates.js](backend/messaging/templates.js).

### Sending from the dashboard

- **Applications:** open an applicant and use **Send a message**. Choose email, WhatsApp or SMS; the text is pre-filled for the current status. **Messages sent** below it lists everything sent to that applicant, including any failures and the reason.
- **Messages:** click **Reply** on a contact-form message. A sent reply marks the message as read and shows *Replied*.

Every attempt, sent or failed, is saved in the `outbound_messages` table. Failures are also printed in the server console with the provider's reason, for example `InsufficientBalance` or `Invalid token`.

If no channel is set up, the dashboard says so. Staff can still use the **WhatsApp**, **Call** and **Email** buttons, which open their own phone or email app.

---

## Admin dashboard

| Address | Section |
| --- | --- |
| `/admin` | Sign in |
| `/admin/applications` | Applications |
| `/admin/messages` | Contact-form messages (`?filter=unread`) |
| `/admin/subscribers` | Newsletter subscribers |
| `/admin/content/posts` | News and events |
| `/admin/content/calendar` | Important dates |
| `/admin/content/testimonials` | Testimonials |

**Applications:**
- Count cards; click one to filter by that status.
- Search by name, NRC, phone (`0977…` finds `+260977…`), email or reference (`NEC-00012`), and filter by programme and status.
- Bulk accept, reject or reset to pending, and pagination.
- The review panel has a status switch, messaging, internal notes and contact buttons.
- **New application** for walk-in or phone applicants, and **Export CSV**.

Filters and the open applicant are kept in the address bar, so a refresh keeps your place.

**Other sections:**
- **Messages:** unread tracking, replies, mark as read, delete.
- **Subscribers:** search, remove, copy all addresses, or export as CSV.
- **Website content:** news, events, important dates and testimonials appear on the website automatically. Past events and dates are hidden.

The sidebar shows pending and unread counts, and the bell lists the newest items. Press Ctrl+K (⌘K on a Mac) to search.

---

## Editing the website

| What | Where |
| --- | --- |
| Phone numbers, address, intake, email, social links, menus | [frontend/src/config/site.js](frontend/src/config/site.js) |
| Phone numbers in automatic messages | [backend/messaging/templates.js](backend/messaging/templates.js) |
| Programmes and schools (initial list) | [backend/seeds/seed.js](backend/seeds/seed.js) |
| Page text | [frontend/src/pages/public/](frontend/src/pages/public/) |
| Colours and styles | [frontend/src/styles/styles.css](frontend/src/styles/styles.css) |
| Logo | [frontend/public/img/](frontend/public/img/) (`logo.png`, `favicon.png`, `apple-touch-icon.png`) |

Placeholder content to replace with the college's own: the story on the About page (`AboutPage.jsx`), and the grouping of programmes into four schools (`seed.js`).

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm run build` | Build the website for production |
| `npm start` | Production server (build first) |
| `npm run setup` | Run migrations and seed the programmes |
| `npm run migrate` | Apply new database migrations |
| `npm run migrate:status` | List migrations and whether each has run |
| `npm run migrate:rollback` | Undo the last migration |
| `npm run seed` | Add the schools, programmes and first news post (safe to repeat) |
| `npm run db:backup` | Copy the database to `backups/` |
| `npm run db:restore -- backups/<file> --yes` | Restore a backup (stop the server first) |

---

## Database

**Tables:**
- `schools`, `programmes`
- `applications`
- `contact_messages`, `newsletter_subscribers`
- `posts` (news and events), `calendar_dates`, `testimonials`
- `outbound_messages` (every message sent)
- `schema_migrations` (which migrations have run)

**Changing the database:** add a new numbered file in `backend/migrations/` with `-- +up` and `-- +down` sections, then run `npm run migrate`. Don't edit a migration that has already run.

```sql
-- +up
ALTER TABLE programmes ADD COLUMN annual_fee INTEGER;

-- +down
ALTER TABLE programmes DROP COLUMN annual_fee;
```

**Backups:**
- `npm run db:backup` writes `backups/college-YYYYMMDD-HHMMSS.db`, and works while the server is running. Do it before every migration, and copy backups somewhere safe; the `backups/` folder is not in git.
- To restore, stop the server and run `npm run db:restore -- backups/<file> --yes`. It checks the backup first and saves the current database to `backups/before-restore-…`.

---

## API

Public endpoints:

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/schools` | Schools with programme counts |
| GET | `/api/programmes?school=<slug>` | Active programmes |
| GET | `/api/programmes/:slug` | One programme plus related programmes |
| GET | `/api/posts?type=news\|event&limit=` | News, or upcoming events |
| GET | `/api/calendar?limit=` | Upcoming important dates |
| GET | `/api/testimonials?limit=` | Testimonials |
| POST | `/api/applications` | Apply (`programme_id`, `full_name`, `phone`, `nrc`, optional `email`) |
| POST | `/api/contact` | Contact form (`name`, `email` or `phone`, `message`) |
| POST | `/api/newsletter` | Subscribe (`email`) |

Admin endpoints (send the `X-Admin-Token` header):

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/admin/summary` | Counts for the dashboard |
| GET / POST | `/api/admin/applications` | List applications, or add one |
| PATCH | `/api/admin/applications` | Bulk status change `{ ids, status }` |
| PATCH | `/api/admin/applications/:id` | Set `status` and/or `notes` |
| GET | `/api/admin/applications/:id/outbox` | Messages sent to an applicant |
| POST | `/api/admin/applications/:id/send` | Send `{ channel, subject?, body }` to an applicant |
| GET | `/api/admin/messaging` | Which channels are set up |
| GET / PATCH / DELETE | `/api/admin/messages[/:id]` | Contact messages: list, `{ read }`, delete |
| POST | `/api/admin/messages/:id/reply` | Reply `{ channel, subject?, body }` |
| GET / DELETE | `/api/admin/subscribers[/:id]` | Subscribers |
| GET / POST / DELETE | `/api/admin/content/:resource[/:id]` | `posts`, `calendar`, `testimonials` |

`channel` is `email`, `whatsapp` or `sms`. A send returns `201` when the message is sent, and `502` with an `error` when the provider refused it.

**Phone numbers:** Zambian numbers in any common format (`0971234567`, `260971234567`, `+260 971 234 567`) are stored as `+260971234567`.

**Rate limit:** the public forms accept 20 submissions per visitor every 15 minutes.

---

## Project structure

```
backend/
  app.js              Express app: API, SEO routes, website
  frontend.js         serves the React app (live reload in dev); correct 404s
  server.js           entry point
  config.js           reads .env
  db.js, migrate.js   database connection and migration runner
  messaging/          email, WhatsApp and SMS sending, and message templates
  routes/             API endpoints
  lib/                validation and shared logic
  middleware/         rate limiter
  migrations/         numbered SQL migrations
  seeds/              initial schools, programmes and news
frontend/
  index.html          page shell and SEO tags
  public/img/         logo and icons
  src/
    config/site.js    college details and menus
    pages/public/     website pages
    pages/admin/      dashboard pages
    layouts/          header, footer, dashboard layout
    components/       shared UI pieces
    services/         API calls
    hooks/, context/, utils/, styles/
scripts/              database backup and restore
docs/migration/       migration audit, plan and progress notes
data/                 the database file (not in git)
```
# north_end_state_college

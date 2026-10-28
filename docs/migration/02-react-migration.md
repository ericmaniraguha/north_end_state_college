# React migration: progress and test results

**Status:** Phases 0, 3, 4 and 5 of the [plan](01-audit-and-plan.md) are done. The public site and the admin dashboard now run on React. The original HTML/JS frontend has been removed; it remains in git history in the first commit.

**Waiting on your approval:** Phase 1 (PostgreSQL) and Phase 2 (staff accounts and roles). See [What's next](#whats-next).

---

## Module checklist

| Module | Original | React | Verified |
| --- | --- | --- | --- |
| Shared layout: top bar, header with dropdowns, mobile menu, footer, newsletter form, WhatsApp button, skip link | `site.js` | `layouts/PublicLayout`, `SiteHeader`, `SiteFooter` | ✅ screenshots, nav test |
| Home | `index.html`, `home.js` | `pages/public/HomePage` | ✅ screenshot identical |
| About | `about.html` | `AboutPage` | ✅ visually identical |
| Admissions and application form | `admissions.html`, `site.js` | `AdmissionsPage`, `ApplicationForm` | ✅ screenshots, form tests |
| Programmes (school filter, search, `?school=` in the URL) | `programmes.html`, `programmes.js` | `ProgrammesPage` | ✅ screenshot identical, filter test |
| Programme detail (structured data, related programmes, not found) | `programme.html`, `programme.js` | `ProgrammeDetailPage` | ✅ screenshot, tests |
| News & Events (opens `#post-N`) | `news.html`, `news.js` | `NewsPage` | ✅ screenshot identical |
| Contact form and map | `contact.html` | `ContactPage`, `ContactForm` | ✅ screenshot identical |
| Not found (real 404 status) | `404.html` | `NotFoundPage` and the server's status check | ✅ screenshot identical, API test |
| Admin sign-in | `admin.html`, `admin.js` | `LoginPage`, `AuthContext` | ✅ tests |
| Admin shell: sidebar counts, global search, Ctrl/⌘K, notifications, toasts, mobile sidebar | `admin.js` | `AdminLayout`, `ToastContext` | ✅ screenshot, tests |
| Applications: cards, filters, search, bulk actions, pagination, review drawer, notes, new application, CSV | `admin.js` | `ApplicationsPage`, `ApplicantDrawer`, `NewApplicationDialog` | ✅ screenshots, tests |
| Messages | `admin.js` | `MessagesPage` | ✅ built, API tested |
| Subscribers | `admin.js` | `SubscribersPage` | ✅ built, API tested |
| News & Events, Important Dates, Testimonials editors | `admin.js` | `ContentPage` | ✅ built, API tested |

---

## What changed for users

**Nothing visible on the public site.** Pages, URLs, styles and behaviour are the same. Old `.html` addresses (for example `/about.html`) redirect to the new ones.

**Admin dashboard improvements:**

- Each section has its own address (`/admin/applications`, `/admin/messages`, `/admin/content/posts` and so on).
- Filters, the page number and the open applicant are kept in the URL (`/admin/applications?status=pending&open=12`), so they survive a refresh and can be bookmarked.
- Notifications link straight to the applicant or the unread inbox.
- The admin code loads only on admin pages. Public visitors never download it.

---

## Test results

> **28 October 2026:** the automated test suites and test tools (Vitest, Testing Library, jsdom) were removed from the project at the owner's request. To bring them back, run `git checkout 7868267 -- backend/tests frontend/src/test` and restore the `*.test.*` files from that commit.

Results recorded before removal:

| Suite | Command | Result |
| --- | --- | --- |
| API, routing and SEO (`backend/tests/api.test.js`, throwaway database) | `npm run test:api` | **23 passed, 0 failed** |
| Frontend: utilities, forms, programmes pages, admin sign-in and applications (`frontend/src/**/*.test.*`) | `npm run test:web` | **22 passed, 0 failed** (stable over 3 runs) |
| Visual comparison: 11 screenshots of the original site vs the React build, same sample data, desktop and 390px mobile | Manual (headless Edge) | **7 byte-identical**; the other 4 (about, admissions, programme, admin) visually identical |
| Backup and restore | `npm run db:backup`, `npm run db:restore` | ✅ Backup made; restore refuses without `--yes` and refuses non-database files; restored row counts match |

**Not tested automatically:** clipboard copy (needs a real browser) and CSV download in a real browser (the CSV content is unit-tested).

---

## Code layout after the migration

```
frontend/
  index.html               page shell, meta tags, structured data
  vite.config.mjs          build and test config
  public/img/              logo.png, favicon.png, apple-touch-icon.png (the college's own logo)
  src/
    main.jsx, App.jsx      entry point and public routes
    routes/AdminRoutes.jsx admin routes (loaded on demand)
    layouts/               PublicLayout, SiteHeader, SiteFooter, AdminLayout
    pages/public/          8 public pages
    pages/admin/           Login, Applications (+ drawer, dialog), Messages, Subscribers, Content
    components/            Icon, cards, forms, contact widgets, page sections, admin/ui
    context/               AuthContext (admin token), ToastContext
    hooks/                 useApi, useApiForm, usePageMeta
    services/              api.js (fetch wrapper), publicApi.js, adminApi.js
    utils/                 format, applications (filtering, stats, messages), csv
    config/site.js         contacts, intake, menus: edit college details here
    styles/                styles.css, admin.css (unchanged from the original)
backend/
  app.js                   createApp(): API, SEO and frontend
  frontend.js              serves the React app; Vite live reload in dev; real 404s
  server.js, config.js, db.js, migrate.js
  messaging/               email, WhatsApp and SMS (added after the migration)
  routes/, lib/, middleware/, migrations/, seeds/
scripts/                   backup-db.js, restore-db.js
```

**Removed:** `frontend/*.html` (9 pages) and `frontend/js/*.js` (6 scripts). The two stylesheets and the logo were moved, not copied, so there are no duplicates.

---

## What's next

| Phase | Needs from you |
| --- | --- |
| **1. PostgreSQL:** move the database to the PostgreSQL 15 already installed on this PC | Permission to create a database (for example `north_end_college`) with its own user, or a `DATABASE_URL` you create yourself in `.env` |
| **2. Staff accounts and roles:** individual logins with hashed passwords, roles (System administrator, Admissions officer, Content editor), permission checks on every admin endpoint, audit log | Confirm the three staff roles to start with. Lecturer and Student roles are set up when their modules exist. |
| **6. Academic modules** (students, academic years, semesters, courses, registration, results) | The policies listed in section 9.5 of the plan, and whether the system serves one campus or several |

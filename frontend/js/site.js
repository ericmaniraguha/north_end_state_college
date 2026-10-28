// Shared code for every page: site details, helpers, the header and footer,
// and the behaviour behind forms and the small widgets marked with data-* hooks.

const SITE = {
  name: 'North End College',
  tagline: 'Championing Quality Education',
  motto: 'Learn Today · Lead Tomorrow',
  intake: 'January 2027',
  address: ['Findeco House, Floor No. 17', 'Lusaka, Zambia'],
  phones: ['+260 771 413 910', '+260 977 494 707'], // both on WhatsApp
  email: '', // admissions email, shown everywhere once set
  social: { Facebook: '', Instagram: '', LinkedIn: '', YouTube: '', X: '' }, // profile URLs, shown once set
};

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', items: [
    ['Our Story', '/about#story'],
    ['Why North End College', '/about#why'],
    ['Student Support', '/about#support'],
    ['Our Campus', '/contact#campus'],
  ] },
  { label: 'Admissions', items: [
    ['Admissions Overview', '/admissions'],
    ['How to Apply', '/admissions#how-to-apply'],
    ['Entry Requirements', '/admissions#requirements'],
    ['FAQs', '/admissions#faq'],
    ['Apply Online', '/admissions#apply'],
  ] },
  { label: 'Academics', menu: 'academics', items: [['All Programmes', '/programmes']] }, // schools added from the API
  { label: 'News & Events', items: [
    ['Latest News', '/news#news'],
    ['Upcoming Events', '/news#events'],
    ['Important Dates', '/news#dates'],
  ] },
  { label: 'Contact', href: '/contact' },
];

const FEATURES = [
  ['cap', 'Qualified Lecturers', 'Learn from experienced, qualified academic staff.'],
  ['book', 'Practical Learning', 'Hands-on training that prepares you for real workplaces.'],
  ['people', 'Supportive Environment', 'Student services and mentoring through every stage.'],
  ['chart', 'Career Guidance', 'Advice and connections to help you plan your career.'],
  ['shield', 'A Brighter Future', 'Qualifications that open doors to further study and work.'],
];

const ICONS = {
  cap: 'M12 3 1 9l11 6 9-4.9V17h2V9L12 3Zm-7 9.2V16c0 2.2 3.1 4 7 4s7-1.8 7-4v-3.8l-7 3.8-7-3.8Z',
  book: 'M21 5c-1.1-.3-2.3-.5-3.5-.5-2 0-4 .4-5.5 1.5-1.5-1.1-3.5-1.5-5.5-1.5S2.5 4.9 1 6v14.6c1.5-1.1 3.5-1.5 5.5-1.5s4 .4 5.5 1.5c1.5-1.1 3.5-1.5 5.5-1.5 1.2 0 2.4.2 3.5.5.8.3 1.5.6 2 1V6a6.8 6.8 0 0 0-2-1Zm0 13.5c-1.1-.3-2.3-.5-3.5-.5-1.7 0-4.1.6-5.5 1.5V8c1.4-.9 3.8-1.5 5.5-1.5 1.2 0 2.4.2 3.5.5v11.5Z',
  people: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13Zm8 0h-1c1.2.8 2 1.9 2 3.5V19h6v-2.5c0-2.3-4.7-3.5-7-3.5Z',
  chart: 'M3 21V3h2v16h16v2H3Zm4-4v-6h3v6H7Zm5 0V7h3v10h-3Zm5 0v-4h3v4h-3Z',
  shield: 'M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4Zm-2 16-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9l-8 8Z',
  phone: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z',
  pin: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z',
  mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z',
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V9h14v11ZM7 11h5v5H7v-5Z',
  chevron: 'M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z',
  whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z',
};

// ---------- helpers

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else if (key === 'className') node.className = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

function svg(name, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name]}"/></svg>`;
}

function icon(name, className) {
  const t = document.createElement('template');
  t.innerHTML = svg(name, className);
  return t.content.firstElementChild;
}

const joinWith = (nodes, separator) => nodes.flatMap((n, i) => (i ? [separator, n] : [n]));
const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`;
const waHref = (phone = SITE.phones[0], text = '') =>
  `https://wa.me/${phone.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status, data });
  return data;
}

const cache = {};
const getSchools = () => (cache.schools ||= api('/api/schools'));
const getProgrammes = () => (cache.programmes ||= api('/api/programmes'));

// SQLite gives "YYYY-MM-DD" for dates and "YYYY-MM-DD HH:MM:SS" (UTC) for timestamps.
function parseDate(value) {
  return value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(`${value.replace(' ', 'T')}Z`);
}

function formatDate(value) {
  return value ? parseDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

function whenVisible(node, fn) {
  if (!('IntersectionObserver' in window)) return fn();
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      fn();
    }
  });
  observer.observe(node);
}

function countUp(node, target) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.textContent = target;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min((now - start) / 900, 1);
    node.textContent = Math.round(target * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Fills a list, or shows a message when there is nothing to show.
function renderList(node, rows, render, emptyText) {
  const message = (text) => el(node.tagName === 'UL' ? 'li' : 'p', { className: 'muted' }, text);
  if (!rows) return node.replaceChildren(message('This could not be loaded. Please try again later.'));
  node.replaceChildren(...(rows.length ? rows.map(render) : [message(emptyText)]));
}

// ---------- shared cards

function programmeCard(p) {
  return el('article', { className: 'programme' },
    el('div', { className: 'programme-meta' }, el('span', { className: 'pill' }, p.level), el('span', {}, p.study_mode)),
    el('h3', {}, el('a', { href: `/programmes/${p.slug}` }, p.name)),
    p.school_name ? el('p', { className: 'programme-school' }, p.school_name) : null,
    el('p', {}, p.description),
    el('div', { className: 'programme-actions' },
      el('a', { href: `/programmes/${p.slug}`, className: 'link-arrow' }, 'Learn more'),
      el('a', { href: `/admissions?programme=${p.slug}#apply`, className: 'btn btn-primary btn-sm' }, 'Apply now')));
}

function newsCard(post, full = false) {
  const paragraphs = (post.body || '').split(/\n{2,}/).filter(Boolean);
  return el('article', { className: 'news-card', id: `post-${post.id}` },
    el('time', { datetime: post.published_at }, formatDate(post.published_at)),
    el('h3', {}, post.title),
    el('p', {}, post.summary),
    full && paragraphs.length
      ? el('details', {}, el('summary', {}, 'Read more'), paragraphs.map((t) => el('p', {}, t)))
      : null,
    full ? null : el('a', { href: `/news#post-${post.id}`, className: 'link-arrow' }, 'Read more'));
}

function eventItem(e) {
  const d = parseDate(e.event_date);
  return el('article', { className: 'event-item' },
    el('div', { className: 'date-badge' },
      el('strong', {}, String(d.getDate())),
      el('span', {}, d.toLocaleDateString('en-GB', { month: 'short' }))),
    el('div', {},
      el('h4', {}, e.title),
      e.location ? el('p', { className: 'meta' }, e.location) : null,
      el('p', {}, e.summary)));
}

function dateItem(d) {
  return el('li', { className: 'date-item' },
    el('time', { datetime: d.date }, formatDate(d.date)),
    el('span', {}, d.title),
    d.note ? el('small', {}, d.note) : null);
}

function testimonialCard(t) {
  return el('blockquote', { className: 'voice' },
    el('p', {}, t.quote),
    el('footer', {}, el('strong', {}, t.name), t.programme ? el('span', {}, t.programme) : null));
}

// ---------- header and footer

const brandMarkup = () => `<a href="/" class="brand">
  <img src="/img/logo.svg" alt="" width="52" height="52">
  <span class="brand-text"><strong>${SITE.name}</strong><small>${SITE.tagline}</small></span>
</a>`;

function navMarkup() {
  return NAV.map((item, i) => {
    if (item.href) return `<li><a class="nav-link" href="${item.href}">${item.label}</a></li>`;
    const links = item.items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('');
    return `<li class="has-menu">
      <button type="button" class="nav-link nav-trigger" aria-expanded="false" aria-controls="menu-${i}">${item.label}${svg('chevron', 'icon chev')}</button>
      <ul class="dropdown" id="menu-${i}"${item.menu ? ` data-menu="${item.menu}"` : ''}>${links}</ul>
    </li>`;
  }).join('');
}

function renderHeader(slot) {
  slot.outerHTML = `
  <div class="topbar">
    <div class="container topbar-inner">
      <a class="topbar-announce" href="/admissions#apply"><strong>${SITE.intake} intake:</strong> applications now open <span aria-hidden="true">→</span></a>
      <div class="topbar-links">
        <a href="${telHref(SITE.phones[0])}">${svg('phone')}${SITE.phones[0]}</a>
        <a href="${waHref()}" target="_blank" rel="noopener">${svg('whatsapp')}WhatsApp</a>
        <span>${svg('pin')}${SITE.address[1]}</span>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="container nav">
      ${brandMarkup()}
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Menu"><span></span><span></span><span></span></button>
      <nav class="main-nav" id="main-nav" aria-label="Main">
        <ul class="nav-list">${navMarkup()}</ul>
        <a href="/admissions#apply" class="btn btn-accent btn-sm nav-cta">Apply now</a>
      </nav>
    </div>
  </header>`;
  markActiveNav();
  bindNav();
}

function markActiveNav() {
  const path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1');
  const base = (href) => href.split(/[?#]/)[0];
  const matches = (href) => base(href) === path || (base(href) !== '/' && path.startsWith(`${base(href)}/`));
  const items = [...document.querySelectorAll('.nav-list > li')];
  const direct = items.find((li) => {
    const a = li.querySelector(':scope > a');
    return a && matches(a.getAttribute('href'));
  });
  const parent = direct || items.find((li) =>
    [...li.querySelectorAll('.dropdown a')].some((a) => matches(a.getAttribute('href'))));
  if (parent) parent.querySelector('.nav-link').classList.add('active');
}

function bindNav() {
  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('.nav-toggle');

  const closeMenus = (except) => {
    document.querySelectorAll('.has-menu.open').forEach((li) => {
      if (li === except) return;
      li.classList.remove('open');
      li.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    });
  };
  const closeNav = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    closeMenus();
  };

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-trigger').forEach((btn) => btn.addEventListener('click', () => {
    const li = btn.parentElement;
    const open = !li.classList.contains('open');
    closeMenus(li);
    li.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-menu')) closeMenus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
}

function renderFooter(slot) {
  const socials = Object.entries(SITE.social).filter(([, url]) => url);
  slot.outerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        ${brandMarkup()}
        <p>${SITE.address.join('<br>')}</p>
        <p>${SITE.phones.map((p) => `<a href="${telHref(p)}">${p}</a>`).join('<br>')}</p>
        ${SITE.email ? `<p><a href="mailto:${SITE.email}">${SITE.email}</a></p>` : ''}
      </div>
      <div>
        <h4>About</h4>
        <ul>
          <li><a href="/about#story">Our story</a></li>
          <li><a href="/about#why">Why North End College</a></li>
          <li><a href="/news">News and events</a></li>
          <li><a href="/contact">Contact us</a></li>
        </ul>
      </div>
      <div>
        <h4>Admissions</h4>
        <ul>
          <li><a href="/admissions#how-to-apply">How to apply</a></li>
          <li><a href="/admissions#requirements">Entry requirements</a></li>
          <li><a href="/admissions#faq">FAQs</a></li>
          <li><a href="/admissions#apply">Apply online</a></li>
        </ul>
      </div>
      <div>
        <h4>Schools</h4>
        <ul id="footer-schools"><li><a href="/programmes">All programmes</a></li></ul>
      </div>
      <div class="footer-news">
        <h4>Newsletter</h4>
        <p>Be the first to get North End College updates.</p>
        <form class="newsletter" data-endpoint="/api/newsletter" novalidate>
          <div class="newsletter-row">
            <input type="email" name="email" placeholder="Your email address" aria-label="Email address" autocomplete="email" required>
            <button class="btn btn-accent btn-sm" type="submit">Subscribe</button>
          </div>
          <p class="form-status" role="status"></p>
        </form>
        ${socials.length ? `<ul class="socials">${socials.map(([name, url]) => `<li><a href="${url}" target="_blank" rel="noopener">${name}</a></li>`).join('')}</ul>` : ''}
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <span>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</span>
        <span class="motto">${SITE.motto}</span>
      </div>
    </div>
  </footer>
  <a class="wa-float" href="${waHref(SITE.phones[0], 'Hello North End College, I would like to ask about admissions.')}" target="_blank" rel="noopener">${svg('whatsapp')}<span>Ask a question</span></a>`;
}

async function fillSchoolLinks() {
  try {
    const schools = await getSchools();
    const link = (s) => el('li', {}, el('a', { href: `/programmes?school=${s.slug}` }, s.name));
    const menu = document.querySelector('[data-menu="academics"]');
    if (menu && schools.length) {
      menu.prepend(el('li', { className: 'menu-label' }, 'Schools'), ...schools.map(link), el('li', { className: 'divider', role: 'separator' }));
    }
    document.getElementById('footer-schools')?.prepend(...schools.map(link));
  } catch { /* menus still link to /programmes */ }
}

// ---------- data-* widgets

function renderFeatures(node) {
  node.replaceChildren(el('ul', { className: 'features' },
    FEATURES.map(([name, title, text]) => el('li', {}, icon(name), el('h3', {}, title), el('p', {}, text)))));
}

function renderContact(node) {
  const phoneLinks = (href, external) => joinWith(SITE.phones.map((p) =>
    el('a', { href: href(p), target: external && '_blank', rel: external && 'noopener' }, p)), ' / ');
  const items = [
    ['pin', 'Visit us', SITE.address.join(', ')],
    ['phone', 'Call us', phoneLinks(telHref, false)],
    ['whatsapp', 'WhatsApp', phoneLinks(waHref, true)],
  ];
  if (SITE.email) items.push(['mail', 'Email', el('a', { href: `mailto:${SITE.email}` }, SITE.email)]);
  node.replaceChildren(el('ul', { className: 'contact-list' }, items.map(([name, label, value]) =>
    el('li', {}, el('span', { className: 'icon-badge' }, icon(name)), el('div', {}, el('strong', {}, label), el('span', {}, value))))));
}

function renderWhatsApp(node) {
  node.replaceChildren(el('div', { className: 'whatsapp' },
    icon('whatsapp'),
    el('div', {},
      el('span', {}, 'WhatsApp admissions'),
      el('strong', {}, joinWith(SITE.phones.map((p) => el('a', { href: waHref(p), target: '_blank', rel: 'noopener' }, p)), ' / ')))));
}

async function fillProgrammeSelects() {
  const selects = document.querySelectorAll('select[data-programmes]');
  if (!selects.length) return;
  try {
    const programmes = await getProgrammes();
    const wanted = new URLSearchParams(location.search).get('programme');
    selects.forEach((select) => {
      const groups = new Map();
      for (const p of programmes) {
        const label = p.school_name || 'Other programmes';
        if (!groups.has(label)) groups.set(label, el('optgroup', { label }));
        groups.get(label).append(el('option', { value: p.id }, p.name));
      }
      select.append(...groups.values());
      const match = programmes.find((p) => p.slug === wanted);
      if (match) select.value = match.id;
    });
  } catch { /* the API reports a missing programme when the form is submitted */ }
}

// ---------- forms

function clearFieldErrors(form) {
  form.querySelectorAll('.error').forEach((n) => { n.textContent = ''; });
  form.querySelectorAll('.invalid').forEach((n) => n.classList.remove('invalid'));
}

// Shows API field errors next to their inputs. Returns messages that had no slot.
function showFieldErrors(form, errors) {
  const unplaced = [];
  for (const [field, message] of Object.entries(errors)) {
    const slot = form.querySelector(`.error[data-for="${field}"]`);
    if (slot) slot.textContent = message;
    else unplaced.push(message);
    form.elements[field]?.classList?.add('invalid');
  }
  return unplaced;
}

function setStatus(node, text, kind) {
  node.textContent = text;
  node.className = `form-status${kind ? ` ${kind}` : ''}`;
}

function bindForm(form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    setStatus(status, '');
    button.disabled = true;
    try {
      const data = await api(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      form.reset();
      setStatus(status, data.message, 'ok');
    } catch (err) {
      if (err.data?.errors) {
        const [first] = showFieldErrors(form, err.data.errors);
        setStatus(status, first || 'Please correct the highlighted fields.', 'fail');
      } else {
        setStatus(status, err.status === 429 ? err.message : 'Something went wrong. Please try again or contact us on WhatsApp.', 'fail');
      }
    } finally {
      button.disabled = false;
    }
  });
}

// ---------- start

const headerSlot = document.getElementById('site-header');
const footerSlot = document.getElementById('site-footer');
if (headerSlot) renderHeader(headerSlot);
if (footerSlot) renderFooter(footerSlot);
if (headerSlot || footerSlot) fillSchoolLinks();

document.querySelectorAll('[data-icon]').forEach((n) => n.append(icon(n.dataset.icon)));
document.querySelectorAll('[data-features]').forEach(renderFeatures);
document.querySelectorAll('[data-contact]').forEach(renderContact);
document.querySelectorAll('[data-whatsapp]').forEach(renderWhatsApp);
document.querySelectorAll('[data-phones]').forEach((n) =>
  n.replaceChildren(...joinWith(SITE.phones.map((p) => el('a', { href: telHref(p) }, p)), ' / ')));
document.querySelectorAll('form[data-endpoint]').forEach(bindForm);
fillProgrammeSelects();

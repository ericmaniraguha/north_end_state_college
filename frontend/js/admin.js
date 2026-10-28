// Admin dashboard: admissions (applications, messages, newsletter subscribers) and
// editors for the website content (news and events, important dates, testimonials).
// Uses the helpers in site.js. The token is kept in sessionStorage, so it is
// cleared when the tab closes.

Object.assign(ICONS, {
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z',
  newspaper: 'M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-9 14H6v-6h5v6Zm7 0h-5v-2h5v2Zm0-4h-5v-2h5v2Zm0-4H6V7h12v2Z',
  quote: 'M6 17h3l2-4V7H5v6h3l-2 4Zm8 0h3l2-4V7h-6v6h3l-2 4Z',
  search: 'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z',
  bell: 'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.1-1.6-5.6-4.5-6.3V4a1.5 1.5 0 0 0-3 0v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1l-2-2Z',
  logout: 'M17 7l-1.4 1.4 2.6 2.6H8v2h10.2l-2.6 2.6L17 17l5-5-5-5ZM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5Z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z',
  check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z',
  close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z',
  eye: 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z',
  menu: 'M3 18h18v-2H3v2Zm0-5h18v-2H3v2Zm0-7v2h18V6H3Z',
  inbox: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 12h-4a3 3 0 0 1-6 0H5V5h14v10Z',
  refresh: 'M17.6 6.4A8 8 0 1 0 19.7 14h-2.1a6 6 0 1 1-1.4-6.2L13 11h7V4l-2.4 2.4Z',
  chevronLeft: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12l4.6-4.6Z',
  chevronRight: 'M10 6 8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6-6-6Z',
  trash: 'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7Z',
  checkCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 15-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9Z',
  xCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 13.6L15.6 17 12 13.4 8.4 17 7 15.6l3.6-3.6L7 8.4 8.4 7l3.6 3.6L15.6 7 17 8.4 13.4 12l3.6 3.6Z',
  folder: 'M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2Z',
  external: 'M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7ZM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7Z',
  copy: 'M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z',
});

const $ = (id) => document.getElementById(id);
const view = $('view');
const PAGE_SIZE = 10;
const STATUSES = ['pending', 'accepted', 'rejected'];

const state = {
  token: sessionStorage.getItem('adminToken') || '',
  tab: 'applications',
  seq: 0, // increases on every tab change so slow responses for an old tab are ignored
  summary: null,
  applications: [],
  programmes: [],
  filters: { q: '', programme: '', status: '' },
  page: 1,
  selected: new Set(),
  messageFilter: 'all',
};
let appsUI = null; // elements of the applications view while it is on screen

// Editable website content. Field names match the backend resource definitions.
const CONTENT = {
  posts: {
    title: 'News & Events',
    singular: 'news item or event',
    description: 'News appears on the home page and the News page. Events are shown until their date has passed.',
    fields: [
      { name: 'type', label: 'Type', options: [['news', 'News'], ['event', 'Event']] },
      { name: 'title', label: 'Title' },
      { name: 'summary', label: 'Summary', textarea: true },
      { name: 'body', label: 'Full text (optional)', textarea: true },
      { name: 'event_date', label: 'Event date (events only)', type: 'date' },
      { name: 'location', label: 'Location (optional)' },
    ],
    columns: [['type', 'Type', 'badge'], ['title', 'Title', 'wrap'], ['event_date', 'Event date', 'date'], ['published_at', 'Published', 'date']],
  },
  calendar: {
    title: 'Important Dates',
    singular: 'important date',
    description: 'Upcoming dates appear on the home page and the News page, and drop off once they have passed.',
    fields: [
      { name: 'title', label: 'Title' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'note', label: 'Note (optional)' },
    ],
    columns: [['date', 'Date', 'date'], ['title', 'Title', 'wrap'], ['note', 'Note', 'wrap']],
  },
  testimonials: {
    title: 'Testimonials',
    singular: 'testimonial',
    description: 'Quotes appear in the Student Voices section of the home page. Only publish quotes students have agreed to share.',
    fields: [
      { name: 'name', label: 'Student name' },
      { name: 'programme', label: 'Programme (optional)' },
      { name: 'quote', label: 'Quote', textarea: true },
    ],
    columns: [['name', 'Name'], ['programme', 'Programme'], ['quote', 'Quote', 'wrap']],
  },
};

const TABS = {
  applications: { label: 'Applications', icon: 'file', group: 'Admissions', render: renderApplications },
  messages: { label: 'Messages', icon: 'mail', group: 'Admissions', render: renderMessages },
  subscribers: { label: 'Subscribers', icon: 'people', group: 'Admissions', render: renderSubscribers },
  posts: { label: 'News & Events', icon: 'newspaper', group: 'Website content', render: (current) => renderContent('posts', current) },
  calendar: { label: 'Important Dates', icon: 'calendar', group: 'Website content', render: (current) => renderContent('calendar', current) },
  testimonials: { label: 'Testimonials', icon: 'quote', group: 'Website content', render: (current) => renderContent('testimonials', current) },
};

// ---------- helpers

async function adminApi(path, options = {}) {
  try {
    return await api(`/api/admin${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': state.token },
    });
  } catch (err) {
    if (err.status === 401) signOut('Your session has expired. Please sign in again.');
    throw err;
  }
}

const send = (path, method, body) => adminApi(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

const ref = (id) => `NEC-${String(id).padStart(5, '0')}`;
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const shortDate = (v) => (v ? parseDate(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const dateTime = (v) => (v ? parseDate(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const daysAgo = (n) => Date.now() - n * 86400000;
const sqlNow = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

function btn(label, { iconName, className = 'btn btn-light btn-sm', ...attrs } = {}) {
  return el('button', { type: 'button', className, ...attrs }, iconName ? icon(iconName) : null, label);
}

function iconButton(name, label, onclick, { className = '', disabled = false } = {}) {
  return el('button', { type: 'button', className: `icon-btn ${className}`, title: label, 'aria-label': label, onclick, disabled }, icon(name));
}

const badge = (value) => el('span', { className: `badge badge-${value}` }, value);

function emptyState(title, text, action) {
  return el('div', { className: 'empty' }, el('div', { className: 'empty-icon' }, icon('inbox')), el('h3', {}, title), el('p', {}, text), action);
}

function viewHead(title, description, ...actions) {
  return el('div', { className: 'view-head' },
    el('div', {}, el('h2', {}, title), el('p', {}, description)),
    el('div', { className: 'view-actions' }, actions));
}

function field(label, input, name) {
  return el('label', {}, label, input, el('small', { className: 'error', 'data-for': name }));
}

function programmeOptions() {
  const groups = new Map();
  for (const p of state.programmes) {
    const label = p.school_name || 'Other programmes';
    if (!groups.has(label)) groups.set(label, el('optgroup', { label }));
    groups.get(label).append(el('option', { value: p.id }, p.name));
  }
  return [...groups.values()];
}

let toastTimer;
function toast(message, kind = 'ok') {
  const node = $('toast');
  node.replaceChildren(icon(kind === 'error' ? 'xCircle' : 'checkCircle'), el('span', {}, message));
  node.className = `toast show${kind === 'error' ? ' error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 3200);
}

function failed(err, message) {
  if (err.status !== 401) toast(message, 'error');
}

// CSV with a BOM so Excel reads UTF-8, quoted cells, and free text that starts with
// a formula character prefixed so spreadsheets don't run it.
function downloadCsv(filename, header, rows) {
  const cell = (value) => {
    let v = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(v) && !/^\+\d+$/.test(v)) v = `'${v}`;
    return `"${v.replace(/"/g, '""')}"`;
  };
  const csv = `﻿${[header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = el('a', { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const today = () => new Date().toISOString().slice(0, 10);

// ---------- layout: sidebar, counts, notifications

function renderSidebar() {
  const groups = {};
  for (const [id, tab] of Object.entries(TABS)) (groups[tab.group] ||= []).push([id, tab]);
  $('sidebar-nav').replaceChildren(...Object.entries(groups).flatMap(([group, tabs]) => [
    el('p', { className: 'nav-group-label' }, group),
    ...tabs.map(([id, tab]) => el('button', { type: 'button', className: 'side-link', 'data-tab': id, onclick: () => showTab(id) },
      icon(tab.icon), el('span', {}, tab.label), el('span', { className: 'count', 'data-count': id, hidden: true }))),
  ]));
}

function updateCounts() {
  const s = state.summary;
  if (!s) return;
  const counts = {
    applications: [s.applications.pending, true, 'pending review'],
    messages: [s.unreadMessages, true, 'unread'],
    subscribers: [s.subscribers],
    posts: [s.posts],
    calendar: [s.calendar],
    testimonials: [s.testimonials],
  };
  for (const [id, [n, alert, hint]] of Object.entries(counts)) {
    const node = document.querySelector(`[data-count="${id}"]`);
    node.textContent = n;
    node.hidden = !n;
    node.classList.toggle('alert', Boolean(alert && n));
    node.title = hint ? `${n} ${hint}` : '';
  }
  const alerts = s.applications.pending + s.unreadMessages;
  const bell = $('bell-count');
  bell.hidden = !alerts;
  bell.textContent = alerts > 99 ? '99+' : alerts;
  if (!$('notify-panel').hidden) renderNotifications();
}

async function refreshSummary() {
  try {
    state.summary = await adminApi('/summary');
    updateCounts();
  } catch { /* counts stay as they were */ }
}

function renderNotifications() {
  const s = state.summary;
  const go = (fn) => () => { closeNotifications(); fn(); };
  const items = [];
  if (s.applications.pending) {
    items.push(el('button', { type: 'button', className: 'notify-item highlight', onclick: go(() => showTab('applications', { status: 'pending' })) },
      el('strong', {}, `${plural(s.applications.pending, 'application')} awaiting review`), el('small', {}, 'Open the pending list')));
    items.push(...s.latestPending.map((a) => el('button', { type: 'button', className: 'notify-item', onclick: go(() => openApplicant(a.id)) },
      el('strong', {}, a.full_name), el('small', {}, `${a.programme} · ${dateTime(a.created_at)}`))));
  }
  if (s.unreadMessages) {
    items.push(el('button', { type: 'button', className: 'notify-item highlight', onclick: go(() => showTab('messages', { messages: 'unread' })) },
      el('strong', {}, plural(s.unreadMessages, 'unread message')), el('small', {}, 'Open the inbox')));
  }
  $('notify-panel').replaceChildren(el('h3', {}, 'Notifications'),
    ...(items.length ? items : [el('p', { className: 'muted notify-empty' }, "You're all caught up.")]));
}

function toggleNotifications() {
  const panel = $('notify-panel');
  if (panel.hidden) renderNotifications();
  panel.hidden = !panel.hidden;
  $('bell').setAttribute('aria-expanded', String(!panel.hidden));
}

function closeNotifications() {
  $('notify-panel').hidden = true;
  $('bell').setAttribute('aria-expanded', 'false');
}

function setSidebar(open) {
  $('sidebar').classList.toggle('open', open);
  $('sidebar-backdrop').hidden = !open;
  $('sidebar-toggle').setAttribute('aria-expanded', String(open));
}

async function showTab(id, options = {}) {
  const seq = ++state.seq;
  const current = () => seq === state.seq;
  state.tab = id;
  appsUI = null;
  if (options.status !== undefined) {
    state.filters.status = options.status;
    state.page = 1;
  }
  if (options.messages) state.messageFilter = options.messages;

  document.querySelectorAll('.side-link[data-tab]').forEach((b) => {
    if (b.dataset.tab === id) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  $('page-title').textContent = TABS[id].label;
  setSidebar(false);
  view.replaceChildren(el('p', { className: 'muted' }, 'Loading…'));

  try {
    await TABS[id].render(current);
  } catch (err) {
    if (err.status === 401 || !current()) return;
    view.replaceChildren(emptyState('This page could not be loaded', 'Check that the server is running, then try again.',
      btn('Try again', { iconName: 'refresh', onclick: () => showTab(id) })));
  }
}

// ---------- applications

async function loadApplications() {
  const [applications, programmes] = await Promise.all([
    adminApi('/applications'),
    state.programmes.length ? state.programmes : getProgrammes(),
  ]);
  state.applications = applications;
  state.programmes = programmes;
  const ids = new Set(applications.map((a) => a.id));
  state.selected = new Set([...state.selected].filter((id) => ids.has(id)));
}

function filteredApplications() {
  const { q, programme, status } = state.filters;
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '').replace(/^0/, ''); // "0977…" also finds "+260977…"
  return state.applications.filter((a) => (!status || a.status === status)
    && (!programme || String(a.programme_id) === programme)
    && (!needle
      || [a.full_name, a.email, a.nrc, a.phone, ref(a.id)].some((v) => v && v.toLowerCase().includes(needle))
      || (digits.length >= 3 && a.phone.replace(/\D/g, '').includes(digits))));
}

async function renderApplications(current) {
  await loadApplications();
  if (!current()) return;

  const search = el('input', { type: 'search', value: state.filters.q, placeholder: 'Search by name, NRC, phone, email or reference', 'aria-label': 'Search applications' });
  search.addEventListener('input', () => {
    state.filters.q = search.value;
    $('global-search').value = search.value;
    state.page = 1;
    paintApplications();
  });

  const programmeSelect = el('select', { 'aria-label': 'Filter by programme' },
    el('option', { value: '' }, 'All programmes'),
    state.programmes.map((p) => el('option', { value: String(p.id) }, p.name)));
  programmeSelect.value = state.filters.programme;
  programmeSelect.addEventListener('change', () => {
    state.filters.programme = programmeSelect.value;
    state.page = 1;
    paintApplications();
  });

  const statusSelect = el('select', { 'aria-label': 'Filter by status' },
    el('option', { value: '' }, 'All statuses'),
    STATUSES.map((s) => el('option', { value: s }, s[0].toUpperCase() + s.slice(1))));
  statusSelect.value = state.filters.status;
  statusSelect.addEventListener('change', () => setStatusFilter(statusSelect.value));

  appsUI = {
    search,
    statusSelect,
    programmeSelect,
    kpis: el('div', { className: 'kpi-grid' }),
    batch: el('div', { className: 'batch-bar', hidden: true }),
    table: el('div'),
    foot: el('div', { className: 'table-foot' }),
  };

  view.replaceChildren(
    el('div', { className: 'view-head' },
      el('div', {},
        el('h2', {}, 'Admissions', el('span', { className: 'tag' }, `${SITE.intake} intake`)),
        el('p', {}, 'Review applications, record decisions and contact applicants.')),
      el('div', { className: 'view-actions' },
        btn('Refresh', { iconName: 'refresh', onclick: () => showTab('applications') }),
        btn('Export CSV', { iconName: 'download', onclick: exportApplications }),
        btn('New application', { iconName: 'plus', className: 'btn btn-primary btn-sm', onclick: openNewApplication }))),
    appsUI.kpis,
    el('section', { className: 'panel', 'aria-label': 'Applications' },
      el('div', { className: 'toolbar' },
        el('label', { className: 'search-box' }, icon('search'), search),
        programmeSelect,
        statusSelect,
        btn('Reset', { onclick: resetFilters })),
      appsUI.batch,
      appsUI.table,
      appsUI.foot));

  paintApplications();
}

function setStatusFilter(status) {
  state.filters.status = status;
  state.page = 1;
  if (appsUI) appsUI.statusSelect.value = status;
  paintApplications();
}

function resetFilters() {
  state.filters = { q: '', programme: '', status: '' };
  state.page = 1;
  $('global-search').value = '';
  if (appsUI) {
    appsUI.search.value = '';
    appsUI.programmeSelect.value = '';
    appsUI.statusSelect.value = '';
  }
  paintApplications();
}

function paintKpis() {
  const apps = state.applications;
  const n = (status) => apps.filter((a) => a.status === status).length;
  const decided = n('accepted') + n('rejected');
  const share = (count) => (decided ? `${Math.round((count / decided) * 100)}% of decisions` : 'No decisions yet');
  const recent = apps.filter((a) => parseDate(a.created_at) >= daysAgo(7)).length;
  const cards = [
    ['', 'total', 'Total', apps.length, 'folder', `${recent} in the last 7 days`],
    ['pending', 'pending', 'Pending', n('pending'), 'clock', 'Awaiting review'],
    ['accepted', 'accepted', 'Accepted', n('accepted'), 'checkCircle', share(n('accepted'))],
    ['rejected', 'rejected', 'Rejected', n('rejected'), 'xCircle', share(n('rejected'))],
  ];
  appsUI.kpis.replaceChildren(...cards.map(([status, cls, label, value, iconName, note]) => el('button', {
    type: 'button',
    className: `kpi ${cls}`,
    'aria-pressed': String(state.filters.status === status),
    title: status ? `Show ${label.toLowerCase()} applications` : 'Show all applications',
    onclick: () => setStatusFilter(status),
  },
  el('span', {}, el('span', { className: 'kpi-label' }, label), el('strong', { className: 'kpi-value' }, String(value)), el('span', { className: 'kpi-note' }, note)),
  el('span', { className: 'kpi-icon' }, icon(iconName)))));
}

function paintApplications() {
  if (!appsUI) return;
  paintKpis();

  const list = filteredApplications();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(Math.max(state.page, 1), pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const rows = list.slice(start, start + PAGE_SIZE);

  if (!list.length) {
    const filtered = state.applications.length > 0;
    appsUI.table.replaceChildren(filtered
      ? emptyState('No applications match', 'Try a different search, or clear the filters.', btn('Clear filters', { onclick: resetFilters }))
      : emptyState('No applications yet', 'Applications submitted on the website, or added here with "New application", will appear here.'));
    appsUI.foot.replaceChildren();
    paintBatch();
    return;
  }

  const selectAll = el('input', { type: 'checkbox', 'aria-label': 'Select all on this page', checked: rows.every((a) => state.selected.has(a.id)) });
  selectAll.addEventListener('change', () => {
    rows.forEach((a) => (selectAll.checked ? state.selected.add(a.id) : state.selected.delete(a.id)));
    paintApplications();
  });
  const syncSelectAll = () => { selectAll.checked = rows.every((a) => state.selected.has(a.id)); };

  appsUI.table.replaceChildren(el('div', { className: 'table-wrap' }, el('table', {},
    el('thead', {}, el('tr', {},
      el('th', { className: 'check' }, selectAll),
      ['Applicant', 'Programme', 'Contact', 'NRC', 'Submitted', 'Status'].map((h) => el('th', {}, h)),
      el('th', { className: 'right' }, 'Actions'))),
    el('tbody', {}, rows.map((a) => applicationRow(a, syncSelectAll))))));

  appsUI.foot.replaceChildren(
    el('span', {}, `Showing ${start + 1}–${start + rows.length} of ${plural(list.length, 'application')}`),
    pager(pages));
  paintBatch();
}

function applicationRow(a, onSelect) {
  const row = el('tr', { className: state.selected.has(a.id) ? 'selected' : null });
  const box = el('input', { type: 'checkbox', 'aria-label': `Select ${a.full_name}`, checked: state.selected.has(a.id) });
  box.addEventListener('change', () => {
    if (box.checked) state.selected.add(a.id);
    else state.selected.delete(a.id);
    row.classList.toggle('selected', box.checked);
    onSelect();
    paintBatch();
  });

  row.append(
    el('td', { className: 'check' }, box),
    el('td', {}, el('div', { className: 'applicant' },
      el('span', { className: 'avatar' }, initials(a.full_name)),
      el('div', {},
        el('button', { type: 'button', className: 'name', onclick: () => openApplicant(a.id) }, a.full_name),
        el('small', {}, ref(a.id))))),
    el('td', { className: 'wrap-sm' }, a.programme),
    el('td', { className: 'contact-cell' }, el('span', { className: 'mono' }, a.phone), a.email ? el('small', {}, a.email) : null),
    el('td', { className: 'mono' }, a.nrc),
    el('td', { title: dateTime(a.created_at) }, shortDate(a.created_at)),
    el('td', {}, badge(a.status)),
    el('td', {}, el('div', { className: 'row-actions' },
      iconButton('eye', `Review ${a.full_name}`, () => openApplicant(a.id)),
      iconButton('check', `Accept ${a.full_name}`, () => updateStatus([a.id], 'accepted'), { className: 'ok', disabled: a.status === 'accepted' }),
      iconButton('close', `Reject ${a.full_name}`, () => updateStatus([a.id], 'rejected'), { className: 'bad', disabled: a.status === 'rejected' }))));
  return row;
}

function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const wanted = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((x, y) => x - y);
  return wanted.flatMap((p, i) => (i && p - wanted[i - 1] > 1 ? ['…', p] : [p]));
}

function pager(pages) {
  const go = (page) => { state.page = page; paintApplications(); };
  return el('div', { className: 'pager' },
    el('button', { type: 'button', 'aria-label': 'Previous page', disabled: state.page === 1, onclick: () => go(state.page - 1) }, icon('chevronLeft')),
    pageNumbers(state.page, pages).map((p) => (p === '…'
      ? el('span', { className: 'gap' }, '…')
      : el('button', { type: 'button', 'aria-current': p === state.page ? 'page' : null, onclick: () => go(p) }, String(p)))),
    el('button', { type: 'button', 'aria-label': 'Next page', disabled: state.page === pages, onclick: () => go(state.page + 1) }, icon('chevronRight')));
}

function paintBatch() {
  const n = state.selected.size;
  appsUI.batch.hidden = !n;
  if (!n) return;
  appsUI.batch.replaceChildren(
    el('span', {}, `${plural(n, 'application')} selected`),
    el('div', { className: 'view-actions' },
      btn('Accept', { iconName: 'check', className: 'btn btn-ok btn-sm', onclick: () => batchUpdate('accepted') }),
      btn('Reject', { iconName: 'close', className: 'btn btn-danger btn-sm', onclick: () => batchUpdate('rejected') }),
      btn('Mark pending', { onclick: () => batchUpdate('pending') }),
      btn('Clear selection', { className: 'btn btn-ghost btn-sm', onclick: () => { state.selected.clear(); paintApplications(); } })));
}

async function batchUpdate(status) {
  const ids = [...state.selected];
  if (status === 'rejected' && !confirm(`Reject ${plural(ids.length, 'application')}?`)) return;
  if (await updateStatus(ids, status)) {
    state.selected.clear();
    paintApplications();
  }
}

async function updateStatus(ids, status) {
  try {
    await send('/applications', 'PATCH', { ids, status });
    await loadApplications();
  } catch (err) {
    failed(err, 'Could not update the status.');
    return false;
  }
  const name = ids.length === 1 && state.applications.find((a) => a.id === ids[0])?.full_name;
  toast(name ? `${name} marked ${status}` : `${plural(ids.length, 'application')} marked ${status}`);
  refreshSummary();
  paintApplications();
  return true;
}

function exportApplications() {
  const list = filteredApplications();
  if (!list.length) return toast('There is nothing to export.', 'error');
  downloadCsv(`nec-applications-${today()}.csv`,
    ['Reference', 'Name', 'Programme', 'Phone', 'NRC', 'Email', 'Intake', 'Status', 'Submitted', 'Last reviewed', 'Notes'],
    list.map((a) => [ref(a.id), a.full_name, a.programme, a.phone, a.nrc, a.email, a.intake, a.status, a.created_at, a.reviewed_at, a.notes]));
  toast(`Exported ${plural(list.length, 'application')}`);
}

// Pre-filled messages; staff can edit them in WhatsApp or their email app before sending.
function applicantMessage(a) {
  const first = a.full_name.split(/\s+/)[0];
  if (a.status === 'accepted') {
    return `Hello ${first}, congratulations! Your application for ${a.programme} (${a.intake} intake) at North End College has been accepted. Reference: ${ref(a.id)}.`;
  }
  if (a.status === 'rejected') {
    return `Hello ${first}, thank you for applying for ${a.programme} at North End College. Unfortunately we cannot offer you a place at this time. Please contact us if you would like to discuss your application. Reference: ${ref(a.id)}.`;
  }
  return `Hello ${first}, thank you for applying for ${a.programme} (${a.intake} intake) at North End College. Please send a photo of your Grade 12 results and NRC here so we can complete your application. Reference: ${ref(a.id)}.`;
}

async function openApplicant(id, draftNotes) {
  if (!state.applications.some((x) => x.id === id)) {
    try { await loadApplications(); } catch (err) { return failed(err, 'Could not load the application.'); }
  }
  const a = state.applications.find((x) => x.id === id);
  if (!a) return toast('That application no longer exists.', 'error');

  const drawer = $('drawer');
  const notes = el('textarea', { rows: 4, 'aria-label': 'Internal notes', placeholder: 'e.g. Grade 12 results received on WhatsApp and checked' });
  notes.value = draftNotes ?? a.notes ?? '';
  const message = applicantMessage(a);
  const section = (title, ...children) => el('section', { className: 'drawer-section' }, el('h3', {}, title), children);
  const detail = (label, value, className) => el('div', { className }, el('dt', {}, label), el('dd', {}, value));

  drawer.replaceChildren(
    el('div', { className: 'drawer-head' },
      el('span', { className: 'avatar' }, initials(a.full_name)),
      el('div', {}, el('h2', { id: 'drawer-name' }, a.full_name), el('p', {}, a.programme)),
      iconButton('close', 'Close', () => drawer.close())),
    el('div', { className: 'drawer-body' },
      section('Decision', el('div', { className: 'decision' },
        el('div', { className: 'decision-row' }, el('span', {}, 'Current status'), badge(a.status)),
        el('div', { className: 'status-switch', role: 'group', 'aria-label': 'Set status' }, STATUSES.map((s) => el('button', {
          type: 'button',
          className: s,
          'aria-pressed': String(a.status === s),
          onclick: async () => {
            if (s === a.status) return;
            const draft = notes.value;
            if (await updateStatus([a.id], s)) openApplicant(a.id, draft);
          },
        }, s))),
        a.reviewed_at ? el('small', { className: 'muted' }, `Status last changed ${dateTime(a.reviewed_at)}`) : null)),
      section('Applicant details', el('dl', { className: 'details' },
        detail('Reference', ref(a.id), 'mono'),
        detail('Submitted', dateTime(a.created_at)),
        detail('NRC', a.nrc, 'mono'),
        detail('Phone', a.phone, 'mono'),
        detail('Email', a.email || '—', 'full'),
        detail('Programme', a.programme, 'full'),
        detail('Intake', a.intake))),
      section('Contact applicant',
        el('div', { className: 'contact-actions' },
          el('a', { className: 'btn btn-primary btn-sm', href: waHref(a.phone, message), target: '_blank', rel: 'noopener' }, icon('whatsapp'), 'WhatsApp'),
          el('a', { className: 'btn btn-light btn-sm', href: telHref(a.phone) }, icon('phone'), 'Call'),
          a.email ? el('a', {
            className: 'btn btn-light btn-sm',
            href: `mailto:${a.email}?subject=${encodeURIComponent(`Your application to North End College (${ref(a.id)})`)}&body=${encodeURIComponent(message)}`,
          }, icon('mail'), 'Email') : null),
        el('p', { className: 'note-box' }, 'WhatsApp and email open with a message written for the current status, so you can check it before sending. Applicants send their Grade 12 results and NRC on WhatsApp, so check them there before accepting.')),
      section('Internal notes', notes, el('small', { className: 'muted' }, 'Only visible to admins. Included in CSV exports.'))),
    el('div', { className: 'drawer-foot' },
      btn('Save notes', { iconName: 'check', className: 'btn btn-primary btn-sm', onclick: () => saveNotes(a.id, notes.value) }),
      btn('Close', { onclick: () => drawer.close() })));

  if (!drawer.open) drawer.showModal();
}

async function saveNotes(id, text) {
  try {
    const updated = await send(`/applications/${id}`, 'PATCH', { notes: text });
    const a = state.applications.find((x) => x.id === id);
    if (a) a.notes = updated.notes;
    toast('Notes saved');
  } catch (err) {
    failed(err, 'Could not save the notes.');
  }
}

async function openNewApplication() {
  if (!state.programmes.length) {
    try { state.programmes = await getProgrammes(); } catch { return toast('Could not load the programmes.', 'error'); }
  }
  const dialog = $('modal');
  const status = el('p', { className: 'form-status', role: 'status' });
  const form = el('form', { className: 'form', novalidate: true },
    el('div', { className: 'modal-head' }, el('h3', {}, 'New application'), iconButton('close', 'Close', () => dialog.close())),
    el('p', { className: 'muted' }, 'Record an application received in person, by phone or on WhatsApp.'),
    field('Programme', el('select', { name: 'programme_id', required: true }, el('option', { value: '' }, 'Select a programme'), programmeOptions()), 'programme_id'),
    field('Full name', el('input', { name: 'full_name', autocomplete: 'off', required: true }), 'full_name'),
    el('div', { className: 'row' },
      field('Phone / WhatsApp', el('input', { name: 'phone', type: 'tel', placeholder: '+260 971 234 567', required: true }), 'phone'),
      field('NRC number', el('input', { name: 'nrc', placeholder: '123456/12/1', required: true }), 'nrc')),
    field('Email (optional)', el('input', { name: 'email', type: 'email' }), 'email'),
    el('div', { className: 'view-actions' },
      el('button', { type: 'submit', className: 'btn btn-primary' }, 'Save application'),
      btn('Cancel', { className: 'btn btn-light', onclick: () => dialog.close() })),
    status);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    setStatus(status, '');
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      await send('/applications', 'POST', Object.fromEntries(new FormData(form)));
      dialog.close();
      toast('Application added');
      state.filters = { q: '', programme: '', status: '' };
      $('global-search').value = '';
      state.page = 1;
      refreshSummary();
      showTab('applications');
    } catch (err) {
      if (err.data?.errors) {
        showFieldErrors(form, err.data.errors);
        setStatus(status, 'Please correct the highlighted fields.', 'fail');
      } else if (err.status !== 401) {
        setStatus(status, 'Could not save the application.', 'fail');
      }
    } finally {
      submit.disabled = false;
    }
  });

  dialog.replaceChildren(form);
  dialog.showModal();
}

// ---------- messages

async function renderMessages(current) {
  const messages = await adminApi('/messages');
  if (!current()) return;

  const filter = el('div', { className: 'segmented', role: 'group', 'aria-label': 'Show messages' });
  const list = el('div', { className: 'message-list' });

  const paint = () => {
    const unread = messages.filter((m) => !m.read_at);
    filter.replaceChildren(...[['all', `All (${messages.length})`], ['unread', `Unread (${unread.length})`]].map(([key, label]) =>
      el('button', { type: 'button', 'aria-pressed': String(state.messageFilter === key), onclick: () => { state.messageFilter = key; paint(); } }, label)));
    const shown = state.messageFilter === 'unread' ? unread : messages;
    list.replaceChildren(...(shown.length
      ? shown.map((m) => messageCard(m, messages, paint))
      : [el('div', { className: 'panel' }, messages.length
        ? emptyState('No unread messages', "You're all caught up.")
        : emptyState('No messages yet', 'Messages sent from the Contact page will appear here.'))]));
  };

  view.replaceChildren(viewHead('Messages', 'Questions sent from the Contact page. Reply by email or WhatsApp, then mark them as read.', filter), list);
  paint();
}

function messageCard(m, all, repaint) {
  const setRead = async (read) => {
    try {
      await send(`/messages/${m.id}`, 'PATCH', { read });
    } catch (err) {
      return failed(err, 'Could not update the message.');
    }
    m.read_at = read ? (m.read_at || sqlNow()) : null;
    refreshSummary();
    repaint();
  };
  const remove = async () => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await send(`/messages/${m.id}`, 'DELETE');
    } catch (err) {
      return failed(err, 'Could not delete the message.');
    }
    all.splice(all.indexOf(m), 1);
    toast('Message deleted');
    refreshSummary();
    repaint();
  };
  const reply = `Hello ${m.name.split(/\s+/)[0]}, thank you for contacting North End College. `;
  const markOnReply = () => { if (!m.read_at) setRead(true); };

  return el('article', { className: `message${m.read_at ? '' : ' unread'}` },
    el('div', { className: 'message-head' },
      el('span', { className: 'avatar' }, initials(m.name)),
      el('strong', {}, m.name),
      m.read_at ? null : el('span', { className: 'pill-new' }, 'New'),
      el('time', { datetime: m.created_at }, dateTime(m.created_at))),
    el('div', { className: 'message-meta' },
      m.email ? el('span', {}, m.email) : null,
      m.phone ? el('span', { className: 'mono' }, m.phone) : null),
    el('p', { className: 'message-body' }, m.message),
    el('div', { className: 'message-actions' },
      m.email ? el('a', {
        className: 'btn btn-primary btn-sm',
        href: `mailto:${m.email}?subject=${encodeURIComponent('Your message to North End College')}&body=${encodeURIComponent(reply)}`,
        onclick: markOnReply,
      }, icon('mail'), 'Reply by email') : null,
      m.phone ? el('a', { className: 'btn btn-light btn-sm', href: waHref(m.phone, reply), target: '_blank', rel: 'noopener', onclick: markOnReply }, icon('whatsapp'), 'WhatsApp') : null,
      m.phone ? el('a', { className: 'btn btn-light btn-sm', href: telHref(m.phone) }, icon('phone'), 'Call') : null,
      btn(m.read_at ? 'Mark as unread' : 'Mark as read', { iconName: 'check', onclick: () => setRead(!m.read_at) }),
      btn('Delete', { iconName: 'trash', className: 'btn btn-ghost btn-sm', onclick: remove })));
}

// ---------- subscribers

async function renderSubscribers(current) {
  const subscribers = await adminApi('/subscribers');
  if (!current()) return;

  const search = el('input', { type: 'search', placeholder: 'Search email addresses', 'aria-label': 'Search subscribers' });
  const area = el('div');
  const recent = subscribers.filter((s) => parseDate(s.created_at) >= daysAgo(30)).length;

  const remove = async (s) => {
    if (!confirm(`Remove ${s.email} from the newsletter list?`)) return;
    try {
      await send(`/subscribers/${s.id}`, 'DELETE');
    } catch (err) {
      return failed(err, 'Could not remove the subscriber.');
    }
    subscribers.splice(subscribers.indexOf(s), 1);
    toast(`${s.email} removed`);
    refreshSummary();
    paint();
  };

  const paint = () => {
    const q = search.value.trim().toLowerCase();
    const shown = subscribers.filter((s) => s.email.includes(q));
    area.replaceChildren(shown.length
      ? el('div', { className: 'table-wrap' }, el('table', {},
        el('thead', {}, el('tr', {}, el('th', {}, 'Email'), el('th', {}, 'Subscribed'), el('th', { className: 'right' }, ''))),
        el('tbody', {}, shown.map((s) => el('tr', {},
          el('td', {}, el('a', { href: `mailto:${s.email}` }, s.email)),
          el('td', {}, dateTime(s.created_at)),
          el('td', {}, el('div', { className: 'row-actions' }, iconButton('trash', `Remove ${s.email}`, () => remove(s), { className: 'bad' }))))))))
      : emptyState(subscribers.length ? 'No matches' : 'No subscribers yet',
        subscribers.length ? 'Try a different search.' : 'People who subscribe in the website footer will appear here.'));
  };
  search.addEventListener('input', paint);

  const copyAll = async () => {
    if (!subscribers.length) return toast('There are no addresses to copy.', 'error');
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', '));
      toast(`Copied ${plural(subscribers.length, 'address', 'addresses')}`);
    } catch {
      toast('Copying is not available in this browser.', 'error');
    }
  };
  const exportCsv = () => {
    if (!subscribers.length) return toast('There is nothing to export.', 'error');
    downloadCsv(`nec-subscribers-${today()}.csv`, ['Email', 'Subscribed'], subscribers.map((s) => [s.email, s.created_at]));
  };

  view.replaceChildren(
    viewHead('Newsletter subscribers', 'People who signed up for updates in the website footer.',
      btn('Copy all emails', { iconName: 'copy', onclick: copyAll }),
      btn('Export CSV', { iconName: 'download', onclick: exportCsv })),
    el('div', { className: 'kpi-grid two' },
      el('div', { className: 'kpi' }, el('span', {}, el('span', { className: 'kpi-label' }, 'Subscribers'), el('strong', { className: 'kpi-value' }, String(subscribers.length)), el('span', { className: 'kpi-note' }, 'On the mailing list')), el('span', { className: 'kpi-icon' }, icon('people'))),
      el('div', { className: 'kpi pending' }, el('span', {}, el('span', { className: 'kpi-label' }, 'New'), el('strong', { className: 'kpi-value' }, String(recent)), el('span', { className: 'kpi-note' }, 'In the last 30 days')), el('span', { className: 'kpi-icon' }, icon('clock')))),
    el('section', { className: 'panel' }, el('div', { className: 'toolbar' }, el('label', { className: 'search-box' }, icon('search'), search)), area));
  paint();
}

// ---------- website content

function contentInput(f) {
  if (f.options) return el('select', { name: f.name }, f.options.map(([value, label]) => el('option', { value }, label)));
  if (f.textarea) return el('textarea', { name: f.name, rows: 3 });
  return el('input', { name: f.name, type: f.type || 'text' });
}

async function renderContent(key, current) {
  const cfg = CONTENT[key];
  const rows = await adminApi(`/content/${key}`);
  if (!current()) return;

  const status = el('p', { className: 'form-status', role: 'status' });
  const form = el('form', { className: 'form content-form', novalidate: true },
    cfg.fields.map((f) => field(f.label, contentInput(f), f.name)),
    el('button', { className: 'btn btn-primary', type: 'submit' }, icon('plus'), 'Add'),
    status);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(form);
    setStatus(status, '');
    try {
      await send(`/content/${key}`, 'POST', Object.fromEntries(new FormData(form)));
      toast(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} added`);
      refreshSummary();
      showTab(key);
    } catch (err) {
      if (err.data?.errors) {
        showFieldErrors(form, err.data.errors);
        setStatus(status, 'Please correct the highlighted fields.', 'fail');
      } else if (err.status !== 401) {
        setStatus(status, 'Could not save.', 'fail');
      }
    }
  });

  const remove = async (row) => {
    if (!confirm('Delete this item? It will be removed from the website.')) return;
    try {
      await send(`/content/${key}/${row.id}`, 'DELETE');
    } catch (err) {
      return failed(err, 'Could not delete the item.');
    }
    toast('Deleted');
    refreshSummary();
    showTab(key);
  };

  const cell = (row, [name, , kind]) => {
    const value = row[name];
    if (value == null || value === '') return el('td', {}, '—');
    if (kind === 'badge') return el('td', {}, badge(value));
    if (kind === 'date') return el('td', {}, shortDate(value));
    return el('td', { className: kind }, value);
  };

  view.replaceChildren(
    viewHead(cfg.title, cfg.description),
    el('div', { className: 'content-layout' },
      el('section', { className: 'panel' }, el('div', { className: 'panel-head' }, el('h3', {}, `Add ${cfg.singular}`)), form),
      el('section', { className: 'panel' },
        el('div', { className: 'panel-head' }, el('h3', {}, `${cfg.title} (${rows.length})`)),
        rows.length
          ? el('div', { className: 'table-wrap' }, el('table', {},
            el('thead', {}, el('tr', {}, cfg.columns.map(([, label]) => el('th', {}, label)), el('th', { className: 'right' }, ''))),
            el('tbody', {}, rows.map((row) => el('tr', {},
              cfg.columns.map((col) => cell(row, col)),
              el('td', {}, el('div', { className: 'row-actions' }, iconButton('trash', 'Delete', () => remove(row), { className: 'bad' }))))))))
          : emptyState('Nothing here yet', `Use the form to add the first ${cfg.singular}.`))));
}

// ---------- sign in and out

async function signIn() {
  const button = $('login').querySelector('[type="submit"]');
  button.disabled = true;
  try {
    state.summary = await api('/api/admin/summary', { headers: { 'X-Admin-Token': state.token } });
  } catch (err) {
    return signOut(err.status === 401 ? 'That token is not correct.' : 'Could not reach the server. Is it running?');
  } finally {
    button.disabled = false;
  }
  sessionStorage.setItem('adminToken', state.token);
  $('login-screen').hidden = true;
  $('app').hidden = false;
  updateCounts();
  showTab('applications');
}

function signOut(message = '') {
  sessionStorage.removeItem('adminToken');
  state.token = '';
  state.seq++;
  state.applications = [];
  state.selected.clear();
  appsUI = null;
  for (const dialog of [$('drawer'), $('modal')]) if (dialog.open) dialog.close();
  closeNotifications();
  $('app').hidden = true;
  $('login-screen').hidden = false;
  const form = $('login');
  form.elements.token.value = '';
  setStatus(form.querySelector('.form-status'), message, message ? 'fail' : '');
  form.elements.token.focus();
}

// ---------- start

document.querySelectorAll('[data-admin-icon]').forEach((n) => n.replaceWith(icon(n.dataset.adminIcon)));
$('intake-status').textContent = `${SITE.intake} intake open`;
$('search-shortcut').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
renderSidebar();

$('login').addEventListener('submit', (e) => {
  e.preventDefault();
  state.token = $('login').elements.token.value.trim();
  if (!state.token) return setStatus($('login').querySelector('.form-status'), 'Enter the admin token.', 'fail');
  signIn();
});
$('logout').addEventListener('click', () => signOut());
$('sidebar-toggle').addEventListener('click', () => setSidebar(!$('sidebar').classList.contains('open')));
$('sidebar-backdrop').addEventListener('click', () => setSidebar(false));
$('bell').addEventListener('click', (e) => { e.stopPropagation(); toggleNotifications(); });

$('global-search').addEventListener('input', (e) => {
  state.filters.q = e.target.value;
  state.page = 1;
  if (state.tab !== 'applications') showTab('applications');
  else if (appsUI) {
    appsUI.search.value = e.target.value;
    paintApplications();
  }
});

document.addEventListener('click', (e) => {
  if (!$('notify-panel').hidden && !e.target.closest('.notify')) closeNotifications();
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !$('app').hidden) {
    e.preventDefault();
    const global = $('global-search');
    const target = global.offsetParent ? global : appsUI?.search;
    target?.focus();
    target?.select();
  }
  if (e.key === 'Escape') {
    closeNotifications();
    setSidebar(false);
  }
});
// Close a dialog when its backdrop is clicked
for (const dialog of [$('drawer'), $('modal')]) {
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

if (state.token) signIn();

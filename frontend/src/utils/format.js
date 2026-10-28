// Small formatting helpers shared by the public site and the admin dashboard.

// SQLite gives "YYYY-MM-DD" for dates and "YYYY-MM-DD HH:MM:SS" (UTC) for timestamps.
export function parseDate(value) {
  return value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(`${value.replace(' ', 'T')}Z`);
}

export const formatDate = (value) =>
  (value ? parseDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export const shortDate = (value) =>
  (value ? parseDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export const dateTime = (value) =>
  (value ? parseDate(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

export const daysAgo = (n) => Date.now() - n * 86400000;

export const today = () => new Date().toISOString().slice(0, 10);

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

export const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Display reference for an application, e.g. NEC-00012
export const applicationRef = (id) => `NEC-${String(id).padStart(5, '0')}`;

export const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

export const cx = (...classes) => classes.filter(Boolean).join(' ');

// Groups programmes into [[school name, programmes], …] for <optgroup> lists
export function groupBySchool(programmes) {
  const groups = new Map();
  for (const p of programmes) {
    const label = p.school_name || 'Other programmes';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(p);
  }
  return [...groups];
}

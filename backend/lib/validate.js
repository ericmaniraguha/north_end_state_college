// Input helpers shared by the API routes.

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Accepts Zambian numbers written locally (0971234567), with the country code
// (260971234567 or +260 971 234 567), or any other international +number.
// Returns the number in international form (+260971234567), or null if invalid.
function normalizePhone(value) {
  const v = clean(value).replace(/[\s().-]/g, '');
  if (/^0\d{9}$/.test(v)) return `+260${v.slice(1)}`;
  if (/^260\d{9}$/.test(v)) return `+${v}`;
  if (v.startsWith('+260')) return /^\+260\d{9}$/.test(v) ? v : null;
  if (/^\+\d{8,15}$/.test(v)) return v;
  return null;
}

module.exports = { clean, isEmail, normalizePhone };

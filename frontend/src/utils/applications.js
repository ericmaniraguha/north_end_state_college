import { applicationRef, daysAgo, parseDate } from './format.js';

export const STATUSES = ['pending', 'accepted', 'rejected'];

// Search matches name, email, NRC, phone or reference. Typing a local number such as
// 0977… also finds the stored +260977… form.
export function filterApplications(applications, { q = '', programme = '', status = '' } = {}) {
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '').replace(/^0/, '');
  return applications.filter((a) => (!status || a.status === status)
    && (!programme || String(a.programme_id) === programme)
    && (!needle
      || [a.full_name, a.email, a.nrc, a.phone, applicationRef(a.id)].some((v) => v && v.toLowerCase().includes(needle))
      || (digits.length >= 3 && a.phone.replace(/\D/g, '').includes(digits))));
}

export function applicationStats(applications) {
  const count = (status) => applications.filter((a) => a.status === status).length;
  const accepted = count('accepted');
  const rejected = count('rejected');
  return {
    total: applications.length,
    pending: count('pending'),
    accepted,
    rejected,
    decided: accepted + rejected,
    recent: applications.filter((a) => parseDate(a.created_at) >= daysAgo(7)).length,
  };
}

// Page buttons with gaps, e.g. [1, '…', 4, 5, 6, '…', 12]
export function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const wanted = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return wanted.flatMap((p, i) => (i && p - wanted[i - 1] > 1 ? ['…', p] : [p]));
}

// Pre-filled WhatsApp/email text for the applicant's current status. Staff check and
// edit it in WhatsApp or their email app before sending.
export function applicantMessage(a) {
  const first = a.full_name.split(/\s+/)[0];
  const ref = applicationRef(a.id);
  if (a.status === 'accepted') {
    return `Hello ${first}, congratulations! Your application for ${a.programme} (${a.intake} intake) at North End College has been accepted. Reference: ${ref}.`;
  }
  if (a.status === 'rejected') {
    return `Hello ${first}, thank you for applying for ${a.programme} at North End College. Unfortunately we cannot offer you a place at this time. Please contact us if you would like to discuss your application. Reference: ${ref}.`;
  }
  return `Hello ${first}, thank you for applying for ${a.programme} (${a.intake} intake) at North End College. Please send a photo of your Grade 12 results and NRC here so we can complete your application. Reference: ${ref}.`;
}

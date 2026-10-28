import { request } from './api.js';

// Schools and programmes are used by the header, footer and several pages,
// so each is fetched once per visit. A failed request is retried next time.
const cache = new Map();
function cached(url) {
  if (!cache.has(url)) cache.set(url, request(url).catch((err) => { cache.delete(url); throw err; }));
  return cache.get(url);
}

export const getSchools = () => cached('/api/schools');
export const getProgrammes = () => cached('/api/programmes');
export const getProgramme = (slug) => request(`/api/programmes/${encodeURIComponent(slug)}`);

export const getNews = (limit) => request(`/api/posts?type=news&limit=${limit}`);
export const getEvents = (limit) => request(`/api/posts?type=event&limit=${limit}`);
export const getCalendar = (limit) => request(`/api/calendar?limit=${limit}`);
export const getTestimonials = (limit) => request(`/api/testimonials?limit=${limit}`);

// Answers 201 when saved, or 202 with { verification: { token, email, … } } when the
// email address must first be confirmed with the emailed code
export const submitApplication = (data) => request('/api/applications', { method: 'POST', body: data });
export const verifyApplication = (data) => request('/api/applications/verify', { method: 'POST', body: data });
export const resendApplicationCode = (data) => request('/api/applications/verify/resend', { method: 'POST', body: data });
export const sendContactMessage = (data) => request('/api/contact', { method: 'POST', body: data });
export const subscribe = (data) => request('/api/newsletter', { method: 'POST', body: data });

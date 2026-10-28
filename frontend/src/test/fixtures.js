// Small sample of the API's data shapes, used by the component tests.
export const SCHOOLS = [
  { id: 1, slug: 'education', name: 'School of Education', description: 'Teacher training.', programme_count: 2 },
  { id: 2, slug: 'media-communication', name: 'School of Media and Communication', description: 'Journalism and PR.', programme_count: 1 },
];

export const PROGRAMMES = [
  { id: 4, slug: 'secondary-teaching', name: 'Secondary Teaching', level: 'Diploma', study_mode: 'Full time', description: 'Teaching methods for secondary schools.', entry_requirements: 'Grade 12 and NRC', school_slug: 'education', school_name: 'School of Education' },
  { id: 5, slug: 'primary-diploma', name: 'Primary Diploma', level: 'Diploma', study_mode: 'Full time', description: 'Primary teacher training.', entry_requirements: 'Grade 12 and NRC', school_slug: 'education', school_name: 'School of Education' },
  { id: 9, slug: 'journalism', name: 'Journalism', level: 'Diploma', study_mode: 'Full time', description: 'Reporting and editing.', entry_requirements: 'Grade 12 and NRC', school_slug: 'media-communication', school_name: 'School of Media and Communication' },
];

export const APPLICATIONS = [
  { id: 3, programme_id: 9, programme: 'Journalism', full_name: 'Taonga Zulu', phone: '+260955432109', nrc: '189302/67/1', email: 'taonga@example.com', intake: 'January 2027', status: 'pending', notes: null, reviewed_at: null, created_at: '2026-10-28 08:50:00' },
  { id: 2, programme_id: 4, programme: 'Secondary Teaching', full_name: 'Chisomo Phiri', phone: '+260968872190', nrc: '298102/10/1', email: null, intake: 'January 2027', status: 'accepted', notes: 'Checked', reviewed_at: '2026-10-28 09:00:00', created_at: '2026-10-27 08:50:00' },
  { id: 1, programme_id: 9, programme: 'Journalism', full_name: 'Mwamba Chilufya', phone: '+260971234567', nrc: '348921/11/1', email: 'mwamba@example.com', intake: 'January 2027', status: 'rejected', notes: null, reviewed_at: '2026-10-28 09:10:00', created_at: '2026-10-20 08:50:00' },
];

export const SUMMARY = {
  applications: { total: 3, pending: 1, accepted: 1, rejected: 1 },
  latestPending: [{ id: 3, full_name: 'Taonga Zulu', programme: 'Journalism', created_at: '2026-10-28 08:50:00' }],
  messages: 1,
  unreadMessages: 1,
  subscribers: 2,
  posts: 1,
  calendar: 0,
  testimonials: 0,
};

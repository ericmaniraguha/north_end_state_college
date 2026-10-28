// College details used across the site. Change contacts, the intake or social links here.

export const SITE = {
  name: 'North End College',
  tagline: 'Championing Quality Education',
  motto: 'Learn Today · Lead Tomorrow',
  intake: 'January 2027',
  address: ['Findeco House, Floor No. 17', 'Lusaka, Zambia'],
  phones: ['+260 771 413 910', '+260 977 494 707'], // both on WhatsApp
  email: '', // admissions email, shown everywhere once set
  social: { Facebook: '', Instagram: '', LinkedIn: '', YouTube: '', X: '' }, // profile URLs, shown once set
};

export const DEFAULT_DESCRIPTION = 'North End College in Lusaka, Zambia offers full-time diploma programmes in business, education, social sciences and media. Applications are open for the January 2027 intake.';

export const NAV = [
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
  { label: 'Academics', menu: 'academics', items: [['All Programmes', '/programmes']] }, // schools are added from the API
  { label: 'News & Events', items: [
    ['Latest News', '/news#news'],
    ['Upcoming Events', '/news#events'],
    ['Important Dates', '/news#dates'],
  ] },
  { label: 'Contact', href: '/contact' },
];

export const FEATURES = [
  ['cap', 'Qualified Lecturers', 'Learn from experienced, qualified academic staff.'],
  ['book', 'Practical Learning', 'Hands-on training that prepares you for real workplaces.'],
  ['people', 'Supportive Environment', 'Student services and mentoring through every stage.'],
  ['chart', 'Career Guidance', 'Advice and connections to help you plan your career.'],
  ['shield', 'A Brighter Future', 'Qualifications that open doors to further study and work.'],
];

export const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`;

export const waHref = (phone = SITE.phones[0], text = '') =>
  `https://wa.me/${phone.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

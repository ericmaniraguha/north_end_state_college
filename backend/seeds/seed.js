// Seeds schools, the programme list from the January 2027 intake poster, and a
// first news post. Safe to run repeatedly: existing rows are left alone.
const db = require('../db');

const schools = [
  ['business-management', 'School of Business and Management', 'Human resources, business, finance and accounting for careers in modern organisations.'],
  ['education', 'School of Education', 'Teacher training for early childhood, primary and secondary classrooms.'],
  ['social-sciences', 'School of Social Sciences and Public Administration', 'Social work and public administration for careers serving communities and government.'],
  ['media-communication', 'School of Media and Communication', 'Journalism and public relations for print, broadcast and digital media.'],
];

// [slug, name, school slug, description]
const programmes = [
  ['human-resources-management', 'Diploma in Human Resources Management', 'business-management', 'Manage people, recruitment, employee relations and labour law in modern organisations.'],
  ['business', 'Diploma in Business Courses', 'business-management', 'Core business skills in management, marketing, entrepreneurship and office administration.'],
  ['finance-accounting', 'Finance and Accounting', 'business-management', 'Bookkeeping, financial reporting, auditing and business finance.'],
  ['secondary-teaching', 'Secondary Teaching', 'education', 'Subject knowledge and teaching methods for secondary school classrooms.'],
  ['primary-diploma', 'Primary Diploma', 'education', 'Teacher training for primary education with supervised school placements.'],
  ['early-childhood-education', 'Early Childhood Education', 'education', 'Child development, play-based learning and early years classroom practice.'],
  ['social-work', 'Social Work', 'social-sciences', 'Prepare to support individuals, families and communities through casework and social policy.'],
  ['public-administration', 'Public Administration', 'social-sciences', 'Government structures, policy implementation and public sector management.'],
  ['journalism', 'Journalism', 'media-communication', 'Reporting, writing, editing and digital media production for print, broadcast and online.'],
  ['public-relations', 'Public Relations', 'media-communication', 'Communication strategy, media relations and reputation management for organisations.'],
];

const insertSchool = db.prepare(
  'INSERT OR IGNORE INTO schools (slug, name, description, sort_order) VALUES (?, ?, ?, ?)'
);
const insertProgramme = db.prepare(
  `INSERT OR IGNORE INTO programmes (slug, name, level, description, entry_requirements)
   VALUES (?, ?, 'Diploma', ?, ?)`
);
const assignSchool = db.prepare(
  `UPDATE programmes SET school_id = (SELECT id FROM schools WHERE slug = ?)
   WHERE slug = ? AND school_id IS NULL`
);

let addedSchools = 0;
schools.forEach(([slug, name, description], i) => {
  addedSchools += insertSchool.run(slug, name, description, i + 1).changes;
});

let addedProgrammes = 0;
for (const [slug, name, school, description] of programmes) {
  addedProgrammes += insertProgramme.run(slug, name, description, 'Grade 12 certificate and National Registration Card (NRC).').changes;
  assignSchool.run(school, slug);
}

const intakeTitle = 'Applications open for the January 2027 intake';
if (!db.prepare('SELECT 1 FROM posts WHERE title = ?').get(intakeTitle)) {
  db.prepare('INSERT INTO posts (type, title, summary, body) VALUES (?, ?, ?, ?)').run(
    'news',
    intakeTitle,
    'Applications are now open for full-time diploma programmes starting in January 2027.',
    'North End College is accepting applications for the January 2027 full-time intake across all ten diploma programmes.\n\n'
      + 'To apply, send your Grade 12 results and NRC on WhatsApp or apply online, and receive an instant acceptance letter once your documents are verified.'
  );
}

console.log(`Seeded ${addedSchools} new school(s) and ${addedProgrammes} new programme(s).`);

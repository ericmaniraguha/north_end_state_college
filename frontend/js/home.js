// Home page: schools, programme showcase, counters, news, events, dates and testimonials.

const showcase = document.getElementById('programme-showcase');
const tabs = document.getElementById('programme-tabs');

function schoolCard(s) {
  return el('article', { className: 'school-card' },
    el('span', { className: 'school-count' }, `${s.programme_count} programme${s.programme_count === 1 ? '' : 's'}`),
    el('h3', {}, s.name),
    el('p', {}, s.description),
    el('div', { className: 'school-actions' },
      el('a', { href: `/programmes?school=${s.slug}`, className: 'link-arrow light' }, 'Explore'),
      el('a', { href: '/admissions#apply', className: 'btn btn-accent btn-sm' }, 'Apply now')));
}

// "All" shows a preview of six; a school tab shows all of that school's programmes.
function showProgrammes(programmes, school) {
  const list = school ? programmes.filter((p) => p.school_slug === school) : programmes.slice(0, 6);
  showcase.replaceChildren(...list.map(programmeCard));
  tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.school === school));
}

function setStat(name, value) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach((node) => {
    if (node.classList.contains('counter')) whenVisible(node, () => countUp(node, value));
    else node.textContent = value;
  });
}

async function loadAcademics() {
  try {
    const [schools, programmes] = await Promise.all([getSchools(), getProgrammes()]);
    document.getElementById('schools-grid').replaceChildren(...schools.map(schoolCard));
    tabs.replaceChildren(
      el('button', { type: 'button', role: 'tab', 'data-school': '' }, 'All'),
      ...schools.map((s) => el('button', { type: 'button', role: 'tab', 'data-school': s.slug }, s.name)));
    tabs.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) showProgrammes(programmes, button.dataset.school);
    });
    showProgrammes(programmes, '');
    setStat('programmes', programmes.length);
    setStat('schools', schools.length);
  } catch {
    showcase.replaceChildren(el('p', { className: 'muted' }, 'Programmes could not be loaded. Please try again later.'));
  }
}

async function loadUpdates() {
  const safe = (request) => request.catch(() => []);
  const [news, events, dates, voices] = await Promise.all([
    safe(api('/api/posts?type=news&limit=3')),
    safe(api('/api/posts?type=event&limit=3')),
    safe(api('/api/calendar?limit=4')),
    safe(api('/api/testimonials?limit=3')),
  ]);

  const newsGrid = document.getElementById('home-news');
  newsGrid.replaceChildren(...news.map((p) => newsCard(p)));
  newsGrid.hidden = !news.length;
  document.getElementById('home-events').replaceChildren(...events.map(eventItem));
  document.getElementById('home-events-block').hidden = !events.length;
  document.getElementById('home-dates').replaceChildren(...dates.map(dateItem));
  document.getElementById('home-dates-block').hidden = !dates.length;
  document.getElementById('news-layout').classList.toggle('single', !news.length || !(events.length || dates.length));
  document.getElementById('news').hidden = !(news.length || events.length || dates.length);

  document.getElementById('voices-list').replaceChildren(...voices.map(testimonialCard));
  document.getElementById('voices').hidden = !voices.length;
}

loadAcademics();
loadUpdates();

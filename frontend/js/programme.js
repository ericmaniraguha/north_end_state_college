// Programme detail page, served at /programmes/:slug.

const $ = (id) => document.getElementById(id);
const slug = location.pathname.split('/')[2] || '';

(async () => {
  try {
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Bad slug');
    const p = await api(`/api/programmes/${slug}`);

    document.title = `${p.name} | ${SITE.name}`;
    document.querySelector('meta[name="description"]').content = `${p.name} at ${SITE.name}, Lusaka, Zambia. ${p.description}`;
    $('crumb-name').textContent = p.name;
    $('programme-name').textContent = p.name;
    $('programme-school').textContent = p.school_name || '';
    $('fact-level').textContent = p.level;
    $('fact-mode').textContent = p.study_mode;
    $('fact-school').textContent = p.school_name || '—';
    $('fact-intake').textContent = SITE.intake;
    $('programme-description').textContent = p.description;
    $('programme-requirements').textContent = p.entry_requirements;
    document.querySelectorAll('[data-apply-link]').forEach((a) => { a.href = `/admissions?programme=${p.slug}#apply`; });

    if (p.related.length) {
      $('related-grid').replaceChildren(...p.related.map(programmeCard));
      $('related').hidden = false;
    }
    $('programme-content').hidden = false;

    const schema = el('script', { type: 'application/ld+json' });
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: p.name,
      description: p.description,
      provider: { '@type': 'CollegeOrUniversity', name: SITE.name },
    });
    document.head.append(schema);
  } catch {
    document.title = `Programme not found | ${SITE.name}`;
    $('crumb-name').textContent = 'Not found';
    $('programme-name').textContent = 'Programme not found';
    $('not-found').hidden = false;
  }
})();

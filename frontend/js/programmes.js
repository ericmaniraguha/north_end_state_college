// Programmes page: filter by school and search by name or description.

const schoolSelect = document.getElementById('filter-school');
const search = document.getElementById('filter-search');
const grid = document.getElementById('programme-grid');
const count = document.getElementById('programme-count');
let programmes = [];

function render() {
  const school = schoolSelect.value;
  const q = search.value.trim().toLowerCase();
  const list = programmes.filter((p) => (!school || p.school_slug === school)
    && (!q || `${p.name} ${p.description} ${p.school_name || ''}`.toLowerCase().includes(q)));

  count.textContent = `${list.length} programme${list.length === 1 ? '' : 's'}`;
  renderList(grid, list, programmeCard, 'No programmes match your search.');

  const url = new URL(location.href);
  if (school) url.searchParams.set('school', school);
  else url.searchParams.delete('school');
  history.replaceState(null, '', url);
}

(async () => {
  try {
    const [schools, list] = await Promise.all([getSchools(), getProgrammes()]);
    programmes = list;
    schoolSelect.append(...schools.map((s) => el('option', { value: s.slug }, s.name)));
    schoolSelect.value = new URLSearchParams(location.search).get('school') || '';
    render();
  } catch {
    renderList(grid, null);
    count.textContent = '';
  }
})();

schoolSelect.addEventListener('change', render);
search.addEventListener('input', render);

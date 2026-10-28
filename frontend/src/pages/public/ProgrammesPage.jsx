import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ProgrammeCard } from '../../components/cards.jsx';
import { CtaBand, PageHero } from '../../components/sections.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { getProgrammes, getSchools } from '../../services/publicApi.js';

export default function ProgrammesPage() {
  usePageMeta('Programmes | North End College, Lusaka', 'Full-time diploma programmes at North End College, Lusaka: business, finance, human resources, education, social work, public administration, journalism and public relations.');
  const catalogue = useApi(() => Promise.all([getSchools(), getProgrammes()]), []);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const [schools, programmes] = catalogue.data || [[], []];
  const requested = params.get('school') || '';
  const school = schools.some((s) => s.slug === requested) ? requested : '';
  const q = query.trim().toLowerCase();
  const list = programmes.filter((p) => (!school || p.school_slug === school)
    && (!q || `${p.name} ${p.description} ${p.school_name || ''}`.toLowerCase().includes(q)));

  const chooseSchool = (slug) => setParams(slug ? { school: slug } : {}, { replace: true });

  return (
    <>
      <PageHero crumbs={[['Programmes']]} title="Our Programmes">
        <p>Full-time diploma programmes for the January 2027 intake, with descriptions and entry requirements.</p>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="filters">
            <label>School
              <select value={school} onChange={(e) => chooseSchool(e.target.value)}>
                <option value="">All schools</option>
                {schools.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </label>
            <label>Search
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. teaching, accounting" />
            </label>
          </div>
          <p className="result-count" aria-live="polite">
            {catalogue.data && `${list.length} programme${list.length === 1 ? '' : 's'}`}
          </p>
          <div className="programme-grid">
            {catalogue.loading && <p className="muted">Loading programmes…</p>}
            {catalogue.error && <p className="muted">This could not be loaded. Please try again later.</p>}
            {catalogue.data && !list.length && <p className="muted">No programmes match your search.</p>}
            {list.map((p) => <ProgrammeCard key={p.id} programme={p} />)}
          </div>
        </div>
      </section>

      <CtaBand eyebrow="Need help choosing?" title="Talk to our admissions team" phonesLabel="Call or WhatsApp:">
        <Link to="/admissions#apply" className="btn btn-primary">Apply online</Link>
        <Link to="/admissions#requirements" className="btn btn-outline-dark">Entry requirements</Link>
      </CtaBand>
    </>
  );
}

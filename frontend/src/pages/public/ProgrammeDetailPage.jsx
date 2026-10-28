import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ProgrammeCard } from '../../components/cards.jsx';
import { WhatsAppBox } from '../../components/contact.jsx';
import { PageHero } from '../../components/sections.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { getProgramme } from '../../services/publicApi.js';
import { SITE } from '../../config/site.js';

export default function ProgrammeDetailPage() {
  const { slug } = useParams();
  const { data: p, error, loading } = useApi(() => getProgramme(slug), [slug]);

  usePageMeta(
    p ? `${p.name} | ${SITE.name}` : error ? `Programme not found | ${SITE.name}` : `Programme | ${SITE.name}, Lusaka`,
    p ? `${p.name} at ${SITE.name}, Lusaka, Zambia. ${p.description}` : undefined,
  );

  // Course structured data for search engines
  useEffect(() => {
    if (!p) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: p.name,
      description: p.description,
      provider: { '@type': 'CollegeOrUniversity', name: SITE.name },
    });
    document.head.append(script);
    return () => script.remove();
  }, [p]);

  const applyLink = `/admissions?programme=${slug}#apply`;
  const title = p ? p.name : error ? 'Programme not found' : 'Loading…';

  return (
    <>
      <PageHero crumbs={[['Programmes', '/programmes'], [p ? p.name : error ? 'Not found' : '…']]} title={title}>
        <p>{p?.school_name}</p>
      </PageHero>

      <section className="section">
        <div className="container">
          {p && (
            <div className="detail-layout">
              <div className="detail-body">
                <dl className="facts">
                  <div><dt>Award</dt><dd>{p.level}</dd></div>
                  <div><dt>Study mode</dt><dd>{p.study_mode}</dd></div>
                  <div><dt>School</dt><dd>{p.school_name || '—'}</dd></div>
                  <div><dt>Next intake</dt><dd>{SITE.intake}</dd></div>
                </dl>
                <h2>Overview</h2>
                <p>{p.description}</p>
                <h2>Entry requirements</h2>
                <p>{p.entry_requirements}</p>
                <h2>How to apply</h2>
                <p>Apply online, or send your Grade 12 results and NRC to our admissions team on WhatsApp. You'll receive an instant acceptance letter once your documents are verified.</p>
                <Link to={applyLink} className="link-arrow">Start your application</Link>
              </div>
              <aside className="card apply-card">
                <h3>Apply for this programme</h3>
                <p>Applications are open for the {SITE.intake} full-time intake.</p>
                <Link to={applyLink} className="btn btn-primary">Apply now</Link>
                <WhatsAppBox />
              </aside>
            </div>
          )}
          {error && (
            <div>
              <p>We couldn't find that programme. It may have been renamed or is no longer offered.</p>
              <Link to="/programmes" className="btn btn-primary">See all programmes</Link>
            </div>
          )}
          {loading && <p className="muted">Loading…</p>}
        </div>
      </section>

      {p?.related.length > 0 && (
        <section className="section section-light">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow dark">Same school</p>
              <h2>Related programmes</h2>
            </div>
            <div className="programme-grid">
              {p.related.map((r) => <ProgrammeCard key={r.id} programme={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

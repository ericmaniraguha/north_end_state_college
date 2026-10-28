import { useState } from 'react';
import { Link } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { DateItem, EventItem, NewsCard, ProgrammeCard, TestimonialCard } from '../../components/cards.jsx';
import { ContactList, WhatsAppBox } from '../../components/contact.jsx';
import { Counter, CtaBand, Features } from '../../components/sections.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { getCalendar, getEvents, getNews, getProgrammes, getSchools, getTestimonials } from '../../services/publicApi.js';
import { DEFAULT_DESCRIPTION } from '../../config/site.js';
import { cx } from '../../utils/format.js';

function SchoolCard({ school: s }) {
  return (
    <article className="school-card">
      <span className="school-count">{s.programme_count} programme{s.programme_count === 1 ? '' : 's'}</span>
      <h3>{s.name}</h3>
      <p>{s.description}</p>
      <div className="school-actions">
        <Link to={`/programmes?school=${s.slug}`} className="link-arrow light">Explore</Link>
        <Link to="/admissions#apply" className="btn btn-accent btn-sm">Apply now</Link>
      </div>
    </article>
  );
}

const safe = (request) => request.catch(() => []);

export default function HomePage() {
  usePageMeta('North End College | Championing Quality Education in Lusaka, Zambia', DEFAULT_DESCRIPTION);
  const catalogue = useApi(() => Promise.all([getSchools(), getProgrammes()]), []);
  const updates = useApi(() => Promise.all([safe(getNews(3)), safe(getEvents(3)), safe(getCalendar(4)), safe(getTestimonials(3))]), []);
  const [school, setSchool] = useState('');

  const [schools, programmes] = catalogue.data || [[], []];
  const [news, events, dates, voices] = updates.data || [[], [], [], []];
  // "All" shows a preview of six; a school tab shows all of that school's programmes
  const showcase = school ? programmes.filter((p) => p.school_slug === school) : programmes.slice(0, 6);
  const hasUpdates = news.length + events.length + dates.length > 0;
  const singleColumn = !news.length || !(events.length || dates.length);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Welcome to North End College</p>
            <h1>Your gateway to <span>quality education</span> in Lusaka</h1>
            <p className="lead">Full-time diploma programmes in business, education, social sciences and media, taught by qualified lecturers with a focus on practical learning.</p>
            <div className="intake-badge">
              <span>Applications open</span>
              <strong>January Intake · Full Time 2027</strong>
            </div>
            <div className="hero-actions">
              <Link to="/admissions#apply" className="btn btn-accent">Apply now</Link>
              <Link to="/programmes" className="btn btn-outline">Explore programmes</Link>
            </div>
          </div>
          <aside className="hero-card">
            <h2>How to apply</h2>
            <ol>
              <li>Choose your programme</li>
              <li>Send your <strong>Grade 12 results</strong> and <strong>NRC</strong></li>
              <li>Get an instant acceptance letter</li>
            </ol>
            <WhatsAppBox />
          </aside>
        </div>
      </section>

      <section className="quick-links" aria-label="Quick links">
        <div className="container quick-grid">
          <Link className="quick-tile" to="/programmes">
            <span className="icon-badge"><Icon name="cap" /></span>
            <span><strong>{programmes.length || 10} Programmes</strong><small>Find your diploma</small></span>
          </Link>
          <Link className="quick-tile" to="/admissions#how-to-apply">
            <span className="icon-badge"><Icon name="book" /></span>
            <span><strong>How to Apply</strong><small>Simple steps to join</small></span>
          </Link>
          <Link className="quick-tile" to="/contact#campus">
            <span className="icon-badge"><Icon name="pin" /></span>
            <span><strong>Our Campus</strong><small>Findeco House, Lusaka</small></span>
          </Link>
          <Link className="quick-tile" to="/contact">
            <span className="icon-badge"><Icon name="whatsapp" /></span>
            <span><strong>Talk to Admissions</strong><small>Call or WhatsApp us</small></span>
          </Link>
        </div>
      </section>

      <section id="schools" className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">Our Schools</p>
            <h2>Study in a school that fits your goals</h2>
            <p>Our diploma programmes are organised into four schools, each focused on careers in demand in Zambia.</p>
          </div>
          <div className="school-grid">
            {schools.map((s) => <SchoolCard key={s.slug} school={s} />)}
          </div>
        </div>
      </section>

      <section id="programmes" className="section section-light">
        <div className="container">
          <div className="section-head row-head">
            <div>
              <p className="eyebrow dark">Academic Excellence</p>
              <h2>Find our programmes</h2>
            </div>
            <Link to="/programmes" className="link-arrow">Browse all programmes</Link>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter by school">
            {schools.length > 0 && [{ slug: '', name: 'All' }, ...schools].map((s) => (
              <button key={s.slug || 'all'} type="button" role="tab" aria-selected={school === s.slug} onClick={() => setSchool(s.slug)}>{s.name}</button>
            ))}
          </div>
          <div className="programme-grid" aria-live="polite">
            {catalogue.loading && <p className="muted">Loading programmes…</p>}
            {catalogue.error && <p className="muted">Programmes could not be loaded. Please try again later.</p>}
            {showcase.map((p) => <ProgrammeCard key={p.id} programme={p} />)}
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container split">
          <div>
            <p className="eyebrow dark">About North End College</p>
            <h2>Championing quality education in Zambia</h2>
            <p>North End College is based at Findeco House in the heart of Lusaka. We combine academic excellence with practical learning, so our graduates leave ready for the workplace and for further study.</p>
            <p>Our qualified lecturers, supportive environment and career guidance help every student move confidently towards a brighter future.</p>
            <Link to="/about#story" className="link-arrow">Our story</Link>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><Counter value={catalogue.data && programmes.length} fallback={10} /><span>Diploma programmes</span></div>
            <div className="stat-card"><Counter value={catalogue.data && schools.length} fallback={4} /><span>Academic schools</span></div>
            <div className="stat-card"><strong>Full time</strong><span>Study mode</span></div>
            <div className="stat-card"><strong>2027</strong><span>January intake open</span></div>
          </div>
        </div>
      </section>

      <section id="why" className="section section-green">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Why North End College</p>
            <h2>Academic excellence, practical learning</h2>
            <p>Everything we do is built around helping you learn today and lead tomorrow.</p>
          </div>
          <Features />
        </div>
      </section>

      <section id="news" className="section" hidden={!hasUpdates}>
        <div className="container">
          <div className="section-head row-head">
            <div>
              <p className="eyebrow dark">College Updates</p>
              <h2>Latest news and events</h2>
            </div>
            <Link to="/news" className="link-arrow">View all news and events</Link>
          </div>
          <div className={cx('news-layout', singleColumn && 'single')}>
            <div className="news-grid" hidden={!news.length}>
              {news.map((post) => <NewsCard key={post.id} post={post} />)}
            </div>
            <aside>
              <div className="side-block" hidden={!events.length}>
                <h3><Icon name="calendar" />Upcoming events</h3>
                <div>{events.map((e) => <EventItem key={e.id} event={e} />)}</div>
              </div>
              <div className="side-block" hidden={!dates.length}>
                <h3>Important dates</h3>
                <ul className="date-list">{dates.map((d) => <DateItem key={d.id} item={d} />)}</ul>
                <Link to="/news#dates" className="link-arrow">Full calendar</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="voices" className="section section-light" hidden={!voices.length}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">Student Voices</p>
            <h2>Hear from our students</h2>
          </div>
          <div className="voices">
            {voices.map((t) => <TestimonialCard key={t.id} testimonial={t} />)}
          </div>
        </div>
      </section>

      <CtaBand eyebrow="January 2027 intake · Applications open" title="Ready to join the North End College community?">
        <Link to="/admissions#apply" className="btn btn-primary">Apply online</Link>
        <Link to="/admissions#requirements" className="btn btn-outline-dark">Entry requirements</Link>
      </CtaBand>

      <section id="get-in-touch" className="section section-light">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">Get in touch</p>
            <h2>We're here to help</h2>
            <p>Visit our campus in Lusaka or reach the admissions team by phone or WhatsApp.</p>
          </div>
          <div className="contact-cards"><ContactList /></div>
        </div>
      </section>
    </>
  );
}

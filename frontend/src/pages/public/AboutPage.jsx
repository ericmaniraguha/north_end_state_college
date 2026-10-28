import { Link } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { CtaBand, Features, PageHero } from '../../components/sections.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';

const SUPPORT = [
  ['whatsapp', 'Admissions support', 'Our team guides you from choosing a programme to receiving your acceptance letter, in person or on WhatsApp.'],
  ['chart', 'Career guidance', "Advice to help you plan your next step after your diploma, whether that's work or further study."],
  ['people', 'Supportive environment', 'Lecturers and staff who know their students and support them throughout their studies.'],
];

export default function AboutPage() {
  usePageMeta('About Us | North End College, Lusaka', 'About North End College in Lusaka, Zambia: our story, why students choose us, and how we support them.');

  return (
    <>
      <PageHero crumbs={[['About']]} title="About North End College">
        <p>Championing quality education in Lusaka, Zambia.</p>
      </PageHero>

      <section id="story" className="section">
        <div className="container split top">
          <div>
            <p className="eyebrow dark">Our Story</p>
            <h2>Learn today, lead tomorrow</h2>
            {/* Replace with the college's own history: founding year, accreditation and leadership. */}
            <p>North End College is a college in Lusaka, Zambia, located at Findeco House. We offer full-time diploma programmes in business and management, education, social sciences and public administration, and media and communication.</p>
            <p>Our approach combines academic excellence with practical learning. Students are taught by qualified lecturers, supported throughout their studies, and guided towards careers and further study.</p>
            <div className="actions">
              <Link to="/programmes" className="btn btn-primary">Explore programmes</Link>
              <Link to="/admissions" className="btn btn-outline-dark">Admissions</Link>
            </div>
          </div>
          <div>
            <div className="promise"><span>Our promise</span><strong>Championing Quality Education</strong></div>
            <div className="promise"><span>Our motto</span><strong>Learn Today · Lead Tomorrow</strong></div>
          </div>
        </div>
      </section>

      <section id="why" className="section section-green">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Why North End College</p>
            <h2>What sets us apart</h2>
          </div>
          <Features />
        </div>
      </section>

      <section id="support" className="section section-light">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">Student Support</p>
            <h2>Supported from application to graduation</h2>
          </div>
          <div className="card-grid">
            {SUPPORT.map(([icon, title, text]) => (
              <article key={title} className="info-card">
                <span className="icon-badge"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand eyebrow="January 2027 intake · Applications open" title="Start your journey with us">
        <Link to="/admissions#apply" className="btn btn-primary">Apply online</Link>
        <Link to="/contact" className="btn btn-outline-dark">Contact us</Link>
      </CtaBand>
    </>
  );
}

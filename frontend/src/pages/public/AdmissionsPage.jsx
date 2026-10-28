import { Link } from 'react-router';
import { PhoneLinks, WhatsAppBox } from '../../components/contact.jsx';
import { ApplicationForm } from '../../components/forms.jsx';
import { PageHero } from '../../components/sections.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { SITE } from '../../config/site.js';

const FAQ = [
  ['How do I apply?', `Apply using the online form on this page, or send your Grade 12 results and NRC to our admissions team on WhatsApp (${SITE.phones.join(' or ')}).`],
  ['What are the entry requirements?', 'You need a Grade 12 certificate or results and a National Registration Card (NRC).'],
  ['When does the next intake start?', `The next intake is ${SITE.intake}, for full-time study.`],
  ['How quickly will I hear back?', "Once your documents are verified, you'll receive an instant acceptance letter."],
  ['How much are the fees?', 'Please contact admissions by phone or WhatsApp for the current fees for your programme.'],
];

export default function AdmissionsPage() {
  usePageMeta('Admissions | North End College, Lusaka', 'Apply to North End College in Lusaka, Zambia for the January 2027 full-time intake. Entry requirements: Grade 12 results and NRC.');

  return (
    <>
      <PageHero crumbs={[['Admissions']]} title="Admissions">
        <p>Applications are open for the {SITE.intake} full-time intake. Here's everything you need to apply to North End College.</p>
      </PageHero>

      <section id="overview" className="section">
        <div className="container split">
          <div>
            <p className="eyebrow dark">Admissions Overview</p>
            <h2>{SITE.intake} intake</h2>
            <p>All of our diploma programmes are studied full time at our Lusaka campus. Applying is quick: once we've verified your documents, you'll receive an instant acceptance letter.</p>
            <dl className="facts">
              <div><dt>Intake</dt><dd>{SITE.intake}</dd></div>
              <div><dt>Study mode</dt><dd>Full time</dd></div>
              <div><dt>Campus</dt><dd>Findeco House, Lusaka</dd></div>
            </dl>
          </div>
          <div className="card">
            <h3>Apply on WhatsApp</h3>
            <p className="muted">Send your Grade 12 results and NRC to either number below to get your acceptance letter.</p>
            <WhatsAppBox />
          </div>
        </div>
      </section>

      <section id="how-to-apply" className="section section-light">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">How to Apply</p>
            <h2>Four simple steps</h2>
          </div>
          <ol className="steps">
            <li><h3>Choose your programme</h3><p>Browse our <Link to="/programmes">diploma programmes</Link> across four schools.</p></li>
            <li><h3>Apply online or on WhatsApp</h3><p>Complete the <Link to="/admissions#apply">online form</Link> or message our admissions team.</p></li>
            <li><h3>Send your documents</h3><p>Share your Grade 12 results and National Registration Card (NRC).</p></li>
            <li><h3>Get your acceptance letter</h3><p>Receive an instant acceptance letter once your documents are verified.</p></li>
          </ol>
        </div>
      </section>

      <section id="requirements" className="section">
        <div className="container split top">
          <div>
            <p className="eyebrow dark">Entry Requirements</p>
            <h2>What you need</h2>
            <ul className="checklist">
              <li>Grade 12 certificate or results</li>
              <li>National Registration Card (NRC)</li>
              <li>Availability for full-time study from {SITE.intake}</li>
            </ul>
            <p className="muted">Not sure if you qualify? Call or WhatsApp admissions on <PhoneLinks />.</p>
          </div>
          <ApplicationForm />
        </div>
      </section>

      <section id="faq" className="section section-light">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">FAQs</p>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq">
            {FAQ.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
            <details>
              <summary>Where is the campus?</summary>
              <p>Our campus is at Findeco House, Floor No. 17, Lusaka, Zambia. <Link to="/contact#campus">See the map</Link>.</p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}

import { ContactList } from '../../components/contact.jsx';
import { ContactForm } from '../../components/forms.jsx';
import { PageHero } from '../../components/sections.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { SITE } from '../../config/site.js';

export default function ContactPage() {
  usePageMeta('Contact Us | North End College, Lusaka', `Contact North End College at Findeco House, Floor 17, Lusaka, Zambia. Call or WhatsApp ${SITE.phones.join(' or ')}.`);

  return (
    <>
      <PageHero crumbs={[['Contact']]} title="Contact Us">
        <p>Visit us in Lusaka, call, or send us a message. Our admissions team is happy to help.</p>
      </PageHero>

      <section className="section">
        <div className="container split top">
          <div>
            <p className="eyebrow dark">Get in touch</p>
            <h2>{SITE.name}</h2>
            <ContactList />
          </div>
          <ContactForm />
        </div>
      </section>

      <section id="campus" className="section section-light">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow dark">Our Campus</p>
            <h2>Findeco House, Lusaka</h2>
            <p>Floor No. 17, Findeco House, Lusaka, Zambia.</p>
          </div>
          <iframe
            className="map"
            title="Map showing Findeco House, Lusaka, Zambia"
            src="https://www.google.com/maps?q=Findeco+House,+Lusaka,+Zambia&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}

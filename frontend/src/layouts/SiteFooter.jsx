import { Link } from 'react-router';
import { Brand } from './SiteHeader.jsx';
import { NewsletterForm } from '../components/forms.jsx';
import { useApi } from '../hooks/useApi.js';
import { getSchools } from '../services/publicApi.js';
import { SITE, telHref } from '../config/site.js';

export default function SiteFooter() {
  const { data: schools = [] } = useApi(getSchools, []);
  const socials = Object.entries(SITE.social).filter(([, url]) => url);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>{SITE.address[0]}<br />{SITE.address[1]}</p>
          <p>
            {SITE.phones.map((p, i) => <span key={p}>{i > 0 && <br />}<a href={telHref(p)}>{p}</a></span>)}
          </p>
          {SITE.email && <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>}
        </div>
        <div>
          <h4>About</h4>
          <ul>
            <li><Link to="/about#story">Our story</Link></li>
            <li><Link to="/about#why">Why North End College</Link></li>
            <li><Link to="/news">News and events</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </div>
        <div>
          <h4>Admissions</h4>
          <ul>
            <li><Link to="/admissions#how-to-apply">How to apply</Link></li>
            <li><Link to="/admissions#requirements">Entry requirements</Link></li>
            <li><Link to="/admissions#faq">FAQs</Link></li>
            <li><Link to="/admissions#apply">Apply online</Link></li>
          </ul>
        </div>
        <div>
          <h4>Schools</h4>
          <ul>
            {schools.map((s) => <li key={s.slug}><Link to={`/programmes?school=${s.slug}`}>{s.name}</Link></li>)}
            <li><Link to="/programmes">All programmes</Link></li>
          </ul>
        </div>
        <div className="footer-news">
          <h4>Newsletter</h4>
          <p>Be the first to get North End College updates.</p>
          <NewsletterForm />
          {socials.length > 0 && (
            <ul className="socials">
              {socials.map(([name, url]) => <li key={name}><a href={url} target="_blank" rel="noopener">{name}</a></li>)}
            </ul>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span className="motto">{SITE.motto}</span>
        </div>
      </div>
    </footer>
  );
}

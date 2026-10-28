import { Link } from 'react-router';
import { PageHero } from '../../components/sections.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function NotFoundPage() {
  usePageMeta('Page not found | North End College');

  return (
    <>
      <PageHero crumbs={[['Page not found']]} title="Page not found">
        <p>The page you're looking for doesn't exist or has moved.</p>
      </PageHero>
      <section className="section">
        <div className="container actions">
          <Link to="/" className="btn btn-primary">Go to the home page</Link>
          <Link to="/programmes" className="btn btn-outline-dark">Browse programmes</Link>
          <Link to="/contact" className="btn btn-outline-dark">Contact us</Link>
        </div>
      </section>
    </>
  );
}

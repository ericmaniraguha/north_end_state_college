import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import SiteHeader, { TopBar } from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import Icon from '../components/Icon.jsx';
import { SITE, waHref } from '../config/site.js';

// Scrolls to the top on a new page, or to the element named in the #hash. Content loaded
// from the API may not exist yet, so the hash target is retried for about a second.
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }
    let frame;
    let tries = 0;
    const attempt = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView();
      else if (tries++ < 60) frame = requestAnimationFrame(attempt);
    };
    attempt();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
}

export default function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <TopBar />
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
      <a className="wa-float" href={waHref(SITE.phones[0], 'Hello North End College, I would like to ask about admissions.')} target="_blank" rel="noopener">
        <Icon name="whatsapp" />
        <span>Ask a question</span>
      </a>
      <ScrollManager />
    </>
  );
}

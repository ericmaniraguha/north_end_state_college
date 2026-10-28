import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Icon from '../components/Icon.jsx';
import { useApi } from '../hooks/useApi.js';
import { getSchools } from '../services/publicApi.js';
import { NAV, SITE, telHref, waHref } from '../config/site.js';
import { cx } from '../utils/format.js';

// Index of the top-level menu item for the current page. Direct links win over dropdown
// entries, so /contact highlights "Contact" rather than "About > Our Campus".
function activeNavIndex(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const base = (href) => href.split(/[?#]/)[0];
  const matches = (href) => base(href) === path || (base(href) !== '/' && path.startsWith(`${base(href)}/`));
  const direct = NAV.findIndex((item) => item.href && matches(item.href));
  return direct !== -1 ? direct : NAV.findIndex((item) => item.items?.some(([, href]) => matches(href)));
}

export function Brand() {
  return (
    <Link to="/" className="brand">
      <img src="/img/logo.png" alt="" width="60" height="60" />
      <span className="brand-text"><strong>{SITE.name}</strong><small>{SITE.tagline}</small></span>
    </Link>
  );
}

export function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <Link className="topbar-announce" to="/admissions#apply">
          <strong>{SITE.intake} intake:</strong> applications now open <span aria-hidden="true">→</span>
        </Link>
        <div className="topbar-links">
          <a href={telHref(SITE.phones[0])}><Icon name="phone" />{SITE.phones[0]}</a>
          <a href={waHref()} target="_blank" rel="noopener"><Icon name="whatsapp" />WhatsApp</a>
          <span><Icon name="pin" />{SITE.address[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const location = useLocation();
  const { data: schools = [] } = useApi(getSchools, []);
  const [navOpen, setNavOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const active = activeNavIndex(location.pathname);

  const closeAll = () => {
    setNavOpen(false);
    setOpenMenu(null);
  };

  useEffect(closeAll, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (e) => { if (!e.target.closest('.has-menu')) setOpenMenu(null); };
    const onKey = (e) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="container nav">
        <Brand />
        <button type="button" className="nav-toggle" aria-expanded={navOpen} aria-controls="main-nav" aria-label="Menu" onClick={() => setNavOpen((o) => !o)}>
          <span /><span /><span />
        </button>
        <nav className={cx('main-nav', navOpen && 'open')} id="main-nav" aria-label="Main" onClick={(e) => { if (e.target.closest('a')) closeAll(); }}>
          <ul className="nav-list">
            {NAV.map((item, i) => (item.href ? (
              <li key={item.label}>
                <Link className={cx('nav-link', active === i && 'active')} to={item.href}>{item.label}</Link>
              </li>
            ) : (
              <li key={item.label} className={cx('has-menu', openMenu === i && 'open')}>
                <button
                  type="button"
                  className={cx('nav-link nav-trigger', active === i && 'active')}
                  aria-expanded={openMenu === i}
                  aria-controls={`menu-${i}`}
                  onClick={() => setOpenMenu((m) => (m === i ? null : i))}
                >
                  {item.label}<Icon name="chevron" className="icon chev" />
                </button>
                <ul className="dropdown" id={`menu-${i}`}>
                  {item.menu === 'academics' && schools.length > 0 && (
                    <>
                      <li className="menu-label">Schools</li>
                      {schools.map((s) => <li key={s.slug}><Link to={`/programmes?school=${s.slug}`}>{s.name}</Link></li>)}
                      <li className="divider" role="separator" />
                    </>
                  )}
                  {item.items.map(([label, href]) => <li key={href}><Link to={href}>{label}</Link></li>)}
                </ul>
              </li>
            )))}
          </ul>
          <Link to="/admissions#apply" className="btn btn-accent btn-sm nav-cta">Apply now</Link>
        </nav>
      </div>
    </header>
  );
}

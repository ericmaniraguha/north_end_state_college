import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Icon from './Icon.jsx';
import { PhoneLinks } from './contact.jsx';
import { FEATURES } from '../config/site.js';

// Green banner at the top of inner pages. crumbs: [[label, path?], …] after "Home".
export function PageHero({ crumbs = [], title, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map(([label, to]) => (to ? <Link key={label} to={to}>{label}</Link> : <span key={label}>{label}</span>))}
        </nav>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}

// Yellow call-to-action band with the admissions phone numbers; children are the buttons.
export function CtaBand({ eyebrow, title, phonesLabel = 'Call or WhatsApp admissions:', children }) {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{phonesLabel} <PhoneLinks /></p>
        </div>
        <div className="cta-actions">{children}</div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <ul className="features">
      {FEATURES.map(([icon, title, text]) => (
        <li key={title}>
          <Icon name={icon} />
          <h3>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ul>
  );
}

// Shows `fallback` until `value` is known, then counts up from 0 when scrolled into view.
export function Counter({ value, fallback }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(fallback);

  useEffect(() => {
    if (value == null) return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      setShown(value);
      return undefined;
    }
    let frame;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now) => {
        const k = Math.min((now - start) / 900, 1);
        setShown(Math.round(value * (1 - (1 - k) ** 3)));
        if (k < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong ref={ref} className="counter">{shown}</strong>;
}

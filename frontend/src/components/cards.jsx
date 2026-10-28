import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { formatDate, parseDate } from '../utils/format.js';

export function ProgrammeCard({ programme: p }) {
  return (
    <article className="programme">
      <div className="programme-meta"><span className="pill">{p.level}</span><span>{p.study_mode}</span></div>
      <h3><Link to={`/programmes/${p.slug}`}>{p.name}</Link></h3>
      {p.school_name && <p className="programme-school">{p.school_name}</p>}
      <p>{p.description}</p>
      <div className="programme-actions">
        <Link to={`/programmes/${p.slug}`} className="link-arrow">Learn more</Link>
        <Link to={`/admissions?programme=${p.slug}#apply`} className="btn btn-primary btn-sm">Apply now</Link>
      </div>
    </article>
  );
}

// `full` shows the whole post (News page); otherwise a summary with a link to it.
export function NewsCard({ post, full = false, open = false }) {
  const details = useRef(null);
  const paragraphs = (post.body || '').split(/\n{2,}/).filter(Boolean);

  useEffect(() => {
    if (open && details.current) details.current.open = true;
  }, [open]);

  return (
    <article className="news-card" id={`post-${post.id}`}>
      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
      {full && paragraphs.length > 0 && (
        <details ref={details}>
          <summary>Read more</summary>
          {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
        </details>
      )}
      {!full && <Link to={`/news#post-${post.id}`} className="link-arrow">Read more</Link>}
    </article>
  );
}

export function EventItem({ event }) {
  const d = parseDate(event.event_date);
  return (
    <article className="event-item">
      <div className="date-badge">
        <strong>{d.getDate()}</strong>
        <span>{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
      </div>
      <div>
        <h4>{event.title}</h4>
        {event.location && <p className="meta">{event.location}</p>}
        <p>{event.summary}</p>
      </div>
    </article>
  );
}

export function DateItem({ item }) {
  return (
    <li className="date-item">
      <time dateTime={item.date}>{formatDate(item.date)}</time>
      <span>{item.title}</span>
      {item.note && <small>{item.note}</small>}
    </li>
  );
}

export function TestimonialCard({ testimonial: t }) {
  return (
    <blockquote className="voice">
      <p>{t.quote}</p>
      <footer>
        <strong>{t.name}</strong>
        {t.programme && <span>{t.programme}</span>}
      </footer>
    </blockquote>
  );
}

// A list with loading, empty and error states, matching the original pages' messages.
export function ListState({ state, render, empty, as: Tag = 'div', className }) {
  const Message = Tag === 'ul' ? 'li' : 'p';
  let content;
  if (state.loading) content = <Message className="muted">Loading…</Message>;
  else if (state.error) content = <Message className="muted">This could not be loaded. Please try again later.</Message>;
  else if (!state.data.length) content = <Message className="muted">{empty}</Message>;
  else content = state.data.map(render);
  return <Tag className={className}>{content}</Tag>;
}

import { useEffect, useRef } from 'react';
import Icon from '../Icon.jsx';
import { pageNumbers } from '../../utils/applications.js';

export function Button({ icon, className = 'btn btn-light btn-sm', children, ...props }) {
  return (
    <button type="button" className={className} {...props}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, className = '', ...props }) {
  return (
    <button type="button" className={`icon-btn ${className}`} title={label} aria-label={label} {...props}>
      <Icon name={icon} />
    </button>
  );
}

export const Badge = ({ value }) => <span className={`badge badge-${value}`}>{value}</span>;

export function EmptyState({ title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name="inbox" /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

export function ViewHead({ title, description, children }) {
  return (
    <div className="view-head">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="view-actions">{children}</div>
    </div>
  );
}

export function LoadError({ onRetry }) {
  return (
    <EmptyState title="This page could not be loaded" text="Check that the server is running, then try again.">
      <Button icon="refresh" onClick={onRetry}>Try again</Button>
    </EmptyState>
  );
}

export function Kpi({ label, value, note, icon, tone = '', pressed, onClick, title }) {
  const body = (
    <>
      <span>
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
        <span className="kpi-note">{note}</span>
      </span>
      <span className="kpi-icon"><Icon name={icon} /></span>
    </>
  );
  return onClick
    ? <button type="button" className={`kpi ${tone}`} aria-pressed={pressed} title={title} onClick={onClick}>{body}</button>
    : <div className={`kpi ${tone}`}>{body}</div>;
}

export function Pager({ page, pages, onPage }) {
  return (
    <div className="pager">
      <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}><Icon name="chevronLeft" /></button>
      {pageNumbers(page, pages).map((p, i) => (p === '…'
        ? <span key={`gap-${i}`} className="gap">…</span>
        : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>{p}</button>))}
      <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onPage(page + 1)}><Icon name="chevronRight" /></button>
    </div>
  );
}

// Native modal <dialog>: focus trap, Escape to close and a backdrop for free.
// Clicking the backdrop closes it too.
export function Dialog({ open, onClose, className, labelledBy, label, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      aria-label={label}
      onClose={() => { if (open) onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {open && children}
    </dialog>
  );
}

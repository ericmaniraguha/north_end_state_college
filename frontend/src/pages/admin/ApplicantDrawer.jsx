import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Badge, Button, Dialog, IconButton } from '../../components/admin/ui.jsx';
import { STATUSES, applicantMessage } from '../../utils/applications.js';
import { applicationRef, dateTime, initials } from '../../utils/format.js';
import { telHref, waHref } from '../../config/site.js';

function Detail({ label, value, className }) {
  return <div className={className}><dt>{label}</dt><dd>{value}</dd></div>;
}

// Review panel for one application. Unsaved notes are kept while the status changes.
export default function ApplicantDrawer({ application: a, onClose, onStatus, onSaveNotes }) {
  const [notes, setNotes] = useState(a?.notes || '');
  const message = a ? applicantMessage(a) : '';
  const mailto = a?.email
    && `mailto:${a.email}?subject=${encodeURIComponent(`Your application to North End College (${applicationRef(a.id)})`)}&body=${encodeURIComponent(message)}`;

  return (
    <Dialog open={Boolean(a)} onClose={onClose} className="drawer" labelledBy="drawer-name">
      {a && (
        <>
          <div className="drawer-head">
            <span className="avatar">{initials(a.full_name)}</span>
            <div>
              <h2 id="drawer-name">{a.full_name}</h2>
              <p>{a.programme}</p>
            </div>
            <IconButton icon="close" label="Close" onClick={onClose} />
          </div>

          <div className="drawer-body">
            <section className="drawer-section">
              <h3>Decision</h3>
              <div className="decision">
                <div className="decision-row"><span>Current status</span><Badge value={a.status} /></div>
                <div className="status-switch" role="group" aria-label="Set status">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" className={s} aria-pressed={a.status === s} onClick={() => s !== a.status && onStatus(s)}>{s}</button>
                  ))}
                </div>
                {a.reviewed_at && <small className="muted">Status last changed {dateTime(a.reviewed_at)}</small>}
              </div>
            </section>

            <section className="drawer-section">
              <h3>Applicant details</h3>
              <dl className="details">
                <Detail label="Reference" value={applicationRef(a.id)} className="mono" />
                <Detail label="Submitted" value={dateTime(a.created_at)} />
                <Detail label="NRC" value={a.nrc} className="mono" />
                <Detail label="Phone" value={a.phone} className="mono" />
                <Detail label="Email" value={a.email || '—'} className="full" />
                <Detail label="Programme" value={a.programme} className="full" />
                <Detail label="Intake" value={a.intake} />
              </dl>
            </section>

            <section className="drawer-section">
              <h3>Contact applicant</h3>
              <div className="contact-actions">
                <a className="btn btn-primary btn-sm" href={waHref(a.phone, message)} target="_blank" rel="noopener"><Icon name="whatsapp" />WhatsApp</a>
                <a className="btn btn-light btn-sm" href={telHref(a.phone)}><Icon name="phone" />Call</a>
                {mailto && <a className="btn btn-light btn-sm" href={mailto}><Icon name="mail" />Email</a>}
              </div>
              <p className="note-box">WhatsApp and email open with a message written for the current status, so you can check it before sending. Applicants send their Grade 12 results and NRC on WhatsApp, so check them there before accepting.</p>
            </section>

            <section className="drawer-section">
              <h3>Internal notes</h3>
              <textarea rows={4} aria-label="Internal notes" placeholder="e.g. Grade 12 results received on WhatsApp and checked" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <small className="muted">Only visible to admins. Included in CSV exports.</small>
            </section>
          </div>

          <div className="drawer-foot">
            <Button icon="check" className="btn btn-primary btn-sm" onClick={() => onSaveNotes(notes)}>Save notes</Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </>
      )}
    </Dialog>
  );
}

import { useCallback, useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Badge, Button, Dialog, IconButton } from '../../components/admin/ui.jsx';
import SendMessageForm, { CHANNEL_LABELS, sendResult } from '../../components/admin/SendMessageForm.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { STATUSES, applicantMessage } from '../../utils/applications.js';
import { applicationRef, dateTime, initials } from '../../utils/format.js';
import { telHref, waHref } from '../../config/site.js';

const KIND_LABELS = { confirmation: 'Automatic confirmation', decision: 'Automatic decision', reply: 'Sent by staff' };

function Detail({ label, value, className }) {
  return <div className={className}><dt>{label}</dt><dd>{value}</dd></div>;
}

// Messages already sent to this applicant, newest first. Automatic decision messages
// are sent in the background, so the list is checked again shortly after a status change.
function Outbox({ applicationId, status, refreshKey }) {
  const { api } = useAdmin();
  const [items, setItems] = useState(null);
  const load = useCallback(() => api.applicationOutbox(applicationId).then(setItems, () => setItems([])), [api, applicationId]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => {
    const timer = setTimeout(load, 2500);
    return () => clearTimeout(timer);
  }, [load, status]);

  if (!items) return <p className="muted">Loading…</p>;
  if (!items.length) return <p className="muted">No messages sent yet.</p>;
  return (
    <ul className="outbox">
      {items.map((m) => (
        <li key={m.id}>
          <div className="outbox-head">
            <span className={`badge badge-${m.status}`}>{m.status}</span>
            <strong>{CHANNEL_LABELS[m.channel]}</strong>
            <span className="muted">{KIND_LABELS[m.kind] || m.kind}</span>
            <time dateTime={m.created_at}>{dateTime(m.created_at)}</time>
          </div>
          <p>{m.body}</p>
          {m.error && <small className="error">{m.error}</small>}
        </li>
      ))}
    </ul>
  );
}

// Review panel for one application. Unsaved notes are kept while the status changes.
export default function ApplicantDrawer({ application: a, onClose, onStatus, onSaveNotes }) {
  const { api, toast, messaging } = useAdmin();
  const [notes, setNotes] = useState(a?.notes || '');
  const [sentCount, setSentCount] = useState(0);
  const message = a ? applicantMessage(a) : '';
  const subject = a ? `Your application to North End College (${applicationRef(a.id)})` : '';
  const mailto = a?.email && `mailto:${a.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  async function send(data) {
    try {
      await api.sendToApplicant(a.id, data);
    } catch (err) {
      setSentCount((n) => n + 1); // failed attempts are recorded too
      return sendResult(err);
    }
    setSentCount((n) => n + 1);
    toast(`Message sent by ${CHANNEL_LABELS[data.channel]}`);
    return { ok: true };
  }

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
                {messaging.automatic.decision && messaging.automatic.channels.length > 0 && (
                  <small className="muted">Accepting or rejecting sends the applicant an automatic message by {messaging.automatic.channels.map((c) => CHANNEL_LABELS[c]).join(' and ')}.</small>
                )}
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
              <h3>Send a message</h3>
              <SendMessageForm
                key={a.status}
                person={a}
                channels={messaging.channels}
                defaultSubject={subject}
                defaultBody={message}
                onSend={send}
              />
            </section>

            <section className="drawer-section">
              <h3>Messages sent</h3>
              <Outbox applicationId={a.id} status={a.status} refreshKey={sentCount} />
            </section>

            <section className="drawer-section">
              <h3>Contact from your own phone or email</h3>
              <div className="contact-actions">
                <a className="btn btn-light btn-sm" href={waHref(a.phone, message)} target="_blank" rel="noopener"><Icon name="whatsapp" />WhatsApp</a>
                <a className="btn btn-light btn-sm" href={telHref(a.phone)}><Icon name="phone" />Call</a>
                {mailto && <a className="btn btn-light btn-sm" href={mailto}><Icon name="mail" />Email</a>}
              </div>
              <p className="note-box">These open WhatsApp or your email app with a message written for the current status. Applicants send their Grade 12 results and NRC on WhatsApp, so check them there before accepting.</p>
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

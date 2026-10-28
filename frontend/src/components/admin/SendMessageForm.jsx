import { useState } from 'react';
import Icon from '../Icon.jsx';

export const CHANNEL_LABELS = { email: 'Email', whatsapp: 'WhatsApp', sms: 'SMS' };

// Lets staff write a message and send it by email, WhatsApp or SMS from the server.
// person: { email, phone }. channels: the channels set up in the server's .env.
// onSend({ channel, subject, body }) resolves to { ok: true } or { ok: false, error }.
export default function SendMessageForm({ person, channels, defaultSubject, defaultBody, onSend, onCancel }) {
  const options = Object.keys(CHANNEL_LABELS)
    .filter((c) => channels.includes(c) && (c === 'email' ? person.email : person.phone));
  const [channel, setChannel] = useState(options[0] || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!channels.length) {
    return <p className="note-box">Sending isn't set up yet. Add email, WhatsApp or SMS settings to the server's <code>.env</code> file (see the README), then restart the server.</p>;
  }
  if (!options.length) {
    return <p className="note-box">None of the channels set up ({channels.map((c) => CHANNEL_LABELS[c]).join(', ')}) can reach this person: there is no {channels.includes('email') ? 'email address' : 'phone number'}.</p>;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await onSend({ channel, subject, body });
    setBusy(false);
    if (!result.ok) setError(result.error);
  }

  const to = channel === 'email' ? person.email : person.phone;
  const smsParts = Math.max(1, Math.ceil(body.length / 153));

  return (
    <form className="form send-form" noValidate onSubmit={submit}>
      <label>Send by
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          {options.map((c) => <option key={c} value={c}>{CHANNEL_LABELS[c]} to {c === 'email' ? person.email : person.phone}</option>)}
        </select>
      </label>
      {channel === 'email' && (
        <label>Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
      )}
      <label>Message
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <div className="send-actions">
        <small className="muted">{body.length} characters{channel === 'sms' && ` · about ${smsParts} SMS`}</small>
        <div className="view-actions">
          {onCancel && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !body.trim()} title={`Send to ${to}`}>
            <Icon name={channel === 'email' ? 'mail' : channel === 'whatsapp' ? 'whatsapp' : 'phone'} />
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
      {error && <p className="form-status fail">{error}</p>}
    </form>
  );
}

// Turns an API error into the { ok, error } shape SendMessageForm expects
export function sendResult(err) {
  if (err.status === 401) return { ok: false, error: '' };
  return { ok: false, error: err.data?.error || 'Could not send the message. Check the server logs.' };
}

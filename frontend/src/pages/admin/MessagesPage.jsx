import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { Button, EmptyState, LoadError, ViewHead } from '../../components/admin/ui.jsx';
import SendMessageForm, { CHANNEL_LABELS, sendResult } from '../../components/admin/SendMessageForm.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { dateTime, initials } from '../../utils/format.js';
import { telHref, waHref } from '../../config/site.js';

function MessageCard({ message: m, channels, onRead, onDelete, onReply }) {
  const [replying, setReplying] = useState(false);
  const greeting = `Hello ${m.name.split(/\s+/)[0]}, thank you for contacting North End College. `;
  const markOnReply = () => { if (!m.read_at) onRead(true); };
  const canSend = channels.length > 0;

  async function send(data) {
    const result = await onReply(data);
    if (result.ok) setReplying(false);
    return result;
  }

  return (
    <article className={`message${m.read_at ? '' : ' unread'}`}>
      <div className="message-head">
        <span className="avatar">{initials(m.name)}</span>
        <strong>{m.name}</strong>
        {!m.read_at && <span className="pill-new">New</span>}
        {m.replied_at && <span className="pill-replied">Replied {dateTime(m.replied_at)}</span>}
        <time dateTime={m.created_at}>{dateTime(m.created_at)}</time>
      </div>
      <div className="message-meta">
        {m.email && <span>{m.email}</span>}
        {m.phone && <span className="mono">{m.phone}</span>}
      </div>
      <p className="message-body">{m.message}</p>
      {replying ? (
        <SendMessageForm
          person={m}
          channels={channels}
          defaultSubject="Re: your message to North End College"
          defaultBody={greeting}
          onSend={send}
          onCancel={() => setReplying(false)}
        />
      ) : (
        <div className="message-actions">
          {canSend && <Button icon="mail" className="btn btn-primary btn-sm" onClick={() => setReplying(true)}>Reply</Button>}
          {!canSend && m.email && (
            <a className="btn btn-primary btn-sm" onClick={markOnReply}
              href={`mailto:${m.email}?subject=${encodeURIComponent('Your message to North End College')}&body=${encodeURIComponent(greeting)}`}>
              <Icon name="mail" />Reply by email
            </a>
          )}
          {m.phone && <a className="btn btn-light btn-sm" href={waHref(m.phone, greeting)} target="_blank" rel="noopener" onClick={markOnReply}><Icon name="whatsapp" />Open WhatsApp</a>}
          {m.phone && <a className="btn btn-light btn-sm" href={telHref(m.phone)}><Icon name="phone" />Call</a>}
          <Button icon="check" onClick={() => onRead(!m.read_at)}>{m.read_at ? 'Mark as unread' : 'Mark as read'}</Button>
          <Button icon="trash" className="btn btn-ghost btn-sm" onClick={onDelete}>Delete</Button>
        </div>
      )}
    </article>
  );
}

export default function MessagesPage() {
  const { api, toast, fail, refreshSummary, messaging } = useAdmin();
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') === 'unread' ? 'unread' : 'all';
  const [messages, setMessages] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(() => {
    setLoadError(null);
    api.messages().then(setMessages, (err) => { if (err.status !== 401) setLoadError(err); });
  }, [api]);
  useEffect(reload, [reload]);

  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
  const patch = (id, changes) => setMessages((list) => list.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  async function setRead(m, read) {
    try {
      await api.setMessageRead(m.id, read);
    } catch (err) {
      return fail(err, 'Could not update the message.');
    }
    patch(m.id, { read_at: read ? m.read_at || now() : null });
    return refreshSummary();
  }

  async function reply(m, data) {
    try {
      await api.replyToMessage(m.id, data);
    } catch (err) {
      return sendResult(err);
    }
    patch(m.id, { read_at: m.read_at || now(), replied_at: now() });
    toast(`Reply sent to ${m.name} by ${CHANNEL_LABELS[data.channel]}`);
    refreshSummary();
    return { ok: true };
  }

  async function remove(m) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api.deleteMessage(m.id);
    } catch (err) {
      fail(err, 'Could not delete the message.');
      return;
    }
    setMessages((list) => list.filter((x) => x.id !== m.id));
    toast('Message deleted');
    refreshSummary();
  }

  if (loadError) return <LoadError onRetry={reload} />;
  if (!messages) return <p className="muted">Loading…</p>;

  const unread = messages.filter((m) => !m.read_at);
  const shown = filter === 'unread' ? unread : messages;

  return (
    <>
      <ViewHead title="Messages" description="Questions sent from the Contact page. Reply by email, WhatsApp or SMS, then mark them as read.">
        <div className="segmented" role="group" aria-label="Show messages">
          {[['all', `All (${messages.length})`], ['unread', `Unread (${unread.length})`]].map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setParams(key === 'all' ? {} : { filter: key }, { replace: true })}>{label}</button>
          ))}
        </div>
      </ViewHead>
      <div className="message-list">
        {shown.length
          ? shown.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              channels={messaging.channels}
              onRead={(read) => setRead(m, read)}
              onReply={(data) => reply(m, data)}
              onDelete={() => remove(m)}
            />
          ))
          : (
            <div className="panel">
              {messages.length
                ? <EmptyState title="No unread messages" text="You're all caught up." />
                : <EmptyState title="No messages yet" text="Messages sent from the Contact page will appear here." />}
            </div>
          )}
      </div>
    </>
  );
}

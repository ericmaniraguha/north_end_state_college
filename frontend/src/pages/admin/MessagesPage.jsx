import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { Button, EmptyState, LoadError, ViewHead } from '../../components/admin/ui.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { dateTime, initials } from '../../utils/format.js';
import { telHref, waHref } from '../../config/site.js';

function MessageCard({ message: m, onRead, onDelete }) {
  const reply = `Hello ${m.name.split(/\s+/)[0]}, thank you for contacting North End College. `;
  const markOnReply = () => { if (!m.read_at) onRead(true); };

  return (
    <article className={`message${m.read_at ? '' : ' unread'}`}>
      <div className="message-head">
        <span className="avatar">{initials(m.name)}</span>
        <strong>{m.name}</strong>
        {!m.read_at && <span className="pill-new">New</span>}
        <time dateTime={m.created_at}>{dateTime(m.created_at)}</time>
      </div>
      <div className="message-meta">
        {m.email && <span>{m.email}</span>}
        {m.phone && <span className="mono">{m.phone}</span>}
      </div>
      <p className="message-body">{m.message}</p>
      <div className="message-actions">
        {m.email && (
          <a className="btn btn-primary btn-sm" onClick={markOnReply}
            href={`mailto:${m.email}?subject=${encodeURIComponent('Your message to North End College')}&body=${encodeURIComponent(reply)}`}>
            <Icon name="mail" />Reply by email
          </a>
        )}
        {m.phone && <a className="btn btn-light btn-sm" href={waHref(m.phone, reply)} target="_blank" rel="noopener" onClick={markOnReply}><Icon name="whatsapp" />WhatsApp</a>}
        {m.phone && <a className="btn btn-light btn-sm" href={telHref(m.phone)}><Icon name="phone" />Call</a>}
        <Button icon="check" onClick={() => onRead(!m.read_at)}>{m.read_at ? 'Mark as unread' : 'Mark as read'}</Button>
        <Button icon="trash" className="btn btn-ghost btn-sm" onClick={onDelete}>Delete</Button>
      </div>
    </article>
  );
}

export default function MessagesPage() {
  const { api, toast, fail, refreshSummary } = useAdmin();
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') === 'unread' ? 'unread' : 'all';
  const [messages, setMessages] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(() => {
    setLoadError(null);
    api.messages().then(setMessages, (err) => { if (err.status !== 401) setLoadError(err); });
  }, [api]);
  useEffect(reload, [reload]);

  async function setRead(m, read) {
    try {
      await api.setMessageRead(m.id, read);
    } catch (err) {
      return fail(err, 'Could not update the message.');
    }
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, read_at: read ? x.read_at || new Date().toISOString() : null } : x)));
    return refreshSummary();
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
      <ViewHead title="Messages" description="Questions sent from the Contact page. Reply by email or WhatsApp, then mark them as read.">
        <div className="segmented" role="group" aria-label="Show messages">
          {[['all', `All (${messages.length})`], ['unread', `Unread (${unread.length})`]].map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setParams(key === 'all' ? {} : { filter: key }, { replace: true })}>{label}</button>
          ))}
        </div>
      </ViewHead>
      <div className="message-list">
        {shown.length
          ? shown.map((m) => <MessageCard key={m.id} message={m} onRead={(read) => setRead(m, read)} onDelete={() => remove(m)} />)
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

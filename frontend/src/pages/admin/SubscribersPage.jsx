import { useCallback, useEffect, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, EmptyState, IconButton, Kpi, LoadError, ViewHead } from '../../components/admin/ui.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { downloadCsv } from '../../utils/csv.js';
import { dateTime, daysAgo, parseDate, plural, today } from '../../utils/format.js';

export default function SubscribersPage() {
  const { api, toast, fail, refreshSummary } = useAdmin();
  const [subscribers, setSubscribers] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState('');

  const reload = useCallback(() => {
    setLoadError(null);
    api.subscribers().then(setSubscribers, (err) => { if (err.status !== 401) setLoadError(err); });
  }, [api]);
  useEffect(reload, [reload]);

  async function remove(s) {
    if (!window.confirm(`Remove ${s.email} from the newsletter list?`)) return;
    try {
      await api.deleteSubscriber(s.id);
    } catch (err) {
      fail(err, 'Could not remove the subscriber.');
      return;
    }
    setSubscribers((list) => list.filter((x) => x.id !== s.id));
    toast(`${s.email} removed`);
    refreshSummary();
  }

  async function copyAll() {
    if (!subscribers.length) return toast('There are no addresses to copy.', 'error');
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', '));
      return toast(`Copied ${plural(subscribers.length, 'address', 'addresses')}`);
    } catch {
      return toast('Copying is not available in this browser.', 'error');
    }
  }

  function exportCsv() {
    if (!subscribers.length) return toast('There is nothing to export.', 'error');
    return downloadCsv(`nec-subscribers-${today()}.csv`, ['Email', 'Subscribed'], subscribers.map((s) => [s.email, s.created_at]));
  }

  if (loadError) return <LoadError onRetry={reload} />;
  if (!subscribers) return <p className="muted">Loading…</p>;

  const q = query.trim().toLowerCase();
  const shown = subscribers.filter((s) => s.email.includes(q));
  const recent = subscribers.filter((s) => parseDate(s.created_at) >= daysAgo(30)).length;

  return (
    <>
      <ViewHead title="Newsletter subscribers" description="People who signed up for updates in the website footer.">
        <Button icon="copy" onClick={copyAll}>Copy all emails</Button>
        <Button icon="download" onClick={exportCsv}>Export CSV</Button>
      </ViewHead>
      <div className="kpi-grid two">
        <Kpi label="Subscribers" value={subscribers.length} note="On the mailing list" icon="people" />
        <Kpi tone="pending" label="New" value={recent} note="In the last 30 days" icon="clock" />
      </div>
      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <Icon name="search" />
            <input data-page-search type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search email addresses" aria-label="Search subscribers" />
          </label>
        </div>
        {shown.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Subscribed</th><th className="right" /></tr></thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id}>
                    <td><a href={`mailto:${s.email}`}>{s.email}</a></td>
                    <td>{dateTime(s.created_at)}</td>
                    <td><div className="row-actions"><IconButton icon="trash" label={`Remove ${s.email}`} className="bad" onClick={() => remove(s)} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={subscribers.length ? 'No matches' : 'No subscribers yet'}
            text={subscribers.length ? 'Try a different search.' : 'People who subscribe in the website footer will appear here.'}
          />
        )}
      </section>
    </>
  );
}

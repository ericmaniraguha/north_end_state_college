import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { Badge, Button, EmptyState, IconButton, Kpi, LoadError, Pager } from '../../components/admin/ui.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { getProgrammes } from '../../services/publicApi.js';
import { STATUSES, applicationStats, filterApplications } from '../../utils/applications.js';
import { downloadCsv } from '../../utils/csv.js';
import { applicationRef, capitalize, cx, dateTime, initials, plural, shortDate, today } from '../../utils/format.js';
import { SITE } from '../../config/site.js';
import ApplicantDrawer from './ApplicantDrawer.jsx';
import NewApplicationDialog from './NewApplicationDialog.jsx';

const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const { api, toast, fail, refreshSummary } = useAdmin();
  // Filters, page and the open applicant live in the URL, so they survive a refresh
  const [params, setParams] = useSearchParams();
  const filters = { q: params.get('q') || '', status: params.get('status') || '', programme: params.get('programme') || '' };
  const page = Math.max(1, Number(params.get('page')) || 1);
  const openId = Number(params.get('open')) || null;

  const [applications, setApplications] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const [apps, progs] = await Promise.all([api.applications(), getProgrammes()]);
    setApplications(apps);
    setProgrammes(progs);
    setSelected((s) => new Set([...s].filter((id) => apps.some((a) => a.id === id))));
  }, [api]);

  const reload = useCallback(() => {
    setLoadError(null);
    load().catch((err) => { if (err.status !== 401) setLoadError(err); });
  }, [load]);
  useEffect(reload, [reload]);

  const setQuery = (changes) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, String(value));
      else next.delete(key);
    }
    if (!('page' in changes) && !('open' in changes)) next.delete('page');
    return next;
  }, { replace: true });

  const open = openId && applications?.find((a) => a.id === openId);
  useEffect(() => {
    if (applications && openId && !open) {
      toast('That application no longer exists.', 'error');
      setQuery({ open: '' });
    }
  }, [applications, openId, open]);

  async function updateStatus(ids, status) {
    try {
      await api.setApplicationStatus(ids, status);
      await load();
    } catch (err) {
      fail(err, 'Could not update the status.');
      return false;
    }
    const name = ids.length === 1 && applications.find((a) => a.id === ids[0])?.full_name;
    toast(name ? `${name} marked ${status}` : `${plural(ids.length, 'application')} marked ${status}`);
    refreshSummary();
    return true;
  }

  async function batchUpdate(status) {
    const ids = [...selected];
    if (status === 'rejected' && !window.confirm(`Reject ${plural(ids.length, 'application')}?`)) return;
    if (await updateStatus(ids, status)) setSelected(new Set());
  }

  async function saveNotes(id, notes) {
    try {
      const updated = await api.saveApplicationNotes(id, notes);
      setApplications((list) => list.map((a) => (a.id === id ? { ...a, notes: updated.notes } : a)));
      toast('Notes saved');
    } catch (err) {
      fail(err, 'Could not save the notes.');
    }
  }

  async function created() {
    setCreating(false);
    toast('Application added');
    setParams({}, { replace: true });
    await load().catch(() => {});
    refreshSummary();
  }

  if (loadError) return <LoadError onRetry={reload} />;
  if (!applications) return <p className="muted">Loading…</p>;

  const list = filterApplications(applications, filters);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = list.slice(start, start + PAGE_SIZE);
  const stats = applicationStats(applications);
  const share = (n) => (stats.decided ? `${Math.round((n / stats.decided) * 100)}% of decisions` : 'No decisions yet');
  const allOnPage = rows.length > 0 && rows.every((a) => selected.has(a.id));

  const toggle = (id, on) => setSelected((s) => {
    const next = new Set(s);
    if (on) next.add(id);
    else next.delete(id);
    return next;
  });

  function exportCsv() {
    if (!list.length) return toast('There is nothing to export.', 'error');
    downloadCsv(`nec-applications-${today()}.csv`,
      ['Reference', 'Name', 'Programme', 'Phone', 'NRC', 'Email', 'Intake', 'Status', 'Submitted', 'Last reviewed', 'Notes'],
      list.map((a) => [applicationRef(a.id), a.full_name, a.programme, a.phone, a.nrc, a.email, a.intake, a.status, a.created_at, a.reviewed_at, a.notes]));
    return toast(`Exported ${plural(list.length, 'application')}`);
  }

  const kpis = [
    ['', 'total', 'Total', stats.total, 'folder', `${stats.recent} in the last 7 days`],
    ['pending', 'pending', 'Pending', stats.pending, 'clock', 'Awaiting review'],
    ['accepted', 'accepted', 'Accepted', stats.accepted, 'checkCircle', share(stats.accepted)],
    ['rejected', 'rejected', 'Rejected', stats.rejected, 'xCircle', share(stats.rejected)],
  ];

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Admissions <span className="tag">{SITE.intake} intake</span></h2>
          <p>Review applications, record decisions and contact applicants.</p>
        </div>
        <div className="view-actions">
          <Button icon="refresh" onClick={reload}>Refresh</Button>
          <Button icon="download" onClick={exportCsv}>Export CSV</Button>
          <Button icon="plus" className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>New application</Button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(([status, tone, label, value, icon, note]) => (
          <Kpi
            key={label}
            tone={tone}
            label={label}
            value={value}
            icon={icon}
            note={note}
            pressed={filters.status === status}
            title={status ? `Show ${label.toLowerCase()} applications` : 'Show all applications'}
            onClick={() => setQuery({ status })}
          />
        ))}
      </div>

      <section className="panel" aria-label="Applications">
        <div className="toolbar">
          <label className="search-box">
            <Icon name="search" />
            <input data-page-search type="search" value={filters.q} onChange={(e) => setQuery({ q: e.target.value })} placeholder="Search by name, NRC, phone, email or reference" aria-label="Search applications" />
          </label>
          <select aria-label="Filter by programme" value={filters.programme} onChange={(e) => setQuery({ programme: e.target.value })}>
            <option value="">All programmes</option>
            {programmes.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <select aria-label="Filter by status" value={filters.status} onChange={(e) => setQuery({ status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{capitalize(s)}</option>)}
          </select>
          <Button onClick={() => setParams({}, { replace: true })}>Reset</Button>
        </div>

        {selected.size > 0 && (
          <div className="batch-bar">
            <span>{plural(selected.size, 'application')} selected</span>
            <div className="view-actions">
              <Button icon="check" className="btn btn-ok btn-sm" onClick={() => batchUpdate('accepted')}>Accept</Button>
              <Button icon="close" className="btn btn-danger btn-sm" onClick={() => batchUpdate('rejected')}>Reject</Button>
              <Button onClick={() => batchUpdate('pending')}>Mark pending</Button>
              <Button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Clear selection</Button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          applications.length
            ? <EmptyState title="No applications match" text="Try a different search, or clear the filters."><Button onClick={() => setParams({}, { replace: true })}>Clear filters</Button></EmptyState>
            : <EmptyState title="No applications yet" text='Applications submitted on the website, or added here with "New application", will appear here.' />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="check">
                      <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={(e) => rows.forEach((a) => toggle(a.id, e.target.checked))} />
                    </th>
                    {['Applicant', 'Programme', 'Contact', 'NRC', 'Submitted', 'Status'].map((h) => <th key={h}>{h}</th>)}
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id} className={cx(selected.has(a.id) && 'selected')}>
                      <td className="check">
                        <input type="checkbox" aria-label={`Select ${a.full_name}`} checked={selected.has(a.id)} onChange={(e) => toggle(a.id, e.target.checked)} />
                      </td>
                      <td>
                        <div className="applicant">
                          <span className="avatar">{initials(a.full_name)}</span>
                          <div>
                            <button type="button" className="name" onClick={() => setQuery({ open: a.id })}>{a.full_name}</button>
                            <small>{applicationRef(a.id)}</small>
                          </div>
                        </div>
                      </td>
                      <td className="wrap-sm">{a.programme}</td>
                      <td className="contact-cell"><span className="mono">{a.phone}</span>{a.email && <small>{a.email}</small>}</td>
                      <td className="mono">{a.nrc}</td>
                      <td title={dateTime(a.created_at)}>{shortDate(a.created_at)}</td>
                      <td><Badge value={a.status} /></td>
                      <td>
                        <div className="row-actions">
                          <IconButton icon="eye" label={`Review ${a.full_name}`} onClick={() => setQuery({ open: a.id })} />
                          <IconButton icon="check" label={`Accept ${a.full_name}`} className="ok" disabled={a.status === 'accepted'} onClick={() => updateStatus([a.id], 'accepted')} />
                          <IconButton icon="close" label={`Reject ${a.full_name}`} className="bad" disabled={a.status === 'rejected'} onClick={() => updateStatus([a.id], 'rejected')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              <span>Showing {start + 1}–{start + rows.length} of {plural(list.length, 'application')}</span>
              <Pager page={current} pages={pages} onPage={(p) => setQuery({ page: p > 1 ? p : '' })} />
            </div>
          </>
        )}
      </section>

      <ApplicantDrawer
        key={open?.id || 'closed'}
        application={open}
        onClose={() => setQuery({ open: '' })}
        onStatus={(status) => updateStatus([open.id], status)}
        onSaveNotes={(notes) => saveNotes(open.id, notes)}
      />
      {creating && (
        <NewApplicationDialog
          open
          programmes={programmes}
          create={api.createApplication}
          onClose={() => setCreating(false)}
          onCreated={created}
        />
      )}
    </>
  );
}

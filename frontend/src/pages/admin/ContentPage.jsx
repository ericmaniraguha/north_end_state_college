import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import Icon from '../../components/Icon.jsx';
import { Badge, EmptyState, IconButton, LoadError, ViewHead } from '../../components/admin/ui.jsx';
import { FieldError, FormStatus, invalid } from '../../components/forms.jsx';
import { useAdmin } from '../../layouts/AdminLayout.jsx';
import { useApiForm } from '../../hooks/useApiForm.js';
import { capitalize, shortDate } from '../../utils/format.js';

// Editable website content. Field names match the backend resource definitions
// in backend/routes/admin.js. Column kinds: badge, date, wrap.
export const CONTENT = {
  posts: {
    title: 'News & Events',
    singular: 'news item or event',
    description: 'News appears on the home page and the News page. Events are shown until their date has passed.',
    fields: [
      { name: 'type', label: 'Type', options: [['news', 'News'], ['event', 'Event']] },
      { name: 'title', label: 'Title' },
      { name: 'summary', label: 'Summary', textarea: true },
      { name: 'body', label: 'Full text (optional)', textarea: true },
      { name: 'event_date', label: 'Event date (events only)', type: 'date' },
      { name: 'location', label: 'Location (optional)' },
    ],
    columns: [['type', 'Type', 'badge'], ['title', 'Title', 'wrap'], ['event_date', 'Event date', 'date'], ['published_at', 'Published', 'date']],
  },
  calendar: {
    title: 'Important Dates',
    singular: 'important date',
    description: 'Upcoming dates appear on the home page and the News page, and drop off once they have passed.',
    fields: [
      { name: 'title', label: 'Title' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'note', label: 'Note (optional)' },
    ],
    columns: [['date', 'Date', 'date'], ['title', 'Title', 'wrap'], ['note', 'Note', 'wrap']],
  },
  testimonials: {
    title: 'Testimonials',
    singular: 'testimonial',
    description: 'Quotes appear in the Student Voices section of the home page. Only publish quotes students have agreed to share.',
    fields: [
      { name: 'name', label: 'Student name' },
      { name: 'programme', label: 'Programme (optional)' },
      { name: 'quote', label: 'Quote', textarea: true },
    ],
    columns: [['name', 'Name'], ['programme', 'Programme'], ['quote', 'Quote', 'wrap']],
  },
};

function FieldInput({ field, error }) {
  const className = invalid(error);
  if (field.options) {
    return (
      <select name={field.name} className={className}>
        {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    );
  }
  if (field.textarea) return <textarea name={field.name} rows={3} className={className} />;
  return <input name={field.name} type={field.type || 'text'} className={className} />;
}

function Cell({ value, kind }) {
  if (value == null || value === '') return <td>—</td>;
  if (kind === 'badge') return <td><Badge value={value} /></td>;
  if (kind === 'date') return <td>{shortDate(value)}</td>;
  return <td className={kind}>{value}</td>;
}

function ContentEditor({ resource, config }) {
  const { api, toast, fail, refreshSummary } = useAdmin();
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(() => {
    setLoadError(null);
    return api.content(resource).then(setRows, (err) => { if (err.status !== 401) setLoadError(err); });
  }, [api, resource]);
  useEffect(() => { reload(); }, [reload]);

  const { errors, status, busy, handleSubmit } = useApiForm((data) => api.createContent(resource, data), {
    errorMessage: 'Could not save.',
    onSuccess: () => {
      toast(`${capitalize(config.singular)} added`);
      reload();
      refreshSummary();
    },
  });

  async function remove(row) {
    if (!window.confirm('Delete this item? It will be removed from the website.')) return;
    try {
      await api.deleteContent(resource, row.id);
    } catch (err) {
      fail(err, 'Could not delete the item.');
      return;
    }
    toast('Deleted');
    setRows((list) => list.filter((r) => r.id !== row.id));
    refreshSummary();
  }

  if (loadError) return <LoadError onRetry={reload} />;

  return (
    <>
      <ViewHead title={config.title} description={config.description} />
      <div className="content-layout">
        <section className="panel">
          <div className="panel-head"><h3>Add {config.singular}</h3></div>
          <form className="form content-form" noValidate onSubmit={handleSubmit}>
            {config.fields.map((f) => (
              <label key={f.name}>{f.label}
                <FieldInput field={f} error={errors[f.name]} />
                <FieldError message={errors[f.name]} />
              </label>
            ))}
            <button className="btn btn-primary" type="submit" disabled={busy}><Icon name="plus" />Add</button>
            <FormStatus status={status.kind === 'fail' ? status : { text: '', kind: '' }} />
          </form>
        </section>
        <section className="panel">
          <div className="panel-head"><h3>{config.title} ({rows ? rows.length : '…'})</h3></div>
          {!rows && <p className="muted empty">Loading…</p>}
          {rows && !rows.length && <EmptyState title="Nothing here yet" text={`Use the form to add the first ${config.singular}.`} />}
          {rows?.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th className="right" /></tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {config.columns.map(([name, , kind]) => <Cell key={name} value={row[name]} kind={kind} />)}
                      <td><div className="row-actions"><IconButton icon="trash" label="Delete" className="bad" onClick={() => remove(row)} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function ContentPage() {
  const { resource } = useParams();
  const config = CONTENT[resource];
  if (!config) return <Navigate to="/admin/content/posts" replace />;
  // key: switching between content types starts with a fresh form and list
  return <ContentEditor key={resource} resource={resource} config={config} />;
}

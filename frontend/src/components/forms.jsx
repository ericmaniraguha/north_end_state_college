import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useApi } from '../hooks/useApi.js';
import { useApiForm } from '../hooks/useApiForm.js';
import { getProgrammes, sendContactMessage, submitApplication, subscribe } from '../services/publicApi.js';
import { SITE } from '../config/site.js';
import { cx, groupBySchool } from '../utils/format.js';

export const invalid = (error) => (error ? 'invalid' : undefined);

export function FieldError({ message }) {
  return <small className="error">{message}</small>;
}

export function FormStatus({ status }) {
  return <p className={cx('form-status', status.kind)} role="status">{status.text}</p>;
}

export function ProgrammeOptions({ programmes }) {
  return groupBySchool(programmes).map(([school, list]) => (
    <optgroup key={school} label={school}>
      {list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </optgroup>
  ));
}

export function ApplicationForm() {
  const { data: programmes = [] } = useApi(getProgrammes, []);
  const [params] = useSearchParams();
  const [programmeId, setProgrammeId] = useState('');
  const { errors, status, busy, handleSubmit } = useApiForm(submitApplication, { onSuccess: () => setProgrammeId('') });

  // Preselect the programme from ?programme=<slug> (links from programme pages)
  const wanted = params.get('programme');
  useEffect(() => {
    const match = programmes.find((p) => p.slug === wanted);
    if (match) setProgrammeId(String(match.id));
  }, [programmes, wanted]);

  return (
    <form id="apply" className="card form" noValidate onSubmit={handleSubmit}>
      <h3>Apply for the {SITE.intake} intake</h3>
      <label>Programme
        <select name="programme_id" required value={programmeId} onChange={(e) => setProgrammeId(e.target.value)} className={invalid(errors.programme_id)}>
          <option value="">Select a programme</option>
          <ProgrammeOptions programmes={programmes} />
        </select>
        <FieldError message={errors.programme_id} />
      </label>
      <label>Full name
        <input name="full_name" autoComplete="name" required className={invalid(errors.full_name)} />
        <FieldError message={errors.full_name} />
      </label>
      <div className="row">
        <label>Phone / WhatsApp
          <input name="phone" type="tel" autoComplete="tel" placeholder="+260 971 234 567" required className={invalid(errors.phone)} />
          <FieldError message={errors.phone} />
        </label>
        <label>NRC number
          <input name="nrc" placeholder="123456/12/1" required className={invalid(errors.nrc)} />
          <FieldError message={errors.nrc} />
        </label>
      </div>
      <label>Email (optional)
        <input name="email" type="email" autoComplete="email" className={invalid(errors.email)} />
        <FieldError message={errors.email} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>Submit application</button>
      <p className="hint">After submitting, send your Grade 12 results and NRC on WhatsApp to receive your acceptance letter.</p>
      <FormStatus status={status} />
    </form>
  );
}

export function ContactForm() {
  const { errors, status, busy, handleSubmit } = useApiForm(sendContactMessage);
  return (
    <form id="contact-form" className="card form" noValidate onSubmit={handleSubmit}>
      <h3>Send us a message</h3>
      <label>Name
        <input name="name" autoComplete="name" required className={invalid(errors.name)} />
        <FieldError message={errors.name} />
      </label>
      <div className="row">
        <label>Email
          <input name="email" type="email" autoComplete="email" className={invalid(errors.email)} />
          <FieldError message={errors.email} />
        </label>
        <label>Phone
          <input name="phone" type="tel" autoComplete="tel" placeholder="+260 971 234 567" className={invalid(errors.phone)} />
          <FieldError message={errors.phone} />
        </label>
      </div>
      <label>Message
        <textarea name="message" rows={5} required className={invalid(errors.message)} />
        <FieldError message={errors.message} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>Send message</button>
      <FormStatus status={status} />
    </form>
  );
}

export function NewsletterForm() {
  const { errors, status, busy, handleSubmit } = useApiForm(subscribe, { inlineErrors: false });
  return (
    <form className="newsletter" noValidate onSubmit={handleSubmit}>
      <div className="newsletter-row">
        <input type="email" name="email" placeholder="Your email address" aria-label="Email address" autoComplete="email" required className={invalid(errors.email)} />
        <button className="btn btn-accent btn-sm" type="submit" disabled={busy}>Subscribe</button>
      </div>
      <FormStatus status={status} />
    </form>
  );
}

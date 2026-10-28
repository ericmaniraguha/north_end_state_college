import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useApi } from '../hooks/useApi.js';
import { useApiForm } from '../hooks/useApiForm.js';
import {
  getProgrammes, resendApplicationCode, sendContactMessage, submitApplication, subscribe, verifyApplication,
} from '../services/publicApi.js';
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

const NO_STATUS = { text: '', kind: '' };

// Second step of the application form: the code emailed to a first-time address.
function VerifyEmailStep({ pending, onVerified, onChangeEmail }) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [status, setStatus] = useState(NO_STATUS);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(pending.resend_in);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setCodeError('');
    setStatus(NO_STATUS);
    try {
      const data = await verifyApplication({ token: pending.token, code });
      onVerified(data.message);
    } catch (err) {
      if (err.data?.errors?.code) setCodeError(err.data.errors.code);
      else setStatus({ text: err.data?.error || 'Something went wrong. Please try again.', kind: 'fail' });
      if (err.data?.expired) setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setCodeError('');
    setStatus(NO_STATUS);
    try {
      const data = await resendApplicationCode({ token: pending.token });
      setWait(data.resend_in);
      setCode('');
      setStatus({ text: data.message, kind: 'ok' });
    } catch (err) {
      if (err.data?.resend_in) setWait(err.data.resend_in);
      setStatus({ text: err.data?.error || 'Something went wrong. Please try again.', kind: 'fail' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form verify-step" noValidate onSubmit={verify}>
      <h3>Check your email</h3>
      <p className="muted">
        We sent a 6-digit code to <strong>{pending.email}</strong>. Enter it below to finish your application.
        The code expires in {Math.round(pending.expires_in / 60)} minutes.
      </p>
      <label>Verification code
        <input
          name="code"
          className={cx('code-input', invalid(codeError))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          autoFocus
          required
        />
        <FieldError message={codeError} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy || code.length !== 6}>Verify and submit</button>
      <div className="verify-actions">
        <button type="button" className="btn-link" onClick={resend} disabled={busy || wait > 0}>
          {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
        </button>
        <button type="button" className="btn-link" onClick={onChangeEmail}>Change email address</button>
      </div>
      <p className="hint">Can't find it? Check your spam folder, or go back and leave the email empty to apply with your phone number only.</p>
      <FormStatus status={status} />
    </form>
  );
}

// Applying with a first-time email address takes two steps: the form, then the code
// emailed to that address. The form stays filled in while the code is checked.
export function ApplicationForm() {
  const { data: programmes = [] } = useApi(getProgrammes, []);
  const [params] = useSearchParams();
  const [programmeId, setProgrammeId] = useState('');
  const [pending, setPending] = useState(null);
  const detailsForm = useRef(null);
  const { errors, status, busy, handleSubmit, setStatus } = useApiForm(submitApplication, {
    resetOnSuccess: (data) => !data.verification,
    onSuccess: (data) => {
      if (data.verification) setPending(data.verification);
      else setProgrammeId('');
    },
  });

  // Preselect the programme from ?programme=<slug> (links from programme pages)
  const wanted = params.get('programme');
  useEffect(() => {
    const match = programmes.find((p) => p.slug === wanted);
    if (match) setProgrammeId(String(match.id));
  }, [programmes, wanted]);

  function verified(message) {
    detailsForm.current.reset();
    setProgrammeId('');
    setPending(null);
    setStatus({ text: message, kind: 'ok' });
  }

  function changeEmail() {
    setPending(null);
    setStatus(NO_STATUS);
    setTimeout(() => detailsForm.current.elements.email.focus());
  }

  return (
    <div id="apply" className="card">
      <form ref={detailsForm} className="form" noValidate onSubmit={handleSubmit} hidden={Boolean(pending)}>
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
        <p className="hint">The first time you use an email address, we'll send a code to confirm it. After submitting, send your Grade 12 results and NRC on WhatsApp to receive your acceptance letter.</p>
        <FormStatus status={status} />
      </form>
      {pending && <VerifyEmailStep pending={pending} onVerified={verified} onChangeEmail={changeEmail} />}
    </div>
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

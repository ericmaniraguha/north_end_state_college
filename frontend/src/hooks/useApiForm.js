import { useState } from 'react';

const GENERIC_ERROR = 'Something went wrong. Please try again or contact us on WhatsApp.';

// Submits a form's fields as JSON and tracks field errors and the status message.
// With inlineErrors: false (e.g. the one-field newsletter form) the first field error
// is shown as the status message instead of next to a field.
export function useApiForm(submit, { onSuccess, inlineErrors = true, errorMessage = GENERIC_ERROR } = {}) {
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ text: '', kind: '' });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setErrors({});
    setStatus({ text: '', kind: '' });
    setBusy(true);
    try {
      const data = await submit(Object.fromEntries(new FormData(form)));
      form.reset();
      setStatus({ text: data.message || 'Saved.', kind: 'ok' });
      onSuccess?.(data);
    } catch (err) {
      if (err.data?.errors) {
        setErrors(err.data.errors);
        setStatus({
          text: inlineErrors ? 'Please correct the highlighted fields.' : Object.values(err.data.errors)[0],
          kind: 'fail',
        });
      } else {
        setStatus({ text: err.status === 429 ? err.message : errorMessage, kind: 'fail' });
      }
    } finally {
      setBusy(false);
    }
  }

  return { errors, status, busy, handleSubmit, setStatus };
}

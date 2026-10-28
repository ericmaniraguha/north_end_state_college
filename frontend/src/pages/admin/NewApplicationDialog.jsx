import { Button, Dialog, IconButton } from '../../components/admin/ui.jsx';
import { FieldError, FormStatus, ProgrammeOptions, invalid } from '../../components/forms.jsx';
import { useApiForm } from '../../hooks/useApiForm.js';

// Records an application received in person, by phone or on WhatsApp.
export default function NewApplicationDialog({ open, programmes, onClose, onCreated, create }) {
  const { errors, status, busy, handleSubmit } = useApiForm(create, {
    onSuccess: onCreated,
    errorMessage: 'Could not save the application.',
  });

  return (
    <Dialog open={open} onClose={onClose} className="modal" label="New application">
      <form className="form" noValidate onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3>New application</h3>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        <p className="muted">Record an application received in person, by phone or on WhatsApp.</p>
        <label>Programme
          <select name="programme_id" required defaultValue="" className={invalid(errors.programme_id)}>
            <option value="">Select a programme</option>
            <ProgrammeOptions programmes={programmes} />
          </select>
          <FieldError message={errors.programme_id} />
        </label>
        <label>Full name
          <input name="full_name" autoComplete="off" required className={invalid(errors.full_name)} />
          <FieldError message={errors.full_name} />
        </label>
        <div className="row">
          <label>Phone / WhatsApp
            <input name="phone" type="tel" placeholder="+260 971 234 567" required className={invalid(errors.phone)} />
            <FieldError message={errors.phone} />
          </label>
          <label>NRC number
            <input name="nrc" placeholder="123456/12/1" required className={invalid(errors.nrc)} />
            <FieldError message={errors.nrc} />
          </label>
        </div>
        <label>Email (optional)
          <input name="email" type="email" className={invalid(errors.email)} />
          <FieldError message={errors.email} />
        </label>
        <div className="view-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>Save application</button>
          <Button className="btn btn-light" onClick={onClose}>Cancel</Button>
        </div>
        <FormStatus status={status.kind === 'fail' ? status : { text: '', kind: '' }} />
      </form>
    </Dialog>
  );
}

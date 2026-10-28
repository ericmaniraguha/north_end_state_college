import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { FormStatus } from '../../components/forms.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { SITE } from '../../config/site.js';

export default function LoginPage() {
  usePageMeta(`Sign in · Admin | ${SITE.name}`);
  const { status, message, signIn } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [empty, setEmpty] = useState(false);

  if (status === 'signed-in') return <Navigate to={location.state?.from || '/admin/applications'} replace />;
  if (status === 'checking') return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const token = new FormData(e.currentTarget).get('token').trim();
    setEmpty(!token);
    if (!token) return;
    setBusy(true);
    await signIn(token);
    setBusy(false);
  }

  const text = empty ? 'Enter the admin token.' : message;
  return (
    <div className="login-screen">
      <form className="login-card form" noValidate onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src="/img/logo.svg" alt="" width="56" height="56" />
          <span><strong>{SITE.name}</strong><small>Admin dashboard</small></span>
        </div>
        <h1>Sign in</h1>
        <p>Enter the admin token from the server's <code>.env</code> file.</p>
        <label>Admin token
          <input name="token" type="password" autoComplete="current-password" required autoFocus />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>Sign in</button>
        <FormStatus status={{ text, kind: text ? 'fail' : '' }} />
      </form>
    </div>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createAdminApi, verifyToken } from '../services/adminApi.js';

// The admin token is kept in sessionStorage, so it is cleared when the tab closes.
const KEY = 'adminToken';
const storage = {
  get() { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } },
  set(value) { try { sessionStorage.setItem(KEY, value); } catch { /* private mode: stay signed in for this page only */ } },
  clear() { try { sessionStorage.removeItem(KEY); } catch { /* nothing stored */ } },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.get);
  // 'checking' while a saved token is verified, then 'signed-in' or 'signed-out'
  const [status, setStatus] = useState(token ? 'checking' : 'signed-out');
  const [message, setMessage] = useState('');

  const signOut = useCallback((reason = '') => {
    storage.clear();
    setToken('');
    setStatus('signed-out');
    setMessage(reason);
  }, []);

  const signIn = useCallback(async (value) => {
    try {
      await verifyToken(value);
    } catch (err) {
      setMessage(err.status === 401 ? 'That token is not correct.' : 'Could not reach the server. Is it running?');
      return false;
    }
    storage.set(value);
    setToken(value);
    setStatus('signed-in');
    setMessage('');
    return true;
  }, []);

  useEffect(() => {
    if (status !== 'checking') return;
    verifyToken(token).then(
      () => setStatus('signed-in'),
      (err) => signOut(err.status === 401 ? 'Your session has expired. Please sign in again.' : 'Could not reach the server. Is it running?'),
    );
  }, []); // verify the saved token once, on first load

  const api = useMemo(
    () => createAdminApi(token, () => signOut('Your session has expired. Please sign in again.')),
    [token, signOut],
  );

  const value = useMemo(() => ({ status, message, signIn, signOut, api }), [status, message, signIn, signOut, api]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

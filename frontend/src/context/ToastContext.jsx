import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { cx } from '../utils/format.js';

const ToastContext = createContext(() => {});

// toast(message) or toast(message, 'error'); the message hides after a few seconds.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = useCallback((message, kind = 'ok') => {
    setToast({ message, kind });
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={cx('toast', visible && 'show', toast?.kind === 'error' && 'error')} role="status" aria-live="polite">
        {toast && (
          <>
            <Icon name={toast.kind === 'error' ? 'xCircle' : 'checkCircle'} />
            <span>{toast.message}</span>
          </>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

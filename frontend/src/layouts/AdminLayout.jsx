import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { SITE } from '../config/site.js';
import { cx, dateTime, plural } from '../utils/format.js';

// Sidebar entries. count(summary) returns [number, highlight in red?, tooltip text].
export const ADMIN_TABS = [
  { to: '/admin/applications', label: 'Applications', icon: 'file', group: 'Admissions', count: (s) => [s.applications.pending, true, 'pending review'] },
  { to: '/admin/messages', label: 'Messages', icon: 'mail', group: 'Admissions', count: (s) => [s.unreadMessages, true, 'unread'] },
  { to: '/admin/subscribers', label: 'Subscribers', icon: 'people', group: 'Admissions', count: (s) => [s.subscribers] },
  { to: '/admin/content/posts', label: 'News & Events', icon: 'newspaper', group: 'Website content', count: (s) => [s.posts] },
  { to: '/admin/content/calendar', label: 'Important Dates', icon: 'calendar', group: 'Website content', count: (s) => [s.calendar] },
  { to: '/admin/content/testimonials', label: 'Testimonials', icon: 'quote', group: 'Website content', count: (s) => [s.testimonials] },
];

const AdminContext = createContext(null);

// Everything an admin page needs: the API, toasts, and the sidebar summary.
export function useAdmin() {
  const { api } = useAuth();
  const toast = useToast();
  const { summary, refreshSummary } = useContext(AdminContext);
  const fail = useCallback((err, message) => { if (err.status !== 401) toast(message, 'error'); }, [toast]);
  return { api, toast, fail, summary, refreshSummary };
}

function Notifications({ summary }) {
  const items = [];
  if (summary.applications.pending) {
    items.push(
      <Link key="pending" className="notify-item highlight" to="/admin/applications?status=pending">
        <strong>{plural(summary.applications.pending, 'application')} awaiting review</strong>
        <small>Open the pending list</small>
      </Link>,
      ...summary.latestPending.map((a) => (
        <Link key={a.id} className="notify-item" to={`/admin/applications?open=${a.id}`}>
          <strong>{a.full_name}</strong>
          <small>{a.programme} · {dateTime(a.created_at)}</small>
        </Link>
      )),
    );
  }
  if (summary.unreadMessages) {
    items.push(
      <Link key="messages" className="notify-item highlight" to="/admin/messages?filter=unread">
        <strong>{plural(summary.unreadMessages, 'unread message')}</strong>
        <small>Open the inbox</small>
      </Link>,
    );
  }
  return (
    <div id="notify-panel" className="notify-panel">
      <h3>Notifications</h3>
      {items.length ? items : <p className="muted notify-empty">You're all caught up.</p>}
    </div>
  );
}

export default function AdminLayout() {
  const { api, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const searchRef = useRef(null);

  const refreshSummary = useCallback(() => api.summary().then(setSummary, () => {}), [api]);
  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  useEffect(() => {
    setSidebarOpen(false);
    setBellOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // The top-bar search is hidden on phones; fall back to the page's own search box
        const target = searchRef.current?.offsetParent ? searchRef.current : document.querySelector('[data-page-search]');
        target?.focus();
        target?.select();
      }
      if (e.key === 'Escape') {
        setBellOpen(false);
        setSidebarOpen(false);
      }
    };
    const onClick = (e) => { if (!e.target.closest('.notify')) setBellOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const tab = ADMIN_TABS.find((t) => location.pathname.startsWith(t.to));
  usePageMeta(`${tab?.label || 'Dashboard'} · Admin | ${SITE.name}`);

  // The top-bar search filters the applications list from any page
  const onApplications = location.pathname === '/admin/applications';
  const query = onApplications ? new URLSearchParams(location.search).get('q') || '' : '';
  const search = (value) => {
    const params = new URLSearchParams(onApplications ? location.search : '');
    if (value) params.set('q', value);
    else params.delete('q');
    params.delete('page');
    navigate(`/admin/applications?${params}`, { replace: onApplications });
  };

  const alerts = summary ? summary.applications.pending + summary.unreadMessages : 0;
  const groups = [...new Set(ADMIN_TABS.map((t) => t.group))];
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const context = useMemo(() => ({ summary, refreshSummary }), [summary, refreshSummary]);

  return (
    <AdminContext.Provider value={context}>
      <div className="admin-app">
        <aside id="sidebar" className={cx('admin-sidebar', sidebarOpen && 'open')} aria-label="Dashboard">
          <a href="/" className="sidebar-brand" target="_blank" rel="noopener">
            <img src="/img/logo.png" alt="" width="48" height="48" />
            <span><strong>{SITE.name}</strong><small>Admin dashboard</small></span>
          </a>
          <div className="sidebar-status"><span className="live-dot" /><span>{SITE.intake} intake open</span></div>
          <nav className="sidebar-nav">
            {groups.map((group) => [
              <p key={group} className="nav-group-label">{group}</p>,
              ...ADMIN_TABS.filter((t) => t.group === group).map((t) => {
                const [n, alert, hint] = summary ? t.count(summary) : [0];
                return (
                  <NavLink key={t.to} to={t.to} className="side-link">
                    <Icon name={t.icon} />
                    <span>{t.label}</span>
                    {n > 0 && <span className={cx('count', alert && 'alert')} title={hint ? `${n} ${hint}` : undefined}>{n}</span>}
                  </NavLink>
                );
              }),
            ])}
          </nav>
          <div className="sidebar-footer">
            <a className="side-link" href="/" target="_blank" rel="noopener"><Icon name="external" />View website</a>
            <button className="side-link" type="button" onClick={() => signOut()}><Icon name="logout" />Log out</button>
          </div>
        </aside>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

        <div className="admin-main">
          <header className="admin-topbar">
            <button id="sidebar-toggle" className="icon-btn" type="button" aria-label="Open menu" aria-controls="sidebar" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((o) => !o)}>
              <Icon name="menu" />
            </button>
            <div className="topbar-title">
              <span>Admin</span>
              <h1>{tab?.label || 'Dashboard'}</h1>
            </div>
            <label className="search-box global">
              <Icon name="search" />
              <input ref={searchRef} type="search" value={query} onChange={(e) => search(e.target.value)} placeholder="Search applicants, NRC, phone…" aria-label="Search applications" />
              <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
            </label>
            <div className="notify">
              <button className="icon-btn" type="button" aria-label="Notifications" aria-expanded={bellOpen} aria-controls="notify-panel" onClick={() => setBellOpen((o) => !o)}>
                <Icon name="bell" />
                {alerts > 0 && <span className="badge-dot">{alerts > 99 ? '99+' : alerts}</span>}
              </button>
              {bellOpen && summary && <Notifications summary={summary} />}
            </div>
          </header>

          <main className="admin-view" aria-live="polite">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

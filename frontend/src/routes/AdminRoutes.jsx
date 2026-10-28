import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import LoginPage from '../pages/admin/LoginPage.jsx';
import ApplicationsPage from '../pages/admin/ApplicationsPage.jsx';
import MessagesPage from '../pages/admin/MessagesPage.jsx';
import SubscribersPage from '../pages/admin/SubscribersPage.jsx';
import ContentPage from '../pages/admin/ContentPage.jsx';
import '../styles/admin.css';

// Loaded on demand, so visitors to the public site never download the admin code.

function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return null;
  if (status !== 'signed-in') return <Navigate to="/admin" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export default function AdminRoutes() {
  useEffect(() => {
    document.body.classList.add('admin');
    return () => document.body.classList.remove('admin');
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="subscribers" element={<SubscribersPage />} />
            <Route path="content/:resource" element={<ContentPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/applications" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

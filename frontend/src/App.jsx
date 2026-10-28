import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import PublicLayout from './layouts/PublicLayout.jsx';
import HomePage from './pages/public/HomePage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import AdmissionsPage from './pages/public/AdmissionsPage.jsx';
import ProgrammesPage from './pages/public/ProgrammesPage.jsx';
import ProgrammeDetailPage from './pages/public/ProgrammeDetailPage.jsx';
import NewsPage from './pages/public/NewsPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

const AdminRoutes = lazy(() => import('./routes/AdminRoutes.jsx'));

// Keep in sync with PAGES in backend/frontend.js, which sets the HTTP status for each URL.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="programmes" element={<ProgrammesPage />} />
        <Route path="programmes/:slug" element={<ProgrammeDetailPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="admin/*" element={<Suspense fallback={null}><AdminRoutes /></Suspense>} />
    </Routes>
  );
}

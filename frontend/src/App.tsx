import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { useAuth } from './hooks/useAuth';
import { usePageTracking } from './hooks/useAnalytics';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Import } from './pages/Import';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Privacy } from './pages/Privacy';
import { ProjectDetail } from './pages/ProjectDetail';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { ShareView } from './pages/ShareView';
import { Terms } from './pages/Terms';
import { Upgrade } from './pages/Upgrade';
import { vi } from './i18n/vi';

export function App() {
  const { isLoading, loadMe, user } = useAuth();

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  useEffect(() => {
    document.documentElement.dataset.theme = user?.darkMode ? 'dark' : 'light';
  }, [user?.darkMode]);

  return (
    <BrowserRouter>
      <AppRoutes isLoading={isLoading} user={user} />
    </BrowserRouter>
  );
}

function AppRoutes({
  isLoading,
  user,
}: {
  isLoading: boolean;
  user: ReturnType<typeof useAuth>['user'];
}) {
  usePageTracking();

  return (
    <PageWrapper>
      <Routes>
        <Route element={user ? <Navigate replace to="/dashboard" /> : <Landing />} path="/" />
        <Route element={user ? <Dashboard /> : <Navigate replace to="/login" />} path="/dashboard" />
        <Route
          element={user ? <ProjectDetail /> : <Navigate replace to="/login" />}
          path="/projects/:id"
        />
        <Route element={user ? <Navigate replace to="/dashboard" /> : <Login />} path="/login" />
        <Route
          element={user ? <Navigate replace to="/dashboard" /> : <Register />}
          path="/register"
        />
        <Route element={user ? <Import /> : <Navigate replace to="/login" />} path="/import" />
        <Route element={user ? <Upgrade /> : <Navigate replace to="/login" />} path="/upgrade" />
        <Route element={user ? <Admin /> : <Navigate replace to="/login" />} path="/admin" />
        <Route element={user ? <Settings /> : <Navigate replace to="/login" />} path="/settings" />
        <Route element={<ShareView />} path="/share/:uuid" />
        <Route element={<Terms />} path="/dieu-khoan" />
        <Route element={<Privacy />} path="/chinh-sach-bao-mat" />
      </Routes>
      {isLoading && (
        <div className="fixed bottom-4 right-4 rounded-md bg-blue px-3 py-2 text-sm text-white">
          {vi.nav.loading}
        </div>
      )}
    </PageWrapper>
  );
}

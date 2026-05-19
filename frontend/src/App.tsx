import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { useAuth } from './hooks/useAuth';
import { Admin } from './pages/Admin';
import { Dashboard } from './pages/Dashboard';
import { Import } from './pages/Import';
import { Login } from './pages/Login';
import { ProjectDetail } from './pages/ProjectDetail';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { ShareView } from './pages/ShareView';
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
      <PageWrapper>
        <Routes>
          <Route element={user ? <Dashboard /> : <Navigate replace to="/login" />} path="/" />
          <Route
            element={user ? <ProjectDetail /> : <Navigate replace to="/login" />}
            path="/projects/:id"
          />
          <Route element={user ? <Navigate replace to="/" /> : <Login />} path="/login" />
          <Route element={user ? <Navigate replace to="/" /> : <Register />} path="/register" />
          <Route element={user ? <Import /> : <Navigate replace to="/login" />} path="/import" />
          <Route
            element={user ? <Upgrade /> : <Navigate replace to="/login" />}
            path="/upgrade"
          />
          <Route element={user ? <Admin /> : <Navigate replace to="/login" />} path="/admin" />
          <Route
            element={user ? <Settings /> : <Navigate replace to="/login" />}
            path="/settings"
          />
          <Route element={<ShareView />} path="/share/:uuid" />
        </Routes>
        {isLoading && (
          <div className="fixed bottom-4 right-4 rounded-md bg-blue px-3 py-2 text-sm text-white">
            {vi.nav.loading}
          </div>
        )}
      </PageWrapper>
    </BrowserRouter>
  );
}

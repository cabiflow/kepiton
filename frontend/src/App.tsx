import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { Import } from './pages/Import';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { ShareView } from './pages/ShareView';

export function App() {
  const { isLoading, loadMe, user } = useAuth();

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  return (
    <BrowserRouter>
      <PageWrapper>
        <Routes>
          <Route element={user ? <Dashboard /> : <Navigate replace to="/login" />} path="/" />
          <Route element={<Login />} path="/login" />
          <Route element={<Register />} path="/register" />
          <Route element={user ? <Import /> : <Navigate replace to="/login" />} path="/import" />
          <Route
            element={user ? <Settings /> : <Navigate replace to="/login" />}
            path="/settings"
          />
          <Route element={<ShareView />} path="/share/:uuid" />
        </Routes>
        {isLoading && <div className="fixed bottom-4 right-4 rounded-md bg-blue px-3 py-2 text-sm text-white" />}
      </PageWrapper>
    </BrowserRouter>
  );
}

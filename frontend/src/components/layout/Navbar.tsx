import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import { vi } from '../../i18n/vi';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link className="text-lg font-bold text-blue" to="/">
          Kepiton
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
          {user && (
            <>
              <NavLink className="text-text-muted hover:text-text" to="/dashboard">
                {vi.nav.dashboard}
              </NavLink>
              <NavLink className="text-text-muted hover:text-text" to="/import">
                {vi.nav.import}
              </NavLink>
              <NavLink className="text-text-muted hover:text-text" to="/upgrade">
                {vi.nav.upgrade}
              </NavLink>
              {user.isAdmin && (
                <NavLink className="text-text-muted hover:text-text" to="/admin">
                  {vi.nav.admin}
                </NavLink>
              )}
              <NavLink className="text-text-muted hover:text-text" to="/settings">
                {vi.nav.settings}
              </NavLink>
              <Button onClick={() => void logout()} variant="secondary">
                {vi.auth.logout}
              </Button>
            </>
          )}
          {!user && (
            <>
              <NavLink className="text-text-muted hover:text-text" to="/login">
                {vi.auth.login}
              </NavLink>
              <NavLink className="text-text-muted hover:text-text" to="/register">
                {vi.auth.register}
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

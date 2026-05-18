import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import { vi } from '../../i18n/vi';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link className="text-lg font-bold text-blue" to="/">
          Kepiton
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user && (
            <>
              <NavLink className="text-text-muted hover:text-text" to="/">
                {vi.nav.dashboard}
              </NavLink>
              <NavLink className="text-text-muted hover:text-text" to="/import">
                {vi.nav.import}
              </NavLink>
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

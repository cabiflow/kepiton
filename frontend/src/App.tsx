import { vi } from './i18n/vi';
import { PageWrapper } from './components/layout/PageWrapper';
import { Import } from './pages/Import';

export function App() {
  if (window.location.pathname === '/import') {
    return <Import />;
  }

  return (
    <PageWrapper>
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue">Kepiton</p>
        <h1 className="mt-3 text-4xl font-bold text-text">{vi.dashboard.title}</h1>
        <p className="mt-4 max-w-xl text-text-muted">{vi.dashboard.emptySubtitle}</p>
      </section>
    </PageWrapper>
  );
}

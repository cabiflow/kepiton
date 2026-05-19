import { Link } from 'react-router-dom';
import { vi } from '../i18n/vi';

export function Privacy() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-lg border border-border bg-bg-secondary p-4">
        <Link className="text-sm font-medium text-blue" to="/">
          {vi.legal.backHome}
        </Link>
        <nav className="mt-4 grid gap-2 text-sm">
          {vi.legal.privacySections.map((section) => (
            <a className="text-text-muted hover:text-text" href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
        </nav>
      </aside>
      <article className="min-w-0">
        <h1 className="text-3xl font-bold text-text">{vi.legal.privacyTitle}</h1>
        <p className="mt-3 text-text-muted">{vi.legal.privacyIntro}</p>
        <div className="mt-8 grid gap-6">
          {vi.legal.privacySections.map((section) => (
            <section className="rounded-lg border border-border bg-bg p-5" id={section.id} key={section.id}>
              <h2 className="text-xl font-semibold text-text">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}

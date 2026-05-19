import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { vi } from '../i18n/vi';

const countdownPreview = [
  { label: vi.urgency.days, value: '12' },
  { label: vi.urgency.hours, value: '08' },
  { label: vi.urgency.minutes, value: '24' },
  { label: vi.urgency.seconds, value: '39' },
];

export function Landing() {
  return (
    <section className="bg-bg">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue">
            {vi.landing.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-text sm:text-5xl">
            {vi.landing.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-text-muted">{vi.landing.heroSubtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button className="w-full sm:w-auto">{vi.landing.primaryCta}</Button>
            </Link>
            <Link to="/login">
              <Button className="w-full sm:w-auto" variant="secondary">
                {vi.landing.secondaryCta}
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">{vi.landing.freeNote}</p>
        </div>

        <div className="rounded-lg border border-border bg-bg-secondary p-5">
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="text-sm font-semibold text-text">{vi.landing.demoProject}</p>
            <p className="mt-1 text-sm text-text-muted">{vi.landing.demoDeadline}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {countdownPreview.map((item) => (
                <div className="rounded-md bg-bg-secondary p-3 text-center" key={item.label}>
                  <strong className="block text-2xl text-text">{item.value}</strong>
                  <span className="text-xs text-text-muted">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 rounded-full bg-border">
              <div className="h-2 w-1/3 rounded-full bg-warning" />
            </div>
            <p className="mt-2 text-xs font-medium text-warning">{vi.landing.demoUrgency}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
          {vi.landing.valueProps.map((item) => (
            <article className="rounded-lg border border-border bg-bg p-5" key={item.title}>
              <h2 className="text-lg font-semibold text-text">{item.title}</h2>
              <p className="mt-2 text-sm text-text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-text">{vi.landing.workflowTitle}</h2>
          <div className="mt-6 grid gap-4">
            {vi.landing.workflow.map((item, index) => (
              <div className="flex gap-4" key={item.title}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-text">{item.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">{vi.landing.audienceTitle}</h2>
          <ul className="mt-6 grid gap-3 text-sm text-text-muted">
            {vi.landing.audiences.map((item) => (
              <li className="rounded-md border border-border bg-bg-secondary p-4" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy px-4 py-12 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{vi.landing.finalTitle}</h2>
            <p className="mt-2 text-sm text-white/80">{vi.landing.finalSubtitle}</p>
          </div>
          <Link to="/register">
            <Button className="w-full bg-white text-navy sm:w-auto">{vi.landing.primaryCta}</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{vi.landing.footerBrand}</span>
          <div className="flex gap-4">
            <Link className="hover:text-text" to="/dieu-khoan">
              {vi.legal.termsTitle}
            </Link>
            <Link className="hover:text-text" to="/chinh-sach-bao-mat">
              {vi.legal.privacyTitle}
            </Link>
          </div>
        </div>
      </footer>
    </section>
  );
}

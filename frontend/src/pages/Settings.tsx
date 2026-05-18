import { Card } from '../components/ui/Card';
import { vi } from '../i18n/vi';

export function Settings() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <Card>
        <h1 className="text-2xl font-bold">{vi.settings.title}</h1>
        <p className="mt-2 text-text-muted">{vi.settings.comingSoon}</p>
      </Card>
    </section>
  );
}

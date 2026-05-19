import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/project/ProjectList';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { trackEvent } from '../hooks/useAnalytics';
import { vi } from '../i18n/vi';

const extensionNudgeStorageKey = 'kepiton_extension_nudge_dismissed';

export function Dashboard() {
  const { user } = useAuth();
  const { createProject, error, fetchProjects, isLoading, projects } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showExtensionNudge, setShowExtensionNudge] = useState(false);
  const chromeWebStoreUrl = import.meta.env.VITE_CHROME_EXTENSION_URL as string | undefined;

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(extensionNudgeStorageKey);
    const shouldShow = projects.length > 0 && dismissed !== 'true';
    setShowExtensionNudge(shouldShow);

    if (shouldShow) {
      trackEvent('extension_nudge_shown', { project_count: projects.length });
    }
  }, [projects.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = await createProject({
      name,
      description,
      deadline: new Date(deadline).toISOString(),
    });

    if (project) {
      trackEvent('project_created', { tier: user?.tier === 'PRO' ? 'pro' : 'free' });
      setName('');
      setDescription('');
      setDeadline('');
    }
  }

  function dismissExtensionNudge() {
    window.localStorage.setItem(extensionNudgeStorageKey, 'true');
    setShowExtensionNudge(false);
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">{vi.dashboard.title}</h1>
          <p className="mt-2 text-text-muted">{vi.dashboard.emptySubtitle}</p>
        </div>
        <Link className="w-full sm:w-auto" to="/import">
          <Button className="w-full sm:w-auto">{vi.dashboard.openImport}</Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">{vi.dashboard.newProject}</h2>
        <form className="mt-4 grid gap-4 lg:grid-cols-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium">
            {vi.dashboard.projectName}
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {vi.dashboard.projectDescription}
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {vi.dashboard.projectDeadline}
            <Input
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
              type="datetime-local"
            />
          </label>
          <Button className="self-end" disabled={isLoading} type="submit">
            {vi.dashboard.createProject}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </Card>

      {showExtensionNudge && (
        <Card className="flex flex-col gap-4 border-blue bg-bg-secondary sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">{vi.extension.nudgeTitle}</h2>
            <p className="mt-1 text-sm text-text-muted">{vi.extension.nudgeSubtitle}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="rounded-md bg-blue px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
              href={chromeWebStoreUrl || '#'}
              rel="noreferrer"
              target="_blank"
            >
              {vi.extension.nudgeCta}
            </a>
            <Button onClick={dismissExtensionNudge} variant="secondary">
              {vi.extension.nudgeDismiss}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {isLoading && <p className="text-sm text-text-muted">{vi.dashboard.loading}</p>}
        {!isLoading && projects.length === 0 && (
          <p className="text-sm text-text-muted">{vi.dashboard.noProjects}</p>
        )}
        <ProjectList projects={projects} />
      </div>
    </section>
  );
}

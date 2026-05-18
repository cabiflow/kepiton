import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ProjectList } from '../components/project/ProjectList';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useProjects } from '../hooks/useProjects';
import { vi } from '../i18n/vi';

export function Dashboard() {
  const { createProject, error, fetchProjects, isLoading, projects } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = await createProject({
      name,
      description,
      deadline: new Date(deadline).toISOString(),
    });

    if (project) {
      setName('');
      setDescription('');
      setDeadline('');
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">{vi.dashboard.title}</h1>
          <p className="mt-2 text-text-muted">{vi.dashboard.emptySubtitle}</p>
        </div>
        <Link to="/import">
          <Button>{vi.dashboard.openImport}</Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">{vi.dashboard.newProject}</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={submit}>
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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CountdownTimer } from '../components/countdown/CountdownTimer';
import { Card } from '../components/ui/Card';
import { vi } from '../i18n/vi';
import { api } from '../lib/api';

interface SharedTask {
  id: string;
  name: string;
  deadline: string;
  assigneeName?: string | null;
  status: string;
}

interface SharedMilestone {
  id: string;
  name: string;
  deadline: string;
}

interface SharedProject {
  id: string;
  name: string;
  description?: string | null;
  deadline: string;
  createdAt: string;
  milestone?: SharedMilestone | null;
  tasks: SharedTask[];
}

interface ShareResponse {
  project: SharedProject;
  share: {
    id: string;
    expiresAt?: string | null;
    createdAt: string;
  };
}

export function ShareView() {
  const { uuid } = useParams();
  const [project, setProject] = useState<SharedProject | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShare() {
      if (!uuid) {
        setError(vi.errors.expiredLink);
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ShareResponse>(`/share/${uuid}`);
        setProject(response.data.project);
        setExpiresAt(response.data.share.expiresAt ?? null);
      } catch {
        setError(vi.errors.expiredLink);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchShare();
  }, [uuid]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-sm text-text-muted">{vi.share.loading}</p>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Card>
          <h1 className="text-2xl font-bold">{vi.errors.expiredLink}</h1>
        </Card>
      </section>
    );
  }

  const deadline = new Date(project.deadline);
  const createdAt = new Date(project.createdAt);

  return (
    <section className="mx-auto grid max-w-4xl gap-5 px-4 py-6 sm:px-6 sm:py-10">
      <Card className="grid gap-5">
        <div>
          <p className="text-sm font-medium text-blue">{vi.share.title}</p>
          <h1 className="mt-1 text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="mt-2 text-sm text-text-muted">{project.description}</p>}
          <p className="mt-2 text-sm text-text-muted">{vi.share.readOnly}</p>
          {expiresAt && (
            <p className="mt-1 text-sm text-text-muted">
              {vi.share.expiresAt}: {new Date(expiresAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <div className="overflow-x-auto pb-1">
          <CountdownTimer createdAt={createdAt} deadline={deadline} />
        </div>
      </Card>

      {project.milestone && (
        <Card>
          <p className="text-sm font-semibold text-text-muted">{vi.share.milestone}</p>
          <h2 className="mt-1 text-lg font-semibold">{project.milestone.name}</h2>
          <p className="mt-2 text-sm text-text-muted">
            {vi.share.deadline}: {new Date(project.milestone.deadline).toLocaleString('vi-VN')}
          </p>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold">{vi.share.tasks}</h2>
        {project.tasks.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">{vi.share.noTasks}</p>
        )}
        {project.tasks.length > 0 && (
          <div className="mt-4 grid gap-3">
            {project.tasks.map((task) => (
              <div
                className="grid gap-2 rounded-md border border-border bg-bg-secondary p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                key={task.id}
              >
                <div className="min-w-0">
                  <p className="font-medium text-text">{task.name}</p>
                  {task.assigneeName && (
                    <p className="text-sm text-text-muted">
                      {vi.share.assignee}: {task.assigneeName}
                    </p>
                  )}
                </div>
                <p className="text-sm text-text-muted">
                  {new Date(task.deadline).toLocaleString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

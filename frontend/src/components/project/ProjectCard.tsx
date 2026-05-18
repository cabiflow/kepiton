import { Link } from 'react-router-dom';
import { CountdownTimer } from '../countdown/CountdownTimer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { vi } from '../../i18n/vi';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  deadline: string;
  createdAt: string;
}

export function ProjectCard({ createdAt, deadline, description, id, name }: ProjectCardProps) {
  const deadlineDate = new Date(deadline);
  const createdAtDate = new Date(createdAt);

  return (
    <Card className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue">Kepiton</p>
        <h2 className="mt-1 truncate text-xl font-bold text-text">{name}</h2>
        {description && <p className="mt-2 line-clamp-2 text-sm text-text-muted">{description}</p>}
        <p className="mt-3 text-sm text-text-muted">
          {vi.dashboard.projectDeadline}: {deadlineDate.toLocaleString('vi-VN')}
        </p>
        <div className="mt-4">
          <Link to={`/import?projectId=${id}`}>
            <Button variant="secondary">{vi.dashboard.importFile}</Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <CountdownTimer createdAt={createdAtDate} deadline={deadlineDate} />
      </div>
    </Card>
  );
}

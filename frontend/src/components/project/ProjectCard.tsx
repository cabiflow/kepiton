import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from '../countdown/CountdownTimer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { vi } from '../../i18n/vi';
import { api } from '../../lib/api';

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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function createShareLink() {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      const response = await api.post<{ shareLink: { id: string } }>(`/projects/${id}/share`, {});
      const nextShareUrl = `${window.location.origin}/share/${response.data.shareLink.id}`;
      setShareUrl(nextShareUrl);
      setStatusMessage(vi.dashboard.shareReady);
    } catch {
      setStatusMessage(vi.dashboard.shareError);
    } finally {
      setIsBusy(false);
    }
  }

  async function pinDeadline() {
    setIsBusy(true);
    setStatusMessage(null);
    try {
      await api.post('/me/pinned', {
        entityType: 'PROJECT',
        entityId: id,
      });
      setStatusMessage(vi.dashboard.pinSuccess);
    } catch {
      setStatusMessage(vi.dashboard.pinError);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue">Kepiton</p>
        <h2 className="mt-1 truncate text-xl font-bold text-text">{name}</h2>
        {description && <p className="mt-2 line-clamp-2 text-sm text-text-muted">{description}</p>}
        <p className="mt-3 text-sm text-text-muted">
          {vi.dashboard.projectDeadline}: {deadlineDate.toLocaleString('vi-VN')}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/projects/${id}`}>
            <Button>{vi.dashboard.openProject}</Button>
          </Link>
          <Link to={`/import?projectId=${id}`}>
            <Button variant="secondary">{vi.dashboard.importFile}</Button>
          </Link>
          <Button disabled={isBusy} onClick={() => void pinDeadline()} variant="secondary">
            {vi.dashboard.pinDeadline}
          </Button>
          <Button disabled={isBusy} onClick={() => void createShareLink()} variant="secondary">
            {vi.dashboard.createShare}
          </Button>
        </div>
        {statusMessage && <p className="mt-3 text-sm text-text-muted">{statusMessage}</p>}
        {shareUrl && (
          <InputLikeLink aria-label={vi.dashboard.shareReady} value={shareUrl} />
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <CountdownTimer createdAt={createdAtDate} deadline={deadlineDate} />
      </div>
    </Card>
  );
}

function InputLikeLink({ value, ...props }: { value: string; 'aria-label': string }) {
  return (
    <input
      className="mt-2 w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text"
      readOnly
      value={value}
      {...props}
    />
  );
}

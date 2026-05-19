import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { vi } from '../../i18n/vi';

export type TaskStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE';

export interface TaskItem {
  id: string;
  name: string;
  deadline: string;
  assigneeName?: string | null;
  notes?: string | null;
  status: TaskStatus;
  milestoneId?: string | null;
}

interface TaskRowProps {
  task: TaskItem;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
  onReopen: (taskId: string) => void;
}

const statusClass: Record<TaskStatus, string> = {
  ACTIVE: 'border-blue text-blue',
  COMPLETED: 'border-safe text-safe',
  OVERDUE: 'border-overdue text-overdue',
};

const statusText: Record<TaskStatus, string> = {
  ACTIVE: vi.projectDetail.statusActive,
  COMPLETED: vi.projectDetail.statusCompleted,
  OVERDUE: vi.projectDetail.statusOverdue,
};

export function TaskRow({ onComplete, onDelete, onEdit, onReopen, task }: TaskRowProps) {
  const deadline = new Date(task.deadline);

  return (
    <article className="grid gap-3 rounded-lg border border-border bg-bg p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-semibold text-text">{task.name}</h3>
          <Badge className={statusClass[task.status]}>{statusText[task.status]}</Badge>
        </div>
        <p className="mt-2 text-sm text-text-muted">
          {vi.projectDetail.taskDeadline}: {deadline.toLocaleString('vi-VN')}
        </p>
        {task.assigneeName && (
          <p className="mt-1 text-sm text-text-muted">
            {vi.projectDetail.taskAssignee}: {task.assigneeName}
          </p>
        )}
        {task.notes && <p className="mt-2 text-sm text-text-muted">{task.notes}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
        <Button className="min-h-11" onClick={() => onEdit(task)} variant="secondary">
          {vi.projectDetail.editTask}
        </Button>
        {task.status === 'COMPLETED' ? (
          <Button className="min-h-11" onClick={() => onReopen(task.id)} variant="secondary">
            {vi.projectDetail.reopenTask}
          </Button>
        ) : (
          <Button className="min-h-11" onClick={() => onComplete(task.id)} variant="secondary">
            {vi.projectDetail.completeTask}
          </Button>
        )}
        <Button className="col-span-2 min-h-11 sm:col-span-1" onClick={() => onDelete(task.id)} variant="secondary">
          {vi.projectDetail.deleteTask}
        </Button>
      </div>
    </article>
  );
}

import { TaskRow } from './TaskRow';
import type { TaskItem, TaskStatus } from './TaskRow';
import { vi } from '../../i18n/vi';

export type TaskFilter = 'ALL' | TaskStatus;

interface TaskListProps {
  filter: TaskFilter;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: TaskItem) => void;
  onFilterChange: (filter: TaskFilter) => void;
  onReopen: (taskId: string) => void;
  tasks: TaskItem[];
}

const filters: Array<{ label: string; value: TaskFilter }> = [
  { label: vi.projectDetail.filterAll, value: 'ALL' },
  { label: vi.projectDetail.filterOverdue, value: 'OVERDUE' },
  { label: vi.projectDetail.filterActive, value: 'ACTIVE' },
  { label: vi.projectDetail.filterCompleted, value: 'COMPLETED' },
];

const statusRank: Record<TaskStatus, number> = {
  OVERDUE: 0,
  ACTIVE: 1,
  COMPLETED: 2,
};

function sortTasks(tasks: TaskItem[]) {
  return [...tasks].sort((first, second) => {
    const statusDiff = statusRank[first.status] - statusRank[second.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return new Date(first.deadline).getTime() - new Date(second.deadline).getTime();
  });
}

export function TaskList({
  filter,
  onComplete,
  onDelete,
  onEdit,
  onFilterChange,
  onReopen,
  tasks,
}: TaskListProps) {
  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter);
  const sortedTasks = sortTasks(filteredTasks);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            className={`min-h-11 rounded-md px-3 py-2 text-sm font-medium ${
              filter === item.value
                ? 'bg-blue text-white'
                : 'border border-border bg-bg-secondary text-text-muted'
            }`}
            key={item.value}
            onClick={() => onFilterChange(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {sortedTasks.length === 0 ? (
        <p className="text-sm text-text-muted">{vi.projectDetail.noTask}</p>
      ) : (
        <div className="grid gap-3">
          {sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onReopen={onReopen}
              task={task}
            />
          ))}
        </div>
      )}
    </div>
  );
}

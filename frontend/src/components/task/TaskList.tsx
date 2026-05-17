import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Array<{ id: string; name: string }>;
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div>
      {tasks.map((task) => (
        <TaskRow key={task.id} name={task.name} />
      ))}
    </div>
  );
}

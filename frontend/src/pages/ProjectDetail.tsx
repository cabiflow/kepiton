import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CountdownTimer } from '../components/countdown/CountdownTimer';
import { TaskList } from '../components/task/TaskList';
import type { TaskFilter } from '../components/task/TaskList';
import type { TaskItem } from '../components/task/TaskRow';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { vi } from '../i18n/vi';
import { api } from '../lib/api';

interface Milestone {
  id: string;
  name: string;
  deadline: string;
}

interface ProjectDetailData {
  id: string;
  name: string;
  description?: string | null;
  deadline: string;
  createdAt: string;
  milestone?: Milestone | null;
  tasks: TaskItem[];
}

interface ProjectResponse {
  project: ProjectDetailData;
}

interface TaskFormState {
  id?: string;
  name: string;
  deadline: string;
  assigneeName: string;
  notes: string;
  milestoneId: string;
}

const emptyTaskForm: TaskFormState = {
  name: '',
  deadline: '',
  assigneeName: '',
  notes: '',
  milestoneId: '',
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoFromLocal(value: string) {
  return new Date(value).toISOString();
}

function getCompletionPercent(tasks: TaskItem[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
}

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDeadline, setMilestoneDeadline] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) {
      setError(vi.projectDetail.notFound);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await api.get<ProjectResponse>(`/projects/${id}`);
      setProject(response.data.project);
      if (response.data.project.milestone) {
        setMilestoneName(response.data.project.milestone.name);
        setMilestoneDeadline(toDateTimeLocal(response.data.project.milestone.deadline));
      }
    } catch {
      setError(vi.projectDetail.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  const completionPercent = useMemo(
    () => getCompletionPercent(project?.tasks ?? []),
    [project?.tasks],
  );

  function openCreateTaskModal() {
    setTaskForm({
      ...emptyTaskForm,
      milestoneId: project?.milestone?.id ?? '',
    });
    setTaskModalOpen(true);
  }

  function openEditTaskModal(task: TaskItem) {
    setTaskForm({
      id: task.id,
      name: task.name,
      deadline: toDateTimeLocal(task.deadline),
      assigneeName: task.assigneeName ?? '',
      notes: task.notes ?? '',
      milestoneId: task.milestoneId ?? '',
    });
    setTaskModalOpen(true);
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      return;
    }

    if (!taskForm.deadline) {
      setError(vi.projectDetail.deadlineRequired);
      return;
    }

    setIsSaving(true);
    setError(null);
    const payload = {
      name: taskForm.name,
      deadline: toIsoFromLocal(taskForm.deadline),
      milestoneId: taskForm.milestoneId || null,
      assigneeName: taskForm.assigneeName || null,
      notes: taskForm.notes || null,
    };

    try {
      if (taskForm.id) {
        await api.put(`/tasks/${taskForm.id}`, payload);
      } else {
        await api.post(`/projects/${id}/tasks`, payload);
      }
      setTaskModalOpen(false);
      await fetchProject();
    } catch {
      setError(vi.projectDetail.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !milestoneDeadline) {
      return;
    }

    setIsSaving(true);
    setError(null);
    const payload = {
      name: milestoneName,
      deadline: toIsoFromLocal(milestoneDeadline),
    };

    try {
      if (project?.milestone) {
        await api.put(`/projects/${id}/milestone`, payload);
      } else {
        await api.post(`/projects/${id}/milestone`, payload);
      }
      setShowMilestoneForm(false);
      await fetchProject();
    } catch {
      setError(vi.errors.milestoneTooLate);
    } finally {
      setIsSaving(false);
    }
  }

  async function completeTask(taskId: string) {
    setError(null);
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      await fetchProject();
    } catch {
      setError(vi.projectDetail.saveError);
    }
  }

  async function reopenTask(taskId: string) {
    setError(null);
    try {
      await api.patch(`/tasks/${taskId}/reopen`);
      await fetchProject();
    } catch {
      setError(vi.projectDetail.saveError);
    }
  }

  async function deleteTask(taskId: string) {
    setError(null);
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchProject();
    } catch {
      setError(vi.projectDetail.deleteError);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-sm text-text-muted">{vi.projectDetail.loading}</p>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Card>
          <p className="text-sm text-text-muted">{error ?? vi.projectDetail.notFound}</p>
        </Card>
      </section>
    );
  }

  const deadline = new Date(project.deadline);
  const createdAt = new Date(project.createdAt);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <Link className="text-sm font-medium text-blue" to="/">
        {vi.projectDetail.backToDashboard}
      </Link>

      <Card className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium text-blue">Kepiton</p>
          <h1 className="mt-1 break-words text-3xl font-bold text-text">{project.name}</h1>
          {project.description && (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">{project.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-muted">
            <span>
              {vi.dashboard.projectDeadline}: {deadline.toLocaleString('vi-VN')}
            </span>
            <span>
              {vi.projectDetail.completedPercent}: {completionPercent}%
            </span>
          </div>
        </div>
        <div className="overflow-x-auto pb-1">
          <CountdownTimer createdAt={createdAt} deadline={deadline} />
        </div>
      </Card>

      {error && <p className="rounded-md bg-danger px-4 py-3 text-sm text-white">{error}</p>}

      <Card className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{vi.projectDetail.milestone}</h2>
            {!project.milestone && (
              <p className="mt-1 text-sm text-text-muted">{vi.projectDetail.noMilestone}</p>
            )}
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setMilestoneName(project.milestone?.name ?? '');
              setMilestoneDeadline(
                project.milestone ? toDateTimeLocal(project.milestone.deadline) : '',
              );
              setShowMilestoneForm((current) => !current);
            }}
            variant="secondary"
          >
            {project.milestone ? vi.projectDetail.updateMilestone : vi.projectDetail.addMilestone}
          </Button>
        </div>

        {project.milestone && !showMilestoneForm && (
          <div className="rounded-md border border-border bg-bg-secondary p-4">
            <h3 className="font-semibold">{project.milestone.name}</h3>
            <p className="mt-2 text-sm text-text-muted">
              {vi.projectDetail.milestoneDeadline}:{' '}
              {new Date(project.milestone.deadline).toLocaleString('vi-VN')}
            </p>
          </div>
        )}

        {showMilestoneForm && (
          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]" onSubmit={saveMilestone}>
            <label className="grid gap-2 text-sm font-medium">
              {vi.projectDetail.milestoneName}
              <Input
                required
                value={milestoneName}
                onChange={(event) => setMilestoneName(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {vi.projectDetail.milestoneDeadline}
              <Input
                required
                type="datetime-local"
                value={milestoneDeadline}
                onChange={(event) => setMilestoneDeadline(event.target.value)}
              />
            </label>
            <Button className="self-end" disabled={isSaving} type="submit">
              {vi.projectDetail.saveMilestone}
            </Button>
          </form>
        )}
      </Card>

      <Card className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">{vi.projectDetail.taskList}</h2>
          <Button className="w-full sm:w-auto" onClick={openCreateTaskModal}>
            {vi.projectDetail.addTask}
          </Button>
        </div>

        <TaskList
          filter={filter}
          onComplete={(taskId) => void completeTask(taskId)}
          onDelete={(taskId) => void deleteTask(taskId)}
          onEdit={openEditTaskModal}
          onFilterChange={setFilter}
          onReopen={(taskId) => void reopenTask(taskId)}
          tasks={project.tasks}
        />
      </Card>

      <Modal isOpen={taskModalOpen}>
        <form className="grid gap-4" onSubmit={saveTask}>
          <h2 className="text-xl font-semibold">
            {taskForm.id ? vi.projectDetail.editTask : vi.projectDetail.addTask}
          </h2>
          <label className="grid gap-2 text-sm font-medium">
            {vi.projectDetail.taskName}
            <Input
              required
              value={taskForm.name}
              onChange={(event) => setTaskForm((state) => ({ ...state, name: event.target.value }))}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {vi.projectDetail.taskDeadline}
            <Input
              required
              type="datetime-local"
              value={taskForm.deadline}
              onChange={(event) =>
                setTaskForm((state) => ({ ...state, deadline: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {vi.projectDetail.taskAssignee}
            <Input
              value={taskForm.assigneeName}
              onChange={(event) =>
                setTaskForm((state) => ({ ...state, assigneeName: event.target.value }))
              }
            />
          </label>
          {project.milestone && (
            <label className="grid gap-2 text-sm font-medium">
              {vi.projectDetail.taskMilestone}
              <select
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-blue"
                value={taskForm.milestoneId}
                onChange={(event) =>
                  setTaskForm((state) => ({ ...state, milestoneId: event.target.value }))
                }
              >
                <option value="">{vi.projectDetail.noMilestone}</option>
                <option value={project.milestone.id}>{project.milestone.name}</option>
              </select>
            </label>
          )}
          <label className="grid gap-2 text-sm font-medium">
            {vi.projectDetail.taskNotes}
            <Input
              value={taskForm.notes}
              onChange={(event) =>
                setTaskForm((state) => ({ ...state, notes: event.target.value }))
              }
            />
          </label>
          <div className="grid gap-2 sm:flex sm:justify-end">
            <Button
              disabled={isSaving}
              onClick={() => setTaskModalOpen(false)}
              type="button"
              variant="secondary"
            >
              {vi.projectDetail.cancel}
            </Button>
            <Button disabled={isSaving} type="submit">
              {vi.projectDetail.saveTask}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

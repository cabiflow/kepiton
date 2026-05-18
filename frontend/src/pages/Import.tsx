import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useProjects } from '../hooks/useProjects';
import { api } from '../lib/api';
import { vi } from '../i18n/vi';

interface ParsedImportTask {
  ten_task: string;
  deadline: string | null;
  nguoi_phu_trach: string | null;
}

interface ParseResponse {
  importId: string;
  tasks: ParsedImportTask[];
}

interface ConfirmResponse {
  importedCount: number;
}

export function Import() {
  const { fetchProjects, projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<ParsedImportTask[]>([]);
  const [isParsing, setParsing] = useState(false);
  const [isConfirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function parseFile() {
    if (!projectId) {
      setError(vi.import.projectRequired);
      return;
    }

    if (!file) {
      setError(vi.import.fileRequired);
      return;
    }

    setError(null);
    setSuccess(null);
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('file', file);

      const response = await api.post<ParseResponse>('/import/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportId(response.data.importId);
      setTasks(response.data.tasks);
    } catch {
      setError(vi.errors.importError);
    } finally {
      setParsing(false);
    }
  }

  async function parseSheets() {
    if (!projectId) {
      setError(vi.import.projectRequired);
      return;
    }

    if (!sheetsUrl) {
      setError(vi.import.sheetsRequired);
      return;
    }

    setError(null);
    setSuccess(null);
    setParsing(true);

    try {
      const response = await api.post<ParseResponse>('/import/sheets', {
        projectId,
        url: sheetsUrl,
      });
      setImportId(response.data.importId);
      setTasks(response.data.tasks);
    } catch {
      setError(vi.errors.importError);
    } finally {
      setParsing(false);
    }
  }

  async function confirmImport() {
    if (!importId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setConfirming(true);

    try {
      const response = await api.post<ConfirmResponse>('/import/confirm', { importId });
      setSuccess(`${vi.import.success} ${response.data.importedCount}`);
      setImportId(null);
      setTasks([]);
    } catch {
      setError(vi.errors.importError);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <section className="px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-6">
        <header>
          <h1 className="text-3xl font-bold">{vi.import.title}</h1>
          <p className="mt-2 text-text-muted">{vi.import.subtitle}</p>
        </header>

        <Card className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            {vi.import.projectSelect}
            <select
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-blue"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">{vi.import.projectSelect}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-medium">
              {vi.import.fileLabel}
              <Input
                accept=".xlsx,.csv,.docx"
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button className="self-end" disabled={isParsing} onClick={parseFile}>
              {isParsing ? vi.import.loading : vi.import.parseFile}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm font-medium">
              {vi.import.sheetsUrl}
              <Input value={sheetsUrl} onChange={(event) => setSheetsUrl(event.target.value)} />
            </label>
            <Button className="self-end" disabled={isParsing} onClick={parseSheets}>
              {isParsing ? vi.import.loading : vi.import.parseSheets}
            </Button>
          </div>
        </Card>

        {error && <p className="rounded-md bg-danger px-4 py-3 text-sm text-white">{error}</p>}
        {success && <p className="rounded-md bg-safe px-4 py-3 text-sm text-white">{success}</p>}

        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{vi.import.reviewing}</h2>
            <Button disabled={!importId || isConfirming} onClick={confirmImport}>
              {isConfirming ? vi.import.confirming : vi.import.confirm}
            </Button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-text-muted">{vi.import.emptyReview}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2 pr-4">{vi.import.taskName}</th>
                    <th className="py-2 pr-4">{vi.import.deadline}</th>
                    <th className="py-2 pr-4">{vi.import.assignee}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr className="border-b border-border" key={`${task.ten_task}-${index}`}>
                      <td className="py-3 pr-4">{task.ten_task}</td>
                      <td className="py-3 pr-4 text-text-muted">
                        {task.deadline ?? vi.import.noDeadline}
                      </td>
                      <td className="py-3 pr-4 text-text-muted">{task.nguoi_phu_trach ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </section>
  );
}

import { create } from 'zustand';
import { api } from '../lib/api';
import { vi } from '../i18n/vi';
import { getDemoProjectSummaries } from '../lib/demoData';
import { isDemoMode } from '../lib/supabase';

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  deadline: string;
  createdAt: string;
}

export interface ProjectState {
  projects: ProjectSummary[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (input: {
    name: string;
    description?: string;
    deadline: string;
  }) => Promise<ProjectSummary | null>;
  setProjects: (projects: ProjectSummary[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  fetchProjects: async () => {
    set({ error: null, isLoading: true });
    try {
      if (isDemoMode) {
        set({ projects: getDemoProjectSummaries() });
        return;
      }

      const response = await api.get<{ projects: ProjectSummary[] }>('/projects');
      set({ projects: response.data.projects });
    } catch {
      set({ error: vi.errors.serverError });
    } finally {
      set({ isLoading: false });
    }
  },
  createProject: async (input) => {
    set({ error: null, isLoading: true });
    try {
      if (isDemoMode) {
        const project: ProjectSummary = {
          id: `demo-project-${Date.now()}`,
          name: input.name,
          description: input.description,
          deadline: input.deadline,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, project] }));
        return project;
      }

      const response = await api.post<{ project: ProjectSummary }>('/projects', input);
      set((state) => ({ projects: [...state.projects, response.data.project] }));
      return response.data.project;
    } catch {
      set({ error: vi.errors.freeTierProject });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

import { create } from 'zustand';

export interface ProjectSummary {
  id: string;
  name: string;
  deadline: string;
  createdAt: string;
}

export interface ProjectState {
  projects: ProjectSummary[];
  isLoading: boolean;
  error: string | null;
  setProjects: (projects: ProjectSummary[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

import { useProjectStore } from '../store/projectStore';

export function useProjects() {
  return useProjectStore();
}

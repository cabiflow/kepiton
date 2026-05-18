import { ProjectCard } from './ProjectCard';
import type { ProjectSummary } from '../../store/projectStore';

interface ProjectListProps {
  projects: ProjectSummary[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <ProjectCard
          createdAt={project.createdAt}
          deadline={project.deadline}
          description={project.description}
          id={project.id}
          key={project.id}
          name={project.name}
        />
      ))}
    </div>
  );
}

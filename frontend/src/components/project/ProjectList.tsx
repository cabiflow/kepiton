import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: Array<{ id: string; name: string }>;
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} name={project.name} />
      ))}
    </div>
  );
}

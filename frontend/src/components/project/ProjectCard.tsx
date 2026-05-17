import { Card } from '../ui/Card';

interface ProjectCardProps {
  name: string;
}

export function ProjectCard({ name }: ProjectCardProps) {
  return <Card>{name}</Card>;
}

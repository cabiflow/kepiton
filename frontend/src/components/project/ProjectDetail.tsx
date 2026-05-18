interface ProjectDetailProps {
  name: string;
}

export function ProjectDetail({ name }: ProjectDetailProps) {
  return <section>{name}</section>;
}

interface TaskRowProps {
  name: string;
}

export function TaskRow({ name }: TaskRowProps) {
  return <div className="border-b border-border py-3 text-sm text-text">{name}</div>;
}

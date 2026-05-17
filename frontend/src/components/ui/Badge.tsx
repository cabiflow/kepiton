import type { HTMLAttributes } from 'react';

export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${className}`}
      {...props}
    />
  );
}

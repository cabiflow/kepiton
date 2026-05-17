import type { PropsWithChildren } from 'react';

export function PageWrapper({ children }: PropsWithChildren) {
  return <main className="min-h-screen bg-bg text-text">{children}</main>;
}

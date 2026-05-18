import type { PropsWithChildren } from 'react';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

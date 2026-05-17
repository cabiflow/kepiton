import type { PropsWithChildren } from 'react';

interface ModalProps {
  isOpen: boolean;
}

export function Modal({ children, isOpen }: PropsWithChildren<ModalProps>) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-bg p-6 shadow-xl">{children}</div>
    </div>
  );
}

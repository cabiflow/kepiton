import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue text-white hover:opacity-90',
  secondary: 'border border-border bg-bg-secondary text-text hover:opacity-90',
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${variantClasses[variant]} ${className}`}
      type="button"
      {...props}
    />
  );
}

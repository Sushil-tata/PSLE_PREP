import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

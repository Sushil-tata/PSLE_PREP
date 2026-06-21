import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../../hooks/useApp';

type Props = {
  children: ReactNode;
};

export function AppLayout({ children }: Props) {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen ${
          state.sidebarOpen ? 'ml-60' : 'ml-16'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

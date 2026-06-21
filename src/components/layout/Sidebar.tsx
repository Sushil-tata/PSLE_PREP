import { NavLink } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';

type NavItem = {
  label: string;
  icon: string;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: '⊞', to: '/' },
  { label: 'Topic Practice', icon: '◈', to: '/topics' },
  { label: 'Revision Planner', icon: '📅', to: '/revision' },
  { label: 'Mock Tests', icon: '⏱', to: '/mock-tests' },
];

export function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        state.sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <span className="text-2xl font-bold text-indigo-400 shrink-0">⟨/⟩</span>
        {state.sidebarOpen && (
          <span className="font-semibold text-white tracking-tight whitespace-nowrap">
            DSA Prep
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            {state.sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="flex items-center justify-center h-12 border-t border-slate-800 text-slate-400 hover:text-white transition-colors"
        aria-label={state.sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="text-lg">{state.sidebarOpen ? '◀' : '▶'}</span>
      </button>
    </aside>
  );
}

import { useReducer, type ReactNode } from 'react';
import { AppContext, appReducer, defaultFilters } from './appStore';
import { problems as initialProblems } from '../data/problems';
import { revisionEntries as initialRevision } from '../data/revisionPlan';
import { mockTests as initialMockTests } from '../data/mockTests';
import type { AppState } from './appStore';

const initialState: AppState = {
  problems: initialProblems,
  filters: defaultFilters,
  revisionPlan: initialRevision,
  mockTests: initialMockTests,
  sidebarOpen: true,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

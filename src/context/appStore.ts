import { createContext } from 'react';
import type { Problem, FilterState, RevisionEntry, MockTest } from '../types';

export type AppState = {
  problems: Problem[];
  filters: FilterState;
  revisionPlan: RevisionEntry[];
  mockTests: MockTest[];
  sidebarOpen: boolean;
};

export type AppAction =
  | { type: 'TOGGLE_BOOKMARK'; id: string }
  | { type: 'UPDATE_FILTERS'; filters: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'UPDATE_PROBLEM_STATUS'; id: string; status: Problem['status'] }
  | { type: 'TOGGLE_REVISION_COMPLETE'; id: string }
  | { type: 'ADD_REVISION_ENTRY'; entry: RevisionEntry }
  | { type: 'TOGGLE_SIDEBAR' };

export type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

export const defaultFilters: FilterState = {
  difficulty: [],
  status: [],
  tags: [],
  companies: [],
  search: '',
  bookmarked: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        problems: state.problems.map((p) =>
          p.id === action.id ? { ...p, isBookmarked: !p.isBookmarked } : p
        ),
      };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'RESET_FILTERS':
      return { ...state, filters: defaultFilters };
    case 'UPDATE_PROBLEM_STATUS':
      return {
        ...state,
        problems: state.problems.map((p) =>
          p.id === action.id ? { ...p, status: action.status } : p
        ),
      };
    case 'TOGGLE_REVISION_COMPLETE':
      return {
        ...state,
        revisionPlan: state.revisionPlan.map((r) =>
          r.id === action.id ? { ...r, completed: !r.completed } : r
        ),
      };
    case 'ADD_REVISION_ENTRY':
      return { ...state, revisionPlan: [...state.revisionPlan, action.entry] };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

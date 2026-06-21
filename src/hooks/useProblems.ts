import { useMemo } from 'react';
import { useApp } from './useApp';
import { filterProblems } from '../utils/problemUtils';
import type { Problem } from '../types';

export function useProblems() {
  const { state, dispatch } = useApp();

  const filteredProblems = useMemo(
    () => filterProblems(state.problems, state.filters),
    [state.problems, state.filters]
  );

  function toggleBookmark(id: string) {
    dispatch({ type: 'TOGGLE_BOOKMARK', id });
  }

  function updateStatus(id: string, status: Problem['status']) {
    dispatch({ type: 'UPDATE_PROBLEM_STATUS', id, status });
  }

  function getProblemById(id: string): Problem | undefined {
    return state.problems.find((p) => p.id === id);
  }

  function getProblemBySlug(slug: string): Problem | undefined {
    return state.problems.find((p) => p.slug === slug);
  }

  return {
    problems: state.problems,
    filteredProblems,
    toggleBookmark,
    updateStatus,
    getProblemById,
    getProblemBySlug,
  };
}

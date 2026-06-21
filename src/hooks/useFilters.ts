import { useApp } from './useApp';
import { getAllTags, getAllCompanies } from '../utils/problemUtils';
import type { FilterState } from '../types';

export function useFilters() {
  const { state, dispatch } = useApp();

  const availableTags = getAllTags(state.problems);
  const availableCompanies = getAllCompanies(state.problems);

  function setFilters(filters: Partial<FilterState>) {
    dispatch({ type: 'UPDATE_FILTERS', filters });
  }

  function resetFilters() {
    dispatch({ type: 'RESET_FILTERS' });
  }

  function setSearch(search: string) {
    dispatch({ type: 'UPDATE_FILTERS', filters: { search } });
  }

  const activeFilterCount = [
    state.filters.difficulty.length,
    state.filters.status.length,
    state.filters.tags.length,
    state.filters.companies.length,
    state.filters.bookmarked ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return {
    filters: state.filters,
    availableTags,
    availableCompanies,
    activeFilterCount,
    setFilters,
    resetFilters,
    setSearch,
  };
}

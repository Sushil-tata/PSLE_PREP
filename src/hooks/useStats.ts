import { useMemo } from 'react';
import { useApp } from './useApp';
import type { UserStats } from '../types';

export function useStats(): UserStats {
  const { state } = useApp();

  return useMemo(() => {
    const solved = state.problems.filter((p) => p.status === 'Solved');
    const allAttempts = state.problems.reduce((sum, p) => sum + p.attempts.length, 0);

    return {
      totalSolved: solved.length,
      easySolved: solved.filter((p) => p.difficulty === 'Easy').length,
      mediumSolved: solved.filter((p) => p.difficulty === 'Medium').length,
      hardSolved: solved.filter((p) => p.difficulty === 'Hard').length,
      streak: 7,
      lastActive: new Date().toISOString(),
      totalAttempts: allAttempts,
    };
  }, [state.problems]);
}

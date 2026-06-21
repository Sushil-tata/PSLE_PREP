import type { Difficulty, Problem, FilterState } from '../types';

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'Easy':
      return 'text-emerald-400';
    case 'Medium':
      return 'text-amber-400';
    case 'Hard':
      return 'text-rose-400';
  }
}

export function getDifficultyBadgeClass(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20';
    case 'Medium':
      return 'bg-amber-400/10 text-amber-400 ring-amber-400/20';
    case 'Hard':
      return 'bg-rose-400/10 text-rose-400 ring-rose-400/20';
  }
}

export function getStatusBadgeClass(status: Problem['status']): string {
  switch (status) {
    case 'Solved':
      return 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20';
    case 'In Progress':
      return 'bg-blue-400/10 text-blue-400 ring-blue-400/20';
    case 'Needs Review':
      return 'bg-amber-400/10 text-amber-400 ring-amber-400/20';
    case 'Not Started':
      return 'bg-slate-400/10 text-slate-400 ring-slate-400/20';
  }
}

export function filterProblems(problems: Problem[], filters: FilterState): Problem[] {
  return problems.filter((p) => {
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(p.difficulty)) return false;
    if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;
    if (filters.tags.length > 0 && !filters.tags.some((t) => p.tags.includes(t))) return false;
    if (filters.companies.length > 0 && !filters.companies.some((c) => p.companies.includes(c)))
      return false;
    if (filters.bookmarked && !p.isBookmarked) return false;
    if (
      filters.search &&
      !p.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !p.tags.some((t) => t.toLowerCase().includes(filters.search.toLowerCase()))
    )
      return false;
    return true;
  });
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calcProgress(solved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((solved / total) * 100);
}

export function getAllTags(problems: Problem[]): string[] {
  const tags = new Set<string>();
  problems.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getAllCompanies(problems: Problem[]): string[] {
  const companies = new Set<string>();
  problems.forEach((p) => p.companies.forEach((c) => companies.add(c)));
  return Array.from(companies).sort();
}

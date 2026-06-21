import { useFilters } from '../../hooks/useFilters';
import type { Difficulty, Status } from '../../types';
import { Button } from '../ui/Button';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const STATUSES: Status[] = ['Not Started', 'In Progress', 'Solved', 'Needs Review'];

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'border-emerald-500 text-emerald-400',
  Medium: 'border-amber-500 text-amber-400',
  Hard: 'border-rose-500 text-rose-400',
};

export function FilterBar() {
  const { filters, availableTags, availableCompanies, activeFilterCount, setFilters, resetFilters, setSearch } =
    useFilters();

  function toggleDifficulty(d: Difficulty) {
    const next = filters.difficulty.includes(d)
      ? filters.difficulty.filter((x) => x !== d)
      : [...filters.difficulty, d];
    setFilters({ difficulty: next });
  }

  function toggleStatus(s: Status) {
    const next = filters.status.includes(s)
      ? filters.status.filter((x) => x !== s)
      : [...filters.status, s];
    setFilters({ status: next });
  }

  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((x) => x !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: next });
  }

  function toggleCompany(company: string) {
    const next = filters.companies.includes(company)
      ? filters.companies.filter((x) => x !== company)
      : [...filters.companies, company];
    setFilters({ companies: next });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Search + Reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Difficulty */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-20 shrink-0">
          Difficulty
        </span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => toggleDifficulty(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filters.difficulty.includes(d)
                ? `${difficultyColors[d]} bg-slate-800`
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-20 shrink-0">
          Status
        </span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => toggleStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filters.status.includes(s)
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setFilters({ bookmarked: !filters.bookmarked })}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            filters.bookmarked
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          ★ Bookmarked
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-20 shrink-0 mt-1">
          Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div className="flex flex-wrap items-start gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-20 shrink-0 mt-1">
          Companies
        </span>
        <div className="flex flex-wrap gap-2">
          {availableCompanies.map((c) => (
            <button
              key={c}
              onClick={() => toggleCompany(c)}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                filters.companies.includes(c)
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

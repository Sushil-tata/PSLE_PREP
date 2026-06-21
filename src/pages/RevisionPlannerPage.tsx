import { useApp } from '../hooks/useApp';
import { useProblems } from '../hooks/useProblems';
import { Badge } from '../components/ui/Badge';
import { getStatusBadgeClass, formatDate } from '../utils/problemUtils';
import type { RevisionEntry } from '../types';

const PRIORITY_COLORS: Record<RevisionEntry['priority'], string> = {
  High: 'bg-rose-400/10 text-rose-400 ring-rose-400/20',
  Medium: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
  Low: 'bg-slate-400/10 text-slate-400 ring-slate-400/20',
};

export function RevisionPlannerPage() {
  const { state, dispatch } = useApp();
  const { getProblemById } = useProblems();

  const grouped = state.revisionPlan.reduce<Record<string, typeof state.revisionPlan>>(
    (acc, entry) => {
      const date = entry.scheduledDate.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(grouped).sort();
  const completedCount = state.revisionPlan.filter((r) => r.completed).length;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revision Planner</h1>
          <p className="text-slate-400 mt-1">
            {completedCount} / {state.revisionPlan.length} tasks completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{
            width: `${state.revisionPlan.length ? (completedCount / state.revisionPlan.length) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Daily groups */}
      {sortedDates.map((date) => {
        const entries = grouped[date];
        const dayComplete = entries.every((e) => e.completed);

        return (
          <section key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-slate-300">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              {dayComplete && (
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  ✓ Complete
                </span>
              )}
            </div>

            <div className="space-y-2">
              {entries.map((entry) => {
                const problem = getProblemById(entry.problemId);
                if (!problem) return null;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      entry.completed
                        ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_REVISION_COMPLETE', id: entry.id })}
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        entry.completed
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-600 hover:border-indigo-500'
                      }`}
                      aria-label={entry.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {entry.completed && <span className="text-white text-xs font-bold">✓</span>}
                    </button>

                    {/* Problem info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          entry.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {problem.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadgeClass(problem.status)}>
                          {problem.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Last attempted: {formatDate(problem.lastAttempted)}
                        </span>
                      </div>
                    </div>

                    {/* Priority */}
                    <Badge className={PRIORITY_COLORS[entry.priority]}>{entry.priority}</Badge>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {state.revisionPlan.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No revision entries yet.</p>
          <p className="text-slate-500 text-sm mt-1">
            Add problems to your revision plan from the problem detail page.
          </p>
        </div>
      )}
    </div>
  );
}

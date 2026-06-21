import { useApp } from '../hooks/useApp';
import { useProblems } from '../hooks/useProblems';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getDifficultyBadgeClass, formatDate } from '../utils/problemUtils';
import { Link } from 'react-router-dom';

export function MockTestsPage() {
  const { state } = useApp();
  const { getProblemById } = useProblems();

  const completed = state.mockTests.filter((t) => t.completedAt);
  const upcoming = state.mockTests.filter((t) => !t.completedAt);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Tests</h1>
          <p className="text-slate-400 mt-1">
            Simulate real interview conditions with timed problem sets
          </p>
        </div>
        <Button variant="primary">+ Create Test</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-indigo-400">{state.mockTests.length}</p>
          <p className="text-sm text-slate-400 mt-1">Total Tests</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{completed.length}</p>
          <p className="text-sm text-slate-400 mt-1">Completed</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">
            {completed.length > 0
              ? Math.round(
                  completed.reduce((sum, t) => sum + (t.score ?? 0), 0) / completed.length
                )
              : '—'}
            {completed.length > 0 ? '%' : ''}
          </p>
          <p className="text-sm text-slate-400 mt-1">Avg Score</p>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Tests</h2>
          <div className="space-y-3">
            {upcoming.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-slate-200">{test.title}</h3>
                      <Badge className={getDifficultyBadgeClass(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                      <span>⏱ {test.duration} min</span>
                      <span>📝 {test.problems.length} problems</span>
                      <span>Created {formatDate(test.createdAt)}</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm">Start Test</Button>
                </div>

                {/* Problem list */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {test.problems.map((pid) => {
                    const p = getProblemById(pid);
                    return p ? (
                      <Link
                        key={pid}
                        to={`/problems/${p.slug}`}
                        className="text-xs bg-slate-800 text-slate-300 hover:text-indigo-400 px-2.5 py-1 rounded transition-colors"
                      >
                        {p.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Completed Tests</h2>
          <div className="space-y-3">
            {completed.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-slate-200">{test.title}</h3>
                      <Badge className={getDifficultyBadgeClass(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                      {test.score !== undefined && (
                        <span
                          className={`text-sm font-bold ${
                            test.score >= 80
                              ? 'text-emerald-400'
                              : test.score >= 60
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          Score: {test.score}%
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-slate-400">
                      <span>⏱ {test.duration} min</span>
                      <span>📝 {test.problems.length} problems</span>
                      <span>Completed {formatDate(test.completedAt)}</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Review</Button>
                </div>

                {/* Score bar */}
                {test.score !== undefined && (
                  <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        test.score >= 80
                          ? 'bg-emerald-500'
                          : test.score >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${test.score}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

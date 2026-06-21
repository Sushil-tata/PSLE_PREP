import { Link } from 'react-router-dom';
import type { Problem } from '../../types';
import { Badge } from '../ui/Badge';
import {
  getDifficultyBadgeClass,
  getStatusBadgeClass,
  formatDate,
} from '../../utils/problemUtils';
import { useProblems } from '../../hooks/useProblems';

type Props = {
  problems: Problem[];
};

export function ProblemTable({ problems }: Props) {
  const { toggleBookmark } = useProblems();

  if (problems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
        <p className="text-slate-400">No problems match your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 text-left w-8"></th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Tags</th>
              <th className="px-4 py-3 text-left">Companies</th>
              <th className="px-4 py-3 text-right">Freq</th>
              <th className="px-4 py-3 text-right">Acceptance</th>
              <th className="px-4 py-3 text-right">Last Attempt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {problems.map((p, idx) => (
              <tr
                key={p.id}
                className={`group hover:bg-slate-800/50 transition-colors ${
                  idx % 2 === 0 ? '' : 'bg-slate-900/40'
                }`}
              >
                {/* Bookmark */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleBookmark(p.id)}
                    className={`transition-colors ${
                      p.isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    aria-label={p.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    ★
                  </button>
                </td>

                {/* Title */}
                <td className="px-4 py-3">
                  <Link
                    to={`/problems/${p.slug}`}
                    className="font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                  >
                    {p.title}
                    {p.isPremium && (
                      <span className="ml-1.5 text-xs text-amber-500">🔒</span>
                    )}
                  </Link>
                  {p.attempts.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500">
                      {p.attempts.length} attempt{p.attempts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </td>

                {/* Difficulty */}
                <td className="px-4 py-3">
                  <Badge className={getDifficultyBadgeClass(p.difficulty)}>
                    {p.difficulty}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge className={getStatusBadgeClass(p.status)}>{p.status}</Badge>
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {p.tags.length > 3 && (
                      <span className="text-xs text-slate-500">+{p.tags.length - 3}</span>
                    )}
                  </div>
                </td>

                {/* Companies */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {p.companies.slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                    {p.companies.length > 2 && (
                      <span className="text-xs text-slate-500">+{p.companies.length - 2}</span>
                    )}
                  </div>
                </td>

                {/* Frequency */}
                <td className="px-4 py-3 text-right">
                  <span className="text-slate-300 font-medium">{p.frequency}</span>
                </td>

                {/* Acceptance */}
                <td className="px-4 py-3 text-right">
                  <span className="text-slate-300">{p.acceptance.toFixed(1)}%</span>
                </td>

                {/* Last Attempted */}
                <td className="px-4 py-3 text-right text-slate-500">
                  {formatDate(p.lastAttempted)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-500">
        Showing {problems.length} problem{problems.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  getDifficultyBadgeClass,
  getStatusBadgeClass,
  formatDate,
} from '../utils/problemUtils';
import type { Problem } from '../types';

const STATUS_OPTIONS: Problem['status'][] = [
  'Not Started',
  'In Progress',
  'Solved',
  'Needs Review',
];

export function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getProblemBySlug, toggleBookmark, updateStatus } = useProblems();

  if (!slug) return null;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Problem not found.</p>
        <Link to="/topics" className="text-indigo-400 hover:underline mt-2 inline-block">
          ← Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link to="/topics" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
        ← All Problems
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            <Badge className={getDifficultyBadgeClass(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            <Badge className={getStatusBadgeClass(problem.status)}>{problem.status}</Badge>
            {problem.isPremium && <Badge className="bg-amber-400/10 text-amber-400 ring-amber-400/20">🔒 Premium</Badge>}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
            <span>Acceptance: <strong className="text-slate-200">{problem.acceptance}%</strong></span>
            <span>Frequency: <strong className="text-slate-200">{problem.frequency}/100</strong></span>
            <span>Attempts: <strong className="text-slate-200">{problem.attempts.length}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toggleBookmark(problem.id)}
            className={`text-2xl transition-colors ${problem.isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
            aria-label={problem.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            ★
          </button>
          {problem.leetcodeUrl && (
            <a href={problem.leetcodeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">Open on LeetCode ↗</Button>
            </a>
          )}
        </div>
      </div>

      {/* Status changer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-medium text-slate-400 mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(problem.id, s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                problem.status === s
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tags & Companies */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span key={tag} className="bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">Companies</h2>
          <div className="flex flex-wrap gap-2">
            {problem.companies.map((c) => (
              <span key={c} className="bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded text-xs font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      {problem.notes && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Notes</h2>
          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{problem.notes}</p>
        </div>
      )}

      {/* Attempts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-sm font-medium text-slate-400 mb-4">
          Attempt History ({problem.attempts.length})
        </h2>
        {problem.attempts.length === 0 ? (
          <p className="text-slate-500 text-sm">No attempts yet. Start solving!</p>
        ) : (
          <div className="space-y-3">
            {[...problem.attempts]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((attempt, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg bg-slate-800/50 text-sm">
                  <div className="shrink-0">
                    <span
                      className={`font-medium ${
                        attempt.outcome === 'Solved'
                          ? 'text-emerald-400'
                          : attempt.outcome === 'Partial'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {attempt.outcome}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(attempt.date)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300">{attempt.notes || '—'}</p>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span>⏱ {attempt.timeTaken} min</span>
                      <span>{'</>'} {attempt.language}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

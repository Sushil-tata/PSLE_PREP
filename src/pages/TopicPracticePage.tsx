import { useParams, Link } from 'react-router-dom';
import { topics } from '../data/topics';
import { ProblemTable } from '../components/problem/ProblemTable';
import { TopicProgressCard } from '../components/problem/TopicProgressCard';
import { FilterBar } from '../components/problem/FilterBar';
import { useProblems } from '../hooks/useProblems';
import { ProgressBar } from '../components/ui/ProgressBar';
import { calcProgress } from '../utils/problemUtils';

export function TopicPracticePage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { filteredProblems, problems } = useProblems();

  // Single topic view
  if (topicId) {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) {
      return (
        <div className="p-6">
          <p className="text-slate-400">Topic not found.</p>
          <Link to="/topics" className="text-indigo-400 hover:underline mt-2 inline-block">
            ← Back to Topics
          </Link>
        </div>
      );
    }

    const topicProblems = problems.filter((p) => topic.problems.includes(p.id));
    const pct = calcProgress(topic.solvedProblems, topic.totalProblems);

    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <Link to="/topics" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Topics
          </Link>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-4xl">{topic.icon}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{topic.name}</h1>
              <p className="text-slate-400 mt-1">
                {topic.solvedProblems} / {topic.totalProblems} solved
              </p>
              <ProgressBar value={pct} className="mt-2 max-w-xs" />
            </div>
          </div>
        </div>
        <ProblemTable problems={topicProblems} />
      </div>
    );
  }

  // All topics view
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Topic Practice</h1>
        <p className="text-slate-400 mt-1">Practice problems organized by DSA topic</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {topics.map((t) => (
          <TopicProgressCard key={t.id} topic={t} />
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">All Problems</h2>
        <FilterBar />
        <div className="mt-4">
          <ProblemTable problems={filteredProblems} />
        </div>
      </div>
    </div>
  );
}

import { ProgressBar } from '../ui/ProgressBar';
import { calcProgress } from '../../utils/problemUtils';
import type { Topic } from '../../types';
import { Link } from 'react-router-dom';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
};

type Props = {
  topic: Topic;
};

export function TopicProgressCard({ topic }: Props) {
  const pct = calcProgress(topic.solvedProblems, topic.totalProblems);
  const barColor = colorMap[topic.color] ?? 'bg-indigo-500';

  return (
    <Link
      to={`/topics/${topic.id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-600 hover:bg-slate-800/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{topic.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {topic.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {topic.solvedProblems} / {topic.totalProblems} solved
            </p>
          </div>
        </div>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-400' : 'text-slate-300'}`}>
          {pct}%
        </span>
      </div>
      <ProgressBar value={pct} colorClass={barColor} />
    </Link>
  );
}

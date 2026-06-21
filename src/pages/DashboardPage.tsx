import { useStats } from '../hooks/useStats';
import { useProblems } from '../hooks/useProblems';
import { StatCard } from '../components/ui/StatCard';
import { TopicProgressCard } from '../components/problem/TopicProgressCard';
import { ProblemTable } from '../components/problem/ProblemTable';
import { topics } from '../data/topics';

export function DashboardPage() {
  const stats = useStats();
  const { problems } = useProblems();

  const recentProblems = problems
    .filter((p) => p.lastAttempted)
    .sort((a, b) =>
      new Date(b.lastAttempted!).getTime() - new Date(a.lastAttempted!).getTime()
    )
    .slice(0, 5);

  const totalProblems = problems.length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Track your interview preparation progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Solved"
          value={`${stats.totalSolved} / ${totalProblems}`}
          subtitle="All difficulties"
          icon="✓"
          colorClass="text-indigo-400"
        />
        <StatCard
          title="Easy"
          value={stats.easySolved}
          subtitle="Problems solved"
          icon="○"
          colorClass="text-emerald-400"
        />
        <StatCard
          title="Medium"
          value={stats.mediumSolved}
          subtitle="Problems solved"
          icon="◑"
          colorClass="text-amber-400"
        />
        <StatCard
          title="Hard"
          value={stats.hardSolved}
          subtitle="Problems solved"
          icon="●"
          colorClass="text-rose-400"
        />
      </div>

      {/* Streak & Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          title="Current Streak"
          value={`${stats.streak} days`}
          subtitle="Keep it up!"
          icon="🔥"
          colorClass="text-orange-400"
          trend={{ value: 17, label: 'vs last week' }}
        />
        <StatCard
          title="Total Attempts"
          value={stats.totalAttempts}
          subtitle="Including revisits"
          icon="⟳"
          colorClass="text-blue-400"
        />
        <StatCard
          title="Bookmarked"
          value={problems.filter((p) => p.isBookmarked).length}
          subtitle="For revision"
          icon="★"
          colorClass="text-amber-400"
        />
      </div>

      {/* Topic Progress */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Topic Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {topics.map((t) => (
            <TopicProgressCard key={t.id} topic={t} />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <ProblemTable problems={recentProblems} />
      </section>
    </div>
  );
}

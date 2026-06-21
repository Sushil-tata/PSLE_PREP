import type { ReactNode } from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  colorClass?: string;
};

export function StatCard({ title, value, subtitle, icon, trend, colorClass = 'text-indigo-400' }: Props) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <p
          className={`text-xs font-medium ${
            trend.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}

type Props = {
  value: number; // 0–100
  className?: string;
  colorClass?: string;
};

export function ProgressBar({ value, className = '', colorClass = 'bg-indigo-500' }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-2 w-full rounded-full bg-slate-700 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

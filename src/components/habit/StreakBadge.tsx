interface Props {
  count: number;
  goalMet?: boolean;
}

export default function StreakBadge({ count, goalMet }: Props) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
        goalMet ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
      }`}
      title={goalMet ? "You hit today's goal!" : 'Complete a lesson or 3 problems today to extend your streak'}
    >
      <span className={goalMet ? '' : 'opacity-50'}>🔥</span>
      <span>{count}</span>
    </div>
  );
}

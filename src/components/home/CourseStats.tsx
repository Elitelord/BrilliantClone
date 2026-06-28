import { getOrderedLessons } from '../../content';
import { useProgressStore } from '../../store/progressStore';
import { computeCourseStats } from '../../lib/courseStats';
import ProgressRing from '../common/ProgressRing';

function StatChip({ value, total, label, color }: { value: number; total: number; label: string; color: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
      <div className={`text-xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold leading-tight text-slate-400">
        {label}
        <span className="block text-slate-300">of {total}</span>
      </div>
    </div>
  );
}

export default function CourseStats() {
  const data = useProgressStore((s) => s.data);
  const lessons = getOrderedLessons();
  const stats = computeCourseStats(lessons, data?.progress ?? {});

  return (
    <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <ProgressRing percent={stats.masteryPercent} stroke="#6366f1" />
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            Course mastery
          </div>
          <p className="text-sm text-slate-500">
            {stats.mastered > 0
              ? `You've mastered ${stats.mastered} of ${stats.total} lessons.`
              : 'Master lessons by scoring well to grow your bar.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatChip value={stats.mastered} total={stats.total} label="Mastered" color="text-emerald-600" />
        <StatChip value={stats.completed} total={stats.total} label="Completed" color="text-brand-600" />
        <StatChip value={stats.notStarted} total={stats.total} label="Not started" color="text-slate-500" />
      </div>
    </div>
  );
}

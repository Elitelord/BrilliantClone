import { useProgressStore } from '../../store/progressStore';
import { computeRetentionStats } from '../../lib/review/metrics';
import { retrievability } from '../../lib/scheduler';
import { conceptLabel, conceptMasteryTarget } from '../../lib/concepts';

function RetentionRing({ percent }: { percent: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative flex-none">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 38 38)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none text-slate-800">{percent}%</span>
      </div>
    </div>
  );
}

function StatChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2 text-center">
      <div className={`text-xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold leading-tight text-slate-400">{label}</div>
    </div>
  );
}

function dotColor(recall: number, target: number): string {
  if (recall >= target) return 'bg-emerald-400';
  if (recall >= target * 0.5) return 'bg-amber-400';
  return 'bg-rose-300';
}

/**
 * Phase 3 "measure the effect" surface. Shows RETENTION — current recall strength per
 * concept and how many are solid / fading / due — never engagement or time-on-task.
 * Hidden until the learner has tracked concepts.
 */
export default function RetentionPanel() {
  const data = useProgressStore((s) => s.data);
  const mastery = data?.mastery ?? {};
  const now = Date.now();
  const stats = computeRetentionStats(mastery, now);
  if (stats.tracked === 0) return null;

  const records = Object.values(mastery).sort(
    (a, b) => retrievability(a, now) - retrievability(b, now),
  );
  const pct = Math.round(stats.avgRetrievability * 100);

  return (
    <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <RetentionRing percent={pct} />
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-600">Memory</div>
          <p className="text-sm text-slate-500">
            {stats.dueCount > 0
              ? `${stats.dueCount} concept${stats.dueCount === 1 ? '' : 's'} due for review — recall fades over time.`
              : 'Everything is fresh right now. Concepts resurface as they fade.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatChip value={stats.masteredNow} label="Solid" color="text-emerald-600" />
        <StatChip value={stats.fadingCount} label="Fading" color="text-amber-600" />
        <StatChip value={stats.dueCount} label="Due" color="text-rose-500" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" aria-hidden>
        {records.map((rec) => {
          const recall = retrievability(rec, now);
          const target = conceptMasteryTarget(rec.conceptId);
          return (
            <span
              key={rec.conceptId}
              title={`${conceptLabel(rec.conceptId)} · ${Math.round(recall * 100)}% recall`}
              className={`h-2.5 w-2.5 rounded-full ${dotColor(recall, target)}`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span>Each dot is a concept you&apos;ve practiced, by how well you&apos;d recall it now:</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />Solid
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />Fading
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-300" />Needs review
        </span>
      </div>
    </div>
  );
}

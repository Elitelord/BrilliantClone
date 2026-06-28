import type { Confidence } from '../../lib/metacognition/confidence';

const OPTIONS: { id: Confidence; label: string }[] = [
  { id: 'guess', label: 'Guessing' },
  { id: 'likely', label: 'Pretty sure' },
  { id: 'certain', label: 'Certain' },
];

// Optional one-tap "how sure are you?" before checking an answer. A low-confidence correct
// earns less mastery (resurfaces sooner) — see lib/metacognition/confidence.ts.
export default function ConfidenceChips({
  value,
  onChange,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-400">How sure?</span>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
            value === o.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

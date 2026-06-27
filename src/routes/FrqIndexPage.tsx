import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { FRQ_BANK } from '../content/frqBank';
import { useAuthStore } from '../store/authStore';
import { getFrqResults } from '../lib/frqProgress';
import { MASTERY_THRESHOLD } from '../lib/mastery';

function stimulusLabel(n: number): string {
  return n === 0 ? 'No stimulus' : n === 1 ? '1 stimulus' : `${n} stimuli`;
}

export default function FrqIndexPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const results = profile?.uid ? getFrqResults(profile.uid) : {};
  return (
    <AppShell className="pb-16">
      <header className="flex items-center gap-3 py-5">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          aria-label="Back to course"
        >
          ←
        </button>
        <div>
          <p className="text-sm text-slate-400">Exam practice</p>
          <h1 className="text-xl font-extrabold text-slate-800">AP-style free response</h1>
        </div>
      </header>

      <p className="mb-4 text-sm text-slate-500">
        Practice College Board–style FRQs. Each part is worth one point; you&apos;ll see the scoring
        rubric and a model answer after every part.
      </p>

      <div className="space-y-3">
        {FRQ_BANK.map((frq) => {
          const result = results[frq.id];
          const pct = result ? Math.round((result.best / result.total) * 100) : 0;
          const mastered = result ? pct >= MASTERY_THRESHOLD : false;
          return (
            <button
              key={frq.id}
              type="button"
              onClick={() => navigate(`/frq/${frq.id}`)}
              className="w-full rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] hover:border-indigo-200"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                <span>{stimulusLabel(frq.stimuli?.length ?? 0)}</span>
                <span className="text-slate-300">·</span>
                <span>{frq.parts.length} pts</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-800">{frq.title}</div>
              {frq.intro && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{frq.intro}</p>}
              {result ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      mastered ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {mastered ? '✓ Mastered' : 'Completed'}
                  </span>
                  <span className="text-slate-500">
                    Best {result.best}/{result.total} ({pct}%)
                  </span>
                  <span className="text-slate-300">· tap to retry</span>
                </div>
              ) : (
                <div className="mt-2.5 text-xs font-medium text-slate-400">Not attempted yet</div>
              )}
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}

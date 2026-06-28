import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Frq } from '../../types/frq';
import { partToExplainConfig } from '../../types/frq';
import type { ExplainBackState } from '../../types/interaction';
import { useProgressStore } from '../../store/progressStore';
import { isAiEnabled } from '../../lib/ai';
import { gradeAutoCheck } from '../../lib/frqGrading';
import { gradeFrqPart } from '../../lib/ai/features/frqGrade';
import { recordFrqResult } from '../../lib/frqProgress';
import { useEnterKey } from '../../lib/hooks/useEnterKey';
import ExplainBack from '../interactions/ExplainBack';
import FrqStimulusView from './FrqStimulus';
import FeedbackBar, { type FeedbackTone } from '../lesson/FeedbackBar';
import StepProgress from '../lesson/StepProgress';

const VERB_LABEL: Record<string, string> = {
  identify: 'Identify',
  define: 'Define',
  describe: 'Describe',
  explain: 'Explain',
  compare: 'Compare',
};

function Shell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-y-0 left-1/2 flex w-full max-w-2xl -translate-x-1/2 flex-col overflow-hidden bg-slate-50 lg:max-w-3xl">
      <div className="pt-safe flex flex-none items-center gap-3 px-4 pb-3">
        <button
          type="button"
          onClick={() => navigate('/frq')}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          aria-label="Exit FRQ practice"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-sm font-semibold text-slate-600">{title}</div>
      </div>
      {children}
    </div>
  );
}

type Status = 'answering' | 'grading' | 'graded' | 'selfgrade';

export default function FrqRunner({ frq }: { frq: Frq }) {
  const navigate = useNavigate();
  const store = useProgressStore();
  const parts = frq.parts;

  const [idx, setIdx] = useState(0);
  const [explainState, setExplainState] = useState<ExplainBackState | null>(null);
  const [status, setStatus] = useState<Status>('answering');
  const [result, setResult] = useState<{ earned: boolean; feedback?: string; canonical?: string } | null>(null);
  const [earnedCount, setEarnedCount] = useState(0);
  const [partResults, setPartResults] = useState<{ label: string; taskVerb: string; earned: boolean }[]>([]);
  const [done, setDone] = useState(false);

  // Persist the per-FRQ score once the set is finished, keeping the best across retries.
  useEffect(() => {
    if (!done) return;
    const uid = useProgressStore.getState().data?.profile.uid;
    if (uid) recordFrqResult(uid, frq.id, earnedCount, parts.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const part = parts[idx];
  const text = explainState?.text.trim() ?? '';
  const minChars = part.autoCheck ? 1 : part.minChars ?? 15;
  const canSubmit = text.length >= minChars;
  const isLast = idx >= parts.length - 1;

  const record = (earned: boolean) => {
    setEarnedCount((c) => c + (earned ? 1 : 0));
    setPartResults((rs) => [...rs, { label: part.label, taskVerb: part.taskVerb, earned }]);
    store.registerReviewResult(part.concepts, earned);
  };

  const goNext = () => {
    if (isLast) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setExplainState(null);
    setStatus('answering');
    setResult(null);
  };

  const handlePrimary = async () => {
    if (status !== 'answering' || !canSubmit) return;
    if (part.autoCheck) {
      const { earned, canonical } = gradeAutoCheck(part.autoCheck, text);
      setResult({ earned, canonical });
      record(earned);
      setStatus('graded');
      return;
    }
    if (isAiEnabled) {
      setStatus('grading');
      const graded = await gradeFrqPart(part, frq.stimulusSummary, text);
      if (graded) {
        setResult({ earned: graded.result.correct, feedback: graded.feedback });
        record(graded.result.correct);
        setStatus('graded');
      } else {
        setStatus('selfgrade'); // AI unavailable → self-grade against rubric + model answer
      }
      return;
    }
    setStatus('selfgrade'); // AI off → self-grade
  };

  const selfMark = (earned: boolean) => {
    setResult({ earned });
    record(earned);
    goNext();
  };

  // Enter advances: submit while answering, continue once graded. (Self-grade has two
  // choices, so it's excluded; Cmd/Ctrl+Enter submits from the free-text box.)
  useEnterKey(
    () => {
      if (status === 'answering') {
        if (canSubmit) void handlePrimary();
      } else if (status === 'graded') {
        goNext();
      }
    },
    !done && (status === 'answering' || status === 'graded'),
  );

  if (done) {
    return (
      <Shell title={frq.title}>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl"
          >
            📝
          </motion.div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-800">FRQ complete!</h1>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="text-4xl font-extrabold text-indigo-600">
              {earnedCount}/{parts.length}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">points</div>
          </div>
          <div className="mt-4 w-full max-w-sm space-y-1.5 text-left">
            {partResults.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-600">
                  Part {r.label} · {VERB_LABEL[r.taskVerb] ?? r.taskVerb}
                </span>
                <span className={r.earned ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-500'}>
                  {r.earned ? '✓ 1' : '0'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            On the real exam each part is one point. Compare your answers to the model answers — the
            rubric is what earns the point, not length.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 w-full max-w-sm rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20"
          >
            Back to course
          </button>
        </div>
      </Shell>
    );
  }

  const revealing = status === 'graded' || status === 'selfgrade';

  let feedback: { tone: FeedbackTone; message: string } | null = null;
  if (status === 'graded' && result) {
    if (part.autoCheck) {
      feedback = {
        tone: result.earned ? 'correct' : 'wrong',
        message: result.earned ? 'Point earned ✓' : `Not quite — the answer is ${result.canonical}.`,
      };
    } else {
      feedback = {
        tone: result.earned ? 'correct' : 'wrong',
        message: result.feedback ?? (result.earned ? 'Point earned ✓' : 'Point not earned.'),
      };
    }
  }

  return (
    <Shell title={frq.title}>
      <div className="px-4">
        <StepProgress current={idx} total={parts.length} />
        <p className="mt-2 text-xs font-medium text-slate-400">
          Part {part.label} · {VERB_LABEL[part.taskVerb] ?? part.taskVerb} · FRQ practice
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={part.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4"
          >
            {frq.intro && (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                {frq.intro}
              </p>
            )}

            {frq.stimuli && frq.stimuli.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {frq.stimuli.map((s, i) => (
                  <FrqStimulusView key={i} stimulus={s} />
                ))}
              </div>
            )}

            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <ExplainBack
                key={part.id}
                config={partToExplainConfig(part)}
                onChange={setExplainState}
                disabled={status !== 'answering'}
                showSample={revealing}
              />
            </div>

            {revealing && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-700">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To earn this point
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  {part.rubric.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {status === 'selfgrade' && (
                  <p className="mt-2 text-xs text-slate-500">
                    Compare your answer to the model answer above, then mark whether you earned the point.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe relative flex-none border-t border-slate-100 bg-white px-4 pt-3">
        {feedback && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full px-4 pb-3 pt-6">
            <div className="pointer-events-auto">
              <FeedbackBar tone={feedback.tone} message={feedback.message} />
            </div>
          </div>
        )}

        {status === 'selfgrade' ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => selfMark(false)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-base font-semibold text-slate-600 active:scale-[0.99]"
            >
              I missed it
            </button>
            <button
              type="button"
              onClick={() => selfMark(true)}
              className="flex-1 rounded-2xl bg-brand-600 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
            >
              I got it
            </button>
          </div>
        ) : status === 'graded' ? (
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
          >
            {isLast ? 'See results' : 'Continue'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePrimary}
            disabled={!canSubmit || status === 'grading'}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {status === 'grading' ? 'Grading…' : part.autoCheck || isAiEnabled ? 'Check' : 'Reveal model answer'}
          </button>
        )}
      </div>
    </Shell>
  );
}

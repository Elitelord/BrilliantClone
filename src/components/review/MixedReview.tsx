import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Step, ValidationResult } from '../../types/content';
import type { InteractionState, McState } from '../../types/interaction';
import { validate, resolveFeedback, resolveWrongFeedback } from '../../lib/validators';
import { useProgressStore } from '../../store/progressStore';
import { getOrderedLessons } from '../../content';
import { isAiEnabled } from '../../lib/ai';
import { buildReviewQueue } from '../../lib/review/session';
import { prepareAuthoredReviewStep } from '../../lib/review/authoredItems';
import { markReviewedToday } from '../../lib/review/dailyReview';
import { bankItemsForConcepts } from '../../content/reviewBank';
import { retrievability } from '../../lib/scheduler';
import { generateReviewItems, attributeReviewConcept } from '../../lib/ai/features/reviewItems';
import type { VerifiedSkillCheckQuestion } from '../../lib/ai/verify';
import { canCheck } from '../lesson/stepInput';
import { useEnterKey } from '../../lib/hooks/useEnterKey';
import InteractionRenderer from '../interactions/InteractionRenderer';
import MultipleChoice from '../interactions/MultipleChoice';
import FeedbackBar, { type FeedbackTone } from '../lesson/FeedbackBar';
import StepProgress from '../lesson/StepProgress';
import Spinner from '../common/Spinner';
import ConfidenceChips from '../lesson/ConfidenceChips';
import type { Confidence } from '../../lib/metacognition/confidence';

const MAX_AUTHORED = 6;
const MAX_AI = 2;

type Entry =
  | { kind: 'authored'; concepts: string[]; step: Step }
  | { kind: 'ai'; concepts: string[]; question: VerifiedSkillCheckQuestion };

function Shell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-y-0 left-1/2 flex w-full max-w-2xl -translate-x-1/2 flex-col overflow-hidden bg-slate-50 lg:max-w-3xl">
      <div className="pt-safe flex flex-none items-center gap-3 px-4 pb-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          aria-label="Exit review"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-sm font-semibold text-slate-600">{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function MixedReview() {
  const navigate = useNavigate();
  const store = useProgressStore();

  const [phase, setPhase] = useState<'loading' | 'review' | 'done' | 'empty'>('loading');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [iState, setIState] = useState<InteractionState | null>(null);
  const [mcState, setMcState] = useState<McState | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [locked, setLocked] = useState(false);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [recall, setRecall] = useState<{ before: number; after: number; gain: number; count: number } | null>(
    null,
  );
  const beforeRef = useRef<Record<string, number>>({});

  // Enter triggers the current primary action; the action is refreshed each render path
  // (the phase early-returns below would otherwise make a direct hook call conditional).
  const enterActionRef = useRef<() => void>(() => {});
  useEnterKey(() => enterActionRef.current());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = useProgressStore.getState().data;
      if (!data) {
        setPhase('empty');
        return;
      }
      const now = Date.now();
      const queue = buildReviewQueue(getOrderedLessons(), data.progress, data.mastery, now, {
        max: MAX_AUTHORED,
      });
      if (queue.length === 0) {
        setPhase('empty');
        return;
      }

      const dueList = [...new Set(queue.flatMap((q) => q.concepts))];

      // Fresh MCQ pool for the due concepts: AI-generated (when on) first, then the
      // authored review bank (always available — so AI-off reviews still get fresh items).
      const freshPool: { question: VerifiedSkillCheckQuestion; concepts: string[] }[] = [];
      if (isAiEnabled) {
        const generated = await generateReviewItems(dueList, data.mastery);
        if (cancelled) return;
        for (const q of (generated ?? []).slice(0, MAX_AI)) {
          const concept = attributeReviewConcept(q.template, dueList);
          freshPool.push({ question: q, concepts: concept ? [concept] : [] });
        }
      }
      freshPool.push(...bankItemsForConcepts(dueList));

      // Each interleaved queue slot becomes a fresh MCQ for one of its concepts when one
      // is available, else the replayed authored step (scaffolds stripped).
      const usedFresh = new Set<number>();
      const composed: Entry[] = queue.map((item) => {
        const idx = freshPool.findIndex(
          (f, i) => !usedFresh.has(i) && f.concepts.some((c) => item.concepts.includes(c)),
        );
        if (idx >= 0) {
          usedFresh.add(idx);
          return { kind: 'ai', concepts: item.concepts, question: freshPool[idx].question };
        }
        return { kind: 'authored', concepts: item.concepts, step: prepareAuthoredReviewStep(item.step) };
      });

      const before: Record<string, number> = {};
      for (const e of composed) {
        for (const c of e.concepts) {
          const rec = data.mastery[c];
          before[c] = rec ? retrievability(rec, now) : 0;
        }
      }
      beforeRef.current = before;
      setEntries(composed);
      setPhase('review');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = () => {
    const data = useProgressStore.getState().data;
    const now = Date.now();
    const ids = Object.keys(beforeRef.current);
    const after: Record<string, number> = {};
    if (data) {
      for (const c of ids) {
        const rec = data.mastery[c];
        after[c] = rec ? retrievability(rec, now) : 0;
      }
    }
    const avg = (obj: Record<string, number>) =>
      ids.length ? ids.reduce((s, c) => s + (obj[c] ?? 0), 0) / ids.length : 0;
    const before = avg(beforeRef.current);
    const afterAvg = avg(after);
    setRecall({
      before: Math.round(before * 100),
      after: Math.round(afterAvg * 100),
      gain: Math.round((afterAvg - before) * 100),
      count: ids.length,
    });
    if (data) markReviewedToday(data.profile.uid);
    setPhase('done');
  };

  const goNext = () => {
    if (idx >= entries.length - 1) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setIState(null);
    setMcState(null);
    setResult(null);
    setLocked(false);
    setConfidence(null);
  };

  const recordAndLock = (concepts: string[], r: ValidationResult) => {
    setResult(r);
    setLocked(true);
    if (r.correct) setCorrectCount((c) => c + 1);
    store.registerReviewResult(concepts, r.correct, confidence ?? undefined);
  };

  if (phase === 'loading') {
    return (
      <Shell title="Daily review">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <Spinner />
          <p className="text-sm text-slate-500">Building your review…</p>
        </div>
      </Shell>
    );
  }

  if (phase === 'empty') {
    enterActionRef.current = () => navigate('/');
    return (
      <Shell title="Daily review">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">✅</div>
          <p className="mt-4 text-lg font-bold text-slate-800">Nothing due right now</p>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Your concepts are still fresh. They&apos;ll resurface here for review as they fade — come
            back tomorrow.
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

  if (phase === 'done') {
    const total = entries.length;
    enterActionRef.current = () => navigate('/');
    return (
      <Shell title="Daily review">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl"
          >
            🧠
          </motion.div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-800">Review complete!</h1>
          <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-3xl font-extrabold text-brand-600">
                {correctCount}/{total}
              </div>
              <div className="text-xs font-medium text-slate-500">Recalled this session</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-3xl font-extrabold text-teal-600">{recall ? `${recall.after}%` : '—'}</div>
              <div className="text-xs font-medium text-slate-500">
                Recall now{recall ? ` · was ${recall.before}%` : ''}
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-500">
            {recall && recall.gain > 0
              ? `Your estimated recall on ${recall.count} concept${recall.count === 1 ? '' : 's'} rose from ${recall.before}% to ${recall.after}% — pulling a fading idea back is exactly what makes it stick.`
              : 'Reviewing these again over the next few days will lock them in.'}
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

  const entry = entries[idx];
  if (!entry) return null;
  const checkDisabled =
    entry.kind === 'authored' ? !canCheck(entry.step, iState) : !mcState?.selectedId;

  const submitCurrent = () => {
    if (entry.kind === 'ai') {
      if (!mcState?.selectedId) return;
      recordAndLock(entry.concepts, { correct: mcState.selectedId === entry.question.correctId });
    } else {
      recordAndLock(entry.concepts, validate(entry.step.interaction, entry.step.answer, iState));
    }
  };
  enterActionRef.current = locked ? goNext : checkDisabled ? () => {} : submitCurrent;

  let feedback: { tone: FeedbackTone; message: string; concept?: string } | null = null;
  if (result) {
    if (entry.kind === 'ai') {
      const correctLabel =
        entry.question.options.find((o) => o.id === entry.question.correctId)?.label ?? '';
      feedback = {
        tone: result.correct ? 'correct' : 'wrong',
        message: result.correct ? 'Correct!' : `Not quite — the answer was ${correctLabel}.`,
        concept: entry.question.explanation,
      };
    } else {
      feedback = {
        tone: result.correct ? 'correct' : 'wrong',
        message: result.correct
          ? resolveFeedback(entry.step.feedback, result)
          : resolveWrongFeedback(entry.step, result),
      };
    }
  }

  return (
    <Shell title="Daily review">
      <div className="px-4">
        <StepProgress current={idx} total={entries.length} />
        <p className="mt-2 text-xs font-medium text-slate-400">
          {entry.kind === 'ai' ? 'Fresh AP-style question' : 'Retrieval'} · mixed review
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col"
          >
            <h2 className="text-lg font-bold leading-snug text-slate-800">
              {entry.kind === 'ai' ? entry.question.prompt : entry.step.prompt}
            </h2>

            <div className="mt-5">
              {entry.kind === 'authored' && entry.step.reference && (
                <div className="mx-auto mb-3 w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <InteractionRenderer
                    key={`ref-${idx}`}
                    interaction={entry.step.reference}
                    onChange={() => {}}
                    disabled
                  />
                </div>
              )}
              <div className="mx-auto w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                {entry.kind === 'ai' ? (
                  <MultipleChoice
                    key={`ai-${idx}`}
                    config={{ options: entry.question.options }}
                    onChange={setMcState}
                    disabled={locked}
                    result={result ? { correct: result.correct } : null}
                  />
                ) : (
                  <InteractionRenderer
                    key={`auth-${idx}`}
                    interaction={entry.step.interaction}
                    answer={entry.step.answer}
                    onChange={setIState}
                    disabled={locked}
                    result={result}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe relative flex-none border-t border-slate-100 bg-white px-4 pt-3">
        {feedback && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full px-4 pb-3 pt-6">
            <div className="pointer-events-auto">
              <FeedbackBar tone={feedback.tone} message={feedback.message} concept={feedback.concept} />
            </div>
          </div>
        )}
        {!locked && !result && !checkDisabled && (
          <ConfidenceChips value={confidence} onChange={setConfidence} />
        )}
        {locked ? (
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
          >
            {idx >= entries.length - 1 ? 'See results' : 'Continue'}
          </button>
        ) : (
          <button
            type="button"
            onClick={submitCurrent}
            disabled={checkDisabled}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            Check
          </button>
        )}
      </div>
    </Shell>
  );
}

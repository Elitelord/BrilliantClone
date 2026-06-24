import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Interaction, Lesson, Step, ValidationResult } from '../../types/content';
import type { InteractionState, McState, PyramidState, SectorState, StageSelectState } from '../../types/interaction';
import { validate, resolveFeedback } from '../../lib/validators';
import { useProgressStore } from '../../store/progressStore';
import { getOrderedLessons } from '../../content';
import { recommendNext, computeLessonScore, countFirstTryCorrect, isLessonComplete, isLessonUnlocked } from '../../lib/mastery';
import InteractionRenderer from '../interactions/InteractionRenderer';
import StepProgress from './StepProgress';
import FeedbackBar, { type FeedbackTone } from './FeedbackBar';
import ConceptHint from './ConceptHint';
import Celebration from './Celebration';

function canCheck(step: Step, st: InteractionState | null): boolean {
  if (!st) return false;
  const { interaction } = step;
  if (interaction.type === 'multiple-choice') return !!(st as McState).selectedId;
  if (interaction.type === 'stage-select') return (st as StageSelectState).selectedStage != null;
  if (interaction.type === 'population-pyramid' && interaction.config.mode === 'classify')
    return (st as PyramidState).selectedStage != null;
  if (interaction.type === 'sector-bars' && interaction.config.mode === 'classify')
    return (st as SectorState).selectedStage != null;
  return true;
}

// Selection-style steps reset their pick on "Try again" (a fresh remount so the
// learner re-chooses). Drag steps instead keep their current shape to nudge.
function isSelectionStep(step: Step): boolean {
  const { interaction } = step;
  if (interaction.type === 'multiple-choice' || interaction.type === 'stage-select') return true;
  if (interaction.type === 'population-pyramid' && interaction.config.mode === 'classify') return true;
  if (interaction.type === 'sector-bars' && interaction.config.mode === 'classify') return true;
  return false;
}

function suppressWrongHint(step: Step): boolean {
  const { interaction } = step;
  if (interaction.type === 'multiple-choice') return true;
  if (interaction.type === 'population-pyramid') return true;
  if (interaction.type === 'rate-graph' && interaction.config.snap) return true;
  if (interaction.type === 'rate-sliders' || interaction.type === 'nir-slider') return true;
  if (interaction.type === 'curve-draw') return true;
  return false;
}

function genericWrongMessage(step: Step): string {
  const { interaction } = step;
  if (interaction.type === 'multiple-choice') return 'Not quite — try again.';
  if (interaction.type === 'population-pyramid' && interaction.config.mode === 'classify') {
    return 'That stage doesn\'t match — try again.';
  }
  if (interaction.type === 'population-pyramid') return 'Keep adjusting — the shape isn\'t right yet.';
  if (interaction.type === 'rate-sliders') return 'Not quite — think about what keeps a pyramid\'s base wide.';
  if (interaction.type === 'curve-draw') return 'Some points still need adjusting.';
  return resolveFeedback(step.feedback, { correct: false });
}

// viewBox aspect ratio (width / height) of each SVG-based interaction. Used so
// the white card can hug the graph's actual rendered width once the chart is
// height-capped (max-h-chart) and would otherwise letterbox with large empty
// horizontal space. Non-chart interactions return null (card stays full width).
function chartAspect(interaction: Interaction): number | null {
  switch (interaction.type) {
    case 'rate-graph': {
      const c = interaction.config;
      // The population/NIR explore variant lays itself out two-column, so it keeps
      // the full card width rather than hugging the graph alone.
      if (!c.overview && !c.historical && c.showPopulationBar !== false) return null;
      return c.historical ? 360 / 298 : 360 / 252;
    }
    case 'country-model':
      // Lays itself out two-column (readout + graph) on wide screens, so it keeps
      // the full card width rather than hugging the graph alone.
      return null;
    case 'curve-draw':
      return 360 / 250;
    case 'stage-select':
      return 360 / 242;
    case 'population-pyramid':
      // The stage-preset explore variant lays out two-column, so keep full card width.
      if (interaction.config.showStagePresets) return null;
      return (interaction.config.illustrate ? 356 : 320) / 320;
    case 'sector-bars':
      return 320 / 236;
    default:
      return null;
  }
}

// Card sizing that makes the border hug a height-capped chart (plus padding),
// centered, on wider screens — while collapsing to full width on phones (where
// the chart is width-driven and the max-width never binds). Mirrors the
// `max-h-chart` token: clamp(190px, 46vh, 430px).
function chartCardStyle(interaction: Interaction): CSSProperties | undefined {
  const aspect = chartAspect(interaction);
  if (!aspect) return undefined;
  // padding: p-4 => 1rem each side => 2rem total.
  return { maxWidth: `calc(clamp(190px, 46vh, 430px) * ${aspect} + 2rem)` };
}

export default function LessonRunner({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const store = useProgressStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [iState, setIState] = useState<InteractionState | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  // Bumped to force a fresh remount of selection interactions on "Try again".
  const [attemptKey, setAttemptKey] = useState(0);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  // Wrong checks this lesson run only — drives first-try score (not persisted attempts).
  const [sessionWrong, setSessionWrong] = useState<Record<string, number>>({});
  // Gate step→store sync until restore-from-saved-progress finishes (avoids
  // writing stepIndex=0 over a saved mid-lesson index on mount).
  const [restored, setRestored] = useState(false);

  // Run once on lesson entry — never during render (that caused re-render loops).
  useEffect(() => {
    setRestored(false);
    store.ensureLessonStarted(lesson);
    store.reopenLessonIfComplete(lesson);
    const p = store.getLessonProgress(lesson.id);
    const idx = p ? Math.min(p.currentStepIndex, lesson.steps.length - 1) : 0;
    setStepIndex(idx);
    store.setCurrentStep(lesson.id, idx);
    setIState(null);
    setResult(null);
    setLocked(false);
    setAttemptKey(0);
    setFinished(false);
    setSessionWrong({});
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  // Keep the saved step in sync so exit/re-enter resumes at the right slide.
  useEffect(() => {
    if (!restored) return;
    store.setCurrentStep(lesson.id, stepIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, stepIndex, restored]);

  useEffect(() => {
    setFeedbackDismissed(false);
  }, [lesson.id, stepIndex]);

  useEffect(() => {
    if (result) setFeedbackDismissed(false);
  }, [result]);

  const step = lesson.steps[stepIndex];
  const isLearn = step.kind === 'learn' || step.interaction.type === 'info';
  const isExplore = step.kind === 'explore' || isLearn;
  const isLast = stepIndex === lesson.steps.length - 1;

  const handleChange = (s: InteractionState) => {
    setIState(s);
    if (!locked) setResult(null);
  };

  const handleCheck = () => {
    const r = validate(step.interaction, step.answer, iState);
    setResult(r);
    if (r.correct) {
      setLocked(true);
      const firstTry = (sessionWrong[step.id] ?? 0) === 0;
      store.registerCorrect(lesson, step, firstTry);
    } else {
      setSessionWrong((prev) => ({ ...prev, [step.id]: (prev[step.id] ?? 0) + 1 }));
      store.registerWrong(lesson, step);
    }
  };

  // "Try again": clear the verdict. Selection steps remount to drop the pick and
  // hide the feedback; drag steps keep their shape so the learner can adjust.
  const handleRetry = () => {
    setResult(null);
    if (isSelectionStep(step)) {
      setIState(null);
      setAttemptKey((k) => k + 1);
    }
  };

  const goNext = () => {
    if (isLast) {
      store.completeLesson(lesson);
      setFinished(true);
      return;
    }
    const next = stepIndex + 1;
    store.setCurrentStep(lesson.id, next);
    setStepIndex(next);
    setIState(null);
    setResult(null);
    setLocked(false);
    setAttemptKey(0);
  };

  if (finished) {
    return <CompletionScreen lesson={lesson} />;
  }

  // feedback content — explore/learn hints live in the ? icon, not the sticky bar
  let feedback: { tone: FeedbackTone; message: string } | null = null;
  if (result) {
    if (result.correct) {
      feedback = { tone: 'correct', message: resolveFeedback(step.feedback, result) };
    } else {
      const hideHint = suppressWrongHint(step);
      feedback = {
        tone: 'wrong',
        message: hideHint ? genericWrongMessage(step) : resolveFeedback(step.feedback, result),
      };
    }
  }

  const showContinue = isExplore || locked;
  const checkDisabled = !canCheck(step, iState);
  const showFeedback = feedback && !feedbackDismissed;
  const conceptHintText =
    step.concept ?? (isExplore && step.feedback.onExplore ? step.feedback.onExplore : undefined);

  return (
    <div className="fixed inset-y-0 left-1/2 flex w-full max-w-2xl -translate-x-1/2 flex-col overflow-hidden bg-slate-50 lg:max-w-6xl">
      {/* top bar — stays pinned so progress is always visible */}
      <div className="pt-safe flex flex-none items-center gap-3 px-4 pb-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          aria-label="Exit lesson"
        >
          ✕
        </button>
        <StepProgress current={stepIndex} total={lesson.steps.length} />
      </div>

      {/* step body — the only scrollable region */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {labelForKind(step.kind)}
              </div>
              {conceptHintText && <ConceptHint text={conceptHintText} />}
            </div>
            <h2 className="text-lg font-bold leading-snug text-slate-800">{step.prompt}</h2>

            <div
              className={
                step.reference
                  ? 'mt-5 grid gap-3 lg:grid-cols-2 lg:items-start lg:gap-6'
                  : 'mt-5'
              }
            >
              {step.reference && (
                <div
                  className="mx-auto min-w-0 w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                  style={chartCardStyle(step.reference)}
                >
                  <InteractionRenderer
                    key={`${step.id}-ref`}
                    interaction={step.reference}
                    onChange={() => {}}
                    disabled
                  />
                </div>
              )}

              <div
                className="mx-auto min-w-0 w-full rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                style={chartCardStyle(step.interaction)}
              >
                <InteractionRenderer
                  key={`${step.id}-${attemptKey}`}
                  interaction={step.interaction}
                  answer={step.answer}
                  onChange={handleChange}
                  disabled={locked}
                  result={result}
                />
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* pinned action area: the button stays in flow; feedback floats above it
          as an overlay so it never changes layout or creates page scroll. */}
      <div className="pb-safe relative flex-none border-t border-slate-100 bg-white px-4 pt-3">
        {showFeedback && feedback && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full bg-gradient-to-t from-white/40 via-white/15 to-transparent px-4 pb-3 pt-10">
            <div className="pointer-events-auto">
              <FeedbackBar
                tone={feedback.tone}
                message={feedback.message}
                onDismiss={() => setFeedbackDismissed(true)}
              />
            </div>
          </div>
        )}
        {showContinue ? (
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99]"
          >
            {isLast ? 'Finish lesson' : 'Continue'}
          </button>
        ) : result && !result.correct ? (
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99]"
          >
            Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            disabled={checkDisabled}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}

function labelForKind(kind: Step['kind']): string {
  switch (kind) {
    case 'explore':
      return 'Explore';
    case 'predict':
      return 'Predict';
    case 'solve':
      return 'Solve';
    case 'connect':
      return 'Connect';
    case 'learn':
      return 'Learn';
    default:
      return 'Problem';
  }
}

function CompletionScreen({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const progress = useProgressStore((s) => s.data?.progress[lesson.id]);
  const streak = useProgressStore((s) => s.data?.streak.count ?? 0);
  const userData = useProgressStore((s) => s.data);
  const score = progress ? computeLessonScore(lesson, progress) : 0;
  const firstTry = progress ? countFirstTryCorrect(lesson, progress) : { correct: 0, total: 0 };
  const nextLesson = useMemo(() => {
    if (!userData) return null;
    const ordered = getOrderedLessons();
    const idx = ordered.findIndex((l) => l.id === lesson.id);
    for (let i = idx + 1; i < ordered.length; i++) {
      const l = ordered[i];
      if (isLessonUnlocked(l, userData.progress) && !isLessonComplete(userData.progress[l.id])) {
        return l;
      }
    }
    return null;
  }, [userData, lesson.id]);

  const rec = useMemo(() => {
    if (!userData) return null;
    return recommendNext(getOrderedLessons(), userData.progress);
  }, [userData]);

  return (
    <div className="fixed inset-y-0 left-1/2 flex w-full max-w-2xl -translate-x-1/2 flex-col overflow-hidden bg-slate-50 lg:max-w-3xl">
      <Celebration />
      <div className="pb-safe relative z-10 flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl"
      >
        🎉
      </motion.div>
      <h1 className="relative z-10 mt-6 text-2xl font-extrabold text-slate-800">Lesson complete!</h1>
      <p className="relative z-10 mt-1 text-slate-500">{lesson.title}</p>

      <div className="relative z-10 mt-6 grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-3xl font-extrabold text-brand-600">{score}%</div>
          <div className="text-xs font-medium text-slate-500">
            Score (first try) · {firstTry.correct}/{firstTry.total} graded
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-3xl font-extrabold text-amber-500">🔥 {streak}</div>
          <div className="text-xs font-medium text-slate-500">Day streak</div>
        </div>
      </div>

      {nextLesson && (
        <div className="relative z-10 mt-6 w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-left">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Up next</div>
          <div className="mt-0.5 font-semibold text-slate-700">{nextLesson.title}</div>
          {nextLesson.subtitle && (
            <div className="mt-0.5 text-sm text-slate-500">{nextLesson.subtitle}</div>
          )}
        </div>
      )}

      {!nextLesson && rec && rec.kind !== 'done' && (
        <div className="relative z-10 mt-6 w-full rounded-2xl border border-brand-100 bg-brand-50 p-4 text-left">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Suggestion</div>
          <div className="mt-0.5 font-semibold text-slate-700">{rec.reason}</div>
        </div>
      )}

      <div className="relative z-10 mt-6 flex w-full flex-col gap-2.5">
        {nextLesson ? (
          <>
            <button
              type="button"
              onClick={() => navigate(`/lesson/${nextLesson.id}`)}
              className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
            >
              Continue to next lesson
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-2xl bg-slate-100 py-3.5 text-base font-semibold text-slate-600 active:scale-[0.99]"
            >
              Back to course path
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
          >
            Back to course path
          </button>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}

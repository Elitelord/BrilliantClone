import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Interaction, Lesson, Step, ValidationResult } from '../../types/content';
import type { InteractionState, ExplainBackState } from '../../types/interaction';
import { validate, resolveFeedback, resolveWrongFeedback } from '../../lib/validators';
import { canCheck, isSelectionStep } from './stepInput';
import { useProgressStore } from '../../store/progressStore';
import { getOrderedLessons } from '../../content';
import { recommendNext, computeLessonScore, countFirstTryCorrect, isLessonComplete, isLessonUnlocked, MASTERY_THRESHOLD } from '../../lib/mastery';
import { isAiEnabled, buildStepContext, describeInteraction } from '../../lib/ai';
import { playableSteps, toFullStepIndex, toPlayableStepIndex } from '../../lib/ai/lessonSteps';
import { safeAuthoredHint } from '../../lib/ai/hintGuard';
import { retrievability } from '../../lib/scheduler';
import { allowHint } from '../../lib/scaffold';
import { getWrongAnswerNudge } from '../../lib/ai/features/wrongAnswerNudge';
import { gradeExplanation } from '../../lib/ai/features/explainBack';
import { useEnterKey } from '../../lib/hooks/useEnterKey';
import type { Confidence } from '../../lib/metacognition/confidence';
import ConfidenceChips from './ConfidenceChips';
import { teachingStepFor } from '../../lib/review/teachingSteps';
import { X } from 'lucide-react';
import InteractionRenderer from '../interactions/InteractionRenderer';
import StepProgress from './StepProgress';
import FeedbackBar, { type FeedbackTone } from './FeedbackBar';
import ConceptHint from './ConceptHint';
import Celebration from './Celebration';
import SkillCheck from './SkillCheck';

const EXPLAIN_GRADE_RETRY_MS = 15_000;

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
      // Band+ratio explore uses a two-column-friendly layout; keep full card width.
      if (interaction.config.showDependencyRatio) return null;
      // The stage-preset explore variant lays out two-column, so keep full card width.
      if (interaction.config.showStagePresets) return null;
      return (interaction.config.illustrate ? 356 : 320) / 320;
    case 'sector-bars': {
      const c = interaction.config;
      // The explore variant (implied stage / stage presets) lays out two-column,
      // so keep the full card width rather than hugging the bars alone.
      if (c.mode === 'adjust' && (c.showImpliedStage || c.showStagePresets)) return null;
      return 320 / 236;
    }
    case 'three-lens':
      return null;
    case 'category-bars':
      // Bucket columns + development slider use a two-column layout on wide screens.
      return null;
    case 'family-size':
      // Figurine panel + development slider use a two-column layout on wide screens.
      return null;
    case 'anomaly-pyramid':
      if (interaction.config.mode === 'adjust') return null;
      return null;
    case 'migration-flow':
      return null;
    case 'world-map':
      return null;
    default:
      return null;
  }
}

// Card sizing that makes the border hug a height-capped chart (plus padding),
// centered, on wider screens — while collapsing to full width on phones (where
// the chart is width-driven and the max-width never binds). Mirrors the
// `max-h-chart` token: clamp(190px, 46vh, 430px).
function chartCardStyle(interaction: Interaction): CSSProperties | undefined {
  if (interaction.type === 'world-map') {
    const mode = interaction.config.mode ?? 'explore';
    const showCard = interaction.config.showDataCard ?? (mode === 'explore');
    return showCard ? { maxWidth: '56rem' } : { maxWidth: '36rem' };
  }
  const aspect = chartAspect(interaction);
  if (!aspect) return undefined;
  // padding: p-4 => 1rem each side => 2rem total.
  return { maxWidth: `calc(clamp(190px, 46vh, 430px) * ${aspect} + 2rem)` };
}

export default function LessonRunner({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate();
  const store = useProgressStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [showReteach, setShowReteach] = useState(false);
  const [iState, setIState] = useState<InteractionState | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  // Skill-check result for this run — shown as a breakdown on completion (not persisted on its own).
  const [skillCheckResult, setSkillCheckResult] = useState<{ correct: number; total: number } | null>(null);
  // Bumped to force a fresh remount of selection interactions on "Try again".
  const [attemptKey, setAttemptKey] = useState(0);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  // Wrong checks this lesson run only — drives first-try score (not persisted attempts).
  const [sessionWrong, setSessionWrong] = useState<Record<string, number>>({});
  // Gate step→store sync until restore-from-saved-progress finishes (avoids
  // writing stepIndex=0 over a saved mid-lesson index on mount).
  const [restored, setRestored] = useState(false);
  const [phase, setPhase] = useState<'lesson' | 'skillCheck' | 'complete'>('lesson');
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [wrongNudgeLoading, setWrongNudgeLoading] = useState(false);
  const [wrongNudge, setWrongNudge] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [explainAiFeedback, setExplainAiFeedback] = useState<string | null>(null);
  const [explainSkipped, setExplainSkipped] = useState(false);
  const [explainRetryWaiting, setExplainRetryWaiting] = useState(false);
  const explainRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explainGradeGenRef = useRef(0);

  const activeSteps = useMemo(() => playableSteps(lesson, isAiEnabled), [lesson, isAiEnabled]);

  const clearExplainRetrySchedule = () => {
    if (explainRetryTimerRef.current) {
      clearTimeout(explainRetryTimerRef.current);
      explainRetryTimerRef.current = null;
    }
    setExplainRetryWaiting(false);
  };

  const cancelExplainGrading = () => {
    explainGradeGenRef.current += 1;
    clearExplainRetrySchedule();
    setIsGrading(false);
  };

  // Run once on lesson entry — never during render (that caused re-render loops).
  useEffect(() => {
    setRestored(false);
    store.ensureLessonStarted(lesson);
    store.reopenLessonIfComplete(lesson);
    const p = store.getLessonProgress(lesson.id);
    const savedFull = p ? p.currentStepIndex : 0;
    const idx = toPlayableStepIndex(lesson, savedFull, isAiEnabled);
    setStepIndex(idx);
    const fullIdx = toFullStepIndex(lesson, playableSteps(lesson, isAiEnabled)[idx] ?? lesson.steps[0]);
    store.setCurrentStep(lesson.id, fullIdx >= 0 ? fullIdx : 0);
    setIState(null);
    setResult(null);
    setLocked(false);
    setAttemptKey(0);
    setFinished(false);
    setSkillCheckResult(null);
    setSessionWrong({});
    setPhase('lesson');
    setHintMessage(null);
    setExplainAiFeedback(null);
    setExplainSkipped(false);
    clearExplainRetrySchedule();
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => () => clearExplainRetrySchedule(), []);

  // Keep the saved step in sync so exit/re-enter resumes at the right slide.
  useEffect(() => {
    if (!restored) return;
    const step = activeSteps[stepIndex];
    if (!step) return;
    store.setCurrentStep(lesson.id, toFullStepIndex(lesson, step));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, stepIndex, restored, activeSteps]);

  useEffect(() => {
    setFeedbackDismissed(false);
    setHintMessage(null);
    setWrongNudge(null);
    setExplainAiFeedback(null);
    setExplainSkipped(false);
    clearExplainRetrySchedule();
  }, [lesson.id, stepIndex]);

  useEffect(() => {
    if (result) setFeedbackDismissed(false);
  }, [result]);

  const step = activeSteps[stepIndex] ?? activeSteps[0];
  const isLearn = step.kind === 'learn' || step.interaction.type === 'info';
  const isExplore = step.kind === 'explore' || isLearn;
  const isLast = stepIndex >= activeSteps.length - 1;

  const handleChange = (s: InteractionState) => {
    setIState(s);
    if (!locked) {
      if (result || explainRetryWaiting || explainSkipped) {
        cancelExplainGrading();
        setExplainSkipped(false);
      }
      setResult(null);
    }
  };

  const isExplainBack = step.interaction.type === 'explain-back';

  const scheduleExplainRetry = (gen: number) => {
    clearExplainRetrySchedule();
    setExplainRetryWaiting(true);
    explainRetryTimerRef.current = setTimeout(() => {
      if (gen !== explainGradeGenRef.current) return;
      void runExplainGrading(gen);
    }, EXPLAIN_GRADE_RETRY_MS);
  };

  const runExplainGrading = async (existingGen?: number) => {
    if (step.interaction.type !== 'explain-back') return false;
    const explainConfig = step.interaction.config;
    const text = (iState as ExplainBackState | null)?.text?.trim() ?? '';
    if (!text) return false;

    const gen = existingGen ?? ++explainGradeGenRef.current;
    setExplainRetryWaiting(false);
    setIsGrading(true);
    setExplainAiFeedback(null);

    const ctx = buildStepContext(step, {
      learnerState: iState,
      lessonTitle: lesson.title,
      lessonConcept: lesson.concept,
      includeAnswer: false,
    });
    const grade = await gradeExplanation(explainConfig, ctx, text);

    if (gen !== explainGradeGenRef.current) return false;
    setIsGrading(false);

    if (grade) {
      clearExplainRetrySchedule();
      setExplainSkipped(false);
      setExplainAiFeedback(grade.feedback);
      setResult(grade.result);
      if (grade.result.correct) {
        setLocked(true);
        const firstTry = (sessionWrong[step.id] ?? 0) === 0;
        store.registerCorrect(lesson, step, firstTry);
      } else {
        setSessionWrong((prev) => ({ ...prev, [step.id]: (prev[step.id] ?? 0) + 1 }));
        store.registerWrong(lesson, step, {
          outcome: grade.result.outcome,
          summary: describeInteraction(step, iState, false),
        });
      }
      return true;
    }

    setResult({ correct: false, outcome: 'grade-unavailable' });
    scheduleExplainRetry(gen);
    return false;
  };

  const handleSkipExplainBack = () => {
    cancelExplainGrading();
    setExplainSkipped(true);
    setLocked(true);
    setResult(null);
    setExplainAiFeedback(null);
    store.registerCorrect(lesson, step, false);
  };

  const wrongAttemptDetail = (outcome?: string) => ({
    outcome,
    summary: describeInteraction(step, iState, false),
  });

  const fetchWrongNudge = async (r: ValidationResult) => {
    if (!isAiEnabled || r.correct) return;
    setWrongNudgeLoading(true);
    setWrongNudge(null);
    try {
      const ctx = buildStepContext(step, {
        learnerState: iState,
        result: r,
        lessonTitle: lesson.title,
        lessonConcept: lesson.concept,
        includeAnswer: false,
      });
      const nudge = await getWrongAnswerNudge(ctx, step);
      setWrongNudge(nudge ?? safeAuthoredHint(step));
    } finally {
      setWrongNudgeLoading(false);
    }
  };

  // Enter triggers the footer's primary action. The action depends on render-path state
  // computed below, so it's stored in a ref and refreshed each render (a direct hook call
  // would be conditional given the early returns for the finished / skill-check phases).
  const enterActionRef = useRef<() => void>(() => {});
  useEnterKey(() => enterActionRef.current());

  const handleCheck = async () => {
    if (step.interaction.type === 'explain-back') {
      clearExplainRetrySchedule();
      explainGradeGenRef.current += 1;
      await runExplainGrading(explainGradeGenRef.current);
      return;
    }

    const r = validate(step.interaction, step.answer, iState);
    setHintMessage(null);
    setWrongNudge(null);
    setFeedbackDismissed(false);
    setResult(r);
    if (r.correct) {
      setLocked(true);
      const firstTry = (sessionWrong[step.id] ?? 0) === 0;
      store.registerCorrect(lesson, step, firstTry, confidence ?? undefined);
    } else {
      setSessionWrong((prev) => ({ ...prev, [step.id]: (prev[step.id] ?? 0) + 1 }));
      store.registerWrong(lesson, step, wrongAttemptDetail(r.outcome));
      void fetchWrongNudge(r);
    }
  };

  const handleHint = () => {
    const authored = safeAuthoredHint(step);
    if (authored) setHintMessage(authored);
  };

  // "Try again": clear the verdict. Selection steps remount to drop the pick and
  // hide the feedback; drag steps keep their shape so the learner can adjust.
  const handleRetry = () => {
    cancelExplainGrading();
    setResult(null);
    setExplainAiFeedback(null);
    setExplainSkipped(false);
    setWrongNudge(null);
    setConfidence(null);
    setShowReteach(false);
    if (isSelectionStep(step)) {
      setIState(null);
      setAttemptKey((k) => k + 1);
    }
  };

  const goNext = () => {
    if (isLast) {
      store.completeLesson(lesson);
      if (isAiEnabled && !lesson.skipSkillCheck) {
        setPhase('skillCheck');
      } else {
        setFinished(true);
      }
      return;
    }
    const next = stepIndex + 1;
    const nextStep = activeSteps[next];
    if (nextStep) store.setCurrentStep(lesson.id, toFullStepIndex(lesson, nextStep));
    setStepIndex(next);
    setIState(null);
    setResult(null);
    setLocked(false);
    setAttemptKey(0);
    setConfidence(null);
    setShowReteach(false);
  };

  if (finished) {
    enterActionRef.current = () => {};
    return <CompletionScreen lesson={lesson} skillCheckResult={skillCheckResult} />;
  }

  if (phase === 'skillCheck') {
    enterActionRef.current = () => {}; // SkillCheck handles its own keyboard
    return (
      <div className="fixed inset-y-0 left-1/2 flex w-full max-w-2xl -translate-x-1/2 flex-col overflow-hidden bg-slate-50 lg:max-w-6xl">
        <div className="pt-safe flex flex-none items-center gap-3 px-4 pb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Exit lesson"
          >
            ✕
          </button>
          <div className="text-sm font-semibold text-slate-600">{lesson.title} · Skill check</div>
        </div>
        <SkillCheck
          lesson={lesson}
          onComplete={(result) => {
            store.recordSkillCheckScore(lesson, result);
            setSkillCheckResult(result);
            setFinished(true);
          }}
        />
      </div>
    );
  }

  // feedback content — explore/learn hints live in the ? icon, not the sticky bar
  let feedback: { tone: FeedbackTone; message: string } | null = null;
  if (result) {
    if (result.correct) {
      const msg =
        isExplainBack && explainAiFeedback
          ? explainAiFeedback
          : resolveFeedback(step.feedback, result);
      feedback = { tone: 'correct', message: msg };
    } else {
      let message: string;
      if (isExplainBack && result.outcome === 'grade-unavailable') {
        message =
          'AI grading is unavailable — retrying automatically, or skip to see the model answer.';
      } else if (isExplainBack && explainAiFeedback) {
        message = explainAiFeedback;
      } else {
        message = resolveWrongFeedback(step, result);
      }
      feedback = { tone: 'wrong', message };
    }
  }

  const explainGradingBusy = isExplainBack && (isGrading || explainRetryWaiting);
  const showExplainSkip =
    isExplainBack && !explainSkipped && !locked && (explainRetryWaiting || result?.outcome === 'grade-unavailable');

  const showContinue = isExplore || locked;
  const checkDisabled = !canCheck(step, iState);
  // Scaffolding that fades: withhold the authored hint once the step's concepts are
  // well-retained (desirable difficulty); keep it while they're weak or unseen.
  const masteryMap = store.data?.mastery ?? {};
  const stepConcepts = step.concepts ?? [];
  const stepRecall =
    stepConcepts.length === 0
      ? 0
      : Math.min(
          ...stepConcepts.map((c) => {
            const rec = masteryMap[c];
            return rec ? retrievability(rec, Date.now()) : 0;
          }),
        );
  const showHintButton =
    !isExplore &&
    !locked &&
    !isAiEnabled &&
    !!safeAuthoredHint(step) &&
    allowHint(stepRecall) &&
    !(result && !result.correct);
  const showHintBar = hintMessage && !feedbackDismissed && !feedback;
  const showFeedback = feedback && !feedbackDismissed;
  const conceptHintText =
    step.concept ?? (isExplore && step.feedback.onExplore ? step.feedback.onExplore : undefined);

  // Error-driven re-teaching: after repeated misses, offer to re-read the idea that first
  // taught this step's concept before the next attempt (don't just retry the same item).
  const reteachTarget = (() => {
    if (!(result && !result.correct) || (sessionWrong[step.id] ?? 0) < 2) return null;
    for (const conceptId of stepConcepts) {
      const t = teachingStepFor(conceptId);
      if (t && t.step.id !== step.id) return t;
    }
    return null;
  })();

  // Mirror the footer button's logic so Enter does whatever the visible primary button does.
  enterActionRef.current = () => {
    if (showContinue) goNext();
    else if (showExplainSkip || explainGradingBusy) return; // mid-grading
    else if (result && !result.correct && result.outcome !== 'grade-unavailable') handleRetry();
    else if (!checkDisabled && !isGrading) void handleCheck();
  };

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
          <X className="h-5 w-5" />
        </button>
        <StepProgress current={stepIndex} total={activeSteps.length} />
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
                  disabled={locked || explainGradingBusy}
                  result={result}
                  explainShowSample={explainSkipped}
                />
              </div>
            </div>

            {reteachTarget && (
              <div className="mt-4">
                {!showReteach ? (
                  <button
                    type="button"
                    onClick={() => setShowReteach(true)}
                    className="w-full rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-sm font-semibold text-sky-800"
                  >
                    Stuck? Review the idea
                  </button>
                ) : (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                      Review the idea
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{reteachTarget.step.prompt}</p>
                    {(reteachTarget.step.concept ?? reteachTarget.step.feedback?.onExplore) && (
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {reteachTarget.step.concept ?? reteachTarget.step.feedback?.onExplore}
                      </p>
                    )}
                    <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3">
                      <InteractionRenderer
                        key={`reteach-${reteachTarget.step.id}`}
                        interaction={reteachTarget.step.interaction}
                        onChange={() => {}}
                        disabled
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* pinned action area: the button stays in flow; feedback floats above it
          as an overlay so it never changes layout or creates page scroll. */}
      <div className="pb-safe relative flex-none border-t border-slate-100 bg-white px-4 pt-3">
        {showHintBar && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full bg-gradient-to-t from-white/40 via-white/15 to-transparent px-4 pb-3 pt-10">
            <div className="pointer-events-auto">
              <FeedbackBar
                tone="info"
                message={hintMessage}
                onDismiss={() => setHintMessage(null)}
              />
            </div>
          </div>
        )}
        {showFeedback && feedback && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full bg-gradient-to-t from-white/40 via-white/15 to-transparent px-4 pb-3 pt-10">
            <div className="pointer-events-auto">
              <FeedbackBar
                tone={feedback.tone}
                message={feedback.message}
                onDismiss={() => setFeedbackDismissed(true)}
                followUp={feedback.tone === 'wrong' ? wrongNudge : undefined}
                followUpLoading={feedback.tone === 'wrong' && wrongNudgeLoading}
              />
            </div>
          </div>
        )}
        {!isExplore && step.interaction.type !== 'explain-back' && !locked && !result && !checkDisabled && (
          <ConfidenceChips value={confidence} onChange={setConfidence} />
        )}
        {showHintButton && !showContinue && (
          <button
            type="button"
            onClick={handleHint}
            className="mb-2 w-full rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-sm font-semibold text-sky-800"
          >
            Stuck? Get a hint
          </button>
        )}
        {showContinue ? (
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99]"
          >
            {isLast ? 'Finish lesson' : 'Continue'}
          </button>
        ) : showExplainSkip ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled
              className="flex w-full cursor-wait items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white opacity-80"
            >
              {isGrading ? 'Grading…' : 'Retrying…'}
            </button>
            <button
              type="button"
              onClick={handleSkipExplainBack}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-base font-semibold text-slate-700"
            >
              Skip for now
            </button>
          </div>
        ) : result && !result.correct && result.outcome !== 'grade-unavailable' ? (
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
            disabled={checkDisabled || isGrading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {isGrading ? 'Grading…' : 'Check'}
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

function CompletionScreen({
  lesson,
  skillCheckResult,
}: {
  lesson: Lesson;
  skillCheckResult: { correct: number; total: number } | null;
}) {
  const navigate = useNavigate();
  const progress = useProgressStore((s) => s.data?.progress[lesson.id]);
  const streak = useProgressStore((s) => s.data?.streak.count ?? 0);
  const userData = useProgressStore((s) => s.data);
  const firstTry = progress ? countFirstTryCorrect(lesson, progress) : { correct: 0, total: 0 };
  const lessonScore = progress ? computeLessonScore(lesson, progress) : 0;
  const hasSkillCheck = !!skillCheckResult && skillCheckResult.total > 0;
  const skillCheckScore =
    hasSkillCheck && skillCheckResult
      ? Math.round((skillCheckResult.correct / skillCheckResult.total) * 100)
      : 0;
  const totalCorrect = firstTry.correct + (skillCheckResult?.correct ?? 0);
  const totalGraded = firstTry.total + (skillCheckResult?.total ?? 0);
  const score = totalGraded === 0 ? 100 : Math.round((totalCorrect / totalGraded) * 100);
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
      <Celebration mastered={score >= MASTERY_THRESHOLD} />
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
            Total score · {totalCorrect}/{totalGraded}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-3xl font-extrabold text-amber-500">🔥 {streak}</div>
          <div className="text-xs font-medium text-slate-500">Day streak</div>
        </div>
      </div>

      {hasSkillCheck && (
        <div className="relative z-10 mt-3 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-2xl font-extrabold text-slate-700">{lessonScore}%</div>
            <div className="text-xs font-medium text-slate-500">
              Lesson · {firstTry.correct}/{firstTry.total} first try
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-2xl font-extrabold text-slate-700">{skillCheckScore}%</div>
            <div className="text-xs font-medium text-slate-500">
              Skill check · {skillCheckResult?.correct}/{skillCheckResult?.total}
            </div>
          </div>
        </div>
      )}

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

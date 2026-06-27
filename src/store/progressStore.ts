import { create } from 'zustand';
import type { Lesson, Step } from '../types/content';
import type { UserData, UserProfile, LessonProgress, StepAttemptNote } from '../types/progress';
import {
  loadUserData,
  persistProgress,
  persistMastery,
  persistStreak,
  publishLeaderboard,
} from '../lib/persistence';
import { updateMasteryForConcepts, computeLessonScore, countFirstTryCorrect, combinedScore } from '../lib/mastery';
import {
  reconcileStreak,
  recordProblem,
  applyDailyCompletion,
  emptyStreak,
} from '../lib/streak';

interface ProgressState {
  data: UserData | null;
  loaded: boolean;
  load: (profile: UserProfile) => Promise<void>;
  reset: () => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  ensureLessonStarted: (lesson: Lesson) => void;
  reopenLessonIfComplete: (lesson: Lesson) => void;
  setCurrentStep: (lessonId: string, index: number) => void;
  registerWrong: (
    lesson: Lesson,
    step: Step,
    detail?: { outcome?: string; summary?: string },
  ) => void;
  registerCorrect: (lesson: Lesson, step: Step, isFirstTry?: boolean) => void;
  completeLesson: (lesson: Lesson) => void;
  recordSkillCheckScore: (lesson: Lesson, result: { correct: number; total: number }) => void;
  /** Phase 3: record a spaced-review answer — updates concept mastery + schedule (+ streak on correct). */
  registerReviewResult: (concepts: string[], correct: boolean) => void;
}

function emptyLessonProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    finishedOnce: false,
    playState: 'not_started',
    currentStepIndex: 0,
    completedStepIds: [],
    firstTryCorrect: {},
    attempts: {},
    score: 0,
    updatedAt: Date.now(),
  };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  data: null,
  loaded: false,

  load: async (profile) => {
    set({ loaded: false });
    let data: UserData;
    try {
      data = await loadUserData(profile);
    } catch (e) {
      console.warn('Could not load saved progress; starting fresh.', e);
      data = { profile, progress: {}, mastery: {}, streak: emptyStreak() };
    }
    const streak = reconcileStreak(data.streak);
    const reconciled: UserData = { ...data, profile, streak };
    set({ data: reconciled, loaded: true });
    if (JSON.stringify(streak) !== JSON.stringify(data.streak)) {
      void persistStreak(profile, streak);
    }
    // Keep the public leaderboard entry fresh on every load.
    void publishLeaderboard(profile, streak);
  },

  reset: () => set({ data: null, loaded: false }),

  getLessonProgress: (lessonId) => get().data?.progress[lessonId],

  ensureLessonStarted: (lesson) => {
    const data = get().data;
    if (!data) return;
    if (data.progress[lesson.id]) return;
    const lp = { ...emptyLessonProgress(lesson.id), playState: 'in_progress' as const };
    const progress = { ...data.progress, [lesson.id]: lp };
    set({ data: { ...data, progress } });
    void persistProgress(data.profile, lp);
  },

  // Re-open a finished lesson at slide 1 for review — keeps finishedOnce intact.
  reopenLessonIfComplete: (lesson) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id];
    if (!existing) return;

    const gradable = lesson.steps.filter((s) => s.kind !== 'explore' && s.kind !== 'learn');
    const allGradedDone =
      gradable.length > 0 && gradable.every((s) => existing.completedStepIds.includes(s.id));
    const stuckAtEnd =
      existing.playState === 'in_progress' &&
      existing.currentStepIndex >= lesson.steps.length - 1 &&
      allGradedDone;

    // Idle after completion → start review at slide 1.
    const needsReviewStart = existing.finishedOnce && existing.playState === 'not_started';

    if (!needsReviewStart && !stuckAtEnd) return;

    const lp: LessonProgress = {
      ...existing,
      playState: 'in_progress',
      currentStepIndex: 0,
      // Fresh scoring run — session wrong-counts are not carried over from prior plays.
      completedStepIds: [],
      firstTryCorrect: {},
      attempts: {},
      score: 0,
      updatedAt: Date.now(),
    };
    set({ data: { ...data, progress: { ...data.progress, [lesson.id]: lp } } });
    void persistProgress(data.profile, lp);
  },

  setCurrentStep: (lessonId, index) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lessonId] ?? emptyLessonProgress(lessonId);
    if (existing.currentStepIndex === index && existing.playState === 'in_progress') return;
    const lp: LessonProgress = {
      ...existing,
      playState: 'in_progress',
      currentStepIndex: index,
      updatedAt: Date.now(),
    };
    set({ data: { ...data, progress: { ...data.progress, [lessonId]: lp } } });
    void persistProgress(data.profile, lp);
  },

  registerWrong: (lesson, step, detail) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id] ?? emptyLessonProgress(lesson.id);
    const attempts = { ...existing.attempts, [step.id]: (existing.attempts[step.id] ?? 0) + 1 };
    const note: StepAttemptNote = {
      ...(existing.attemptNotes?.[step.id] ?? {}),
      ...(detail?.outcome ? { lastOutcome: detail.outcome } : {}),
      ...(detail?.summary ? { lastWrongSummary: detail.summary } : {}),
    };
    const attemptNotes = { ...existing.attemptNotes, [step.id]: note };
    const lp: LessonProgress = {
      ...existing,
      playState: 'in_progress',
      attempts,
      attemptNotes,
      updatedAt: Date.now(),
    };

    let next: UserData = { ...data, progress: { ...data.progress, [lesson.id]: lp } };
    if (step.concepts?.length) {
      const mastery = updateMasteryForConcepts(data.mastery, step.concepts, false);
      next = { ...next, mastery };
      void persistMastery(data.profile, step.concepts.map((c) => mastery[c]));
    }
    set({ data: next });
    void persistProgress(data.profile, lp);
  },

  registerCorrect: (lesson, step, isFirstTry) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id] ?? emptyLessonProgress(lesson.id);
    const alreadyDone = existing.completedStepIds.includes(step.id);
    const wasFirstTry =
      isFirstTry !== undefined ? isFirstTry : (existing.attempts[step.id] ?? 0) === 0;
    const firstTryCorrect = { ...existing.firstTryCorrect, [step.id]: wasFirstTry };
    const completedStepIds = alreadyDone
      ? existing.completedStepIds
      : [...existing.completedStepIds, step.id];
    const scored = { ...existing, firstTryCorrect, completedStepIds };
    const lp: LessonProgress = {
      ...existing,
      playState: 'in_progress',
      firstTryCorrect,
      completedStepIds,
      score: computeLessonScore(lesson, scored),
      updatedAt: Date.now(),
    };

    const streak = recordProblem(data.streak);

    let next: UserData = {
      ...data,
      streak,
      progress: { ...data.progress, [lesson.id]: lp },
    };
    if (step.concepts?.length) {
      const mastery = updateMasteryForConcepts(data.mastery, step.concepts, true);
      next = { ...next, mastery };
      void persistMastery(data.profile, step.concepts.map((c) => mastery[c]));
    }
    set({ data: next });
    void persistProgress(data.profile, lp);
    void persistStreak(data.profile, streak);
  },

  completeLesson: (lesson) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id] ?? emptyLessonProgress(lesson.id);
    const gradable = lesson.steps.filter((s) => s.kind !== 'explore' && s.kind !== 'learn');
    const firstTryCorrect = { ...existing.firstTryCorrect };
    for (const step of gradable) {
      if (existing.completedStepIds.includes(step.id) && (existing.attempts[step.id] ?? 0) === 0) {
        firstTryCorrect[step.id] = true;
      }
    }
    const scored: LessonProgress = { ...existing, firstTryCorrect };
    const lp: LessonProgress = {
      ...existing,
      finishedOnce: true,
      playState: 'not_started',
      currentStepIndex: 0,
      firstTryCorrect,
      score: computeLessonScore(lesson, scored),
      updatedAt: Date.now(),
    };
    const streak = applyDailyCompletion(data.streak);
    set({
      data: { ...data, streak, progress: { ...data.progress, [lesson.id]: lp } },
    });
    void persistProgress(data.profile, lp);
    void persistStreak(data.profile, streak);
  },

  // Fold the skill-check result into the persisted lesson score. Only the
  // combined total is saved; the per-component split is shown on the completion
  // screen but never persisted.
  recordSkillCheckScore: (lesson, result) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id];
    if (!existing) return;
    const lessonPart = countFirstTryCorrect(lesson, existing);
    const score = combinedScore([lessonPart, result]);
    const lp: LessonProgress = { ...existing, score, updatedAt: Date.now() };
    set({ data: { ...data, progress: { ...data.progress, [lesson.id]: lp } } });
    void persistProgress(data.profile, lp);
  },

  registerReviewResult: (concepts, correct) => {
    const data = get().data;
    if (!data) return;
    const mastery = concepts.length
      ? updateMasteryForConcepts(data.mastery, concepts, correct)
      : data.mastery;
    // A correct recall counts toward the daily goal, like a lesson problem.
    const streak = correct ? recordProblem(data.streak) : data.streak;
    set({ data: { ...data, mastery, streak } });
    if (concepts.length) void persistMastery(data.profile, concepts.map((c) => mastery[c]));
    if (correct) void persistStreak(data.profile, streak);
  },
}));

// Dev-only QA helper: make every tracked concept due for review again. In the browser
// console (signed in), run `__resetReviewSchedule()` then refresh. Gated to dev builds,
// so it is dead-code-eliminated from production and can never run on the live app.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __resetReviewSchedule?: (daysAgo?: number) => string }).__resetReviewSchedule =
    (daysAgo = 1) => {
      const { data } = useProgressStore.getState();
      if (!data) return 'No user data loaded yet — sign in and wait for the home screen first.';
      const past = Math.max(1, Math.round(Date.now() - daysAgo * 86_400_000));
      const mastery = Object.fromEntries(
        Object.entries(data.mastery).map(([id, r]) => [id, { ...r, nextDue: past }]),
      );
      useProgressStore.setState({ data: { ...data, mastery } });
      void persistMastery(data.profile, Object.values(mastery));
      const n = Object.keys(mastery).length;
      return `Set ${n} concept${n === 1 ? '' : 's'} due (nextDue = ${daysAgo}d ago). Refresh to see the Daily Review.`;
    };
}

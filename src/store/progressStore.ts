import { create } from 'zustand';
import type { Lesson, Step } from '../types/content';
import type { UserData, UserProfile, LessonProgress } from '../types/progress';
import {
  loadUserData,
  persistProgress,
  persistMastery,
  persistStreak,
} from '../lib/persistence';
import { updateMasteryForConcepts, computeLessonScore } from '../lib/mastery';
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
  registerWrong: (lesson: Lesson, step: Step) => void;
  registerCorrect: (lesson: Lesson, step: Step, isFirstTry?: boolean) => void;
  completeLesson: (lesson: Lesson) => void;
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

  registerWrong: (lesson, step) => {
    const data = get().data;
    if (!data) return;
    const existing = data.progress[lesson.id] ?? emptyLessonProgress(lesson.id);
    const attempts = { ...existing.attempts, [step.id]: (existing.attempts[step.id] ?? 0) + 1 };
    const lp: LessonProgress = { ...existing, playState: 'in_progress', attempts, updatedAt: Date.now() };

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
}));

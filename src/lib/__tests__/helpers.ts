import { getOrderedLessons } from '../../content';
import type { LessonProgress, StreakState } from '../../types/progress';
import { emptyStreak } from '../streak';

export { getOrderedLessons };

export function makeLessonProgress(
  lessonId: string,
  overrides: Partial<LessonProgress> = {},
): LessonProgress {
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
    ...overrides,
  };
}

export function makeStreak(overrides: Partial<StreakState> = {}): StreakState {
  return { ...emptyStreak(), ...overrides };
}

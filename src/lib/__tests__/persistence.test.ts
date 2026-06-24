import { describe, expect, it } from 'vitest';
import { normalizeLessonProgress } from '../persistence';
import type { LessonProgress } from '../../types/progress';
import { makeLessonProgress } from './helpers';

type LegacyProgress = LessonProgress & { status?: string };

function legacyProgress(
  overrides: Omit<LegacyProgress, 'finishedOnce' | 'playState'> & { status: string },
): LegacyProgress {
  return overrides as LegacyProgress;
}

describe('normalizeLessonProgress', () => {
  it('passes through modern shape unchanged', () => {
    const raw = makeLessonProgress('dtm-engine', {
      finishedOnce: false,
      playState: 'in_progress',
      currentStepIndex: 5,
    });
    const normalized = normalizeLessonProgress(raw);
    expect(normalized.finishedOnce).toBe(false);
    expect(normalized.playState).toBe('in_progress');
    expect(normalized.currentStepIndex).toBe(5);
  });

  it('migrates legacy status complete', () => {
    const normalized = normalizeLessonProgress(
      legacyProgress({
        lessonId: 'dtm-engine',
        status: 'complete',
        currentStepIndex: 0,
        completedStepIds: [],
        firstTryCorrect: {},
        attempts: {},
        score: 80,
        updatedAt: 1,
      }),
    );
    expect(normalized.finishedOnce).toBe(true);
    expect(normalized.playState).toBe('not_started');
  });

  it('migrates legacy status in_progress and keeps step index', () => {
    const normalized = normalizeLessonProgress(
      legacyProgress({
        lessonId: 'dtm-engine',
        status: 'in_progress',
        currentStepIndex: 4,
        completedStepIds: [],
        firstTryCorrect: {},
        attempts: {},
        score: 0,
        updatedAt: 1,
      }),
    );
    expect(normalized.playState).toBe('in_progress');
    expect(normalized.currentStepIndex).toBe(4);
  });

  it('resets step index for completed idle review lessons', () => {
    const normalized = normalizeLessonProgress(
      makeLessonProgress('dtm-engine', {
        finishedOnce: true,
        playState: 'not_started',
        currentStepIndex: 8,
      }),
    );
    expect(normalized.currentStepIndex).toBe(0);
  });

  it('preserves mid-lesson index for in-progress lessons', () => {
    const normalized = normalizeLessonProgress(
      makeLessonProgress('dtm-engine', {
        finishedOnce: false,
        playState: 'in_progress',
        currentStepIndex: 5,
      }),
    );
    expect(normalized.currentStepIndex).toBe(5);
  });
});

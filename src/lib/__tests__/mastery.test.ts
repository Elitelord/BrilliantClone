import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  MASTERY_THRESHOLD,
  REVIEW_WRONG_THRESHOLD,
  computeLessonScore,
  gradableSteps,
  isFirstTryCorrect,
  isLessonMastered,
  isLessonUnlocked,
  recommendNext,
  stepsNeedingReview,
  updateMasteryForConcepts,
} from '../mastery';
import { getOrderedLessons, makeLessonProgress } from './helpers';

describe('gradableSteps and computeLessonScore', () => {
  const lessons = getOrderedLessons();
  const l1 = lessons[0];

  it('excludes explore and learn steps from scoring', () => {
    const gradable = gradableSteps(l1);
    expect(gradable.every((s) => s.kind !== 'explore' && s.kind !== 'learn')).toBe(true);
    expect(gradable.length).toBeGreaterThan(0);
  });

  it('returns 100 when no gradable steps', () => {
    const emptyLesson = { ...l1, steps: [{ id: 'x', kind: 'explore' as const, prompt: 'p', interaction: { type: 'info' as const, config: { body: 'b' } }, feedback: {} }] };
    expect(computeLessonScore(emptyLesson, makeLessonProgress(l1.id))).toBe(100);
  });

  it('computes score from first-try correctness', () => {
    const gradable = gradableSteps(l1);
    const firstTryCorrect: Record<string, boolean> = {};
    const attempts: Record<string, number> = {};
    gradable.forEach((s, i) => {
      if (i < Math.floor(gradable.length / 2)) {
        firstTryCorrect[s.id] = true;
      } else {
        attempts[s.id] = 1;
      }
    });
    const progress = makeLessonProgress(l1.id, {
      firstTryCorrect,
      attempts,
      completedStepIds: gradable.map((s) => s.id),
    });
    const score = computeLessonScore(l1, progress);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('marks mastered at threshold boundary', () => {
    const gradable = gradableSteps(l1);
    const firstTryCorrect: Record<string, boolean> = {};
    const needed = Math.ceil((MASTERY_THRESHOLD / 100) * gradable.length);
    gradable.forEach((s, i) => {
      firstTryCorrect[s.id] = i < needed;
    });
    const progress = makeLessonProgress(l1.id, {
      finishedOnce: true,
      firstTryCorrect,
      completedStepIds: gradable.map((s) => s.id),
    });
    expect(computeLessonScore(l1, progress)).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(isLessonMastered(l1, progress)).toBe(true);
  });
});

describe('isFirstTryCorrect', () => {
  it('uses explicit firstTryCorrect flag', () => {
    const p = makeLessonProgress('dtm-engine', { firstTryCorrect: { step1: true } });
    expect(isFirstTryCorrect(p, 'step1')).toBe(true);
  });

  it('falls back to completed with zero attempts', () => {
    const p = makeLessonProgress('dtm-engine', {
      completedStepIds: ['step1'],
      attempts: {},
    });
    expect(isFirstTryCorrect(p, 'step1')).toBe(true);
  });

  it('is false when attempts exist without firstTryCorrect', () => {
    const p = makeLessonProgress('dtm-engine', {
      completedStepIds: ['step1'],
      attempts: { step1: 1 },
    });
    expect(isFirstTryCorrect(p, 'step1')).toBe(false);
  });
});

describe('isLessonUnlocked', () => {
  const [l1, l2, l3] = getOrderedLessons();

  it('unlocks first lesson with no prerequisites', () => {
    expect(isLessonUnlocked(l1, {})).toBe(true);
  });

  it('locks lesson 2 until lesson 1 complete', () => {
    expect(isLessonUnlocked(l2, {})).toBe(false);
    expect(
      isLessonUnlocked(l2, { [l1.id]: makeLessonProgress(l1.id, { finishedOnce: true }) }),
    ).toBe(true);
  });

  it('locks lesson 3 until lesson 2 complete', () => {
    const partial = {
      [l1.id]: makeLessonProgress(l1.id, { finishedOnce: true }),
    };
    expect(isLessonUnlocked(l3, partial)).toBe(false);
    expect(
      isLessonUnlocked(l3, {
        ...partial,
        [l2.id]: makeLessonProgress(l2.id, { finishedOnce: true }),
      }),
    ).toBe(true);
  });

  it('keeps an already-completed lesson enterable even if a prerequisite is not complete', () => {
    // l3 finished, but its prerequisite l2 has no completion flag (stale/missing data).
    const map = { [l3.id]: makeLessonProgress(l3.id, { finishedOnce: true }) };
    expect(isLessonUnlocked(l3, map)).toBe(true);
  });
});

describe('recommendNext', () => {
  const lessons = getOrderedLessons();
  const [l1, l2] = lessons;

  it('recommends in-progress lesson first', () => {
    const rec = recommendNext(lessons, {
      [l1.id]: makeLessonProgress(l1.id, { playState: 'in_progress', currentStepIndex: 3 }),
    });
    expect(rec?.kind).toBe('continue');
    expect(rec?.lessonId).toBe(l1.id);
  });

  it('recommends review for completed-but-not-mastered', () => {
    const gradable = gradableSteps(l1);
    const attempts: Record<string, number> = {};
    gradable.forEach((s) => {
      attempts[s.id] = 2;
    });
    const rec = recommendNext(lessons, {
      [l1.id]: makeLessonProgress(l1.id, {
        finishedOnce: true,
        playState: 'not_started',
        attempts,
        completedStepIds: gradable.map((s) => s.id),
      }),
    });
    expect(rec?.kind).toBe('review');
    expect(rec?.lessonId).toBe(l1.id);
  });

  it('recommends next unlocked lesson', () => {
    const rec = recommendNext(lessons, {
      [l1.id]: makeLessonProgress(l1.id, {
        finishedOnce: true,
        playState: 'not_started',
        firstTryCorrect: Object.fromEntries(gradableSteps(l1).map((s) => [s.id, true])),
        completedStepIds: gradableSteps(l1).map((s) => s.id),
      }),
    });
    expect(rec?.kind).toBe('next');
    expect(rec?.lessonId).toBe(l2.id);
  });

  it('returns done when all lessons mastered', () => {
    const progressMap: Record<string, ReturnType<typeof makeLessonProgress>> = {};
    for (const lesson of lessons) {
      const gradable = gradableSteps(lesson);
      progressMap[lesson.id] = makeLessonProgress(lesson.id, {
        finishedOnce: true,
        playState: 'not_started',
        firstTryCorrect: Object.fromEntries(gradable.map((s) => [s.id, true])),
        completedStepIds: gradable.map((s) => s.id),
      });
    }
    const rec = recommendNext(lessons, progressMap);
    expect(rec?.kind).toBe('done');
  });
});

describe('stepsNeedingReview', () => {
  it('returns step ids with attempts at or above threshold', () => {
    const p = makeLessonProgress('dtm-engine', {
      attempts: { a: REVIEW_WRONG_THRESHOLD - 1, b: REVIEW_WRONG_THRESHOLD, c: 5 },
    });
    expect(stepsNeedingReview(p)).toEqual(['b', 'c']);
  });

  it('returns empty when no progress', () => {
    expect(stepsNeedingReview(undefined)).toEqual([]);
  });
});

describe('updateMasteryForConcepts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-22T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increases strength on correct answer', () => {
    const next = updateMasteryForConcepts({}, ['natural-increase'], true);
    expect(next['natural-increase'].strength).toBeCloseTo(0.34);
    expect(next['natural-increase'].wrongCount).toBe(0);
    expect(next['natural-increase'].lastSeen).toBe(Date.now());
  });

  it('awards less strength for a low-confidence correct answer', () => {
    const certain = updateMasteryForConcepts({}, ['natural-increase'], true, 'certain');
    const likely = updateMasteryForConcepts({}, ['natural-increase'], true, 'likely');
    const guess = updateMasteryForConcepts({}, ['natural-increase'], true, 'guess');
    expect(certain['natural-increase'].strength).toBeCloseTo(0.34);
    expect(likely['natural-increase'].strength).toBeCloseTo(0.34 * 0.65);
    expect(guess['natural-increase'].strength).toBeCloseTo(0.34 * 0.3);
    // a guessed correct also holds its schedule (comes back sooner) — box 0 either way here,
    // but the strength gap means lower retrievability and an earlier effective resurface.
    expect(guess['natural-increase'].strength).toBeLessThan(certain['natural-increase'].strength);
  });

  it('decreases strength and increments wrongCount on wrong answer', () => {
    const prev = {
      'natural-increase': {
        conceptId: 'natural-increase',
        strength: 0.5,
        lastSeen: 1,
        wrongCount: 1,
      },
    };
    const next = updateMasteryForConcepts(prev, ['natural-increase'], false);
    expect(next['natural-increase'].strength).toBeCloseTo(0.3);
    expect(next['natural-increase'].wrongCount).toBe(2);
  });

  it('schedules a brand-new concept one day out (box 0) on a correct answer', () => {
    const next = updateMasteryForConcepts({}, ['migration'], true);
    expect(next.migration.nextDue).toBe(Date.now() + 86_400_000);
    expect(Number.isInteger(next.migration.nextDue)).toBe(true);
  });

  it('relearns a wrong concept within a day', () => {
    const next = updateMasteryForConcepts({}, ['migration'], false);
    expect(next.migration.nextDue).toBe(Date.now() + 86_400_000);
  });

  it('advances the interval on a spaced correct review', () => {
    const day = 86_400_000;
    const prev = {
      migration: {
        conceptId: 'migration',
        strength: 0.5,
        lastSeen: Date.now() - day, // last interval was 1 day (box 0)
        wrongCount: 0,
        nextDue: Date.now(), // due now
      },
    };
    const next = updateMasteryForConcepts(prev, ['migration'], true);
    // box 0 (1d) -> box 1 (3d), anchored from now
    expect(next.migration.nextDue).toBe(Date.now() + 3 * day);
  });
});

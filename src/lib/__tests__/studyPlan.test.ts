import { describe, expect, it } from 'vitest';
import { studyPlan, weakestDueFocus } from '../review/studyPlan';
import { gradableSteps } from '../mastery';
import { conceptLabel } from '../concepts';
import { getOrderedLessons, makeLessonProgress } from './helpers';
import type { Lesson } from '../../types/content';
import type { LessonProgress, MasteryRecord } from '../../types/progress';

const DAY = 86_400_000;
const NOW = 2_000_000_000_000;

function mastered(lesson: Lesson): LessonProgress {
  const gradable = gradableSteps(lesson);
  return makeLessonProgress(lesson.id, {
    finishedOnce: true,
    completedStepIds: gradable.map((s) => s.id),
    firstTryCorrect: Object.fromEntries(gradable.map((s) => [s.id, true])),
    score: 100,
  });
}

function allMastered(): Record<string, LessonProgress> {
  return Object.fromEntries(getOrderedLessons().map((l) => [l.id, mastered(l)]));
}

function rec(conceptId: string, over: Partial<MasteryRecord> = {}): MasteryRecord {
  return { conceptId, strength: 0.7, lastSeen: NOW - 5 * DAY, wrongCount: 0, nextDue: NOW - DAY, ...over };
}

describe('studyPlan', () => {
  const lessons = getOrderedLessons();

  it('resumes an in-progress lesson first', () => {
    const map = { [lessons[0].id]: makeLessonProgress(lessons[0].id, { playState: 'in_progress' }) };
    const plan = studyPlan(lessons, map, {}, NOW);
    expect(plan.kind).toBe('continue');
    expect(plan.route).toBe(`/lesson/${lessons[0].id}`);
  });

  it('recommends the next lesson when nothing is due', () => {
    const plan = studyPlan(lessons, {}, {}, NOW);
    expect(plan.kind).toBe('next');
    expect(plan.route).toBe(`/lesson/${lessons[0].id}`);
  });

  it('prioritizes a fading foundation that underpins a tracked concept', () => {
    // dtm-stages is a prerequisite of pyramid-shape; make it the weakest due concept.
    const mastery = {
      'dtm-stages': rec('dtm-stages', { strength: 0.1, nextDue: NOW - 20 * DAY }),
      'pyramid-shape': rec('pyramid-shape', { strength: 0.8, nextDue: NOW + 5 * DAY }),
    };
    const plan = studyPlan(lessons, allMastered(), mastery, NOW);
    expect(plan.kind).toBe('review-concept');
    expect(plan.conceptId).toBe('dtm-stages');
    expect(plan.route).toBe('/review');
    expect(plan.reason).toContain(conceptLabel('pyramid-shape'));
  });

  it('falls back to reviewing the weakest due concept when it has no tracked dependents', () => {
    const mastery = { boserup: rec('boserup', { strength: 0.1, nextDue: NOW - 10 * DAY }) };
    const plan = studyPlan(lessons, allMastered(), mastery, NOW);
    expect(plan.kind).toBe('review-due');
    expect(plan.conceptId).toBe('boserup');
    expect(plan.route).toBe('/review');
  });

  it('reports done when the course is mastered and nothing is due', () => {
    const mastery = { 'dtm-stages': rec('dtm-stages', { strength: 1, nextDue: NOW + 10 * DAY }) };
    const plan = studyPlan(lessons, allMastered(), mastery, NOW);
    expect(plan.kind).toBe('done');
  });
});

describe('weakestDueFocus', () => {
  it('returns null when nothing is due', () => {
    const mastery = { 'dtm-stages': rec('dtm-stages', { nextDue: NOW + 5 * DAY }) };
    expect(weakestDueFocus(mastery, NOW)).toBeNull();
  });

  it('names the weakest due concept regardless of lesson progress', () => {
    const mastery = {
      'dtm-stages': rec('dtm-stages', { strength: 0.1, nextDue: NOW - 20 * DAY }),
      'pyramid-shape': rec('pyramid-shape', { strength: 0.8, nextDue: NOW + 5 * DAY }),
    };
    const focus = weakestDueFocus(mastery, NOW);
    expect(focus?.conceptId).toBe('dtm-stages');
    expect(focus?.reason).toContain(conceptLabel('pyramid-shape')); // mentions what it underpins
  });
});

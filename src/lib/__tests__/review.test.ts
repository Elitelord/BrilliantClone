import { describe, expect, it } from 'vitest';
import { buildReviewQueue } from '../review/session';
import { prepareAuthoredReviewStep } from '../review/authoredItems';
import { computeRetentionStats, summarizeReviewDelta } from '../review/metrics';
import { getOrderedLessons, makeLessonProgress } from './helpers';
import type { LessonProgress, MasteryRecord } from '../../types/progress';
import type { Step } from '../../types/content';

const DAY = 86_400_000;
const NOW = 2_000_000_000_000;

const DUE_CONCEPTS = [
  'natural-increase', // dtm-engine — set weakest
  'pyramid-shape', // population-pyramids
  'etm', // epi-transition
  'density', // limits-of-growth
  'dependency-ratio', // population-structure
  'migration', // why-people-move
];

function dueMastery(): Record<string, MasteryRecord> {
  const map: Record<string, MasteryRecord> = {};
  for (const id of DUE_CONCEPTS) {
    map[id] = {
      conceptId: id,
      strength: id === 'natural-increase' ? 0.1 : 0.7,
      lastSeen: NOW - 5 * DAY,
      wrongCount: 0,
      nextDue: id === 'natural-increase' ? NOW - 20 * DAY : NOW - 1 * DAY,
    };
  }
  return map;
}

function allSeen(): Record<string, LessonProgress> {
  return Object.fromEntries(
    getOrderedLessons().map((l) => [l.id, makeLessonProgress(l.id, { finishedOnce: true })]),
  );
}

describe('buildReviewQueue', () => {
  const lessons = getOrderedLessons();

  it('returns nothing for a brand-new user (no mastery due)', () => {
    expect(buildReviewQueue(lessons, {}, {}, NOW)).toEqual([]);
  });

  it('returns nothing when due concepts exist but no lesson has been seen', () => {
    expect(buildReviewQueue(lessons, {}, dueMastery(), NOW)).toEqual([]);
  });

  it('builds a capped queue of due-concept steps from seen lessons', () => {
    const queue = buildReviewQueue(lessons, allSeen(), dueMastery(), NOW, { max: 6 });
    expect(queue.length).toBeGreaterThan(0);
    expect(queue.length).toBeLessThanOrEqual(6);
    expect(queue.length).toBeLessThanOrEqual(DUE_CONCEPTS.length);

    const dueSet = new Set(DUE_CONCEPTS);
    const lessonIds = new Set(lessons.map((l) => l.id));
    for (const item of queue) {
      expect(item.concepts.length).toBeGreaterThan(0);
      expect(item.concepts.every((c) => dueSet.has(c))).toBe(true);
      expect(lessonIds.has(item.lessonId)).toBe(true);
    }
  });

  it('surfaces the weakest concept first', () => {
    const queue = buildReviewQueue(lessons, allSeen(), dueMastery(), NOW, { max: 6 });
    expect(queue[0].concepts).toContain('natural-increase');
  });

  it('interleaves: no two consecutive items share an interaction type', () => {
    const queue = buildReviewQueue(lessons, allSeen(), dueMastery(), NOW, { max: 6 });
    for (let i = 1; i < queue.length; i++) {
      expect(queue[i].step.interaction.type).not.toBe(queue[i - 1].step.interaction.type);
    }
  });

  it('never repeats the same step', () => {
    const queue = buildReviewQueue(lessons, allSeen(), dueMastery(), NOW, { max: 6 });
    const ids = queue.map((q) => q.step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('prepareAuthoredReviewStep', () => {
  const mcStep: Step = {
    id: 'mc1',
    kind: 'mc',
    prompt: 'Which stage?',
    concepts: ['dtm-stages'],
    difficulty: 2,
    interaction: {
      type: 'multiple-choice',
      config: {
        options: [
          { id: 'a', label: 'Stage 1' },
          { id: 'b', label: 'Stage 2' },
          { id: 'c', label: 'Stage 4' },
          { id: 'd', label: 'Stage 5' },
        ],
      },
    },
    answer: { correctId: 'b' },
    feedback: { correct: 'Yes', incorrect: 'No', hint: 'Look at the death rate' },
  };

  it('removes the up-front hint but keeps the answer key valid', () => {
    const out = prepareAuthoredReviewStep(mcStep, () => 0);
    expect(out.feedback.hint).toBeUndefined();
    const ids = (out.interaction.config as { options: { id: string }[] }).options.map((o) => o.id);
    expect(new Set(ids)).toEqual(new Set(['a', 'b', 'c', 'd']));
    expect(ids.length).toBe(4);
  });

  it('hides answer-revealing scaffold flags', () => {
    const rg: Step = {
      id: 'rg',
      kind: 'solve',
      prompt: 'Drag to a stable stage',
      concepts: ['dtm-stages'],
      interaction: { type: 'rate-graph', config: { showVerdict: true, showGap: true, showStats: true, snap: true } },
      answer: { kind: 'trend', trend: 'stable' },
      feedback: {},
    };
    const out = prepareAuthoredReviewStep(rg, () => 0);
    const cfg = out.interaction.config as Record<string, unknown>;
    expect(cfg.showVerdict).toBe(false);
    expect(cfg.showGap).toBe(false);
    expect(cfg.showStats).toBe(false);
    expect(cfg.snap).toBe(true); // non-scaffold config preserved
  });

  it('keeps the grounding reference visual', () => {
    const withRef: Step = { ...mcStep, reference: { type: 'rate-graph', config: { overview: true } } };
    const out = prepareAuthoredReviewStep(withRef, () => 0);
    expect(out.reference).toEqual({ type: 'rate-graph', config: { overview: true } });
  });
});

describe('computeRetentionStats', () => {
  it('returns zeros for an empty mastery map', () => {
    expect(computeRetentionStats({}, NOW)).toEqual({
      tracked: 0,
      dueCount: 0,
      fadingCount: 0,
      masteredNow: 0,
      avgRetrievability: 0,
    });
  });

  it('counts due, fading, and mastered-now concepts', () => {
    const map: Record<string, MasteryRecord> = {
      // Solid + fresh + not due -> masteredNow.
      strong: { conceptId: 'strong', strength: 1, lastSeen: NOW, wrongCount: 0, nextDue: NOW + 35 * DAY },
      // Was solid, long overdue -> decayed below target -> fading AND due.
      faded: { conceptId: 'faded', strength: 0.9, lastSeen: NOW - 60 * DAY, wrongCount: 0, nextDue: NOW - 30 * DAY },
    };
    const stats = computeRetentionStats(map, NOW);
    expect(stats.tracked).toBe(2);
    expect(stats.masteredNow).toBe(1);
    expect(stats.dueCount).toBe(1);
    expect(stats.fadingCount).toBe(1);
    expect(stats.avgRetrievability).toBeGreaterThan(0);
    expect(stats.avgRetrievability).toBeLessThanOrEqual(1);
  });
});

describe('summarizeReviewDelta', () => {
  it('averages the recall change over shared concepts', () => {
    const before = { a: 0.2, b: 0.5 };
    const after = { a: 0.9, b: 0.4, c: 0.7 }; // c ignored (not in before)
    const d = summarizeReviewDelta(before, after);
    expect(d.conceptCount).toBe(2);
    expect(d.improved).toBe(1);
    expect(d.meanDelta).toBeCloseTo(0.3, 5);
  });

  it('returns zeros when there is no overlap', () => {
    expect(summarizeReviewDelta({}, { a: 0.5 })).toEqual({ conceptCount: 0, improved: 0, meanDelta: 0 });
  });
});

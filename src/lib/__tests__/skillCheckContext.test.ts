import { describe, it, expect } from 'vitest';
import { buildSkillCheckLearnerContext } from '../ai/skillCheckContext';
import type { Lesson } from '../../types/content';
import type { LessonProgress } from '../../types/progress';

const lesson = {
  id: 'l1',
  courseId: 'c1',
  order: 1,
  title: 'DTM Engine',
  concept: 'DTM',
  prerequisites: [],
  steps: [
    {
      id: 'predict-stage2',
      kind: 'predict',
      prompt: 'Set the natural increase rate you would expect.',
      concepts: ['natural-increase'],
      interaction: { type: 'nir-slider', config: { minGap: -5, maxGap: 28, initialGap: 8 } },
      answer: { minGap: 14, trend: 'rapid-growth' },
      feedback: {
        byOutcome: {
          shrinking: 'The opposite: births still far outnumber deaths in Stage 2.',
        },
      },
    },
    {
      id: 'connect-today',
      kind: 'connect',
      prompt: 'Tap the stage Japan is in.',
      concepts: ['dtm-stages'],
      interaction: { type: 'stage-select', config: {} },
      answer: { stages: [5] },
      feedback: {},
    },
  ],
};

describe('buildSkillCheckLearnerContext', () => {
  it('includes struggle details and byOutcome feedback', () => {
    const progress: LessonProgress = {
      lessonId: 'l1',
      finishedOnce: false,
      playState: 'in_progress',
      currentStepIndex: 0,
      completedStepIds: ['predict-stage2', 'connect-today'],
      firstTryCorrect: { 'predict-stage2': false, 'connect-today': true },
      attempts: { 'predict-stage2': 1 },
      attemptNotes: {
        'predict-stage2': {
          lastOutcome: 'shrinking',
          lastWrongSummary: 'Learner set NIR gap to -3 (Shrinking).',
        },
      },
      score: 50,
      updatedAt: Date.now(),
    };

    const ctx = buildSkillCheckLearnerContext(lesson as Lesson, progress);
    expect(ctx).toContain('predict-stage2');
    expect(ctx).toContain('births still far outnumber deaths');
    expect(ctx).not.toContain('Learner set NIR gap to -3');
    expect(ctx).toContain('connect-today');
    expect(ctx).toContain('first try');
  });

  it('includes attempt summary when no byOutcome message exists', () => {
    const progress: LessonProgress = {
      lessonId: 'l1',
      finishedOnce: false,
      playState: 'in_progress',
      currentStepIndex: 0,
      completedStepIds: [],
      firstTryCorrect: {},
      attempts: { 'connect-today': 1 },
      attemptNotes: {
        'connect-today': {
          lastOutcome: 'stage-3',
          lastWrongSummary: 'Learner tapped Stage 3 (Late Expanding).',
        },
      },
      score: 0,
      updatedAt: Date.now(),
    };

    const ctx = buildSkillCheckLearnerContext(lesson as Lesson, progress);
    expect(ctx).toContain('Learner tapped Stage 3');
  });
});

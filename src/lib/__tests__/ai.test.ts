import { describe, it, expect } from 'vitest';
import { hintLeaksAnswer, safeAuthoredHint } from '../ai/hintGuard';
import { normalizeHintResponse, parseAiJson } from '../ai/parseJson';
import { normalizeSkillCheckBatch } from '../ai/features/skillCheck';
import { playableSteps } from '../ai/lessonSteps';
import { verifySkillCheckQuestion } from '../ai/verify';
import type { Step } from '../../types/content';

describe('parseAiJson', () => {
  it('strips markdown fences and parses object', () => {
    const raw = '```json\n{"hint":"Try the gap"}\n```';
    expect(parseAiJson(raw)).toEqual({ hint: 'Try the gap' });
  });

  it('extracts JSON after leading prose', () => {
    const raw = 'Here is the response: {"nudge":"Focus on births vs deaths"}';
    expect(parseAiJson(raw)).toEqual({ nudge: 'Focus on births vs deaths' });
  });
});

describe('normalizeHintResponse', () => {
  it('maps alternate OpenAI key names to hint', () => {
    const res = normalizeHintResponse({ explanation: 'Think about the gap', gives_away_answer: false });
    expect(res?.hint).toBe('Think about the gap');
    expect(res?.givesAwayAnswer).toBe(false);
  });

  it('returns null when no hint-like field exists', () => {
    expect(normalizeHintResponse({ score: 1 })).toBeNull();
  });
});

function migrationMatchStep(): Step {
  return {
    id: 'match-migration-types',
    kind: 'connect',
    prompt: 'Drop each scenario into both categories it fits.',
    interaction: {
      type: 'match-pairs',
      config: {
        tiles: [
          { id: 'pull-city', label: 'A safe city full of jobs attracts newcomers' },
          { id: 'voluntary-job', label: 'A nurse moves abroad for a better-paying job' },
        ],
        slots: [
          { id: 'forced', label: 'Forced migration' },
          { id: 'voluntary', label: 'Voluntary migration' },
        ],
      },
    },
    answer: {
      tileSlots: {
        'pull-city': ['pull', 'voluntary'],
        'voluntary-job': ['pull', 'voluntary'],
      },
    },
    feedback: {},
  };
}

describe('hintLeaksAnswer post-wrong mode', () => {
  it('allows tailored nudges that name a tile and correct category', () => {
    const step = migrationMatchStep();
    const nudge =
      'You placed "A safe city full of jobs attracts newcomers" and "A nurse moves abroad for a better-paying job" as forced migration, but these scenarios involve choices made by individuals. Remember, voluntary migration is when people move by their own decision, not because they have to.';
    expect(hintLeaksAnswer(nudge, step, 'post-wrong')).toBe(false);
    expect(hintLeaksAnswer(nudge, step, 'pre-answer')).toBe(true);
  });

  it('allows post-wrong nudges that mention the target DTM stage on pyramid drags', () => {
    const step: Step = {
      id: 'solve-stage2-shape',
      kind: 'solve',
      prompt: 'Reshape the pyramid into Stage 2.',
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'shape', initialWidths: [0.4, 0.42, 0.44, 0.45] },
      },
      answer: { stages: [2], targetWidths: [0.88, 0.76, 0.52, 0.28], tolerance: 0.12 },
      feedback: { incorrect: 'Keep adjusting.' },
    };
    const nudge =
      'Your pyramid is still too column-shaped — Stage 2 needs a much wider base and a steeper youth bulge.';
    expect(hintLeaksAnswer(nudge, step, 'post-wrong')).toBe(false);
    expect(hintLeaksAnswer(nudge, step, 'pre-answer')).toBe(true);
  });
});

describe('hintLeaksAnswer', () => {
  it('rejects hints containing the correct MC option label', () => {
    const step: Step = {
      id: 'x',
      kind: 'predict',
      prompt: 'Pick one',
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'a', label: 'Stage 2 — rapid growth' },
            { id: 'b', label: 'Stage 4 — stable' },
          ],
        },
      },
      answer: { correctId: 'a' },
      feedback: {},
    };
    expect(hintLeaksAnswer('Think about Stage 2 — rapid growth', step)).toBe(true);
    expect(hintLeaksAnswer('Focus on the gap between the curves', step)).toBe(false);
  });

  it('rejects nir-slider hints that spell out the target gap', () => {
    const step: Step = {
      id: 'predict-stage2',
      kind: 'predict',
      prompt: 'Set NIR',
      interaction: {
        type: 'nir-slider',
        config: { minGap: -5, maxGap: 28, initialGap: 8, showVerdict: false },
      },
      answer: { minGap: 14, trend: 'rapid-growth' },
      feedback: {
        hint: 'Deaths just fell — how does that change the gap if births stay high?',
      },
    };
    expect(hintLeaksAnswer('Set a wide positive NIR — births should far outpace deaths.', step)).toBe(
      true,
    );
    expect(hintLeaksAnswer('Deaths just fell — how does that change the gap if births stay high?', step)).toBe(
      false,
    );
  });
});

describe('safeAuthoredHint', () => {
  it('returns null when authored hint leaks the answer', () => {
    const step: Step = {
      id: 'predict-stage2',
      kind: 'predict',
      prompt: 'Set NIR',
      interaction: {
        type: 'nir-slider',
        config: { minGap: -5, maxGap: 28, initialGap: 8, showVerdict: false },
      },
      answer: { minGap: 14, trend: 'rapid-growth' },
      feedback: {
        hint: 'Set a wide positive NIR — births should far outpace deaths.',
      },
    };
    expect(safeAuthoredHint(step)).toBeNull();
  });
});

describe('playableSteps', () => {
  it('drops explain-back steps when AI is off', () => {
    const lesson = {
      id: 'test',
      title: 'Test',
      steps: [
        { id: 'a', kind: 'predict', prompt: 'p', interaction: { type: 'stage-select', config: {} }, feedback: {} },
        {
          id: 'b',
          kind: 'connect',
          prompt: 'Explain',
          interaction: { type: 'explain-back', config: { question: 'Q?', rubric: ['x'], sampleAnswer: 'y' } },
          feedback: {},
        },
      ],
    } as import('../../types/content').Lesson;
    expect(playableSteps(lesson, false).map((s) => s.id)).toEqual(['a']);
    expect(playableSteps(lesson, true).map((s) => s.id)).toEqual(['a', 'b']);
  });
});

describe('normalizeSkillCheckBatch', () => {
  it('coerces alternate batch keys and option shapes', () => {
    const batch = normalizeSkillCheckBatch({
      Questions: [
        {
          type: 'stage-from-rates',
          stem: 'CBR 38, CDR 20 — which stage?',
          scenario: { birthRate: 38, deathRate: 20 },
          choices: ['Stage 1', 'Stage 2', 'Stage 4', 'Stage 5'],
          answer: 'b',
          rationale: 'High births, falling deaths.',
        },
      ],
    });
    expect(batch?.length).toBe(1);
    expect(batch?.[0].prompt).toContain('CBR 38');
    expect(batch?.[0].scenario.cbr).toBe(38);
    expect(batch?.[0].scenario.cdr).toBe(20);
    expect(batch?.[0].options[1].id).toBe('b');
  });

  it('accepts a top-level array and options as an object map', () => {
    const batch = normalizeSkillCheckBatch([
      {
        template: 'population-pyramid',
        prompt: 'A pyramid with a wide youth bulge is which stage?',
        stage: 2,
        pyramidDescription: 'Wide base and youth bulge',
        options: {
          a: 'Stage 1',
          b: 'Stage 2',
          c: 'Stage 4',
          d: 'Stage 5',
        },
        claimedCorrectId: 'b',
        explanation: 'Youth bulge = Stage 2.',
      },
    ]);
    expect(batch?.length).toBe(1);
    expect(batch?.[0].template).toBe('pyramid-stage');
    expect(batch?.[0].scenario.stage).toBe(2);
  });
});

describe('verifySkillCheckQuestion pyramid-stage', () => {
  it('infers stage from pyramidDescription when stage field is missing', () => {
    const q = {
      template: 'pyramid-stage' as const,
      prompt: 'Which stage matches this pyramid?',
      scenario: { pyramidDescription: 'A wide base with a youth bulge and rapid growth' },
      options: [
        { id: 'a', label: 'Stage 1' },
        { id: 'b', label: 'Stage 2' },
        { id: 'c', label: 'Stage 4' },
        { id: 'd', label: 'Stage 5' },
      ],
      claimedCorrectId: 'b',
      explanation: 'Youth bulge = Stage 2.',
    };
    expect(verifySkillCheckQuestion(q)?.correctId).toBe('b');
  });
});

describe('verifySkillCheckQuestion', () => {
  it('accepts when claimed answer matches recomputed stage', () => {
    const q = {
      template: 'stage-from-rates' as const,
      prompt: 'A country has CBR 38 and CDR 20. Which stage?',
      scenario: { cbr: 38, cdr: 20 },
      options: [
        { id: 'a', label: 'Stage 1' },
        { id: 'b', label: 'Stage 2' },
        { id: 'c', label: 'Stage 4' },
        { id: 'd', label: 'Stage 5' },
      ],
      claimedCorrectId: 'b',
      explanation: 'High births and falling deaths = Stage 2.',
    };
    const verified = verifySkillCheckQuestion(q);
    expect(verified?.correctId).toBe('b');
  });

  it('uses recomputed answer when claimed id is wrong', () => {
    const q = {
      template: 'stage-from-rates' as const,
      prompt: 'A country has CBR 38 and CDR 20. Which stage?',
      scenario: { cbr: 38, cdr: 20 },
      options: [
        { id: 'a', label: 'Stage 1' },
        { id: 'b', label: 'Stage 2' },
        { id: 'c', label: 'Stage 4' },
        { id: 'd', label: 'Stage 5' },
      ],
      claimedCorrectId: 'd',
      explanation: 'Wrong claim, right logic.',
    };
    expect(verifySkillCheckQuestion(q)?.correctId).toBe('b');
  });
});

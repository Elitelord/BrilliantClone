import { describe, expect, it } from 'vitest';
import {
  validate,
  resolveFeedback,
  pyramidAllControlsOk,
  pyramidControlOk,
  curveDrawPointOk,
} from '../validators';
import type { Interaction } from '../../types/content';

describe('validate', () => {
  describe('rate-graph', () => {
    const interaction: Interaction = { type: 'rate-graph', config: { initialStage: 2 } };

    it('passes stage match within tolerance', () => {
      const result = validate(interaction, { kind: 'stage', stages: [2], tolerance: 0.5 }, {
        stage: 2.3,
        trend: 'rapid-growth',
      });
      expect(result.correct).toBe(true);
      expect(result.outcome).toBe('stage-2');
    });

    it('fails stage outside tolerance', () => {
      const result = validate(interaction, { kind: 'stage', stages: [2] }, {
        stage: 4,
        trend: 'stable',
      });
      expect(result.correct).toBe(false);
    });

    it('passes trend match', () => {
      const result = validate(interaction, { kind: 'trend', trend: 'stable' }, {
        stage: 4,
        trend: 'stable',
      });
      expect(result.correct).toBe(true);
      expect(result.outcome).toBe('stable');
    });

    it('passes when no answer (explore)', () => {
      expect(validate(interaction, undefined, { stage: 1, trend: 'stable' }).correct).toBe(true);
    });
  });

  describe('stage-select', () => {
    const interaction: Interaction = { type: 'stage-select', config: {} };

    it('passes when selected stage is in answer list', () => {
      const result = validate(interaction, { stages: [2, 3] }, { selectedStage: 2 });
      expect(result.correct).toBe(true);
    });

    it('fails wrong stage', () => {
      const result = validate(interaction, { stages: [4] }, { selectedStage: 2 });
      expect(result.correct).toBe(false);
    });
  });

  describe('multiple-choice', () => {
    const interaction: Interaction = {
      type: 'multiple-choice',
      config: { options: [{ id: 'a', label: 'A' }] },
    };

    it('passes correct id', () => {
      expect(
        validate(interaction, { correctId: 'stage4' }, { selectedId: 'stage4' }).correct,
      ).toBe(true);
    });

    it('fails wrong id', () => {
      expect(
        validate(interaction, { correctId: 'stage4' }, { selectedId: 'stage2' }).correct,
      ).toBe(false);
    });
  });

  describe('population-pyramid', () => {
    it('classify mode checks selected stage', () => {
      const interaction: Interaction = {
        type: 'population-pyramid',
        config: { mode: 'classify' },
      };
      const pass = validate(interaction, { stages: [2] }, { selectedStage: 2, impliedStage: 2 });
      const fail = validate(interaction, { stages: [4] }, { selectedStage: 2, impliedStage: 2 });
      expect(pass.correct).toBe(true);
      expect(fail.correct).toBe(false);
    });

    it('shape mode checks targetWidths profile', () => {
      const interaction: Interaction = {
        type: 'population-pyramid',
        config: { mode: 'shape' },
      };
      const target: [number, number, number, number] = [0.4, 0.4, 0.42, 0.44];
      const controls: [number, number, number, number] = [0.41, 0.39, 0.43, 0.45];
      const result = validate(
        interaction,
        { stages: [4], targetWidths: target, tolerance: 0.05 },
        { controlWidths: controls, impliedStage: 4 },
      );
      expect(result.correct).toBe(true);
    });
  });

  describe('sector-bars', () => {
    it('classify mode checks selected stage', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'classify' } };
      expect(
        validate(interaction, { stages: [4] }, { selectedStage: 4, impliedStage: 4, dominant: 'tertiary' })
          .correct,
      ).toBe(true);
    });

    it('adjust mode checks dominant sector', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'tertiary' },
        { primary: 10, secondary: 20, tertiary: 70, impliedStage: 4, dominant: 'tertiary' },
      );
      expect(result.correct).toBe(true);
    });

    it('adjust mode checks implied stage when no dominant', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { stages: [3] },
        { primary: 20, secondary: 45, tertiary: 35, impliedStage: 3, dominant: 'secondary' },
      );
      expect(result.correct).toBe(true);
    });
  });

  describe('curve-draw', () => {
    const interaction: Interaction = { type: 'curve-draw', config: { curves: ['death'] } };
    const deathAnswer = { death: [38, 20, 10, 10, 10.5], tolerance: 4 };

    it('passes matching death curve from lesson 1', () => {
      const result = validate(interaction, deathAnswer, {
        birth: [40, 38, 24, 12, 7],
        death: [38, 20, 10, 10, 10.5],
      });
      expect(result.correct).toBe(true);
    });

    it('fails flat stage-2 death drop with death-flat outcome', () => {
      const result = validate(interaction, deathAnswer, {
        birth: [40, 38, 24, 12, 7],
        death: [38, 36, 10, 10, 10.5],
      });
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('death-flat');
    });

    it('passes birth curve within tolerance', () => {
      const result = validate(
        interaction,
        { birth: [40, 38, 24, 12, 7], tolerance: 6 },
        { birth: [40, 38, 24, 12, 7], death: [38, 20, 10, 10, 10.5] },
      );
      expect(result.correct).toBe(true);
    });
  });

  describe('nir-slider', () => {
    const interaction: Interaction = { type: 'nir-slider', config: {} };

    it('checks minGap and trend from lesson 2 pattern', () => {
      const pass = validate(
        interaction,
        { minGap: 14, trend: 'rapid-growth' },
        { gap: 18, trend: 'rapid-growth' },
      );
      const failGap = validate(
        interaction,
        { minGap: 14, trend: 'rapid-growth' },
        { gap: 10, trend: 'rapid-growth' },
      );
      expect(pass.correct).toBe(true);
      expect(failGap.correct).toBe(false);
    });
  });

  describe('rate-sliders', () => {
    const interaction: Interaction = { type: 'rate-sliders', config: {} };

    it('checks birth/death/gap bounds from lesson 2 pattern', () => {
      const answer = { birthMin: 28, gapMin: 10, deathMax: 26 };
      const pass = validate(
        interaction,
        answer,
        { birth: 35, death: 18, gap: 17, trend: 'rapid-growth' },
      );
      const fail = validate(
        interaction,
        answer,
        { birth: 20, death: 18, gap: 2, trend: 'stable' },
      );
      expect(pass.correct).toBe(true);
      expect(fail.correct).toBe(false);
    });
  });

  describe('info and country-model', () => {
    it('always passes info', () => {
      expect(
        validate({ type: 'info', config: { body: 'test' } }, undefined, null).correct,
      ).toBe(true);
    });

    it('always passes country-model', () => {
      expect(
        validate(
          { type: 'country-model', config: { countryIds: ['england'], initialCountryId: 'england' } },
          undefined,
          { countryId: 'england', year: 1900 },
        ).correct,
      ).toBe(true);
    });
  });
});

describe('pyramid helpers', () => {
  const answer = {
    stages: [4],
    targetWidths: [0.4, 0.4, 0.42, 0.44] as [number, number, number, number],
    tolerance: 0.05,
  };

  it('pyramidAllControlsOk passes when all within tolerance', () => {
    expect(pyramidAllControlsOk([0.41, 0.39, 0.43, 0.45], answer)).toBe(true);
  });

  it('pyramidControlOk checks individual handle', () => {
    expect(pyramidControlOk([0.41, 0.39, 0.43, 0.45], answer, 0)).toBe(true);
    expect(pyramidControlOk([0.5, 0.39, 0.43, 0.45], answer, 0)).toBe(false);
  });
});

describe('curveDrawPointOk', () => {
  const answer = { death: [38, 20, 10, 10, 10.5], tolerance: 4 };

  it('passes death point on target', () => {
    expect(
      curveDrawPointOk('death', [38, 20, 10, 10, 10.5], [40, 38, 24, 12, 7], answer, 1),
    ).toBe(true);
  });

  it('fails death point 1 when drop is too shallow', () => {
    expect(
      curveDrawPointOk('death', [38, 34, 10, 10, 10.5], [40, 38, 24, 12, 7], answer, 1),
    ).toBe(false);
  });

  it('passes birth point within tolerance', () => {
    const birthAnswer = { birth: [40, 38, 24, 12, 7], tolerance: 6 };
    expect(
      curveDrawPointOk('birth', [38, 20, 10, 10, 10.5], [40, 38, 24, 12, 7], birthAnswer, 2),
    ).toBe(true);
  });
});

describe('resolveFeedback', () => {
  const feedback = {
    correct: 'Nice!',
    incorrect: 'Try again.',
    byOutcome: { 'stage-2': 'That is Stage 2, not Stage 4.' },
  };

  it('returns correct message on pass', () => {
    expect(resolveFeedback(feedback, { correct: true })).toBe('Nice!');
  });

  it('returns byOutcome when present', () => {
    expect(
      resolveFeedback(feedback, { correct: false, outcome: 'stage-2' }),
    ).toBe('That is Stage 2, not Stage 4.');
  });

  it('falls back to incorrect message', () => {
    expect(resolveFeedback(feedback, { correct: false, outcome: 'other' })).toBe('Try again.');
  });
});

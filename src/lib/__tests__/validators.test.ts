import { describe, expect, it } from 'vitest';
import {
  validate,
  resolveFeedback,
  resolveWrongFeedback,
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

    it('stage-3 solve: secondary clearly > primary (rounded) -> correct', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'secondary' },
        { primary: 25, secondary: 45, tertiary: 30, impliedStage: 3, dominant: 'secondary' },
      );
      expect(result.correct).toBe(true);
      expect(result.outcome).toBe('secondary');
    });

    it('stage-3 solve: secondary == primary (rounded) -> incorrect, outcome primary', () => {
      // Raw values 40.4 vs 39.6 would round to a 40/40 tie the learner sees; grading
      // on the rounded state must NOT mark this correct just because raw secondary led.
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'secondary' },
        { primary: 40, secondary: 40, tertiary: 20, impliedStage: 3, dominant: 'secondary' },
      );
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('primary');
    });

    it('stage-3 solve: tertiary leads -> incorrect, outcome tertiary', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'secondary' },
        { primary: 10, secondary: 30, tertiary: 60, impliedStage: 4, dominant: 'tertiary' },
      );
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('tertiary');
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

    it('adjust mode with minTertiary: tertiary leads but below threshold -> tertiary-low', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'tertiary', minTertiary: 60 },
        { primary: 20, secondary: 30, tertiary: 50, impliedStage: 4, dominant: 'tertiary' },
      );
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('tertiary-low');
    });

    it('adjust mode with minTertiary: blames leading sector when tertiary too low', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'tertiary', minTertiary: 60 },
        { primary: 50, secondary: 30, tertiary: 20, impliedStage: 2, dominant: 'primary' },
      );
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('primary');
    });

    it('adjust mode with minTertiary: passes when tertiary leads above threshold', () => {
      const interaction: Interaction = { type: 'sector-bars', config: { mode: 'adjust' } };
      const result = validate(
        interaction,
        { dominant: 'tertiary', minTertiary: 60 },
        { primary: 8, secondary: 27, tertiary: 65, impliedStage: 4, dominant: 'tertiary' },
      );
      expect(result.correct).toBe(true);
      expect(result.outcome).toBe('tertiary');
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

  describe('match-pairs (single mode)', () => {
    const interaction: Interaction = {
      type: 'match-pairs',
      config: {
        tiles: [
          { id: 'subsistence', label: 'Farming', icon: '🌾' },
          { id: 'publichealth', label: 'Vaccines', icon: '💧' },
        ],
        slots: [
          { id: 'stage1', label: 'Stage 1' },
          { id: 'stage2', label: 'Stage 2' },
        ],
      },
    };
    const answer = { pairs: { subsistence: 'stage1', publichealth: 'stage2' } };

    it('passes when every tile is in its correct slot (array shape)', () => {
      const result = validate(interaction, answer, {
        placements: { stage1: ['subsistence'], stage2: ['publichealth'] },
      });
      expect(result.correct).toBe(true);
      expect(result.detail).toEqual({ subsistence: true, publichealth: true });
    });

    it('fails when a tile is in the wrong slot', () => {
      const result = validate(interaction, answer, {
        placements: { stage1: ['publichealth'], stage2: ['subsistence'] },
      });
      expect(result.correct).toBe(false);
      expect(result.detail).toEqual({ subsistence: false, publichealth: false });
    });
  });

  describe('match-pairs (transition-speed: 3 countries into 3 pace slots)', () => {
    const interaction: Interaction = {
      type: 'match-pairs',
      config: {
        tiles: [
          { id: 'england', label: 'England', icon: '🏴' },
          { id: 'south-korea', label: 'South Korea', icon: '🇰🇷' },
          { id: 'niger', label: 'Niger', icon: '🇳🇪' },
        ],
        slots: [
          { id: 'sped-up', label: 'Sped up' },
          { id: 'slowed-down', label: 'Slowed down' },
          { id: 'textbook-pace', label: 'Textbook pace' },
        ],
      },
    };
    const answer = {
      pairs: { 'south-korea': 'sped-up', niger: 'slowed-down', england: 'textbook-pace' },
    };

    it('passes when each country sits in its correct pace slot', () => {
      const result = validate(interaction, answer, {
        placements: {
          'sped-up': ['south-korea'],
          'slowed-down': ['niger'],
          'textbook-pace': ['england'],
        },
      });
      expect(result.correct).toBe(true);
      expect(result.detail).toEqual({ 'south-korea': true, niger: true, england: true });
    });

    it('fails and flags the swapped countries when speeds are mixed up', () => {
      const result = validate(interaction, answer, {
        placements: {
          'sped-up': ['niger'],
          'slowed-down': ['south-korea'],
          'textbook-pace': ['england'],
        },
      });
      expect(result.correct).toBe(false);
      expect(result.detail).toEqual({ 'south-korea': false, niger: false, england: true });
    });
  });

  describe('match-pairs (bucket mode, 4 tiles into 2 slots)', () => {
    const interaction: Interaction = {
      type: 'match-pairs',
      config: {
        multiPerSlot: true,
        tiles: [
          { id: 'water', label: 'Clean water', icon: '💧' },
          { id: 'vaccines', label: 'Vaccines', icon: '💉' },
          { id: 'girlsed', label: "Girls' education", icon: '🎓' },
          { id: 'contraception', label: 'Contraception', icon: '🩺' },
        ],
        slots: [
          { id: 'deaths', label: 'Lowers deaths' },
          { id: 'births', label: 'Lowers births' },
        ],
      },
    };
    const answer = {
      pairs: { water: 'deaths', vaccines: 'deaths', girlsed: 'births', contraception: 'births' },
    };

    it('passes when each bucket holds the correct multiple tiles', () => {
      const result = validate(interaction, answer, {
        placements: { deaths: ['water', 'vaccines'], births: ['girlsed', 'contraception'] },
      });
      expect(result.correct).toBe(true);
      expect(result.detail).toEqual({
        water: true,
        vaccines: true,
        girlsed: true,
        contraception: true,
      });
    });

    it('marks only the misplaced tile wrong', () => {
      const result = validate(interaction, answer, {
        placements: { deaths: ['water', 'girlsed'], births: ['vaccines', 'contraception'] },
      });
      expect(result.correct).toBe(false);
      expect(result.detail).toEqual({
        water: true,
        vaccines: false,
        girlsed: false,
        contraception: true,
      });
    });
  });

  describe('match-pairs (multi-category mode, one tile in several slots)', () => {
    const interaction: Interaction = {
      type: 'match-pairs',
      config: {
        multiPerTile: true,
        tiles: [
          { id: 'forced-war', label: 'Refugees flee war' },
          { id: 'pull-city', label: 'A city full of jobs' },
        ],
        slots: [
          { id: 'forced', label: 'Forced' },
          { id: 'pull', label: 'Pull factor' },
          { id: 'voluntary', label: 'Voluntary' },
          { id: 'push', label: 'Push factor' },
        ],
      },
    };
    const answer = {
      tileSlots: {
        'forced-war': ['push', 'forced'],
        'pull-city': ['pull', 'voluntary'],
      },
    };

    it('passes when each tile occupies exactly its set of slots (order-independent)', () => {
      const result = validate(interaction, answer, {
        placements: {
          forced: ['forced-war'],
          push: ['forced-war'],
          pull: ['pull-city'],
          voluntary: ['pull-city'],
        },
      });
      expect(result.correct).toBe(true);
      expect(result.detail).toEqual({ 'forced-war': true, 'pull-city': true });
    });

    it('fails a tile that is missing one of its required slots', () => {
      const result = validate(interaction, answer, {
        placements: {
          forced: ['forced-war'],
          push: [],
          pull: ['pull-city'],
          voluntary: ['pull-city'],
        },
      });
      expect(result.correct).toBe(false);
      expect(result.detail).toEqual({ 'forced-war': false, 'pull-city': true });
    });

    it('fails a tile placed in an extra wrong slot', () => {
      const result = validate(interaction, answer, {
        placements: {
          forced: ['forced-war'],
          push: ['forced-war'],
          pull: ['pull-city'],
          voluntary: ['pull-city', 'forced-war'],
        },
      });
      expect(result.correct).toBe(false);
      expect(result.detail).toEqual({ 'forced-war': false, 'pull-city': true });
    });
  });

  describe('family-size (adjust mode)', () => {
    const interaction: Interaction = {
      type: 'family-size',
      config: { mode: 'adjust' },
    };

    it('passes a small Stage 4 family within maxChildren', () => {
      const result = validate(interaction, { maxChildren: 2 }, { children: 2 });
      expect(result.correct).toBe(true);
    });

    it('fails too-many children with a too-many outcome', () => {
      const result = validate(interaction, { maxChildren: 2 }, { children: 6 });
      expect(result.correct).toBe(false);
      expect(result.outcome).toBe('too-many');
    });

    it('explore mode is ungraded (always correct)', () => {
      const result = validate(
        { type: 'family-size', config: { mode: 'explore' } },
        { maxChildren: 2 },
        { dev: 1, children: 6 },
      );
      expect(result.correct).toBe(true);
    });
  });
});

describe('chart-pick', () => {
  const interaction: Interaction = {
    type: 'chart-pick',
    config: {
      options: [
        { id: 'civil-war', series: [{ year: 2000, birth: 20, death: 42, pop: 22 }] },
        { id: 'baby-boom', series: [{ year: 2000, birth: 38, death: 9, pop: 30 }] },
      ],
    },
  };

  it('passes the correct chart id', () => {
    const result = validate(interaction, { correctId: 'civil-war' }, { selectedId: 'civil-war' });
    expect(result.correct).toBe(true);
    expect(result.outcome).toBe('civil-war');
  });

  it('fails a wrong chart id and reports the picked id as the outcome', () => {
    const result = validate(interaction, { correctId: 'civil-war' }, { selectedId: 'baby-boom' });
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('baby-boom');
  });

  it('passes when no answer (explore)', () => {
    expect(validate(interaction, undefined, { selectedId: 'baby-boom' }).correct).toBe(true);
  });
});

describe('migration-flow', () => {
  const interaction: Interaction = {
    type: 'migration-flow',
    config: { naturalChange: 0.5 },
  };

  it('grades shrinking trend', () => {
    const result = validate(interaction, { trend: 'shrinking' }, {
      inMigration: 2,
      outMigration: 12,
      netMigration: -10,
      totalChange: -9.5,
      trend: 'shrinking',
    });
    expect(result.correct).toBe(true);
  });

  it('fails when trend does not match', () => {
    const result = validate(interaction, { trend: 'shrinking' }, {
      inMigration: 10,
      outMigration: 2,
      netMigration: 8,
      totalChange: 8.5,
      trend: 'growing',
    });
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('growing');
  });

  it('grades net migration bounds', () => {
    const bounded = validate(interaction, { minNet: -10, maxNet: -5 }, {
      inMigration: 1,
      outMigration: 8,
      netMigration: -7,
      totalChange: -6.5,
      trend: 'shrinking',
    });
    expect(bounded.correct).toBe(true);
  });
});

describe('world-map', () => {
  const pick: Interaction = {
    type: 'world-map',
    config: { countryIds: ['niger', 'japan', 'uae'], mode: 'pick' },
  };
  const pickMulti: Interaction = {
    type: 'world-map',
    config: { countryIds: ['india', 'brazil', 'mexico', 'indonesia', 'usa'], mode: 'pick-multi' },
  };
  const explore: Interaction = {
    type: 'world-map',
    config: { countryIds: ['niger', 'japan'], mode: 'explore' },
  };

  it('passes when tapped country matches stage answer', () => {
    const result = validate(pick, { stages: [2] }, { selectedId: 'niger', seen: true });
    expect(result.correct).toBe(true);
    expect(result.outcome).toBe('niger');
  });

  it('fails when tapped country is wrong stage', () => {
    const result = validate(pick, { stages: [2] }, { selectedId: 'japan', seen: true });
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('japan');
  });

  it('passes when tapped country id matches', () => {
    const result = validate(pick, { countryIds: ['uae'] }, { selectedId: 'uae', seen: true });
    expect(result.correct).toBe(true);
  });

  it('passes pick-multi when exact set matches', () => {
    const result = validate(
      pickMulti,
      { countryIds: ['india', 'brazil', 'mexico'] },
      { selectedIds: ['brazil', 'india', 'mexico'], seen: true },
    );
    expect(result.correct).toBe(true);
    expect(result.outcome).toBe('all');
  });

  it('fails pick-multi when set is wrong', () => {
    const result = validate(
      pickMulti,
      { countryIds: ['india', 'brazil', 'mexico'] },
      { selectedIds: ['india', 'usa'], seen: true },
    );
    expect(result.correct).toBe(false);
    expect(result.outcome).toBe('wrong-set');
  });

  it('explore mode is always correct', () => {
    const result = validate(explore, undefined, { selectedId: 'niger', seen: true });
    expect(result.correct).toBe(true);
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

describe('resolveWrongFeedback', () => {
  const step = {
    id: 'mc',
    kind: 'predict' as const,
    prompt: 'Why?',
    interaction: {
      type: 'multiple-choice' as const,
      config: {
        options: [
          { id: 'youth-bulge', label: 'Youth bulge' },
          { id: 'immigration', label: 'Immigration' },
        ],
      },
    },
    answer: { correctId: 'youth-bulge' },
    feedback: {
      incorrect: 'Wrong pick.',
      byOutcome: {
        immigration: 'Immigration is not the main reason here.',
      },
      hint: 'Think about age structure.',
    },
  };

  it('prefers byOutcome over incorrect', () => {
    expect(
      resolveWrongFeedback(step, { correct: false, outcome: 'immigration' }),
    ).toBe('Immigration is not the main reason here.');
  });

  it('falls back to incorrect then generic', () => {
    expect(resolveWrongFeedback(step, { correct: false, outcome: 'other' })).toBe('Wrong pick.');
    const noIncorrect = { ...step, feedback: { byOutcome: step.feedback.byOutcome } };
    expect(resolveWrongFeedback(noIncorrect, { correct: false, outcome: 'other' })).toBe(
      'Not quite — try again.',
    );
  });
});

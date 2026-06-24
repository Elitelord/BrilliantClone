import { describe, expect, it } from 'vitest';
import {
  STAGE_DATA,
  STAGE_PYRAMID_PROFILES,
  classifyPyramidControls,
  dominantSector,
  doublingTime,
  gapAtStage,
  impliedStageFromPyramid,
  impliedStageFromSectors,
  nirPercent,
  nirZeroCrossingStage,
  ratesAtStage,
  stableSnapTargets,
  stageFromRates,
  trendAtStage,
  trendFromGap,
} from '../dtm';

describe('ratesAtStage and gapAtStage', () => {
  it('returns canonical stage 1 values', () => {
    expect(ratesAtStage(1)).toEqual({ birth: 40, death: 38 });
    expect(gapAtStage(1)).toBe(2);
  });

  it('interpolates fractional stages', () => {
    const mid = ratesAtStage(2.5);
    expect(mid.birth).toBeGreaterThan(25);
    expect(mid.birth).toBeLessThan(38);
    expect(mid.death).toBeGreaterThan(10);
    expect(mid.death).toBeLessThan(20);
  });

  it('returns stage 5 values', () => {
    const s5 = STAGE_DATA[4];
    expect(ratesAtStage(5)).toEqual({ birth: s5.birth, death: s5.death });
    expect(gapAtStage(5)).toBeLessThan(0);
  });
});

describe('trendFromGap and trendAtStage', () => {
  it('classifies shrinking gap', () => {
    expect(trendFromGap(-2)).toBe('shrinking');
    expect(trendAtStage(5)).toBe('shrinking');
  });

  it('classifies rapid growth at stage 2', () => {
    expect(trendAtStage(2)).toBe('rapid-growth');
  });

  it('classifies stable at stage 4', () => {
    expect(trendAtStage(4)).toBe('stable');
  });
});

describe('stageFromRates', () => {
  it('maps high birth and death to stage 1', () => {
    expect(stageFromRates(40, 38)).toBe(1);
  });

  it('maps high birth with fallen death to stage 2', () => {
    expect(stageFromRates(38, 20)).toBe(2);
  });

  it('maps birth below death to stage 5', () => {
    expect(stageFromRates(7, 10.5)).toBe(5);
  });
});

describe('nirPercent and doublingTime', () => {
  it('computes NIR percent from gap', () => {
    expect(nirPercent(18)).toBe(1.8);
  });

  it('returns null doubling time when not growing', () => {
    expect(doublingTime(0)).toBeNull();
    expect(doublingTime(-0.5)).toBeNull();
  });

  it('computes doubling time for positive NIR', () => {
    expect(doublingTime(1.8)).toBeCloseTo(70 / 1.8, 5);
  });
});

describe('stableSnapTargets and nirZeroCrossingStage', () => {
  it('includes stage 1 as a snap target', () => {
    expect(stableSnapTargets()).toContain(1);
  });

  it('finds NIR zero crossing between stages 4 and 5', () => {
    const cross = nirZeroCrossingStage();
    expect(cross).toBeGreaterThan(4);
    expect(cross).toBeLessThan(5);
    expect(gapAtStage(cross)).toBeCloseTo(0, 4);
  });
});

describe('classifyPyramidControls', () => {
  it('identifies column shape as stage 4', () => {
    const guess = classifyPyramidControls(STAGE_PYRAMID_PROFILES[4]);
    expect(guess.kind).toBe('one');
    if (guess.kind === 'one') expect(guess.stage).toBe(4);
  });

  it('identifies inverted aging as stage 5', () => {
    const guess = classifyPyramidControls(STAGE_PYRAMID_PROFILES[5]);
    expect(guess.kind === 'one' || guess.kind === 'either').toBe(true);
    if (guess.kind === 'one') expect(guess.stage).toBe(5);
  });

  it('identifies wide base profile as early stage', () => {
    const guess = classifyPyramidControls(STAGE_PYRAMID_PROFILES[2]);
    expect(guess.kind).not.toBe('unknown');
  });
});

describe('impliedStageFromPyramid', () => {
  it('infers stage 2 from wide base and narrow top', () => {
    expect(impliedStageFromPyramid(0.92, 0.2)).toBe(2);
  });

  it('infers stage 5 from aging top-heavy shape', () => {
    expect(impliedStageFromPyramid(0.28, 0.68)).toBe(5);
  });
});

describe('dominantSector and impliedStageFromSectors', () => {
  it('picks primary as dominant', () => {
    expect(dominantSector(60, 25, 15)).toBe('primary');
  });

  it('maps primary-heavy economy to stage 2', () => {
    expect(impliedStageFromSectors(60, 25, 15)).toBe(2);
  });

  it('maps tertiary-heavy economy to stage 4', () => {
    expect(impliedStageFromSectors(10, 20, 70)).toBe(4);
  });
});

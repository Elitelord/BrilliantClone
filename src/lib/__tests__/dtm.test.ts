import { describe, expect, it } from 'vitest';
import {
  STAGE_DATA,
  STAGE_PYRAMID_PROFILES,
  classifyPyramidControls,
  cohortWidthsFromControls,
  dependencyRatioFromControls,
  dependencyBreakdownFromControls,
  dominantSector,
  doublingTime,
  gapAtStage,
  idealizedCountrySeries,
  impliedStageFromPyramid,
  impliedStageFromSectors,
  nirPercent,
  nirZeroCrossingStage,
  ratesAtStage,
  sectorStageConfident,
  stableSnapTargets,
  STAGE_SECTOR_PROFILES,
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

describe('dependencyRatioFromControls', () => {
  it('returns high youth-driven ratio for wide-base Stage 2 profile', () => {
    const ratio = dependencyRatioFromControls(STAGE_PYRAMID_PROFILES[2]);
    expect(ratio).toBeGreaterThan(70);
  });

  it('returns high elderly-driven ratio for top-heavy Stage 5 profile', () => {
    const ratio = dependencyRatioFromControls(STAGE_PYRAMID_PROFILES[5]);
    expect(ratio).toBeGreaterThan(60);
  });

  it('returns higher ratio for Stage 5 than Stage 4 column', () => {
    const s4 = dependencyRatioFromControls(STAGE_PYRAMID_PROFILES[4]);
    const s5 = dependencyRatioFromControls(STAGE_PYRAMID_PROFILES[5]);
    expect(s5).toBeGreaterThan(s4);
  });

  it('Stage 2 has more youth-weight than Stage 5', () => {
    const s2 = cohortWidthsFromControls(STAGE_PYRAMID_PROFILES[2]);
    const s5 = cohortWidthsFromControls(STAGE_PYRAMID_PROFILES[5]);
    const youth2 = s2[0] + s2[1];
    const youth5 = s5[0] + s5[1];
    expect(youth2).toBeGreaterThan(youth5);
  });

  it('breakdown sums youth + elderly to total', () => {
    const b = dependencyBreakdownFromControls(STAGE_PYRAMID_PROFILES[2]);
    expect(b.total).toBeCloseTo(b.youth + b.elderly, 5);
    expect(b.youth).toBeGreaterThan(b.elderly);
  });

  it('expands controls to nine cohort widths', () => {
    const widths = cohortWidthsFromControls(STAGE_PYRAMID_PROFILES[4]);
    expect(widths.length).toBe(9);
    const spread = Math.max(...widths) - Math.min(...widths);
    expect(spread).toBeLessThan(0.15);
  });
});

describe('dominantSector and impliedStageFromSectors', () => {
  it('picks primary as dominant', () => {
    expect(dominantSector(60, 25, 15)).toBe('primary');
  });

  it('maps farming-led economy to stage 2', () => {
    expect(impliedStageFromSectors(60, 25, 15)).toBe(2);
  });

  it('maps industry-led economy to stage 3', () => {
    expect(impliedStageFromSectors(25, 45, 30)).toBe(3);
  });

  it('maps services-led economy to stage 4', () => {
    expect(impliedStageFromSectors(10, 20, 70)).toBe(4);
  });
});

describe('sectorStageConfident', () => {
  it('is confident when the lead is clear', () => {
    expect(sectorStageConfident(60, 25, 15)).toBe(true);
  });

  it('is not confident on a near-tie lead', () => {
    expect(sectorStageConfident(40, 35, 25)).toBe(false);
  });
});

describe('idealizedCountrySeries', () => {
  // Stylized UAE-like (low start pop) and Niger-like (stuck Stage 2) windows.
  const uaeLike = [
    { year: 1970, birth: 38, death: 12, pop: 0.3 },
    { year: 1990, birth: 22, death: 4, pop: 1.9 },
    { year: 2023, birth: 9, death: 2, pop: 10.4 },
  ];
  const nigerLike = [
    { year: 1950, birth: 52, death: 32, pop: 2.5 },
    { year: 2000, birth: 50, death: 17, pop: 10.9 },
    { year: 2023, birth: 42, death: 10, pop: 27.2 },
  ];

  it('returns an empty series for empty input', () => {
    expect(idealizedCountrySeries([])).toEqual([]);
  });

  it('keeps the real first-year population as the textbook start', () => {
    const series = idealizedCountrySeries(uaeLike);
    expect(series[0].pop).toBeCloseTo(0.3, 6);
    expect(series).toHaveLength(uaeLike.length);
  });

  it('ends at stable Stage 4 rates — never the declining Stage 5', () => {
    const nigerSeries = idealizedCountrySeries(nigerLike);
    const last = nigerSeries[nigerSeries.length - 1];
    const stage4 = ratesAtStage(4);
    expect(last.birth).toBeCloseTo(stage4.birth, 6);
    expect(last.death).toBeCloseTo(stage4.death, 6);
    // Stage 4 keeps births >= deaths, so the textbook pop never turns downward.
    expect(last.birth).toBeGreaterThanOrEqual(last.death);
  });

  it('produces a finite, non-decreasing, growing population curve', () => {
    for (const input of [uaeLike, nigerLike]) {
      const series = idealizedCountrySeries(input);
      let prev = -Infinity;
      for (const p of series) {
        expect(Number.isFinite(p.pop)).toBe(true);
        expect(Number.isFinite(p.birth)).toBe(true);
        expect(Number.isFinite(p.death)).toBe(true);
        expect(p.pop).toBeGreaterThanOrEqual(prev);
        prev = p.pop;
      }
      // The standard transition grows the population above its starting point.
      expect(series[series.length - 1].pop).toBeGreaterThan(series[0].pop);
    }
  });
});

describe('STAGE_SECTOR_PROFILES', () => {
  it('each stage profile sums to 100', () => {
    for (const { primary, secondary, tertiary } of Object.values(STAGE_SECTOR_PROFILES)) {
      expect(primary + secondary + tertiary).toBe(100);
    }
  });
});

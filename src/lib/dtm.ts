// The Demographic Transition Model - the shared "engine" math used by both the
// interactive components and the validators. Rates are per 1,000 people per year.
import type { Trend, Sector } from '../types/content';

export interface StagePoint {
  stage: number;
  birth: number;
  death: number;
}

// Canonical, textbook-typical birth/death rates at each of the 5 stages.
export const STAGE_DATA: StagePoint[] = [
  { stage: 1, birth: 40, death: 38 }, // pre-industrial: high birth, high death
  { stage: 2, birth: 38, death: 20 }, // early developing: death plummets -> boom
  { stage: 3, birth: 25, death: 10 }, // maturing: birth falls, growth slows
  { stage: 4, birth: 12, death: 10 }, // developed: low birth, low death, stable
  { stage: 5, birth: 7, death: 10.5 }, // births fall below deaths; death barely rises
];

export const STAGE_MIN = 1;
export const STAGE_MAX = 5;
export const RATE_MAX = 45;

// Canonical AP Human Geography names for each stage.
export const STAGE_NAMES: Record<number, string> = {
  1: 'High Stationary',
  2: 'Early Expanding',
  3: 'Late Expanding',
  4: 'Low Stationary',
  5: 'Declining',
};

/** Chip / badge colors per DTM stage. */
export const STAGE_CHIP_STYLE: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  2: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  3: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  4: { bg: '#e2e8f0', text: '#475569', border: '#cbd5e1' },
  5: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
};

/** Example country for each stage (pyramid explore chip). */
export const STAGE_EXAMPLE_COUNTRY: Record<number, string> = {
  1: 'Afghanistan',
  2: 'Nigeria',
  3: 'Brazil',
  4: 'United States',
  5: 'Japan',
};

/** Population-icon color from NIR gap: green (fast growth) → grey (stable) → red (decline). */
function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

const POP_RED = { r: 220, g: 38, b: 38 };
const POP_GREY = { r: 100, g: 116, b: 139 };
const POP_GREEN = { r: 21, g: 128, b: 61 };

export function gapToPopColor(gap: number): string {
  if (gap <= 0) {
    const t = clamp((gap + 8) / 8, 0, 1);
    return mixRgb(POP_RED, POP_GREY, t);
  }
  if (gap <= 18) {
    const t = clamp(gap / 18, 0, 1);
    return mixRgb(POP_GREY, POP_GREEN, t);
  }
  return '#15803d';
}

export function stageName(stage: number): string {
  return STAGE_NAMES[Math.round(Math.max(STAGE_MIN, Math.min(STAGE_MAX, stage)))] ?? '';
}

// Rate of natural increase as a percentage: NIR = (CBR - CDR) / 10.
export function nirPercent(gap: number): number {
  return gap / 10;
}

// Population doubling time via the Rule of 70 (only meaningful while growing).
export function doublingTime(nirPct: number): number | null {
  if (nirPct <= 0.05) return null;
  return 70 / nirPct;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Interpolate birth/death at a fractional stage in [1,5].
export function ratesAtStage(stage: number): { birth: number; death: number } {
  const s = clamp(stage, STAGE_MIN, STAGE_MAX);
  const lower = Math.floor(s);
  const upper = Math.min(STAGE_MAX, lower + 1);
  const t = s - lower;
  const a = STAGE_DATA[lower - 1];
  const b = STAGE_DATA[upper - 1];
  return {
    birth: lerp(a.birth, b.birth, t),
    death: lerp(a.death, b.death, t),
  };
}

export function gapAtStage(stage: number): number {
  const { birth, death } = ratesAtStage(stage);
  return birth - death;
}

/** Stage where birth and death rates cross (NIR = 0) between Stage 4 and 5. */
export function nirZeroCrossingStage(): number {
  let lo = 4;
  let hi = 5;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (gapAtStage(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Magnetic snap targets for stable-population drag steps. */
export function stableSnapTargets(): number[] {
  return [1, nirZeroCrossingStage()];
}

/** @deprecated use stableSnapTargets() */
export const STABLE_SNAP_STAGES = [1, 4] as const;

// Estimate a DTM stage (1..5) from crude birth/death rates.
export function stageFromRates(birth: number, death: number): number {
  if (birth < death) return 5; // deaths overtake births -> decline
  const gap = birth - death;
  if (death >= 24 && gap < 8) return 1; // high death with a small gap (pre-industrial)
  if (birth >= 30) return 2; // high birth, death has dropped -> wide gap
  if (birth >= 18) return 3; // birth falling
  return 4; // low birth, low death, stable
}

// Natural-increase gap -> qualitative population trend.
export function trendFromGap(gap: number): Trend {
  if (gap <= -1) return 'shrinking';
  if (gap < 5) return 'stable';
  if (gap < 16) return 'growing';
  return 'rapid-growth';
}

export function trendAtStage(stage: number): Trend {
  return trendFromGap(gapAtStage(stage));
}

export const TREND_LABEL: Record<Trend, string> = {
  stable: 'Stable',
  growing: 'Growing',
  'rapid-growth': 'Rapid growth',
  shrinking: 'Shrinking',
};

// ---- Population pyramids -------------------------------------------------
// Four control widths (young → old) for shape matching. Used by the explore
// chip and graded drag steps when targetWidths are set.
export const STAGE_PYRAMID_PROFILES: Record<number, [number, number, number, number]> = {
  1: [0.96, 0.50, 0.12, 0.06], // wide base, steep drop (high deaths), nearly empty top
  2: [0.92, 0.76, 0.40, 0.20], // broad youth bulge, still growing
  3: [0.56, 0.52, 0.44, 0.36], // narrowing triangle, births falling
  4: [0.40, 0.40, 0.42, 0.44], // even column
  5: [0.28, 0.36, 0.52, 0.68], // inverted / aging
};

const PROFILE_MAX_DIST = 0.48;
const PROFILE_MIN_GAP = 0.05;

export type PyramidStageGuess =
  | { kind: 'one'; stage: number }
  | { kind: 'either'; stages: [number, number] }
  | { kind: 'unknown' };

function profileDist(controls: [number, number, number, number], profile: [number, number, number, number]): number {
  return controls.reduce((sum, w, i) => sum + Math.abs(w - profile[i]), 0);
}

function rankProfiles(controls: [number, number, number, number]) {
  return Object.entries(STAGE_PYRAMID_PROFILES)
    .map(([stage, profile]) => ({
      stage: Number(stage),
      dist: profileDist(controls, profile),
    }))
    .sort((a, b) => a.dist - b.dist);
}

/** Even column — Stage 4 has similar widths at every age (low spread, mid range). */
function isColumnShape(controls: [number, number, number, number]): boolean {
  const spread = Math.max(...controls) - Math.min(...controls);
  const avg = controls.reduce((a, b) => a + b, 0) / controls.length;
  return spread <= 0.12 && avg >= 0.30 && avg <= 0.52;
}

/** Narrow young + wide old — classic Stage 5 inverted / aging shape. */
function isAgingInverted(controls: [number, number, number, number]): boolean {
  return controls[0] <= 0.38 && controls[3] >= 0.48 && controls[3] - controls[0] >= 0.2;
}

export function classifyPyramidControls(controls: [number, number, number, number]): PyramidStageGuess {
  // Maxed-out uniform block
  if (controls.every((c) => c > 0.85)) return { kind: 'unknown' };

  if (isColumnShape(controls)) return { kind: 'one', stage: 4 };

  const spread = Math.max(...controls) - Math.min(...controls);
  if (spread < 0.08) return { kind: 'unknown' };

  const scores = rankProfiles(controls);
  const best = scores[0];
  const second = scores[1];

  if (isAgingInverted(controls)) {
    const d5 = profileDist(controls, STAGE_PYRAMID_PROFILES[5]);
    const d4 = profileDist(controls, STAGE_PYRAMID_PROFILES[4]);
    if (d5 <= PROFILE_MAX_DIST && d5 <= d4 + 0.08) return { kind: 'one', stage: 5 };
    if (d5 <= PROFILE_MAX_DIST && d4 <= PROFILE_MAX_DIST && Math.abs(d5 - d4) < PROFILE_MIN_GAP) {
      return { kind: 'either', stages: [4, 5] };
    }
  }

  if (best.dist > PROFILE_MAX_DIST) return { kind: 'unknown' };

  if (second.dist - best.dist < PROFILE_MIN_GAP) {
    const a = Math.min(best.stage, second.stage);
    const b = Math.max(best.stage, second.stage);
    return { kind: 'either', stages: [a, b] };
  }

  return { kind: 'one', stage: best.stage };
}

export function formatPyramidStageGuess(guess: PyramidStageGuess): string {
  if (guess.kind === 'one') return `Stage ${guess.stage}`;
  if (guess.kind === 'either') return `Stage ${guess.stages[0]} / Stage ${guess.stages[1]}`;
  return 'Unknown';
}

/** Match a 4-handle shape to the closest DTM stage, or null if ambiguous / non-textbook. */
export function impliedStageFromControls(controls: [number, number, number, number]): number | null {
  const guess = classifyPyramidControls(controls);
  if (guess.kind === 'one') return guess.stage;
  if (guess.kind === 'either') return guess.stages[0];
  return null;
}

// base = width of the youngest cohort (a birth-rate proxy),
// top  = width of the oldest cohort (a longevity proxy). Both 0..1.
export function impliedStageFromPyramid(base: number, top: number): number {
  const controls: [number, number, number, number] = [
    base,
    base + (top - base) * 0.33,
    base + (top - base) * 0.66,
    top,
  ];
  const stage = impliedStageFromControls(controls);
  if (stage !== null) return stage;
  if (base >= 0.72 && top < 0.24) return 2;
  if (base >= 0.40) return 3;
  if (top >= 0.52) return 5;
  return 4;
}

// ---- Sector employment --------------------------------------------------
export function dominantSector(p: number, s: number, t: number): Sector {
  if (p >= s && p >= t) return 'primary';
  if (t >= p && t >= s) return 'tertiary';
  return 'secondary';
}

export function impliedStageFromSectors(p: number, s: number, t: number): number {
  if (p >= 50) return 2; // agrarian -> early stage
  if (t >= 55) return 4; // service economy -> developed
  if (s >= 35 && s >= t) return 3; // industrial peak
  return 3;
}

export const SECTOR_LABEL: Record<Sector, string> = {
  primary: 'Farming (primary)',
  secondary: 'Industry (secondary)',
  tertiary: 'Services (tertiary)',
};

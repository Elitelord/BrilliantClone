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

export interface IdealizedPoint {
  year: number;
  birth: number;
  death: number;
  pop: number; // millions
}

/** Minimal real-country shape consumed by {@link idealizedCountrySeries}. */
export interface CountrySeriesPoint {
  year: number;
  birth: number;
  death: number;
  pop: number; // millions
}

/**
 * Idealized "textbook" DTM baseline for the Textbook-vs-Actual comparison.
 * It answers: "if this country ran the STANDARD demographic transition —
 * births minus deaths only, no migration, at an even pace — what would its
 * rates and population look like?", so the real curve can be read against it.
 *
 * Stylized teaching baseline, NOT demographically exact. Design choices:
 *  - It begins at the DTM stage the country's FIRST real data point already
 *    sits in (via stageFromRates), so we don't pretend a 1970 oil state or
 *    1950 South Korea started at pristine Stage 1 — that mis-anchoring is what
 *    crushed the old curve (every series forced to span Stage 1→5 regardless
 *    of where the country actually was).
 *  - It advances evenly to Stage 4 ("Low Stationary"), where births and deaths
 *    re-converge and population STABILIZES. We deliberately stop at Stage 4 and
 *    NOT Stage 5: the textbook prediction is "complete the transition and level
 *    off." Ending at Stage 5 (births below deaths → a SHRINKING population) is
 *    demographically misleading for developing countries (e.g. Niger) and looks
 *    odd (the population line dips down at the end).
 *  - Population integrates the implied natural increase from the country's real
 *    starting population using the AVERAGE (trapezoidal) rate over each interval,
 *    giving a smooth S-curve that grows then levels rather than under-shooting.
 *
 * The contrast each real country then shows against this baseline:
 *  - South Korea: real transition was COMPRESSED → real births dive below the
 *    standard-pace baseline.
 *  - Niger: real transition STALLED in Stage 2 → real births stay high above it
 *    and real population overshoots it.
 *  - UAE: labour migration → real population dwarfs this births-minus-deaths
 *    baseline (migration is invisible to the DTM).
 */
export function idealizedCountrySeries(actual: CountrySeriesPoint[]): IdealizedPoint[] {
  if (actual.length === 0) return [];
  const first = actual[0];
  const last = actual[actual.length - 1];
  const span = last.year - first.year || 1;

  // Start where the country really is; aim at stable Stage 4 (never go backwards
  // if it already begins at or past Stage 4).
  const startStage = stageFromRates(first.birth, first.death);
  const endStage = Math.max(startStage, 4);

  // Pass 1: birth/death at each year along an even stage path.
  const rates = actual.map((p) => {
    const stage = startStage + ((p.year - first.year) / span) * (endStage - startStage);
    return { year: p.year, ...ratesAtStage(stage) };
  });

  // Pass 2: integrate population with the mean NIR across each interval.
  let pop = first.pop;
  return rates.map((pt, i) => {
    if (i > 0) {
      const prev = rates[i - 1];
      const dt = pt.year - prev.year;
      const avgGap = (prev.birth - prev.death + (pt.birth - pt.death)) / 2;
      pop = pop * Math.pow(1 + avgGap / 1000, dt);
    }
    return { year: pt.year, birth: pt.birth, death: pt.death, pop };
  });
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

// ---- Age bands & dependency ratio ----------------------------------------
const PYRAMID_CONTROL_COHORTS = [0, 3, 6, 8] as const;

/** Expand four control widths to nine cohort widths (young → old). */
export function cohortWidthsFromControls(controls: [number, number, number, number]): number[] {
  const widths: number[] = [];
  for (let cohort = 0; cohort < 9; cohort++) {
    let seg = 0;
    while (seg < PYRAMID_CONTROL_COHORTS.length - 1 && cohort > PYRAMID_CONTROL_COHORTS[seg + 1]) seg++;
    const c0 = PYRAMID_CONTROL_COHORTS[seg];
    const c1 = PYRAMID_CONTROL_COHORTS[seg + 1];
    const t = c1 === c0 ? 0 : (cohort - c0) / (c1 - c0);
    widths.push(lerp(controls[seg], controls[seg + 1], t));
  }
  return widths;
}

/** Sample four control cohorts from nine cohort widths (young → old). */
export function controlsFromCohortWidths(
  widths: number[],
): [number, number, number, number] {
  return [widths[0], widths[3], widths[6], widths[8]];
}

export const STAGE_PYRAMID_COHORTS: Record<
  number,
  [number, number, number, number, number, number, number, number, number]
> = Object.fromEntries(
  Object.entries(STAGE_PYRAMID_PROFILES).map(([stage, profile]) => [
    Number(stage),
    cohortWidthsFromControls(profile) as [number, number, number, number, number, number, number, number, number],
  ]),
) as Record<number, [number, number, number, number, number, number, number, number, number]>;

/** Stylized age-band sums on the 9-cohort model (widths as population proxy). */
function bandSumsFromWidths(widths: number[]): { youth: number; working: number; elderly: number } {
  const youth = widths[0] + widths[1];
  const working = widths.slice(2, 7).reduce((sum, w) => sum + w, 0);
  const elderly = widths[7] + widths[8];
  return { youth, working, elderly };
}

export interface DependencyBreakdown {
  /** Youth (0–14) per 100 working-age (15–64). */
  youth: number;
  /** Elderly (65+) per 100 working-age (15–64). */
  elderly: number;
  /** Total dependents per 100 working-age — youth + elderly ratios. */
  total: number;
}

export function dependencyBreakdownFromWidths(widths: number[]): DependencyBreakdown {
  const { youth, working, elderly } = bandSumsFromWidths(widths);
  if (working <= 0) return { youth: 0, elderly: 0, total: 0 };
  const youthRatio = (youth / working) * 100;
  const elderlyRatio = (elderly / working) * 100;
  return { youth: youthRatio, elderly: elderlyRatio, total: youthRatio + elderlyRatio };
}

export function dependencyBreakdownFromControls(
  controls: [number, number, number, number],
): DependencyBreakdown {
  return dependencyBreakdownFromWidths(cohortWidthsFromControls(controls));
}

/** Stylized dependency ratio on the 9-cohort model: (youth + elderly) / working × 100. */
export function dependencyRatioFromControls(controls: [number, number, number, number]): number {
  return dependencyBreakdownFromControls(controls).total;
}

export function dependencyRatioFromCohorts(
  cohorts: [number, number, number, number, number, number, number, number, number],
): number {
  return dependencyBreakdownFromWidths(cohorts).total;
}

export function dependencyBreakdownFromCohorts(
  cohorts: [number, number, number, number, number, number, number, number, number],
): DependencyBreakdown {
  return dependencyBreakdownFromWidths(cohorts);
}

// ---- Pyramid anomaly presets (explicit 9-cohort widths) ------------------
export interface AnomalyPyramidPreset {
  id: string;
  label: string;
  cohorts: [number, number, number, number, number, number, number, number, number];
  maleCohorts?: [number, number, number, number, number, number, number, number, number];
  femaleCohorts?: [number, number, number, number, number, number, number, number, number];
  caption: string;
}

export const ANOMALY_PYRAMIDS: AnomalyPyramidPreset[] = [
  {
    id: 'smooth',
    label: 'Smooth column',
    cohorts: [0.42, 0.42, 0.44, 0.44, 0.42, 0.40, 0.38, 0.36, 0.34],
    caption: 'Idealized Stage 4 column — even bars, no event scars.',
  },
  {
    id: 'warNotch',
    label: 'War notch',
    cohorts: [0.82, 0.78, 0.72, 0.34, 0.28, 0.30, 0.48, 0.52, 0.48],
    maleCohorts: [0.82, 0.78, 0.72, 0.18, 0.14, 0.16, 0.42, 0.46, 0.44],
    femaleCohorts: [0.82, 0.78, 0.72, 0.58, 0.54, 0.52, 0.54, 0.58, 0.52],
    caption: 'War deaths notch fighting-age men — women outnumber men at those ages.',
  },
  {
    id: 'guestWorker',
    label: 'Guest-worker bulge',
    cohorts: [0.48, 0.52, 0.88, 0.94, 0.86, 0.68, 0.52, 0.44, 0.40],
    maleCohorts: [0.48, 0.52, 0.92, 0.98, 0.90, 0.72, 0.52, 0.44, 0.40],
    femaleCohorts: [0.48, 0.50, 0.42, 0.44, 0.40, 0.36, 0.34, 0.32, 0.30],
    caption: 'Young male workers spike in — families usually stay home.',
  },
  {
    id: 'oneChild',
    label: 'One-child constriction',
    cohorts: [0.24, 0.22, 0.20, 0.34, 0.46, 0.58, 0.66, 0.72, 0.70],
    maleCohorts: [0.28, 0.26, 0.22, 0.36, 0.48, 0.58, 0.66, 0.72, 0.70],
    femaleCohorts: [0.20, 0.18, 0.16, 0.30, 0.42, 0.54, 0.64, 0.70, 0.68],
    caption: 'Few children at the base — more boys than girls from son preference.',
  },
  {
    id: 'babyBoom',
    label: 'Baby-boom bulge',
    cohorts: [0.44, 0.42, 0.40, 0.76, 0.82, 0.78, 0.54, 0.46, 0.40],
    caption: 'A fat middle band — a baby-boom cohort aging up the pyramid.',
  },
];

/** Same anomaly ~25 years later — bulge/notch/pinch climb one stage up the pyramid. */
export const ANOMALY_AGED: Record<string, Pick<AnomalyPyramidPreset, 'maleCohorts' | 'femaleCohorts' | 'cohorts'>> = {
  babyBoom: {
    cohorts: [0.38, 0.36, 0.34, 0.42, 0.44, 0.72, 0.84, 0.80, 0.52],
    maleCohorts: [0.38, 0.36, 0.34, 0.42, 0.44, 0.72, 0.84, 0.80, 0.52],
    femaleCohorts: [0.38, 0.36, 0.34, 0.42, 0.44, 0.72, 0.84, 0.80, 0.52],
  },
};

/** Country ↔ anomaly fingerprint (historical AP Human Geography examples). */
export const COUNTRY_ANOMALY_MATCH: Record<string, string> = {
  warNotch: 'germany',
  guestWorker: 'qatar',
  oneChild: 'china',
  babyBoom: 'usa',
};

export const ANOMALY_PYRAMIDS_BY_ID: Record<string, AnomalyPyramidPreset> = Object.fromEntries(
  ANOMALY_PYRAMIDS.map((p) => [p.id, p]),
);

// ---- Sector employment --------------------------------------------------
export function dominantSector(p: number, s: number, t: number): Sector {
  if (p >= s && p >= t) return 'primary';
  if (t >= p && t >= s) return 'tertiary';
  return 'secondary';
}

export function impliedStageFromSectors(p: number, s: number, t: number): number {
  if (s >= p && s >= t) return 3; // industry leads -> Stage 3 (industrial peak)
  if (t >= p && t >= s) return 4; // services lead  -> Stage 4 (developed)
  return 2; // farming leads  -> Stage 2 (agrarian)
}

/** True when the leading sector clearly leads the runner-up (not a near-tie),
 *  so an implied-stage chip is trustworthy on the explore step. */
export function sectorStageConfident(p: number, s: number, t: number): boolean {
  const sorted = [p, s, t].sort((a, b) => b - a);
  return sorted[0] - sorted[1] >= 12;
}

/** Canonical employment mix per DTM stage (Clark–Fisher). Sums to 100. */
export const STAGE_SECTOR_PROFILES: Record<number, { primary: number; secondary: number; tertiary: number }> = {
  1: { primary: 80, secondary: 12, tertiary: 8 },
  2: { primary: 70, secondary: 18, tertiary: 12 },
  3: { primary: 25, secondary: 45, tertiary: 30 },
  4: { primary: 8, secondary: 27, tertiary: 65 },
  5: { primary: 3, secondary: 22, tertiary: 75 },
};

export const SECTOR_LABEL: Record<Sector, string> = {
  primary: 'Farming (primary)',
  secondary: 'Industry (secondary)',
  tertiary: 'Services (tertiary)',
};

// ---- Population density (Topic 2.2) --------------------------------------
// The three densities students confuse. All inputs share one unit system
// (people, and land area in the same unit), so the ratios are comparable.
//  - arithmetic    = people per unit of TOTAL land (raw crowding)
//  - physiological = people per unit of ARABLE land (pressure on the food system)
//  - agricultural  = FARMERS per unit of ARABLE land (subsistence vs mechanized)
export interface DensityInputs {
  population: number;
  totalLand: number;
  arableLand: number;
  farmers: number;
}

export interface DensityResult {
  arithmetic: number;
  physiological: number;
  agricultural: number;
}

export function computeDensities(inputs: DensityInputs): DensityResult {
  const { population, totalLand, arableLand, farmers } = inputs;
  const safe = (num: number, den: number) => (den > 0 ? num / den : 0);
  return {
    arithmetic: safe(population, totalLand),
    physiological: safe(population, arableLand),
    agricultural: safe(farmers, arableLand),
  };
}

// ---- Malthus: population vs food (Topic 2.6) -----------------------------
// Population grows exponentially; food grows linearly. The "crisis point" is the
// first year population catches the food line — the Malthusian catastrophe.
export interface MalthusParams {
  pop0: number; // starting population index
  food0: number; // starting food capacity (people the land can feed)
  growthRate: number; // population growth rate, % per year
  foodSlope: number; // food capacity added per year (linear)
  horizon: number; // years to project
}

export interface GrowthCrossover {
  crosses: boolean;
  crossYear: number | null;
}

export function populationAt(pop0: number, growthRate: number, year: number): number {
  return pop0 * Math.pow(1 + growthRate / 100, year);
}

export function foodAt(food0: number, foodSlope: number, year: number): number {
  return food0 + foodSlope * year;
}

export function malthusCrossover(params: MalthusParams): GrowthCrossover {
  const { pop0, food0, growthRate, foodSlope, horizon } = params;
  for (let t = 0; t <= horizon; t++) {
    const pop = populationAt(pop0, growthRate, t);
    const food = foodAt(food0, foodSlope, t);
    if (pop >= food) {
      return { crosses: true, crossYear: t };
    }
  }
  return { crosses: false, crossYear: null };
}

// Recompute correct answers for AI-generated skill-check questions from DTM logic.
import type { Lesson, McOption } from '../../types/content';
import {
  classifyPyramidControls,
  stageFromRates,
  trendFromGap,
  dominantSector,
  computeDensities,
  malthusCrossover,
  nirPercent,
  doublingTime,
  dependencyRatioFromBands,
  TREND_LABEL,
  stageName,
  SECTOR_LABEL,
} from '../dtm';
import type { Sector, Trend } from '../../types/content';

export type SkillCheckTemplate =
  | 'stage-from-rates'
  | 'population-trend'
  | 'pyramid-stage'
  | 'sector-dominant'
  | 'cause-of-death'
  | 'net-migration'
  | 'density-measure'
  | 'malthus-outcome'
  | 'doubling-time'
  | 'dependency-ratio'
  | 'replacement-level'
  // Qualitative reasoning questions — verified by independent-solver agreement
  // (see features/qualitativeCheck.ts), NOT by deterministic recompute.
  | 'qualitative';

export type DensityType = 'arithmetic' | 'physiological' | 'agricultural';

export interface SkillCheckScenario {
  cbr?: number;
  cdr?: number;
  stage?: number;
  primary?: number;
  secondary?: number;
  tertiary?: number;
  pyramidDescription?: string;
  /** Optional pyramid control widths for classifyPyramidControls. */
  widths?: [number, number, number, number];
  // net-migration: net migration rate per 1,000 (positive = net in-migration).
  netMigration?: number;
  // density-measure
  population?: number;
  totalLand?: number;
  arableLand?: number;
  farmers?: number;
  densityType?: DensityType;
  // malthus-outcome
  pop0?: number;
  food0?: number;
  growthRate?: number; // population growth, % per year
  foodSlope?: number; // food units added per year (linear)
  horizon?: number; // years to project
  // dependency-ratio: absolute populations in any consistent unit
  youth?: number; // aged 0–14
  working?: number; // aged 15–64
  elderly?: number; // aged 65+
  // replacement-level
  tfr?: number; // total fertility rate (lifetime children per woman)
}

function readNum(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = parseFloat(v.replace(/[^\d.-]/g, ''));
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/** Normalize AI scenario objects that use alternate field names or string numbers. */
export function normalizeSkillCheckScenario(raw: unknown): SkillCheckScenario {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const nested = [o.rates, o.demographics, o.data].find((v) => v && typeof v === 'object') as
    | Record<string, unknown>
    | undefined;

  const pick = (keys: string[]): number | undefined => {
    for (const source of [o, nested]) {
      if (!source) continue;
      for (const key of keys) {
        const n = readNum(source[key]);
        if (n !== undefined) return n;
      }
    }
    return undefined;
  };

  const widthsRaw = o.widths ?? o.pyramidWidths ?? o.controls ?? nested?.widths;
  let widths: [number, number, number, number] | undefined;
  if (Array.isArray(widthsRaw) && widthsRaw.length >= 4) {
    const nums = widthsRaw.slice(0, 4).map(readNum);
    if (nums.every((n) => n !== undefined)) widths = nums as [number, number, number, number];
  }

  const desc = [o.pyramidDescription, o.pyramid_description, o.pyramid, o.description].find(
    (v) => typeof v === 'string' && v.trim(),
  ) as string | undefined;

  const densityRaw = [o.densityType, o.density_type, o.measure, o.densityMeasure].find(
    (v) => typeof v === 'string' && v.trim(),
  ) as string | undefined;
  let densityType: DensityType | undefined;
  if (densityRaw) {
    const d = densityRaw.toLowerCase();
    if (d.includes('arith')) densityType = 'arithmetic';
    else if (d.includes('agri')) densityType = 'agricultural';
    else if (d.includes('phys')) densityType = 'physiological';
  }

  return {
    cbr: pick(['cbr', 'CBR', 'birthRate', 'birth', 'crudeBirthRate', 'birth_rate']),
    cdr: pick(['cdr', 'CDR', 'deathRate', 'death', 'crudeDeathRate', 'death_rate']),
    stage: pick(['stage', 'dtmStage', 'dtm_stage', 'populationStage', 'correctStage']),
    primary: pick(['primary', 'primaryPercent', 'primarySector', 'primary_pct']),
    secondary: pick(['secondary', 'secondaryPercent', 'secondarySector', 'secondary_pct']),
    tertiary: pick(['tertiary', 'tertiaryPercent', 'tertiarySector', 'tertiary_pct']),
    pyramidDescription: desc?.trim(),
    widths,
    netMigration: pick(['netMigration', 'net_migration', 'netMigrationRate', 'migrationRate', 'nmr']),
    population: pick(['population', 'pop', 'populationMillions', 'people', 'totalPopulation']),
    totalLand: pick(['totalLand', 'total_land', 'landArea', 'area', 'totalArea', 'land']),
    arableLand: pick(['arableLand', 'arable_land', 'arable', 'farmland', 'cropland', 'arableArea']),
    farmers: pick(['farmers', 'farmerCount', 'agriculturalWorkers', 'farmWorkers', 'farmPopulation']),
    densityType,
    pop0: pick(['pop0', 'initialPopulation', 'startPopulation', 'startingPopulation']),
    food0: pick(['food0', 'initialFood', 'startFood', 'startingFood']),
    growthRate: pick(['growthRate', 'populationGrowth', 'growthPct', 'growthPercent', 'popGrowthRate']),
    foodSlope: pick(['foodSlope', 'foodGrowth', 'foodIncrease', 'foodRate']),
    horizon: pick(['horizon', 'years', 'timeHorizon', 'projectionYears']),
    youth: pick(['youth', 'young', 'youthPopulation', 'under15', 'age0to14', 'population0to14']),
    working: pick(['working', 'workingAge', 'workingPopulation', 'age15to64', 'laborForce']),
    elderly: pick(['elderly', 'old', 'elderlyPopulation', 'over65', 'age65plus', 'seniors']),
    tfr: pick(['tfr', 'TFR', 'totalFertilityRate', 'fertilityRate', 'fertility']),
  };
}

export function normalizeSkillCheckTemplate(raw: unknown): SkillCheckTemplate | null {
  if (typeof raw !== 'string') return null;
  const key = raw.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const aliases: Record<string, SkillCheckTemplate> = {
    'stage-from-rates': 'stage-from-rates',
    stagefromrates: 'stage-from-rates',
    'rates-to-stage': 'stage-from-rates',
    'dtm-stage-from-rates': 'stage-from-rates',
    'population-trend': 'population-trend',
    populationtrend: 'population-trend',
    trend: 'population-trend',
    'population-growth': 'population-trend',
    'pyramid-stage': 'pyramid-stage',
    pyramidstage: 'pyramid-stage',
    pyramid: 'pyramid-stage',
    'pyramid-shape': 'pyramid-stage',
    'population-pyramid': 'pyramid-stage',
    'sector-dominant': 'sector-dominant',
    sectordominant: 'sector-dominant',
    sector: 'sector-dominant',
    'economic-sector': 'sector-dominant',
    'cause-of-death': 'cause-of-death',
    causeofdeath: 'cause-of-death',
    mortality: 'cause-of-death',
    'epi-transition': 'cause-of-death',
    'net-migration': 'net-migration',
    netmigration: 'net-migration',
    migration: 'net-migration',
    'migration-balance': 'net-migration',
    'density-measure': 'density-measure',
    densitymeasure: 'density-measure',
    density: 'density-measure',
    'population-density': 'density-measure',
    'malthus-outcome': 'malthus-outcome',
    malthusoutcome: 'malthus-outcome',
    malthus: 'malthus-outcome',
    'malthusian-theory': 'malthus-outcome',
    'carrying-capacity': 'malthus-outcome',
    'doubling-time': 'doubling-time',
    doublingtime: 'doubling-time',
    doubling: 'doubling-time',
    'rule-of-70': 'doubling-time',
    'dependency-ratio': 'dependency-ratio',
    dependencyratio: 'dependency-ratio',
    dependency: 'dependency-ratio',
    'age-dependency': 'dependency-ratio',
    'replacement-level': 'replacement-level',
    replacementlevel: 'replacement-level',
    replacement: 'replacement-level',
    'tfr-replacement': 'replacement-level',
  };
  return aliases[key] ?? null;
}

function inferStageFromPyramidDescription(desc: string): number | null {
  const t = desc.toLowerCase();
  const explicit = t.match(/\bstage\s*([1-5])\b/);
  if (explicit) return parseInt(explicit[1], 10);

  if (/inverted|aging|elderly|top.?heavy|narrow base|declining population/.test(t)) return 5;
  if (/column|rectangular|even|box|low stationary|stable shape/.test(t)) return 4;
  if (/narrowing|constrict|late expanding|births fall|taper/.test(t)) return 3;
  if (/bulge|youth|wide base|early expanding|rapid|expanding base/.test(t)) return 2;
  if (/steep drop|high death|pre-industrial|high stationary/.test(t)) return 1;
  return null;
}

function resolvePyramidStage(scenario: SkillCheckScenario): number | null {
  if (scenario.stage != null) return scenario.stage;
  if (scenario.widths) {
    const guess = classifyPyramidControls(scenario.widths);
    if (guess.kind === 'one') return guess.stage;
    if (guess.kind === 'either') return guess.stages[0];
  }
  if (scenario.pyramidDescription) return inferStageFromPyramidDescription(scenario.pyramidDescription);
  if (scenario.cbr != null && scenario.cdr != null) return stageFromRates(scenario.cbr, scenario.cdr);
  return null;
}

export interface RawSkillCheckQuestion {
  template: SkillCheckTemplate;
  prompt: string;
  scenario: SkillCheckScenario;
  options: McOption[];
  claimedCorrectId: string;
  explanation: string;
}

export interface VerifiedSkillCheckQuestion {
  prompt: string;
  options: McOption[];
  correctId: string;
  explanation: string;
  template: SkillCheckTemplate;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ');
}

function findOptionForStage(options: McOption[], stage: number): string | null {
  const patterns = [
    `stage ${stage}`,
    `stage${stage}`,
    stageName(stage).toLowerCase(),
    ...stageName(stage).toLowerCase().split(/\s+/).filter((w) => w.length > 4),
  ];
  for (const opt of options) {
    const label = norm(opt.label);
    const id = norm(opt.id);
    if (
      patterns.some(
        (p) => p && (label.includes(p) || id.includes(`stage-${stage}`) || id === `stage${stage}` || id === `s${stage}`),
      )
    ) {
      return opt.id;
    }
  }
  for (const opt of options) {
    if (new RegExp(`\\b${stage}\\b`).test(opt.label) || new RegExp(`\\b${stage}\\b`).test(opt.id)) {
      return opt.id;
    }
  }
  return null;
}

const TREND_SYNONYMS: Record<Trend, string[]> = {
  stable: ['stable', 'steady', 'little change', 'slow growth', 'low growth'],
  growing: ['growing', 'increase', 'positive growth', 'moderate growth'],
  'rapid-growth': ['rapid', 'fast growth', 'explod', 'surge', 'high growth'],
  shrinking: ['shrink', 'declin', 'negative', 'decreas', 'contract'],
};

function findOptionForTrend(options: McOption[], trend: Trend): string | null {
  const candidates = [TREND_LABEL[trend].toLowerCase(), trend.replace('-', ' '), ...TREND_SYNONYMS[trend]];
  for (const opt of options) {
    const l = norm(opt.label);
    if (candidates.some((c) => l.includes(c))) return opt.id;
  }
  return null;
}

function findOptionForSector(options: McOption[], sector: Sector): string | null {
  const label = SECTOR_LABEL[sector].toLowerCase();
  for (const opt of options) {
    const l = norm(opt.label);
    if (l.includes(sector) || l.includes(label.split('(')[0].trim())) return opt.id;
  }
  return null;
}

function findOptionForCause(options: McOption[], stage: number): string | null {
  const want =
    stage <= 2
      ? ['infectious', 'communicable', 'famine', 'parasite', 'epidemic']
      : ['chronic', 'degenerative', 'heart', 'cancer', 'noncommunicable', 'non-communicable', 'lifestyle'];
  for (const opt of options) {
    const l = norm(opt.label);
    if (want.some((w) => l.includes(w))) return opt.id;
  }
  return null;
}

/** Match the option whose embedded number is closest to `value` (within 20%). */
function findOptionForNumber(options: McOption[], value: number): string | null {
  if (!Number.isFinite(value)) return null;
  let best: { id: string; diff: number } | null = null;
  for (const opt of options) {
    const n = readNum(opt.label);
    if (n === undefined) continue;
    const diff = Math.abs(n - value);
    if (!best || diff < best.diff) best = { id: opt.id, diff };
  }
  if (!best) return null;
  const rel = value !== 0 ? best.diff / Math.abs(value) : best.diff;
  // Reject when the computed value isn't actually represented among the options.
  return rel <= 0.2 ? best.id : null;
}

const MALTHUS_CRISIS_WORDS = [
  'crisis',
  'catastrophe',
  'famine',
  'collapse',
  'overshoot',
  'shortage',
  'starv',
  'outstrip',
  'positive check',
  'exceed',
];
const MALTHUS_AVERT_WORDS = [
  'avert',
  'averted',
  'avoid',
  'sustain',
  'no crisis',
  'no catastrophe',
  'kept in check',
  'keeps pace',
  'keep pace',
  'keeps up',
  'prevented',
  'enough food',
  'sufficient',
];

function findOptionForMalthus(options: McOption[], crisis: boolean): string | null {
  const want = crisis ? MALTHUS_CRISIS_WORDS : MALTHUS_AVERT_WORDS;
  const avoid = crisis ? MALTHUS_AVERT_WORDS : MALTHUS_CRISIS_WORDS;
  // Prefer an option that signals the right outcome and not the opposite.
  for (const opt of options) {
    const l = norm(opt.label);
    if (want.some((w) => l.includes(w)) && !avoid.some((w) => l.includes(w))) return opt.id;
  }
  for (const opt of options) {
    const l = norm(opt.label);
    if (want.some((w) => l.includes(w))) return opt.id;
  }
  return null;
}

/** Short reason a question failed verification — for dev console only. */
export function skillCheckVerificationFailureReason(q: RawSkillCheckQuestion): string {
  if (!q.prompt?.trim()) return 'missing prompt';
  if (q.options.length < 4) return `only ${q.options.length} options`;
  const computed = computeCorrectOptionId(q);
  if (!computed) {
    return `could not map scenario to an option (template=${q.template}, scenario=${JSON.stringify(q.scenario)})`;
  }
  if (!q.options.some((o) => o.id === computed)) return `computed id "${computed}" not in options`;
  return 'unknown';
}

/** Recompute the correct option id from scenario + template; null if unmappable. */
export function computeCorrectOptionId(q: RawSkillCheckQuestion): string | null {
  const { template, scenario, options } = q;
  switch (template) {
    case 'stage-from-rates': {
      if (scenario.cbr == null || scenario.cdr == null) return null;
      const stage = stageFromRates(scenario.cbr, scenario.cdr);
      return findOptionForStage(options, stage);
    }
    case 'population-trend': {
      if (scenario.cbr == null || scenario.cdr == null) return null;
      const trend = trendFromGap(scenario.cbr - scenario.cdr);
      return findOptionForTrend(options, trend);
    }
    case 'pyramid-stage': {
      const stage = resolvePyramidStage(scenario);
      if (stage == null) return null;
      return findOptionForStage(options, stage);
    }
    case 'sector-dominant': {
      if (scenario.primary == null || scenario.secondary == null || scenario.tertiary == null) return null;
      const sector = dominantSector(scenario.primary, scenario.secondary, scenario.tertiary);
      return findOptionForSector(options, sector);
    }
    case 'cause-of-death': {
      const stage = scenario.stage ?? 4;
      return findOptionForCause(options, stage);
    }
    case 'net-migration': {
      if (scenario.cbr == null || scenario.cdr == null || scenario.netMigration == null) return null;
      // Total change combines natural increase (CBR−CDR) with the net migration rate.
      const trend = trendFromGap(scenario.cbr - scenario.cdr + scenario.netMigration);
      return findOptionForTrend(options, trend);
    }
    case 'density-measure': {
      if (scenario.population == null) return null;
      const densities = computeDensities({
        population: scenario.population,
        totalLand: scenario.totalLand ?? 0,
        arableLand: scenario.arableLand ?? 0,
        farmers: scenario.farmers ?? 0,
      });
      const type = scenario.densityType ?? 'physiological';
      const value = densities[type];
      if (!Number.isFinite(value) || value <= 0) return null;
      return findOptionForNumber(options, value);
    }
    case 'malthus-outcome': {
      if (
        scenario.pop0 == null ||
        scenario.food0 == null ||
        scenario.growthRate == null ||
        scenario.foodSlope == null
      ) {
        return null;
      }
      const { crosses } = malthusCrossover({
        pop0: scenario.pop0,
        food0: scenario.food0,
        growthRate: scenario.growthRate,
        foodSlope: scenario.foodSlope,
        horizon: scenario.horizon ?? 100,
      });
      return findOptionForMalthus(options, crosses);
    }
    case 'doubling-time': {
      if (scenario.cbr == null || scenario.cdr == null) return null;
      const years = doublingTime(nirPercent(scenario.cbr - scenario.cdr));
      if (years == null) return null; // not growing → Rule of 70 inapplicable
      return findOptionForNumber(options, years);
    }
    case 'dependency-ratio': {
      if (scenario.youth == null || scenario.working == null || scenario.elderly == null) {
        return null;
      }
      const ratio = dependencyRatioFromBands(scenario.youth, scenario.working, scenario.elderly);
      if (!Number.isFinite(ratio) || ratio <= 0) return null;
      return findOptionForNumber(options, ratio);
    }
    case 'replacement-level': {
      if (scenario.tfr == null) return null;
      const trend: Trend =
        scenario.tfr <= 2.0 ? 'shrinking' : scenario.tfr >= 2.2 ? 'growing' : 'stable';
      return findOptionForTrend(options, trend);
    }
    default:
      return null;
  }
}

/**
 * The skill-check templates appropriate to a lesson, inferred from its concept
 * tags. Keeps generated questions on-topic (e.g. a density lesson gets density /
 * Malthus questions, not DTM-stage ones). Falls back to the core rate templates.
 */
export function skillCheckTemplatesForLesson(lesson: Lesson): SkillCheckTemplate[] {
  const tags = lesson.steps
    .flatMap((s) => s.concepts ?? [])
    .join(' ')
    .toLowerCase();
  const out = new Set<SkillCheckTemplate>();

  if (/pyramid|dependency|momentum|anomal|cohort|age-band|age band|sex-ratio/.test(tags)) {
    out.add('pyramid-stage');
  }
  if (/density|carrying-capacity/.test(tags)) out.add('density-measure');
  if (/malthus|boserup|carrying-capacity/.test(tags)) out.add('malthus-outcome');
  if (/migration|push-pull|refugee|remittance|brain-drain|diaspora|idp|asylum|intervening/.test(tags)) {
    out.add('net-migration');
  }
  if (/sector|primary|secondary|tertiary|employment/.test(tags)) out.add('sector-dominant');
  if (/cause-of-death|etm|epidemio|mortality|fertility|imr/.test(tags)) out.add('cause-of-death');
  if (/stage|cbr|cdr|nir|natural-increase|tfr|doubling|transition|\brate/.test(tags)) {
    out.add('stage-from-rates');
    out.add('population-trend');
  }

  // Also key off the lesson's CED topic codes (more reliable than concept-tag regex).
  const topics = new Set(lesson.cedTopics ?? []);
  const hasTopic = (...codes: string[]) => codes.some((c) => topics.has(c));
  if (hasTopic('2.3', '2.9')) {
    out.add('pyramid-stage');
    out.add('dependency-ratio');
  }
  if (hasTopic('2.2')) out.add('density-measure');
  if (hasTopic('2.6')) out.add('malthus-outcome');
  if (hasTopic('2.10', '2.11', '2.12')) out.add('net-migration');
  if (hasTopic('2.5')) out.add('cause-of-death');
  if (hasTopic('2.4')) out.add('doubling-time');
  if (hasTopic('2.4', '2.8')) out.add('replacement-level');
  if (hasTopic('2.4', '2.5', '2.7', '2.8')) {
    out.add('stage-from-rates');
    out.add('population-trend');
  }
  if (/dependency/.test(tags)) out.add('dependency-ratio');
  if (/doubling/.test(tags)) out.add('doubling-time');
  if (/tfr|replacement|fertility/.test(tags)) out.add('replacement-level');

  if (out.size === 0) {
    out.add('stage-from-rates');
    out.add('population-trend');
  }
  return [...out];
}

export function verifySkillCheckQuestion(q: RawSkillCheckQuestion): VerifiedSkillCheckQuestion | null {
  if (!q.prompt || q.options.length < 4) return null;
  const computed = computeCorrectOptionId(q);
  if (!computed || !q.options.some((o) => o.id === computed)) return null;
  return {
    prompt: q.prompt,
    options: q.options,
    correctId: computed,
    explanation: q.explanation || 'Review the lesson if this one surprised you.',
    template: q.template,
  };
}

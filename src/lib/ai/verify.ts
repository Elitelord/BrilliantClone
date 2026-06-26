// Recompute correct answers for AI-generated skill-check questions from DTM logic.
import type { McOption } from '../../types/content';
import {
  classifyPyramidControls,
  stageFromRates,
  trendFromGap,
  dominantSector,
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
  | 'cause-of-death';

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

  return {
    cbr: pick(['cbr', 'CBR', 'birthRate', 'birth', 'crudeBirthRate', 'birth_rate']),
    cdr: pick(['cdr', 'CDR', 'deathRate', 'death', 'crudeDeathRate', 'death_rate']),
    stage: pick(['stage', 'dtmStage', 'dtm_stage', 'populationStage', 'correctStage']),
    primary: pick(['primary', 'primaryPercent', 'primarySector', 'primary_pct']),
    secondary: pick(['secondary', 'secondaryPercent', 'secondarySector', 'secondary_pct']),
    tertiary: pick(['tertiary', 'tertiaryPercent', 'tertiarySector', 'tertiary_pct']),
    pyramidDescription: desc?.trim(),
    widths,
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
    default:
      return null;
  }
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

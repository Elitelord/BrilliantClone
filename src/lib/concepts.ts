// Concept catalog + prerequisite graph (Phase 3).
//
// Beyond the lesson-level `prerequisites` (which gate whole lessons), this maps the
// fine-grained concept tags used on steps to their CED topic and their concept-level
// prerequisites. The review scheduler uses it to (a) resurface a failing prerequisite
// before its dependent and (b) ground AI-generated review items in the right CED
// subunit. Concept ids MUST match the `concepts: [...]` tags authored on lesson steps
// (see concepts.test.ts, which asserts every active-lesson tag has an entry here).
import { MASTERY_THRESHOLD } from './mastery';
import { retrievability } from './scheduler';
import type { MasteryRecord } from '../types/progress';

export interface ConceptInfo {
  id: string;
  label: string;
  /** CED topic code (e.g. '2.6'); '' for the multi-topic synthesis capstone. */
  cedTopic: string;
  /** Concept-level prerequisites (ids in this catalog). */
  prereqs: string[];
  /** Mastery target 0..1; defaults to MASTERY_THRESHOLD/100 when omitted. */
  masteryTarget?: number;
}

function c(id: string, label: string, cedTopic: string, prereqs: string[] = []): ConceptInfo {
  return { id, label, cedTopic, prereqs };
}

export const CONCEPTS: Record<string, ConceptInfo> = {
  // L1 — The Engine of Growth (2.4 / 2.5)
  'natural-increase': c('natural-increase', 'Natural increase (CBR − CDR)', '2.4'),
  'dtm-stages': c('dtm-stages', 'The five DTM stages', '2.5', ['natural-increase']),
  'dtm-history': c('dtm-history', 'Historical DTM path', '2.5', ['dtm-stages']),
  // L2 — Reading Population Pyramids (2.3)
  'pyramid-shape': c('pyramid-shape', 'Pyramid shape ↔ stage', '2.3', ['dtm-stages']),
  'pyramid-classify': c('pyramid-classify', 'Classifying a country by its pyramid', '2.3', ['pyramid-shape']),
  // L3 — Why the Curves Move (2.5 / 2.8 / 2.7)
  etm: c('etm', 'Epidemiological transition', '2.5', ['dtm-stages']),
  'cause-of-death': c('cause-of-death', 'Cause-of-death shift', '2.5', ['etm']),
  'fertility-transition': c('fertility-transition', 'Why birth rates fall', '2.8', ['dtm-stages']),
  'population-boom': c('population-boom', 'The Stage-2 population boom', '2.5', ['natural-increase', 'dtm-stages']),
  'population-policy': c('population-policy', 'Population policy', '2.7', ['fertility-transition']),
  'pro-natalist': c('pro-natalist', 'Pro-natalist policy', '2.7', ['population-policy']),
  'anti-natalist': c('anti-natalist', 'Anti-natalist policy', '2.7', ['population-policy']),
  // L4 — The Limits of Growth (2.2 / 2.6)
  density: c('density', 'Population density (3 measures)', '2.2'),
  'carrying-capacity': c('carrying-capacity', 'Carrying capacity', '2.6', ['density']),
  malthus: c('malthus', 'Malthusian theory', '2.6', ['carrying-capacity']),
  boserup: c('boserup', 'Boserup / neo-Malthusian critique', '2.6', ['malthus']),
  // L5 — Reading the Shape (2.3 / 2.4 / 2.9)
  'age-structure': c('age-structure', 'Age structure', '2.3', ['pyramid-shape']),
  'dependency-ratio': c('dependency-ratio', 'Dependency ratio', '2.9', ['pyramid-shape']),
  aging: c('aging', 'Aging populations', '2.9', ['dependency-ratio']),
  'population-momentum': c('population-momentum', 'Demographic momentum', '2.4', ['dtm-stages', 'age-structure']),
  'pyramid-anomaly': c('pyramid-anomaly', 'Pyramid anomalies (war, baby boom, one-child)', '2.3', ['pyramid-shape']),
  // L6 — Why People Move (2.10 / 2.11 / 2.12)
  migration: c('migration', 'Migration & population change', '2.10', ['natural-increase']),
  'push-pull': c('push-pull', 'Push & pull factors', '2.10', ['migration']),
  'intervening-obstacle': c('intervening-obstacle', 'Intervening obstacles & opportunities', '2.10', ['push-pull']),
  'distance-decay': c('distance-decay', 'Distance decay', '2.10', ['migration']),
  'forced-migration': c('forced-migration', 'Forced vs voluntary migration', '2.11', ['migration']),
  'internal-migration': c('internal-migration', 'Internal vs international migration', '2.11', ['migration']),
  'chain-migration': c('chain-migration', 'Chain migration', '2.11', ['migration']),
  'step-migration': c('step-migration', 'Step migration', '2.11', ['migration']),
  refugees: c('refugees', 'Refugees, asylum seekers & IDPs', '2.11', ['forced-migration']),
  remittances: c('remittances', 'Remittances', '2.12', ['migration']),
  'brain-drain': c('brain-drain', 'Brain drain', '2.12', ['migration']),
  'age-sex-selectivity': c('age-sex-selectivity', 'Age/sex selectivity of migrants', '2.12', ['migration']),
  'dtm-critique': c('dtm-critique', 'Limits & critiques of the DTM', '2.5', ['dtm-stages', 'migration']),
  // L7 — Place the Country (synthesis capstone)
  synthesis: c('synthesis', 'Synthesis: place a country', '', ['dtm-stages']),
};

export function getConcept(id: string): ConceptInfo | undefined {
  return CONCEPTS[id];
}

export function allConceptIds(): string[] {
  return Object.keys(CONCEPTS);
}

export function conceptLabel(id: string): string {
  return CONCEPTS[id]?.label ?? id;
}

export function prereqsFor(id: string): string[] {
  return CONCEPTS[id]?.prereqs ?? [];
}

export function conceptMasteryTarget(id: string): number {
  return CONCEPTS[id]?.masteryTarget ?? MASTERY_THRESHOLD / 100;
}

/**
 * The prerequisite of `id` the learner is weakest on AND below its mastery target,
 * or null if all prerequisites are solid. An unseen prerequisite counts as weakest
 * (retrievability 0). Used to drill foundations before their dependents.
 */
export function weakestPrereq(
  id: string,
  masteryMap: Record<string, MasteryRecord>,
  now: number,
): string | null {
  let worst: { id: string; r: number } | null = null;
  for (const p of prereqsFor(id)) {
    const rec = masteryMap[p];
    const r = rec ? retrievability(rec, now) : 0;
    if (r < conceptMasteryTarget(p) && (!worst || r < worst.r)) {
      worst = { id: p, r };
    }
  }
  return worst?.id ?? null;
}

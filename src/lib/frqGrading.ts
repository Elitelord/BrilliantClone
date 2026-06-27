// Deterministic grading for FRQ "identify" parts (Phase 3 / FRQ practice, pure).
//
// The canonical answer is recomputed from the stimulus via dtm.ts — the same
// "verify anything checkable" discipline the skill check uses — then tolerantly matched
// against the learner's free text. No AI, so it works identically AI-on and AI-off.
import {
  impliedStageFromControls,
  stageFromRates,
  trendFromGap,
  dominantSector,
  STAGE_NAMES,
  TREND_LABEL,
  SECTOR_LABEL,
} from './dtm';
import type { FrqAutoCheck } from '../types/frq';

/** The canonical correct answer string for an auto-check part (for the reveal). */
export function canonicalAnswer(check: FrqAutoCheck): string {
  switch (check.kind) {
    case 'stage': {
      const stage = impliedStageFromControls(check.controls);
      return stage ? `Stage ${stage} (${STAGE_NAMES[stage]})` : 'Unknown';
    }
    case 'stage-rates': {
      const stage = stageFromRates(check.cbr, check.cdr);
      return `Stage ${stage} (${STAGE_NAMES[stage]})`;
    }
    case 'trend':
      return TREND_LABEL[trendFromGap(check.cbr - check.cdr)];
    case 'sector':
      return SECTOR_LABEL[dominantSector(check.primary, check.secondary, check.tertiary)];
  }
}

/** True only if the text names exactly the right stage (digit, "stage N", or the stage name), with no other stage. */
function matchesStage(text: string, stage: number): boolean {
  const t = text.toLowerCase();
  const named = [...t.matchAll(/\bstage\s*([1-5])\b/g)].map((m) => Number(m[1]));
  if (named.length) return named.every((n) => n === stage);
  const name = STAGE_NAMES[stage]?.toLowerCase();
  if (name && t.includes(name)) return true;
  const digits = [...t.matchAll(/\b([1-5])\b/g)].map((m) => Number(m[1]));
  return digits.length > 0 && digits.every((d) => d === stage);
}

const TREND_KEYWORDS: Record<string, string[]> = {
  Stable: ['stable', 'steady', 'no change', 'little change'],
  Growing: ['grow', 'increas', 'rising', 'rise'],
  'Rapid growth': ['rapid', 'fast', 'explod', 'surge', 'boom'],
  Shrinking: ['shrink', 'declin', 'decreas', 'fall', 'negative', 'contract'],
};

/**
 * Grade a learner's free-text answer to an auto-check part. Returns whether the point is
 * earned and the canonical answer (always returned, for the reveal). Empty answers never
 * earn the point; a bare "2" is a valid stage answer.
 */
export function gradeAutoCheck(check: FrqAutoCheck, text: string): { earned: boolean; canonical: string } {
  const canonical = canonicalAnswer(check);
  const t = text.trim();
  if (!t) return { earned: false, canonical };

  let earned = false;
  switch (check.kind) {
    case 'stage': {
      const stage = impliedStageFromControls(check.controls);
      earned = stage != null && matchesStage(t, stage);
      break;
    }
    case 'stage-rates': {
      earned = matchesStage(t, stageFromRates(check.cbr, check.cdr));
      break;
    }
    case 'trend': {
      const label = TREND_LABEL[trendFromGap(check.cbr - check.cdr)];
      earned = (TREND_KEYWORDS[label] ?? []).some((k) => t.toLowerCase().includes(k));
      break;
    }
    case 'sector': {
      earned = t.toLowerCase().includes(dominantSector(check.primary, check.secondary, check.tertiary));
      break;
    }
  }
  return { earned, canonical };
}

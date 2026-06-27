// Scaffolding that fades (Phase 3, pure).
//
// As a concept's recall strengthens, remove the support so practice stays desirably
// difficult; keep full support while it's weak. Driven by retrievability (current
// recall probability from the forgetting curve), not raw stored strength — so support
// returns if a once-known concept has decayed.
export type ScaffoldLevel = 'full' | 'faded' | 'none';

/** Below this recall, give full support. */
export const FADED_AT = 0.45;
/** At/above this recall, withdraw the crutch (desirable difficulty). */
export const NONE_AT = 0.8;

export function scaffoldLevel(recall: number): ScaffoldLevel {
  if (recall < FADED_AT) return 'full';
  if (recall < NONE_AT) return 'faded';
  return 'none';
}

/** Offer the "get a hint" affordance only while a concept is not yet solid. */
export function allowHint(recall: number): boolean {
  return scaffoldLevel(recall) !== 'none';
}

/** Preferred item difficulty for a concept at this recall (easier when weak, harder when strong). */
export function targetDifficulty(recall: number): 1 | 2 | 3 {
  const level = scaffoldLevel(recall);
  return level === 'full' ? 1 : level === 'faded' ? 2 : 3;
}

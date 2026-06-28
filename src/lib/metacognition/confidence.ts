// Confidence-weighted mastery (Phase 3 metacognition).
//
// The learner optionally taps how sure they are before checking. Rather than a separate
// dashboard, confidence feeds the mastery signal: a correct answer the learner only
// *guessed* (or was merely "pretty sure" about) earns less strength and isn't treated as a
// fully spaced success, so the concept resurfaces sooner — exactly the "needs more work"
// case. This flows automatically into review selection, skill-check targeting, and any AI
// that reads mastery context. Undefined confidence (steps where it wasn't asked) = full credit.

export type Confidence = 'guess' | 'likely' | 'certain';

/** Strength-gain multiplier for a correct answer, by stated confidence. */
export function confidenceFactor(c?: Confidence): number {
  switch (c) {
    case 'guess':
      return 0.3;
    case 'likely':
      return 0.65;
    default:
      return 1; // 'certain' or not asked
  }
}

/** Whether a correct answer should advance the spaced-repetition box. A pure guess holds. */
export function advancesSchedule(c?: Confidence): boolean {
  return c !== 'guess';
}

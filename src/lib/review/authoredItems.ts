// Prepare an authored graded step for AI-off review (Phase 3, pure).
//
// Graded steps are already authored answer-safe (verdict/gap/stats hidden), so this is
// mostly defensive: hide any live "answer-helper" flag that would reveal the answer,
// drop the up-front hint (desirable difficulty / fading), and shuffle option order so
// the item can't be solved by position recognition. The `reference` visual is KEPT —
// it grounds the question rather than giving it away.
import type { Interaction, Step } from '../../types/content';

/** Config flags that would surface the answer in a review context; set false if present. */
const REVEAL_FLAGS = [
  'showVerdict',
  'showGap',
  'showStats',
  'showImpliedStage',
  'showStagePicker',
  'showStagePresets',
  'showBands',
  'showDependencyRatio',
  'showCount',
  'showCapacity',
  'showNirCurve',
  'showNirCurveToggle',
] as const;

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function stripInteraction(interaction: Interaction, rng: () => number): Interaction {
  const config: Record<string, unknown> = { ...(interaction.config as Record<string, unknown>) };
  for (const flag of REVEAL_FLAGS) {
    if (flag in config) config[flag] = false;
  }
  // Option ids are order-independent in every Answer type, so shuffling is answer-safe.
  if (Array.isArray((config as { options?: unknown }).options)) {
    config.options = shuffle(config.options as unknown[], rng);
  }
  return { ...interaction, config } as Interaction;
}

/**
 * Return a review-ready copy of an authored graded step: answer-revealing scaffolds
 * hidden, up-front hint removed, option order shuffled. Pure — pass a seeded `rng` in
 * tests; the UI passes Math.random.
 */
export function prepareAuthoredReviewStep(step: Step, rng: () => number = Math.random): Step {
  const feedback = { ...step.feedback };
  delete feedback.hint;
  return {
    ...step,
    interaction: stripInteraction(step.interaction, rng),
    feedback,
  };
}

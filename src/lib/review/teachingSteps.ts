// Concept → the step that first taught it (Phase 3 error-driven re-teaching).
//
// When a learner misses a concept repeatedly, re-exposing the original explanation before
// they try again converts the error into learning (rather than a lucky retry on the same
// item). This indexes the first `learn`/`explore` step that carries each concept tag.
import { getOrderedLessons } from '../../content';
import type { Lesson, Step } from '../../types/content';

let index: Record<string, { lesson: Lesson; step: Step }> | null = null;

function build(): Record<string, { lesson: Lesson; step: Step }> {
  const map: Record<string, { lesson: Lesson; step: Step }> = {};
  for (const lesson of getOrderedLessons()) {
    for (const step of lesson.steps) {
      if (step.kind !== 'learn' && step.kind !== 'explore') continue;
      for (const c of step.concepts ?? []) {
        if (!map[c]) map[c] = { lesson, step }; // first teaching step wins
      }
    }
  }
  return map;
}

/** The first learn/explore step that taught `conceptId`, or null if none. */
export function teachingStepFor(conceptId: string): { lesson: Lesson; step: Step } | null {
  if (!index) index = build();
  return index[conceptId] ?? null;
}

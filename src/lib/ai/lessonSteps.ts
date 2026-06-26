import type { Lesson, Step } from '../../types/content';

export function isExplainBackStep(step: Step): boolean {
  return step.interaction.type === 'explain-back';
}

/** Steps the learner actually plays — explain-it-back requires AI grading. */
export function playableSteps(lesson: Lesson, aiEnabled: boolean): Step[] {
  if (aiEnabled) return lesson.steps;
  return lesson.steps.filter((s) => !isExplainBackStep(s));
}

/** Map a saved full-lesson step index to an index in playableSteps. */
export function toPlayableStepIndex(lesson: Lesson, savedFullIndex: number, aiEnabled: boolean): number {
  const playable = playableSteps(lesson, aiEnabled);
  if (playable.length === 0) return 0;

  const clamped = Math.min(Math.max(savedFullIndex, 0), lesson.steps.length - 1);
  const targetId = lesson.steps[clamped]?.id;
  const direct = playable.findIndex((s) => s.id === targetId);
  if (direct >= 0) return direct;

  for (let i = clamped; i >= 0; i--) {
    const id = lesson.steps[i]?.id;
    const found = playable.findIndex((s) => s.id === id);
    if (found >= 0) return found;
  }
  return 0;
}

export function toFullStepIndex(lesson: Lesson, step: Step): number {
  return lesson.steps.findIndex((s) => s.id === step.id);
}

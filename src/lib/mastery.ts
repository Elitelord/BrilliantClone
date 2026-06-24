import type { Lesson } from '../types/content';
import type { LessonProgress, MasteryRecord } from '../types/progress';

export const MASTERY_THRESHOLD = 60; // lesson score (%) to count as "mastered"
export const REVIEW_WRONG_THRESHOLD = 2; // wrong attempts on a step -> surface review

export function gradableSteps(lesson: Lesson): Lesson['steps'] {
  return lesson.steps.filter((s) => s.kind !== 'explore' && s.kind !== 'learn');
}

/** A graded step was answered correctly on the first check (no prior wrong attempts). */
export function isFirstTryCorrect(progress: LessonProgress, stepId: string): boolean {
  if (progress.firstTryCorrect[stepId] === true) return true;
  // Fallback when firstTryCorrect was not recorded but the step was completed with no wrong tries.
  return (
    progress.completedStepIds.includes(stepId) && (progress.attempts[stepId] ?? 0) === 0
  );
}

export function countFirstTryCorrect(lesson: Lesson, progress?: LessonProgress): { correct: number; total: number } {
  const gradable = gradableSteps(lesson);
  if (!progress) return { correct: 0, total: gradable.length };
  const correct = gradable.filter((s) => isFirstTryCorrect(progress, s.id)).length;
  return { correct, total: gradable.length };
}

export function computeLessonScore(lesson: Lesson, progress?: LessonProgress): number {
  const { correct, total } = countFirstTryCorrect(lesson, progress);
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function isLessonComplete(progress?: LessonProgress): boolean {
  return !!progress?.finishedOnce;
}

export function isLessonInProgress(progress?: LessonProgress): boolean {
  return progress?.playState === 'in_progress';
}

export function isLessonMastered(lesson: Lesson, progress?: LessonProgress): boolean {
  return isLessonComplete(progress) && computeLessonScore(lesson, progress) >= MASTERY_THRESHOLD;
}

export function isLessonUnlocked(lesson: Lesson, progressMap: Record<string, LessonProgress>): boolean {
  if (lesson.prerequisites.length === 0) return true;
  return lesson.prerequisites.every((pid) => isLessonComplete(progressMap[pid]));
}

// Step ids the learner struggled with (>= threshold wrong attempts).
export function stepsNeedingReview(progress?: LessonProgress): string[] {
  if (!progress) return [];
  return Object.entries(progress.attempts)
    .filter(([, n]) => n >= REVIEW_WRONG_THRESHOLD)
    .map(([id]) => id);
}

export interface Recommendation {
  lessonId: string;
  reason: string;
  kind: 'continue' | 'next' | 'review' | 'done';
}

// Pick a sensible next step across the ordered course.
export function recommendNext(
  orderedLessons: Lesson[],
  progressMap: Record<string, LessonProgress>,
): Recommendation | null {
  // 1) An in-progress lesson takes priority (resume it).
  const inProgress = orderedLessons.find(
    (l) => isLessonInProgress(progressMap[l.id]) && !isLessonComplete(progressMap[l.id]),
  );
  if (inProgress) {
    return { lessonId: inProgress.id, reason: `Pick up where you left off in "${inProgress.title}"`, kind: 'continue' };
  }

  // 2) A completed-but-not-mastered lesson -> recommend review.
  const weak = orderedLessons.find(
    (l) => isLessonComplete(progressMap[l.id]) && !isLessonMastered(l, progressMap[l.id]),
  );
  if (weak) {
    return { lessonId: weak.id, reason: `Review "${weak.title}" to lock in mastery`, kind: 'review' };
  }

  // 3) The first unlocked, not-yet-complete lesson.
  const next = orderedLessons.find(
    (l) => !isLessonComplete(progressMap[l.id]) && isLessonUnlocked(l, progressMap),
  );
  if (next) {
    return { lessonId: next.id, reason: `Start "${next.title}"`, kind: 'next' };
  }

  return { lessonId: orderedLessons[0]?.id ?? '', reason: 'You have mastered the whole course!', kind: 'done' };
}

export function updateMasteryForConcepts(
  map: Record<string, MasteryRecord>,
  conceptIds: string[],
  correct: boolean,
): Record<string, MasteryRecord> {
  const next = { ...map };
  for (const conceptId of conceptIds) {
    const prev = next[conceptId];
    const prevStrength = prev?.strength ?? 0;
    const strength = correct
      ? Math.min(1, prevStrength + 0.34)
      : Math.max(0, prevStrength - 0.2);
    next[conceptId] = {
      conceptId,
      strength,
      lastSeen: Date.now(),
      wrongCount: (prev?.wrongCount ?? 0) + (correct ? 0 : 1),
      nextDue: prev?.nextDue, // reserved for brief Phase 3
    };
  }
  return next;
}

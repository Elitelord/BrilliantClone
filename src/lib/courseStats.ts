import type { Lesson } from '../types/content';
import type { LessonProgress } from '../types/progress';
import {
  computeLessonScore,
  isLessonComplete,
  isLessonInProgress,
  isLessonMastered,
} from './mastery';

export interface CourseStats {
  total: number;
  mastered: number;
  /** Finished at least once (includes mastered). */
  completed: number;
  inProgress: number;
  /** No progress recorded yet (not started, not in progress). */
  notStarted: number;
  /** Overall mastery: average lesson score across the whole course (unfinished = 0). */
  masteryPercent: number;
}

export function computeCourseStats(
  lessons: Lesson[],
  progressMap: Record<string, LessonProgress>,
): CourseStats {
  let mastered = 0;
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let scoreSum = 0;

  for (const lesson of lessons) {
    const p = progressMap[lesson.id];
    if (isLessonComplete(p)) {
      completed += 1;
      scoreSum += computeLessonScore(lesson, p);
      if (isLessonMastered(lesson, p)) mastered += 1;
    } else if (isLessonInProgress(p)) {
      inProgress += 1;
    } else {
      notStarted += 1;
    }
  }

  const total = lessons.length;
  const masteryPercent = total > 0 ? Math.round(scoreSum / total) : 0;

  return { total, mastered, completed, inProgress, notStarted, masteryPercent };
}

// Interleaved spaced-review queue selection (Phase 3, pure).
//
// Picks graded steps from lessons the learner has seen, covering the concepts that are
// DUE now, weakest-first, and interleaves them: consecutive items deliberately differ
// in lesson and interaction type so the learner must choose the right strategy rather
// than repeat the last one (interleaving + spacing). Returns [] when nothing is due.
import type { Lesson, Step } from '../../types/content';
import type { LessonProgress, MasteryRecord } from '../../types/progress';
import { gradableSteps, isLessonComplete, isLessonInProgress, isLessonUnlocked } from '../mastery';
import { dueConcepts, retrievability } from '../scheduler';
import { targetDifficulty } from '../scaffold';

export interface ReviewItem {
  lessonId: string;
  step: Step;
  /** The due concept(s) this step addresses (intersection of step tags and the due set). */
  concepts: string[];
}

export interface BuildReviewQueueOptions {
  /** Max items in a session — kept small (working-memory limit). Default 6. */
  max?: number;
}

/** A lesson is reviewable once it's unlocked AND the learner has actually seen it. */
function isReviewableLesson(lesson: Lesson, progressMap: Record<string, LessonProgress>): boolean {
  const p = progressMap[lesson.id];
  if (!p) return false;
  if (!isLessonUnlocked(lesson, progressMap)) return false;
  return isLessonComplete(p) || isLessonInProgress(p);
}

export function buildReviewQueue(
  orderedLessons: Lesson[],
  progressMap: Record<string, LessonProgress>,
  masteryMap: Record<string, MasteryRecord>,
  now: number,
  options: BuildReviewQueueOptions = {},
): ReviewItem[] {
  const max = options.max ?? 6;
  const due = new Set(dueConcepts(masteryMap, now));
  if (due.size === 0) return [];

  // Candidate graded steps from reviewable lessons that touch a due concept.
  const candidates: ReviewItem[] = [];
  for (const lesson of orderedLessons) {
    if (!isReviewableLesson(lesson, progressMap)) continue;
    for (const step of gradableSteps(lesson)) {
      const hit = (step.concepts ?? []).filter((c) => due.has(c));
      if (hit.length > 0) candidates.push({ lessonId: lesson.id, step, concepts: hit });
    }
  }
  if (candidates.length === 0) return [];

  // Weakest-first: priority = lowest retrievability among the due concepts a step covers.
  const weakness = (item: ReviewItem): number =>
    Math.min(...item.concepts.map((c) => retrievability(masteryMap[c], now)));
  const diffOf = (item: ReviewItem): number => item.step.difficulty ?? 1;
  // Primary: weakest concept first. Secondary (scaffolding that fades): among steps for
  // an equally-weak concept, prefer the difficulty matching its recall — easier while
  // weak, harder once it's better retained.
  const pool = candidates
    .map((item) => ({ item, w: weakness(item) }))
    .sort((a, b) => {
      if (a.w !== b.w) return a.w - b.w;
      return Math.abs(diffOf(a.item) - targetDifficulty(a.w)) -
        Math.abs(diffOf(b.item) - targetDifficulty(b.w));
    })
    .map((x) => x.item);

  // Greedy interleave: each pick adds a not-yet-covered due concept and, when possible,
  // differs from the previous item in both lesson and interaction type.
  const picked: ReviewItem[] = [];
  const covered = new Set<string>();
  const coversNew = (item: ReviewItem) => item.concepts.some((c) => !covered.has(c));

  while (picked.length < max && pool.length > 0) {
    const last = picked[picked.length - 1];
    const diffLessonAndType = (item: ReviewItem) =>
      !last ||
      (item.lessonId !== last.lessonId && item.step.interaction.type !== last.step.interaction.type);
    const diffType = (item: ReviewItem) =>
      !last || item.step.interaction.type !== last.step.interaction.type;

    let idx = pool.findIndex((item) => coversNew(item) && diffLessonAndType(item));
    if (idx < 0) idx = pool.findIndex((item) => coversNew(item) && diffType(item));
    if (idx < 0) idx = pool.findIndex((item) => coversNew(item));
    if (idx < 0) break; // remaining candidates only repeat already-covered concepts

    const [chosen] = pool.splice(idx, 1);
    picked.push(chosen);
    chosen.concepts.forEach((c) => covered.add(c));
  }

  return picked;
}

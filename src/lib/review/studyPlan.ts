// "What should I study next?" — a single, reasoned recommendation (Phase 3).
//
// recommendNext() decides lesson progression; this layers concept-level spacing on top
// so the home screen can name ONE highest-value action with a human reason, instead of
// leaving the learner to choose (combating the metacognitive-laziness failure mode the
// brainlift flags). Pure: callers inject `now`.
import type { Lesson } from '../../types/content';
import type { LessonProgress, MasteryRecord } from '../../types/progress';
import { recommendNext } from '../mastery';
import { weakestDue } from '../scheduler';
import { conceptLabel, dependentsOf } from '../concepts';

export interface StudyPlan {
  kind: 'continue' | 'review-concept' | 'next' | 'review-lesson' | 'review-due' | 'done';
  reason: string;
  /** Where the CTA should navigate. */
  route: string;
  conceptId?: string;
  lessonId?: string;
}

/**
 * The single weakest fading concept to focus on, with a reason — independent of lesson
 * progression, so the home "Suggested focus" strip surfaces whenever anything is due.
 * Returns null when nothing is due.
 */
export function weakestDueFocus(
  masteryMap: Record<string, MasteryRecord>,
  now: number = Date.now(),
): { conceptId: string; reason: string } | null {
  const weakest = weakestDue(masteryMap, now, 1)[0];
  if (!weakest) return null;
  const unlocks = dependentsOf(weakest).filter((d) => masteryMap[d]);
  const reason = unlocks.length
    ? `Review ${conceptLabel(weakest)} — it's fading and underpins ${conceptLabel(unlocks[0])}`
    : `Review ${conceptLabel(weakest)} — your weakest fading concept`;
  return { conceptId: weakest, reason };
}

/** Pick the single best next action, with a reason the learner can act on. */
export function studyPlan(
  orderedLessons: Lesson[],
  progressMap: Record<string, LessonProgress>,
  masteryMap: Record<string, MasteryRecord>,
  now: number = Date.now(),
): StudyPlan {
  const rec = recommendNext(orderedLessons, progressMap, masteryMap, now);
  const weakest = weakestDue(masteryMap, now, 1)[0];

  // 1) Resuming an in-progress lesson always wins.
  if (rec?.kind === 'continue') {
    return { kind: 'continue', reason: rec.reason, route: `/lesson/${rec.lessonId}`, lessonId: rec.lessonId };
  }

  // 2) A fading FOUNDATION (a due concept other concepts build on) is worth fixing before
  //    moving forward — don't build on sand.
  if (weakest) {
    const unlocks = dependentsOf(weakest).filter((d) => masteryMap[d]);
    if (unlocks.length > 0) {
      return {
        kind: 'review-concept',
        conceptId: weakest,
        route: '/review',
        reason: `Review ${conceptLabel(weakest)} — it's fading and underpins ${conceptLabel(unlocks[0])}`,
      };
    }
  }

  // 3) Otherwise make course progress (start the next lesson / shore up a weak one).
  if (rec && (rec.kind === 'next' || rec.kind === 'review')) {
    return {
      kind: rec.kind === 'review' ? 'review-lesson' : 'next',
      reason: rec.reason,
      route: `/lesson/${rec.lessonId}`,
      lessonId: rec.lessonId,
    };
  }

  // 4) Course done but concepts are fading — review the weakest.
  if (weakest) {
    return {
      kind: 'review-due',
      conceptId: weakest,
      route: '/review',
      reason: `Review ${conceptLabel(weakest)} — your weakest fading concept`,
    };
  }
  if (rec?.kind === 'mixed-review') {
    return { kind: 'review-due', route: '/review', reason: rec.reason };
  }

  // 5) Nothing due, nothing left.
  return { kind: 'done', reason: rec?.reason ?? 'You have mastered the whole course!', route: '/' };
}

// Retention / review metrics (Phase 3, pure).
//
// These track LEARNING — current recall strength and how much a review session moved
// it — never engagement or time-on-task (which the learning-science notes flag as poor
// indicators). The before/after delta is the headline "did this work?" number.
import type { MasteryRecord } from '../../types/progress';
import { isDue, retrievability } from '../scheduler';
import { conceptMasteryTarget } from '../concepts';

export interface RetentionStats {
  tracked: number; // concepts with a mastery record
  dueCount: number; // due for review now
  fadingCount: number; // reached target once but have since decayed below it
  masteredNow: number; // currently at/above target (decayed strength)
  avgRetrievability: number; // mean current recall probability, 0..1
}

export function computeRetentionStats(
  masteryMap: Record<string, MasteryRecord>,
  now: number,
): RetentionStats {
  const records = Object.values(masteryMap);
  const tracked = records.length;
  if (tracked === 0) {
    return { tracked: 0, dueCount: 0, fadingCount: 0, masteredNow: 0, avgRetrievability: 0 };
  }
  let dueCount = 0;
  let fadingCount = 0;
  let masteredNow = 0;
  let sumR = 0;
  for (const r of records) {
    const target = conceptMasteryTarget(r.conceptId);
    const recall = retrievability(r, now);
    sumR += recall;
    if (isDue(r, now)) dueCount += 1;
    if (recall >= target) masteredNow += 1;
    else if (r.strength >= target) fadingCount += 1; // was solid, has decayed under target
  }
  return { tracked, dueCount, fadingCount, masteredNow, avgRetrievability: sumR / tracked };
}

export interface ReviewDelta {
  conceptCount: number; // concepts present in both snapshots
  improved: number; // concepts whose recall rose
  meanDelta: number; // average (after - before), -1..1
}

/**
 * Compare per-concept recall snapshots (conceptId -> recall 0..1) from before vs after
 * a review session. Only concepts present in BOTH snapshots count.
 */
export function summarizeReviewDelta(
  before: Record<string, number>,
  after: Record<string, number>,
): ReviewDelta {
  const ids = Object.keys(after).filter((id) => id in before);
  if (ids.length === 0) return { conceptCount: 0, improved: 0, meanDelta: 0 };
  let improved = 0;
  let sum = 0;
  for (const id of ids) {
    const d = after[id] - before[id];
    sum += d;
    if (d > 0) improved += 1;
  }
  return { conceptCount: ids.length, improved, meanDelta: sum / ids.length };
}

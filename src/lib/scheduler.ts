// Spaced-repetition scheduling + a read-time forgetting curve (Phase 3).
//
// SM-2-lite: each concept walks an expanding interval ladder on a spaced correct
// recall and resets to a short relearn interval on a miss. We persist ONLY `nextDue`
// on the MasteryRecord — Firestore rules permit exactly
// {conceptId, strength, lastSeen, wrongCount[, nextDue]} — so the SRS "box" is DERIVED
// from the stored interval rather than stored separately. Forgetting (retrievability)
// is computed at read time; the stored `strength` is never mutated by elapsed time.
//
// All functions are pure; callers inject `now` (epoch ms) for testability.
import type { MasteryRecord } from '../types/progress';

const DAY_MS = 86_400_000;

/** Expanding review ladder (days); index = SRS "box". ~2-3x growth ≈ the classic
 *  expanding schedule and the Cepeda spacing heuristic (gap grows with retention). */
export const INTERVALS_DAYS = [1, 3, 7, 16, 35] as const;

/** A missed concept comes back within a day (resurface wrong items sooner). */
export const RELEARN_DAYS = 1;

/** Floor so a freshly-due box-0 concept still has a sensible half-life. */
const HALF_LIFE_MIN_DAYS = 0.5;

type Schedulable = Pick<MasteryRecord, 'lastSeen' | 'nextDue'>;

/** Interval (days) currently encoded by a record, or null if never scheduled. */
function scheduledIntervalDays(record: Schedulable | undefined): number | null {
  if (!record || record.nextDue == null) return null;
  const days = (record.nextDue - record.lastSeen) / DAY_MS;
  return days > 0 ? days : null;
}

/** Derive the SRS box (ladder index) from the stored interval; -1 if never scheduled. */
export function boxFromRecord(record: Schedulable | undefined): number {
  const days = scheduledIntervalDays(record);
  if (days == null) return -1;
  let best = 0;
  let bestDiff = Infinity;
  INTERVALS_DAYS.forEach((d, i) => {
    const diff = Math.abs(d - days);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

/**
 * Next-due timestamp (epoch ms, whole number > 0) after answering `correct`.
 * Correct AND actually spaced (at/after due) → advance one box up the ladder.
 * Correct but reviewed early (e.g. the same concept tagged on several steps in one
 * lesson) → keep the box, re-anchored from now, so a single session can't inflate the
 * interval. Wrong → short relearn interval. `prev` is the record BEFORE this answer
 * (undefined for a brand-new concept).
 */
export function computeNextDue(
  prev: Schedulable | undefined,
  correct: boolean,
  now: number,
): number {
  if (!correct) return Math.round(now + RELEARN_DAYS * DAY_MS);
  const box = boxFromRecord(prev);
  const wasDue = prev?.nextDue == null || now >= prev.nextDue;
  const nextBox = wasDue
    ? Math.min(box + 1, INTERVALS_DAYS.length - 1)
    : Math.max(box, 0);
  return Math.round(now + INTERVALS_DAYS[nextBox] * DAY_MS);
}

/** Half-life (days) for the forgetting curve — longer at higher boxes (mastered decays slower). */
function halfLifeDays(record: Schedulable): number {
  const box = boxFromRecord(record);
  const intervalDays = box >= 0 ? INTERVALS_DAYS[box] : INTERVALS_DAYS[0];
  return Math.max(HALF_LIFE_MIN_DAYS, intervalDays);
}

/**
 * Estimated current recall probability: stored strength decayed over time since
 * `lastSeen` (Half-Life-Regression-style). Equals `strength` at lastSeen, decays toward
 * 0, and never exceeds the stored strength. Stored strength is NOT mutated.
 */
export function retrievability(record: MasteryRecord, now: number): number {
  const elapsedDays = Math.max(0, (now - record.lastSeen) / DAY_MS);
  const r = record.strength * Math.exp(-elapsedDays / halfLifeDays(record));
  return Math.max(0, Math.min(record.strength, r));
}

/** A concept is due once now passes its nextDue (immediately if never scheduled). */
export function isDue(record: MasteryRecord, now: number): boolean {
  return now >= (record.nextDue ?? record.lastSeen);
}

/** Concept ids that are due for review now. */
export function dueConcepts(mastery: Record<string, MasteryRecord>, now: number): string[] {
  return Object.values(mastery)
    .filter((r) => isDue(r, now))
    .map((r) => r.conceptId);
}

/** Due concept ids, weakest (lowest retrievability) first, capped at n. */
export function weakestDue(
  mastery: Record<string, MasteryRecord>,
  now: number,
  n: number,
): string[] {
  return Object.values(mastery)
    .filter((r) => isDue(r, now))
    .sort((a, b) => retrievability(a, now) - retrievability(b, now))
    .slice(0, n)
    .map((r) => r.conceptId);
}

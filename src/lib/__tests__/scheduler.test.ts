import { describe, expect, it } from 'vitest';
import {
  INTERVALS_DAYS,
  RELEARN_DAYS,
  boxFromRecord,
  computeNextDue,
  retrievability,
  isDue,
  dueConcepts,
  weakestDue,
} from '../scheduler';
import type { MasteryRecord } from '../../types/progress';

const DAY = 86_400_000;
const T0 = 1_700_000_000_000; // fixed epoch ms

function rec(p: Partial<MasteryRecord> = {}): MasteryRecord {
  return { conceptId: 'c', strength: 0.8, lastSeen: T0, wrongCount: 0, ...p };
}

/** A record scheduled at a given ladder box: nextDue = lastSeen + INTERVALS_DAYS[box]. */
function atBox(box: number, p: Partial<MasteryRecord> = {}): MasteryRecord {
  const lastSeen = p.lastSeen ?? T0;
  return rec({ ...p, lastSeen, nextDue: lastSeen + INTERVALS_DAYS[box] * DAY });
}

describe('boxFromRecord', () => {
  it('returns -1 when never scheduled', () => {
    expect(boxFromRecord(rec({ nextDue: undefined }))).toBe(-1);
  });

  it('derives the ladder index from the stored interval', () => {
    INTERVALS_DAYS.forEach((_, box) => {
      expect(boxFromRecord(atBox(box))).toBe(box);
    });
  });
});

describe('computeNextDue', () => {
  it('schedules a brand-new concept at box 0 on a correct answer', () => {
    expect(computeNextDue(undefined, true, T0)).toBe(Math.round(T0 + INTERVALS_DAYS[0] * DAY));
  });

  it('relearns within a day on a wrong answer', () => {
    expect(computeNextDue(undefined, false, T0)).toBe(Math.round(T0 + RELEARN_DAYS * DAY));
    expect(computeNextDue(atBox(3), false, T0 + 16 * DAY)).toBe(
      Math.round(T0 + 16 * DAY + RELEARN_DAYS * DAY),
    );
  });

  it('advances one box when the review was actually due', () => {
    const prev = atBox(0); // nextDue = T0 + 1 day
    const now = prev.nextDue!; // exactly due
    expect(computeNextDue(prev, true, now)).toBe(Math.round(now + INTERVALS_DAYS[1] * DAY));
  });

  it('does NOT advance the box on an early (same-session) correct answer', () => {
    const prev = atBox(1); // 3-day interval, nextDue in the future
    const now = T0 + 1 * DAY; // before due
    // stays box 1 (3 days), re-anchored from now — no single-session inflation
    expect(computeNextDue(prev, true, now)).toBe(Math.round(now + INTERVALS_DAYS[1] * DAY));
  });

  it('holds the box on a due-but-low-confidence correct (advance=false)', () => {
    const prev = atBox(1); // 3-day interval
    const now = prev.nextDue!; // exactly due — would normally advance to box 2
    // a guessed correct keeps box 1 so it comes back at the same short interval
    expect(computeNextDue(prev, true, now, false)).toBe(Math.round(now + INTERVALS_DAYS[1] * DAY));
    // while a confident correct advances to box 2
    expect(computeNextDue(prev, true, now, true)).toBe(Math.round(now + INTERVALS_DAYS[2] * DAY));
  });

  it('caps at the top of the ladder', () => {
    const top = INTERVALS_DAYS.length - 1;
    const prev = atBox(top);
    const now = prev.nextDue!;
    expect(computeNextDue(prev, true, now)).toBe(Math.round(now + INTERVALS_DAYS[top] * DAY));
  });

  it('always returns a whole number strictly greater than now', () => {
    for (const correct of [true, false]) {
      const out = computeNextDue(atBox(2), correct, T0 + 7 * DAY);
      expect(Number.isInteger(out)).toBe(true);
      expect(out).toBeGreaterThan(T0 + 7 * DAY);
    }
  });
});

describe('retrievability', () => {
  it('equals stored strength at lastSeen and never exceeds it', () => {
    const r = rec({ strength: 0.8, lastSeen: T0, nextDue: T0 + 3 * DAY });
    expect(retrievability(r, T0)).toBeCloseTo(0.8, 5);
    expect(retrievability(r, T0 - 10 * DAY)).toBeLessThanOrEqual(0.8);
  });

  it('decays monotonically as time passes', () => {
    const r = atBox(1, { strength: 1 });
    const day1 = retrievability(r, T0 + 1 * DAY);
    const day5 = retrievability(r, T0 + 5 * DAY);
    expect(day5).toBeLessThan(day1);
    expect(day1).toBeLessThan(1);
  });

  it('decays slower for higher boxes (mastered concepts)', () => {
    const low = atBox(0, { strength: 1 });
    const high = atBox(INTERVALS_DAYS.length - 1, { strength: 1 });
    const at = T0 + 5 * DAY;
    expect(retrievability(high, at)).toBeGreaterThan(retrievability(low, at));
  });
});

describe('isDue / dueConcepts / weakestDue', () => {
  it('treats a never-scheduled record as due', () => {
    expect(isDue(rec({ nextDue: undefined }), T0)).toBe(true);
  });

  it('is due once now passes nextDue', () => {
    const r = atBox(1); // due at T0 + 3 days
    expect(isDue(r, T0 + 1 * DAY)).toBe(false);
    expect(isDue(r, T0 + 3 * DAY)).toBe(true);
  });

  it('lists only due concepts', () => {
    const map: Record<string, MasteryRecord> = {
      due: atBox(0, { conceptId: 'due' }), // due at T0 + 1 day
      notDue: atBox(4, { conceptId: 'notDue' }), // due at T0 + 35 days
    };
    expect(dueConcepts(map, T0 + 2 * DAY)).toEqual(['due']);
  });

  it('orders due concepts weakest-first and caps at n', () => {
    const now = T0 + 40 * DAY; // everything overdue
    const map: Record<string, MasteryRecord> = {
      strong: rec({ conceptId: 'strong', strength: 0.9, lastSeen: T0, nextDue: T0 + 35 * DAY }),
      weak: rec({ conceptId: 'weak', strength: 0.2, lastSeen: T0, nextDue: T0 + 1 * DAY }),
      mid: rec({ conceptId: 'mid', strength: 0.5, lastSeen: T0, nextDue: T0 + 7 * DAY }),
    };
    expect(weakestDue(map, now, 2)).toEqual(['weak', 'mid']);
  });
});

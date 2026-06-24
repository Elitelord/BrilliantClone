import { describe, expect, it } from 'vitest';
import {
  DAILY_GOAL,
  applyDailyCompletion,
  emptyStreak,
  goalMetToday,
  recordProblem,
  reconcileStreak,
  rollToToday,
  todayKey,
} from '../streak';
import { makeStreak } from './helpers';

const DAY1 = '2026-06-22';
const DAY2 = '2026-06-23';
const DAY4 = '2026-06-25';

describe('todayKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(todayKey(new Date('2026-06-22T15:30:00'))).toBe('2026-06-22');
  });
});

describe('recordProblem', () => {
  it('does not extend streak before daily goal', () => {
    let s = makeStreak({ todayDate: DAY1, problemsToday: 0 });
    s = recordProblem(s, DAY1);
    expect(s.problemsToday).toBe(1);
    expect(s.lastActiveDate).toBe('');
    s = recordProblem(s, DAY1);
    expect(s.problemsToday).toBe(2);
    expect(s.lastActiveDate).toBe('');
  });

  it('extends streak when daily goal is met', () => {
    let s = makeStreak({ todayDate: DAY1, problemsToday: DAILY_GOAL - 1 });
    s = recordProblem(s, DAY1);
    expect(s.problemsToday).toBe(DAILY_GOAL);
    expect(s.lastActiveDate).toBe(DAY1);
    expect(s.count).toBe(1);
  });
});

describe('applyDailyCompletion', () => {
  it('starts streak at 1 on first active day', () => {
    const s = applyDailyCompletion(emptyStreak(), DAY1);
    expect(s.count).toBe(1);
    expect(s.lastActiveDate).toBe(DAY1);
    expect(s.longest).toBe(1);
  });

  it('increments streak on consecutive day', () => {
    const prev = makeStreak({ count: 3, lastActiveDate: DAY1, todayDate: DAY2 });
    const s = applyDailyCompletion(prev, DAY2);
    expect(s.count).toBe(4);
    expect(s.longest).toBe(4);
  });

  it('resets streak after missed day', () => {
    const prev = makeStreak({ count: 5, lastActiveDate: DAY1, todayDate: DAY4 });
    const s = applyDailyCompletion(prev, DAY4);
    expect(s.count).toBe(1);
  });

  it('is idempotent when already completed today', () => {
    const prev = makeStreak({ count: 2, lastActiveDate: DAY1, todayDate: DAY1, problemsToday: 3 });
    const s = applyDailyCompletion(prev, DAY1);
    expect(s.count).toBe(2);
  });
});

describe('goalMetToday', () => {
  it('is true when lastActiveDate matches today', () => {
    expect(goalMetToday(makeStreak({ lastActiveDate: DAY1 }), DAY1)).toBe(true);
  });

  it('is false when goal not yet met', () => {
    expect(goalMetToday(makeStreak({ lastActiveDate: '' }), DAY1)).toBe(false);
  });
});

describe('reconcileStreak', () => {
  it('consumes charge instead of resetting when day skipped', () => {
    const prev = makeStreak({
      count: 5,
      lastActiveDate: DAY1,
      todayDate: DAY4,
      charges: 1,
    });
    const s = reconcileStreak(prev, DAY4);
    expect(s.charges).toBe(0);
    expect(s.count).toBe(5);
  });

  it('resets count when day skipped without charge', () => {
    const prev = makeStreak({
      count: 5,
      lastActiveDate: DAY1,
      todayDate: DAY4,
      charges: 0,
    });
    const s = reconcileStreak(prev, DAY4);
    expect(s.count).toBe(0);
  });
});

describe('rollToToday', () => {
  it('resets problemsToday on new calendar day', () => {
    const prev = makeStreak({ todayDate: DAY1, problemsToday: 2 });
    const s = rollToToday(prev, DAY2);
    expect(s.todayDate).toBe(DAY2);
    expect(s.problemsToday).toBe(0);
  });

  it('leaves streak unchanged when already on today', () => {
    const prev = makeStreak({ todayDate: DAY1, problemsToday: 2 });
    expect(rollToToday(prev, DAY1)).toBe(prev);
  });
});

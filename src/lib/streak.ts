import type { StreakState } from '../types/progress';

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function emptyStreak(): StreakState {
  return {
    count: 0,
    lastActiveDate: '',
    charges: 0,
    problemsToday: 0,
    todayDate: todayKey(),
    longest: 0,
  };
}

// Number of problems (or a full lesson) needed in a day to extend the streak.
export const DAILY_GOAL = 3;

// Roll the per-day problem counter to today if the date changed.
export function rollToToday(streak: StreakState, today = todayKey()): StreakState {
  if (streak.todayDate === today) return streak;
  return { ...streak, todayDate: today, problemsToday: 0 };
}

// Record one solved problem; bump the streak when the daily goal is first met.
export function recordProblem(streak: StreakState, today = todayKey()): StreakState {
  let s = rollToToday(streak, today);
  const problemsToday = s.problemsToday + 1;
  s = { ...s, problemsToday };
  if (problemsToday === DAILY_GOAL) {
    s = applyDailyCompletion(s, today);
  }
  return s;
}

// Mark today's goal as met (also called when a full lesson is completed).
export function applyDailyCompletion(streak: StreakState, today = todayKey()): StreakState {
  const s = rollToToday(streak, today);
  if (s.lastActiveDate === today) return s; // already counted today

  let count: number;
  if (!s.lastActiveDate) {
    count = 1;
  } else {
    const gap = daysBetween(s.lastActiveDate, today);
    if (gap === 1) count = s.count + 1;
    else if (gap <= 0) count = s.count; // safety
    else count = 1; // missed a day -> reset (charges handled at load time)
  }

  return {
    ...s,
    count,
    lastActiveDate: today,
    longest: Math.max(s.longest, count),
    problemsToday: Math.max(s.problemsToday, DAILY_GOAL),
  };
}

// Returns true once today's goal has already been met.
export function goalMetToday(streak: StreakState, today = todayKey()): boolean {
  return streak.lastActiveDate === today;
}

// Called when data is loaded: reset the day counter, and break the streak if a day
// was missed (a charge protects it once).
export function reconcileStreak(streak: StreakState, today = todayKey()): StreakState {
  let s = rollToToday(streak, today);
  if (s.lastActiveDate && s.lastActiveDate !== today) {
    const gap = daysBetween(s.lastActiveDate, today);
    if (gap > 1) {
      if (s.charges > 0) s = { ...s, charges: s.charges - 1 };
      else s = { ...s, count: 0 };
    }
  }
  return s;
}

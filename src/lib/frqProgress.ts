// Per-FRQ practice results — best score + attempts, for the FRQ index status badge.
// Stored in localStorage per-user (like the daily-review marker): it's a lightweight
// practice record, so it doesn't need the Firestore mastery/progress schema (which is
// locked to lessons/concepts). Concept mastery from FRQ parts already persists via
// registerReviewResult; this just tracks the per-FRQ score so the index can show it.

export interface FrqResult {
  best: number; // best points earned across attempts
  total: number; // parts in the FRQ
  attempts: number;
}

const key = (uid: string) => `dtm:frq:${uid}`;

function readAll(uid: string): Record<string, FrqResult> {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? '{}') as Record<string, FrqResult>;
  } catch {
    return {};
  }
}

/** All FRQ results for a user, keyed by FRQ id. */
export function getFrqResults(uid: string): Record<string, FrqResult> {
  return readAll(uid);
}

/** Record a completed FRQ attempt, keeping the best score. */
export function recordFrqResult(uid: string, frqId: string, earned: number, total: number): void {
  try {
    const all = readAll(uid);
    const prev = all[frqId];
    all[frqId] = {
      best: Math.max(prev?.best ?? 0, earned),
      total,
      attempts: (prev?.attempts ?? 0) + 1,
    };
    localStorage.setItem(key(uid), JSON.stringify(all));
  } catch {
    /* localStorage unavailable — status badge just won't show. */
  }
}

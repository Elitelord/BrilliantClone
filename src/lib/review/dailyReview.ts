// Tracks whether the learner has done a spaced-review session today, to nudge the
// little-and-often habit (one focused session/day) without hard-blocking more.
//
// Stored in localStorage, per-user: this is a soft UX cue, not learning state, so it
// doesn't need to sync across devices or touch Firestore (whose schema is locked).
import { todayKey } from '../streak';

const key = (uid: string) => `dtm:lastReview:${uid}`;

/** Record that `uid` completed a review session today. */
export function markReviewedToday(uid: string): void {
  try {
    localStorage.setItem(key(uid), todayKey());
  } catch {
    /* localStorage unavailable (private mode, etc.) — the nudge just won't show. */
  }
}

/** True if `uid` already completed a review session today. */
export function reviewedToday(uid: string): boolean {
  try {
    return localStorage.getItem(key(uid)) === todayKey();
  } catch {
    return false;
  }
}

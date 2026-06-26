// User progress, mastery, and streak shapes (persisted to Firestore or localStorage).

/** UI-only status for the course path (derived, not stored). */
export type LessonPathStatus = 'locked' | 'available' | 'in_progress' | 'complete';

/** Whether the learner is mid-lesson or has left the lesson idle. */
export type LessonPlayState = 'not_started' | 'in_progress';

export interface LessonProgress {
  lessonId: string;
  /** Finished the lesson end-to-end at least once (permanent "Completed" badge). */
  finishedOnce: boolean;
  /** Active session — used for resume vs restart-from-slide-1 when reviewing. */
  playState: LessonPlayState;
  currentStepIndex: number; // for resume mid-lesson
  completedStepIds: string[];
  // first-try correctness per step id (drives lesson score)
  firstTryCorrect: Record<string, boolean>;
  // total wrong attempts per step id (drives "review" surfacing)
  attempts: Record<string, number>;
  /** Latest wrong-check details per step (for AI skill-check personalization). */
  attemptNotes?: Record<string, StepAttemptNote>;
  score: number; // 0..100, share of steps answered correctly on first try
  updatedAt: number;
}

/** Snapshot from the learner's most recent wrong check on a step. */
export interface StepAttemptNote {
  lastOutcome?: string;
  lastWrongSummary?: string;
}

export interface MasteryRecord {
  conceptId: string;
  strength: number; // 0..1
  lastSeen: number;
  wrongCount: number;
  nextDue?: number; // reserved for brief Phase 3 spaced repetition
}

export interface StreakState {
  count: number;
  lastActiveDate: string; // YYYY-MM-DD (local)
  charges: number; // streak "freezes"
  problemsToday: number;
  todayDate: string; // YYYY-MM-DD the problemsToday counter applies to
  longest: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  isGuest: boolean;
  createdAt: number;
}

export interface UserData {
  profile: UserProfile;
  progress: Record<string, LessonProgress>;
  mastery: Record<string, MasteryRecord>;
  streak: StreakState;
}

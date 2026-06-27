// Persistence layer. Real (non-guest) users sync to Firestore; guests and
// unconfigured setups use localStorage. Same interface either way.
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { emptyStreak } from './streak';
import { normalizeAvatar } from './avatars';
import type {
  UserData,
  UserProfile,
  LessonProgress,
  LeaderboardEntry,
  MasteryRecord,
  StreakState,
  LessonPlayState,
} from '../types/progress';

const LS_PREFIX = 'dtm:user:';
const lsKey = (uid: string) => LS_PREFIX + uid;

/** Set before account sign-in/up so guest progress can merge after auth. */
export const PENDING_GUEST_MERGE_KEY = 'dtm:pending-guest-merge';

export function markPendingGuestMerge(guestUid: string): void {
  try {
    sessionStorage.setItem(PENDING_GUEST_MERGE_KEY, guestUid);
  } catch {
    /* ignore */
  }
}

export function clearPendingGuestMerge(): void {
  try {
    sessionStorage.removeItem(PENDING_GUEST_MERGE_KEY);
  } catch {
    /* ignore */
  }
}

function readPendingGuestMerge(): string | null {
  try {
    return sessionStorage.getItem(PENDING_GUEST_MERGE_KEY);
  } catch {
    return null;
  }
}

function useFirestore(profile: UserProfile): boolean {
  return !profile.isGuest && !!db;
}

// ---- localStorage backend ----------------------------------------------
function readLocal(uid: string): UserData | null {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}

function writeLocal(data: UserData): void {
  try {
    localStorage.setItem(lsKey(data.profile.uid), JSON.stringify(data));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function freshUserData(profile: UserProfile): UserData {
  return { profile, progress: {}, mastery: {}, streak: emptyStreak() };
}

/** Migrate legacy `status` field to finishedOnce + playState. */
export function normalizeLessonProgress(raw: LessonProgress & { status?: string }): LessonProgress {
  let lp: LessonProgress;
  if (typeof raw.finishedOnce === 'boolean') {
    lp = raw;
  } else {
    const legacy = raw.status;
    const finishedOnce = legacy === 'complete';
    let playState: LessonPlayState = 'not_started';
    if (legacy === 'in_progress' || raw.currentStepIndex > 0) playState = 'in_progress';
    if (finishedOnce && raw.currentStepIndex === 0) playState = 'not_started';

    lp = {
      lessonId: raw.lessonId,
      finishedOnce,
      playState,
      currentStepIndex: raw.currentStepIndex ?? 0,
      completedStepIds: raw.completedStepIds ?? [],
      firstTryCorrect: raw.firstTryCorrect ?? {},
      attempts: raw.attempts ?? {},
      score: raw.score ?? 0,
      updatedAt: raw.updatedAt ?? Date.now(),
    };
  }

  // Completed lessons idle for review should not resume on the last slide.
  if (lp.finishedOnce && lp.playState === 'not_started' && lp.currentStepIndex > 0) {
    return { ...lp, currentStepIndex: 0 };
  }
  return lp;
}

// Update the localStorage mirror in place. Firestore users get a local copy too
// so a refresh always resumes, even if a Firestore write was blocked or flaky.
function mirrorLocal(profile: UserProfile, mutate: (d: UserData) => void): void {
  const data = readLocal(profile.uid) ?? freshUserData(profile);
  data.profile = { ...data.profile, ...profile };
  mutate(data);
  writeLocal(data);
}

// Merge remote (Firestore) with the local mirror, preferring the most recently
// updated record per lesson/concept so neither device nor offline edits are lost.
function mergeUserData(remote: UserData, local: UserData | null): UserData {
  if (!local) return remote;
  const progress: Record<string, LessonProgress> = { ...remote.progress };
  for (const [id, lp] of Object.entries(local.progress)) {
    const r = progress[id];
    if (!r || (lp.updatedAt ?? 0) > (r.updatedAt ?? 0)) progress[id] = lp;
  }
  const mastery: Record<string, MasteryRecord> = { ...remote.mastery };
  for (const [id, m] of Object.entries(local.mastery)) {
    const r = mastery[id];
    if (!r || (m.lastSeen ?? 0) > (r.lastSeen ?? 0)) mastery[id] = m;
  }
  let streak = remote.streak;
  if (local.streak && (local.streak.lastActiveDate ?? '') > (remote.streak.lastActiveDate ?? '')) {
    streak = local.streak;
  }
  return { profile: remote.profile, progress, mastery, streak };
}

function normalizeProgressMap(progress: Record<string, LessonProgress>): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = {};
  for (const [id, lp] of Object.entries(progress)) {
    out[id] = normalizeLessonProgress(lp as LessonProgress & { status?: string });
  }
  return out;
}

// ---- public API ---------------------------------------------------------
async function writeAllUserData(profile: UserProfile, data: UserData): Promise<void> {
  writeLocal(data);
  if (!useFirestore(profile)) return;

  await setDoc(
    doc(db!, 'users', profile.uid),
    {
      displayName: profile.displayName,
      email: profile.email ?? null,
      avatar: profile.avatar ?? null,
      createdAt: profile.createdAt,
      streak: data.streak,
    },
    { merge: true },
  );

  await Promise.all([
    ...Object.values(data.progress).map((lp) =>
      setDoc(doc(db!, 'users', profile.uid, 'progress', lp.lessonId), lp),
    ),
    ...Object.values(data.mastery).map((m) =>
      setDoc(doc(db!, 'users', profile.uid, 'mastery', m.conceptId), m),
    ),
  ]);
}

/** Merge a guest's local progress into a newly signed-in account. */
export async function mergeGuestProgressIntoUser(
  guestUid: string,
  newProfile: UserProfile,
): Promise<UserData | null> {
  const guestData = readLocal(guestUid);
  if (!guestData) return null;

  const remote = await fetchUserData(newProfile);
  const merged: UserData = {
    ...mergeUserData(remote, guestData),
    profile: newProfile,
  };
  merged.progress = normalizeProgressMap(merged.progress);

  await writeAllUserData(newProfile, merged);

  try {
    localStorage.removeItem(lsKey(guestUid));
    localStorage.removeItem('dtm:guest');
  } catch {
    /* ignore */
  }
  clearPendingGuestMerge();
  return merged;
}

async function fetchUserData(profile: UserProfile): Promise<UserData> {
  if (!useFirestore(profile)) {
    const existing = readLocal(profile.uid);
    if (existing) {
      return {
        ...existing,
        profile: { ...existing.profile, ...profile },
        progress: normalizeProgressMap(existing.progress),
      };
    }
    const data = freshUserData(profile);
    writeLocal(data);
    return data;
  }

  const userRef = doc(db!, 'users', profile.uid);
  const snap = await getDoc(userRef);
  const streak: StreakState = (snap.exists() && (snap.data().streak as StreakState)) || emptyStreak();
  const mergedProfile: UserProfile = {
    ...profile,
    createdAt: (snap.exists() && (snap.data().createdAt as number)) || profile.createdAt,
    avatar: (snap.exists() && (snap.data().avatar as string)) || profile.avatar,
  };

  if (!snap.exists()) {
    await setDoc(userRef, {
      displayName: profile.displayName,
      email: profile.email ?? null,
      createdAt: profile.createdAt,
      streak,
    });
  }

  const progress: Record<string, LessonProgress> = {};
  const progSnap = await getDocs(collection(db!, 'users', profile.uid, 'progress'));
  progSnap.forEach((d) => {
    progress[d.id] = d.data() as LessonProgress;
  });

  const mastery: Record<string, MasteryRecord> = {};
  const masterySnap = await getDocs(collection(db!, 'users', profile.uid, 'mastery'));
  masterySnap.forEach((d) => {
    mastery[d.id] = d.data() as MasteryRecord;
  });

  const remote: UserData = { profile: mergedProfile, progress, mastery, streak };
  const merged = mergeUserData(remote, readLocal(profile.uid));
  merged.progress = normalizeProgressMap(merged.progress);
  writeLocal(merged);
  return merged;
}

export async function loadUserData(profile: UserProfile): Promise<UserData> {
  const pendingGuestUid = !profile.isGuest ? readPendingGuestMerge() : null;
  if (pendingGuestUid) {
    clearPendingGuestMerge();
    const merged = await mergeGuestProgressIntoUser(pendingGuestUid, profile);
    if (merged) return merged;
  }

  return fetchUserData(profile);
}

export async function persistProgress(profile: UserProfile, lp: LessonProgress): Promise<void> {
  mirrorLocal(profile, (d) => {
    d.progress[lp.lessonId] = lp;
  });
  if (!useFirestore(profile)) return;
  try {
    await setDoc(doc(db!, 'users', profile.uid, 'progress', lp.lessonId), lp);
  } catch (e) {
    console.warn('persistProgress failed (kept locally).', e);
  }
}

function firestoreSafe<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function persistMastery(profile: UserProfile, records: MasteryRecord[]): Promise<void> {
  mirrorLocal(profile, (d) => {
    for (const r of records) d.mastery[r.conceptId] = r;
  });
  if (!useFirestore(profile)) return;
  try {
    await Promise.all(
      records.map((r) =>
        setDoc(doc(db!, 'users', profile.uid, 'mastery', r.conceptId), firestoreSafe(r)),
      ),
    );
  } catch (e) {
    console.warn('persistMastery failed (kept locally).', e);
  }
}

export async function persistStreak(profile: UserProfile, streak: StreakState): Promise<void> {
  mirrorLocal(profile, (d) => {
    d.streak = streak;
  });
  void publishLeaderboard(profile, streak);
  if (!useFirestore(profile)) return;
  try {
    await setDoc(doc(db!, 'users', profile.uid), { streak }, { merge: true });
  } catch (e) {
    console.warn('persistStreak failed (kept locally).', e);
  }
}

/** Update editable profile fields (name / avatar). Mirrors locally and to Firestore. */
export async function updateUserProfileFields(profile: UserProfile): Promise<void> {
  mirrorLocal(profile, (d) => {
    d.profile = { ...d.profile, ...profile };
  });
  if (!useFirestore(profile)) return;
  try {
    await setDoc(
      doc(db!, 'users', profile.uid),
      {
        displayName: profile.displayName,
        email: profile.email ?? null,
        avatar: profile.avatar ?? null,
      },
      { merge: true },
    );
  } catch (e) {
    console.warn('updateUserProfileFields failed (kept locally).', e);
  }
}

// ---- Leaderboard --------------------------------------------------------
// A dedicated public collection that, by design, stores ONLY name + avatar +
// streak. Email and progress never enter it, so the leaderboard cannot leak
// sensitive data even to a signed-in reader.

/** Publish the current learner's public streak entry. No-op for guests/offline. */
export async function publishLeaderboard(profile: UserProfile, streak: StreakState): Promise<void> {
  if (profile.isGuest || !db) return;
  try {
    await setDoc(
      doc(db, 'leaderboard', profile.uid),
      {
        displayName: profile.displayName,
        avatar: normalizeAvatar(profile.avatar),
        streak: Math.max(0, Math.floor(streak.count)),
        longest: Math.max(0, Math.floor(streak.longest)),
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  } catch (e) {
    console.warn('publishLeaderboard failed.', e);
  }
}

/** Read all public leaderboard entries (name + avatar + streak only). */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'leaderboard'));
    const out: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const v = d.data() as Partial<LeaderboardEntry>;
      out.push({
        uid: d.id,
        displayName: typeof v.displayName === 'string' ? v.displayName : 'Learner',
        avatar: normalizeAvatar(typeof v.avatar === 'string' ? v.avatar : undefined),
        streak: typeof v.streak === 'number' ? v.streak : 0,
        longest: typeof v.longest === 'number' ? v.longest : 0,
      });
    });
    return out;
  } catch (e) {
    console.warn('fetchLeaderboard failed.', e);
    return [];
  }
}

/** Best-effort deletion of all of a user's stored data (used by delete-account). */
export async function deleteAccountData(profile: UserProfile): Promise<void> {
  try {
    localStorage.removeItem(lsKey(profile.uid));
  } catch {
    /* ignore */
  }
  if (!useFirestore(profile)) return;
  try {
    const [progSnap, masterySnap] = await Promise.all([
      getDocs(collection(db!, 'users', profile.uid, 'progress')),
      getDocs(collection(db!, 'users', profile.uid, 'mastery')),
    ]);
    await Promise.all([
      ...progSnap.docs.map((d) => deleteDoc(d.ref)),
      ...masterySnap.docs.map((d) => deleteDoc(d.ref)),
    ]);
    await deleteDoc(doc(db!, 'leaderboard', profile.uid)).catch(() => {});
    await deleteDoc(doc(db!, 'users', profile.uid)).catch(() => {});
  } catch (e) {
    console.warn('deleteAccountData failed.', e);
  }
}

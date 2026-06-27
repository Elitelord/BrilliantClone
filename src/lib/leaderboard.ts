import type { LeaderboardEntry } from '../types/progress';

// Seeded demo learners so the streak leaderboard never feels empty. These are not
// real accounts and carry only name + avatar + streak (no sensitive data exists).
export const SEED_ACCOUNTS: LeaderboardEntry[] = [
  { uid: 'seed-1', displayName: 'Maya Chen', avatar: '🦊', streak: 142, longest: 142, isFake: true },
  { uid: 'seed-2', displayName: 'Diego Torres', avatar: '🚀', streak: 98, longest: 110, isFake: true },
  { uid: 'seed-3', displayName: 'Aisha Khan', avatar: '🦉', streak: 76, longest: 80, isFake: true },
  { uid: 'seed-4', displayName: 'Liam OBrien', avatar: '🐼', streak: 64, longest: 64, isFake: true },
  { uid: 'seed-5', displayName: 'Sofia Rossi', avatar: '🦄', streak: 51, longest: 60, isFake: true },
  { uid: 'seed-6', displayName: 'Noah Kim', avatar: '🐯', streak: 43, longest: 45, isFake: true },
  { uid: 'seed-7', displayName: 'Priya Patel', avatar: '🦋', streak: 37, longest: 37, isFake: true },
  { uid: 'seed-8', displayName: 'Lucas Müller', avatar: '🐺', streak: 29, longest: 33, isFake: true },
  { uid: 'seed-9', displayName: 'Emma Johnson', avatar: '🐝', streak: 21, longest: 24, isFake: true },
  { uid: 'seed-10', displayName: 'Yuki Tanaka', avatar: '🐬', streak: 14, longest: 18, isFake: true },
  { uid: 'seed-11', displayName: 'Omar Haddad', avatar: '🦁', streak: 9, longest: 12, isFake: true },
  { uid: 'seed-12', displayName: 'Grace Lee', avatar: '🌈', streak: 5, longest: 7, isFake: true },
  { uid: 'seed-13', displayName: 'Ben Carter', avatar: '🐸', streak: 3, longest: 3, isFake: true },
];

/** Merge seeded + real entries (and the current user) into a ranked list. */
export function buildLeaderboard(
  real: LeaderboardEntry[],
  you?: LeaderboardEntry,
): LeaderboardEntry[] {
  const map = new Map<string, LeaderboardEntry>();
  for (const s of SEED_ACCOUNTS) map.set(s.uid, s);
  for (const r of real) map.set(r.uid, r);
  if (you) map.set(you.uid, { ...you, isYou: true });

  return [...map.values()].sort(
    (a, b) =>
      b.streak - a.streak ||
      b.longest - a.longest ||
      a.displayName.localeCompare(b.displayName),
  );
}

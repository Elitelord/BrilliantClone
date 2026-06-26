/**
 * Reset streak field on all user docs (after progress wipe).
 * Uses Application Default Credentials from `firebase login`.
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = 'brilliantclone-b4a2a';

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const today = new Date();
const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const emptyStreak = {
  count: 0,
  lastActiveDate: '',
  charges: 0,
  problemsToday: 0,
  todayDate,
  longest: 0,
};

const snap = await db.collection('users').get();
for (const doc of snap.docs) {
  await doc.ref.set({ streak: emptyStreak }, { merge: true });
  console.log(`Reset streak: ${doc.id}`);
}

console.log('Done.');

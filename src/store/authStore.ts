import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { clearPendingGuestMerge, markPendingGuestMerge } from '../lib/persistence';
import { useProgressStore } from './progressStore';
import type { UserProfile } from '../types/progress';

const GUEST_KEY = 'dtm:guest';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  init: () => void;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  continueAsGuest: (name: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

function profileFromFirebase(u: FirebaseUser): UserProfile {
  return {
    uid: u.uid,
    displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Learner'),
    email: u.email ?? undefined,
    isGuest: false,
    createdAt: u.metadata.creationTime ? Date.parse(u.metadata.creationTime) : Date.now(),
  };
}

function loadGuest(): UserProfile | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveGuest(p: UserProfile): void {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    default:
      return (e as Error)?.message ?? 'Something went wrong. Please try again.';
  }
}

let initialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,
  configured: isFirebaseConfigured,

  init: () => {
    if (initialized) return;
    initialized = true;

    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, (u) => {
        if (u) {
          set({ profile: profileFromFirebase(u), loading: false });
        } else {
          // fall back to an existing guest session if present
          set({ profile: loadGuest(), loading: false });
        }
      });
    } else {
      set({ profile: loadGuest(), loading: false });
    }
  },

  signUpEmail: async (name, email, password) => {
    if (!auth) throw new Error('Auth not configured');
    set({ error: null });
    const guestUid = (() => {
      const p = get().profile;
      return p?.isGuest ? p.uid : null;
    })();
    if (guestUid) markPendingGuestMerge(guestUid);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      set({ profile: { ...profileFromFirebase(cred.user), displayName: name || cred.user.displayName || 'Learner' } });
    } catch (e) {
      clearPendingGuestMerge();
      set({ error: friendlyError(e) });
      throw e;
    }
  },

  signInEmail: async (email, password) => {
    if (!auth) throw new Error('Auth not configured');
    set({ error: null });
    const guestUid = (() => {
      const p = get().profile;
      return p?.isGuest ? p.uid : null;
    })();
    if (guestUid) markPendingGuestMerge(guestUid);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      clearPendingGuestMerge();
      set({ error: friendlyError(e) });
      throw e;
    }
  },

  signInGoogle: async () => {
    if (!auth) throw new Error('Auth not configured');
    set({ error: null });
    const guestUid = (() => {
      const p = get().profile;
      return p?.isGuest ? p.uid : null;
    })();
    if (guestUid) markPendingGuestMerge(guestUid);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      clearPendingGuestMerge();
      set({ error: friendlyError(e) });
      throw e;
    }
  },

  continueAsGuest: (name) => {
    const uid =
      'guest-' + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    const profile: UserProfile = {
      uid,
      displayName: name || 'Guest',
      isGuest: true,
      createdAt: Date.now(),
    };
    saveGuest(profile);
    set({ profile, error: null });
  },

  logout: async () => {
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      /* ignore */
    }
    clearPendingGuestMerge();
    useProgressStore.getState().reset();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
    }
    set({ profile: null });
  },

  clearError: () => set({ error: null }),
}));

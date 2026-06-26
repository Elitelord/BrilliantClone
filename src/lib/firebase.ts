// Firebase initialization. The app works WITHOUT a config (it falls back to a local
// guest + localStorage), but real auth and cross-device sync require these env vars.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (isFirebaseConfigured) {
  appInstance = initializeApp(config as Record<string, string>);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  initAppCheck(appInstance);
}

// App Check protects backend resources (notably the AI Logic quota) from abuse.
// It is only initialized when a reCAPTCHA Enterprise site key is provided, so the
// app still runs locally without it. For local dev, set VITE_APPCHECK_DEBUG_TOKEN.
function initAppCheck(fbApp: FirebaseApp): void {
  const siteKey = import.meta.env.VITE_APPCHECK_RECAPTCHA_KEY;
  if (!siteKey) return;
  const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    // Recognized by the App Check SDK before initialize; enables localhost calls.
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
  }
  try {
    initializeAppCheck(fbApp, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    // Non-fatal: AI features will be gated off if App Check fails to init.
    console.warn('App Check init failed; AI features may be unavailable.', err);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

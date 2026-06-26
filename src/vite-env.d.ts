/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_AI_ENABLED?: string;
  /** firebase (default) | gemini-api | openai | proxy */
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_AI_MODEL?: string;
  /** Google AI Studio / Gemini Developer API key (gemini-api provider only). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** OpenAI API key (openai provider). Must use VITE_ prefix for Vite to expose it. */
  readonly VITE_OPENAI_API_KEY?: string;
  /** Alias for VITE_OPENAI_API_KEY */
  readonly VITE_OPEN_AI_API_KEY?: string;
  /** HTTPS endpoint for server-side AI proxy (proxy provider only). */
  readonly VITE_AI_PROXY_URL?: string;
  /** Optional Bearer token sent to VITE_AI_PROXY_URL. */
  readonly VITE_AI_PROXY_TOKEN?: string;
  readonly VITE_APPCHECK_RECAPTCHA_KEY?: string;
  readonly VITE_APPCHECK_DEBUG_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

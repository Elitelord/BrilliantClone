import { app, isFirebaseConfigured } from '../../firebase';
import type { AiProviderId } from './types';

export function resolveOpenAiApiKey(): string | undefined {
  return (
    import.meta.env.VITE_OPENAI_API_KEY?.trim() ||
    import.meta.env.VITE_OPEN_AI_API_KEY?.trim() ||
    undefined
  );
}

/** Default model for the active provider (override with VITE_AI_MODEL). */
export function defaultModelForProvider(id: AiProviderId): string {
  const custom = import.meta.env.VITE_AI_MODEL?.trim();
  if (custom) return custom;
  if (id === 'openai') return 'gpt-4o';
  return 'gemini-flash-latest';
}

export const DEFAULT_MODEL = defaultModelForProvider(
  resolveAiProviderId(),
);

/** Which backend to use. Defaults to firebase when unset. */
export function resolveAiProviderId(): AiProviderId {
  const raw = import.meta.env.VITE_AI_PROVIDER?.trim().toLowerCase();
  if (raw === 'gemini-api' || raw === 'gemini' || raw === 'google-ai') return 'gemini-api';
  if (raw === 'openai' || raw === 'open-ai') return 'openai';
  if (raw === 'proxy' || raw === 'backend' || raw === 'custom') return 'proxy';
  return 'firebase';
}

/** True when the operator opted in via VITE_AI_ENABLED. */
export function isAiFeatureFlagOn(): boolean {
  return import.meta.env.VITE_AI_ENABLED === 'true';
}

/** True when the selected provider has the credentials / infra it needs. */
export function isAiProviderConfigured(id: AiProviderId = resolveAiProviderId()): boolean {
  switch (id) {
    case 'firebase':
      return isFirebaseConfigured && !!app;
    case 'gemini-api':
      return !!import.meta.env.VITE_GEMINI_API_KEY?.trim();
    case 'openai':
      return !!resolveOpenAiApiKey();
    case 'proxy':
      return !!import.meta.env.VITE_AI_PROXY_URL?.trim();
    default:
      return false;
  }
}

/** AI features run only when the flag is on AND the chosen provider is ready. */
export const isAiEnabled = isAiFeatureFlagOn() && isAiProviderConfigured();

/** Summary for debugging (safe — no secrets). */
export function aiIntegrationStatus() {
  const provider = resolveAiProviderId();
  return {
    enabled: isAiEnabled,
    featureFlag: isAiFeatureFlagOn(),
    provider,
    providerReady: isAiProviderConfigured(provider),
    model: defaultModelForProvider(provider),
  };
}

import { resolveAiProviderId } from './config';
import { firebaseProvider } from './firebaseProvider';
import { geminiApiProvider } from './geminiApiProvider';
import { openaiProvider } from './openaiProvider';
import { proxyProvider } from './proxyProvider';
import type { AiProvider, GenerateContentRequest } from './types';

export type { AiProvider, AiProviderId, GenerateContentRequest } from './types';
export {
  DEFAULT_MODEL,
  resolveAiProviderId,
  isAiEnabled,
  isAiFeatureFlagOn,
  isAiProviderConfigured,
  aiIntegrationStatus,
} from './config';

const PROVIDERS: Record<string, AiProvider> = {
  firebase: firebaseProvider,
  'gemini-api': geminiApiProvider,
  openai: openaiProvider,
  proxy: proxyProvider,
};

export function getAiProvider(id = resolveAiProviderId()): AiProvider {
  return PROVIDERS[id] ?? firebaseProvider;
}

/** Single entry point for all providers — used by generate.ts. */
export async function executeGenerateContent(req: GenerateContentRequest): Promise<string> {
  const provider = getAiProvider();
  if (!provider.isConfigured()) {
    throw new Error(`AI provider "${provider.id}" is not configured.`);
  }
  return provider.generateContent(req);
}

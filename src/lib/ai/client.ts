// Back-compat re-exports. New code should use `./provider` and `generate.ts`.
export {
  DEFAULT_MODEL,
  isAiEnabled,
  isAiFeatureFlagOn,
  isAiProviderConfigured,
  resolveAiProviderId,
  aiIntegrationStatus,
  getAiProvider,
  executeGenerateContent,
} from './provider';
export { getFirebaseModel as getModel } from './provider/firebaseProvider';

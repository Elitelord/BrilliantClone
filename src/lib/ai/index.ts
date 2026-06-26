// Public surface of the AI layer. Phase 2 features import from here.
export {
  isAiEnabled,
  isAiFeatureFlagOn,
  isAiProviderConfigured,
  resolveAiProviderId,
  aiIntegrationStatus,
  getAiProvider,
  getModel,
  DEFAULT_MODEL,
} from './client';
export { generateText, generateJson } from './generate';
export {
  buildStepContext,
  stringifyContext,
  describeInteraction,
  TUTOR_SYSTEM_INSTRUCTION,
  SUBJECT,
  COURSE,
  type StepContext,
} from './context';
export { hintLeaksAnswer, safeAuthoredHint } from './hintGuard';
export { playableSteps, isExplainBackStep, toPlayableStepIndex, toFullStepIndex } from './lessonSteps';
export { verifySkillCheckQuestion, computeCorrectOptionId, type VerifiedSkillCheckQuestion } from './verify';

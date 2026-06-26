import type { Schema } from 'firebase/ai';

/** How the app reaches Gemini / other LLMs. Set via VITE_AI_PROVIDER. */
export type AiProviderId = 'firebase' | 'gemini-api' | 'openai' | 'proxy';

export interface GenerateContentRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  /** When set, the model should return JSON (optionally schema-constrained). */
  responseSchema?: Schema;
  /** Required JSON keys — used by providers without native schema support. */
  jsonKeyHint?: string;
}

export interface AiProvider {
  id: AiProviderId;
  /** Human-readable label for logs / devtools. */
  label: string;
  isConfigured(): boolean;
  generateContent(req: GenerateContentRequest): Promise<string>;
}

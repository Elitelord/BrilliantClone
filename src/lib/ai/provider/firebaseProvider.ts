import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  type GenerativeModel,
  type ModelParams,
} from 'firebase/ai';
import { app } from '../../firebase';
import { defaultModelForProvider } from './config';
import type { AiProvider, GenerateContentRequest } from './types';

let aiBackend: ReturnType<typeof getAI> | undefined;
const modelCache = new Map<string, GenerativeModel>();

function getBackend() {
  if (!app) throw new Error('Firebase app not initialized; cannot use AI Logic.');
  if (!aiBackend) {
    aiBackend = getAI(app, { backend: new GoogleAIBackend() });
  }
  return aiBackend;
}

function getModel(params: Partial<ModelParams>): GenerativeModel {
  const modelName = params.model ?? defaultModelForProvider('firebase');
  const cacheKey = JSON.stringify({ modelName, ...params });
  let model = modelCache.get(cacheKey);
  if (!model) {
    model = getGenerativeModel(getBackend(), { ...params, model: modelName });
    modelCache.set(cacheKey, model);
  }
  return model;
}

export const firebaseProvider: AiProvider = {
  id: 'firebase',
  label: 'Firebase AI Logic (GoogleAIBackend)',
  isConfigured: () => !!app,
  async generateContent(req: GenerateContentRequest): Promise<string> {
    const model = getModel({
      model: req.model,
      systemInstruction: req.systemInstruction,
      generationConfig: {
        temperature: req.temperature,
        maxOutputTokens: req.maxOutputTokens,
        ...(req.responseSchema
          ? {
              responseMimeType: 'application/json',
              responseSchema: req.responseSchema,
            }
          : {}),
      },
    });
    const result = await model.generateContent(req.prompt);
    return result.response.text().trim();
  },
};

/** Legacy export — Firebase-only model handle. Prefer generateContent via provider. */
export function getFirebaseModel(params?: Partial<ModelParams>): GenerativeModel | undefined {
  if (!app) return undefined;
  return getModel(params ?? {});
}

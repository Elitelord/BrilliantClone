import type { Schema } from 'firebase/ai';
import { defaultModelForProvider } from './config';
import type { AiProvider, GenerateContentRequest } from './types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Best-effort: Firebase Schema descriptors are JSON-serializable for the REST API. */
function schemaForRest(schema: Schema | undefined): Record<string, unknown> | undefined {
  if (!schema) return undefined;
  try {
    return JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export const geminiApiProvider: AiProvider = {
  id: 'gemini-api',
  label: 'Gemini Developer API (direct REST + API key)',
  isConfigured: () => !!import.meta.env.VITE_GEMINI_API_KEY?.trim(),
  async generateContent(req: GenerateContentRequest): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set.');

    const model = req.model ?? defaultModelForProvider('gemini-api');
    const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const generationConfig: Record<string, unknown> = {
      temperature: req.temperature,
      maxOutputTokens: req.maxOutputTokens,
    };
    if (req.responseSchema) {
      generationConfig.responseMimeType = 'application/json';
      const restSchema = schemaForRest(req.responseSchema);
      if (restSchema) generationConfig.responseSchema = restSchema;
    }

    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: req.prompt }] }],
      generationConfig,
    };
    if (req.systemInstruction) {
      body.systemInstruction = { parts: [{ text: req.systemInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Gemini API ${res.status}: ${detail}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Gemini API returned empty response.');
    return text;
  },
};

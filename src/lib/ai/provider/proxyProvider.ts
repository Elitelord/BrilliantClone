import { defaultModelForProvider } from './config';
import type { AiProvider, GenerateContentRequest } from './types';

/**
 * Generic backend proxy — use when your team keeps API keys on a server
 * (Cloud Functions, Cloud Run, etc.) and exposes a single HTTPS endpoint.
 *
 * Expected contract (POST JSON):
 *   Request:  { prompt, systemInstruction?, temperature?, maxOutputTokens?, model?, responseSchema? }
 *   Response: { text: string }  OR  raw string body
 *
 * Optional header: Authorization: Bearer <VITE_AI_PROXY_TOKEN>
 */
export const proxyProvider: AiProvider = {
  id: 'proxy',
  label: 'Custom HTTPS proxy (server-held keys)',
  isConfigured: () => !!import.meta.env.VITE_AI_PROXY_URL?.trim(),
  async generateContent(req: GenerateContentRequest): Promise<string> {
    const url = import.meta.env.VITE_AI_PROXY_URL?.trim();
    if (!url) throw new Error('VITE_AI_PROXY_URL is not set.');

    const token = import.meta.env.VITE_AI_PROXY_TOKEN?.trim();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    let responseSchema: unknown;
    if (req.responseSchema) {
      try {
        responseSchema = JSON.parse(JSON.stringify(req.responseSchema));
      } catch {
        responseSchema = undefined;
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: req.prompt,
        systemInstruction: req.systemInstruction,
        temperature: req.temperature,
        maxOutputTokens: req.maxOutputTokens,
        model: req.model ?? defaultModelForProvider('proxy'),
        responseSchema,
        responseMimeType: responseSchema ? 'application/json' : undefined,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`AI proxy ${res.status}: ${detail}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as { text?: string; content?: string };
      const text = data.text ?? data.content;
      if (!text?.trim()) throw new Error('AI proxy returned empty JSON response.');
      return text.trim();
    }

    const text = (await res.text()).trim();
    if (!text) throw new Error('AI proxy returned empty response.');
    return text;
  },
};

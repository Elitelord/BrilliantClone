import { defaultModelForProvider, resolveOpenAiApiKey } from './config';
import type { AiProvider, GenerateContentRequest } from './types';

const OPENAI_API_BASE = 'https://api.openai.com/v1/chat/completions';

export const openaiProvider: AiProvider = {
  id: 'openai',
  label: 'OpenAI Chat Completions API',
  isConfigured: () => !!resolveOpenAiApiKey(),
  async generateContent(req: GenerateContentRequest): Promise<string> {
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set.');

    const model = req.model ?? defaultModelForProvider('openai');
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    let systemText = req.systemInstruction ?? '';
    if (req.responseSchema) {
      systemText = [systemText, 'You must respond with valid JSON only — no markdown fences or prose.']
        .filter(Boolean)
        .join('\n\n');
    }
    if (systemText) messages.push({ role: 'system', content: systemText });
    messages.push({ role: 'user', content: req.prompt });

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: req.temperature ?? 0.4,
      max_tokens: req.maxOutputTokens ?? 1024,
    };
    if (req.responseSchema) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(OPENAI_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${detail}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenAI API returned empty response.');
    return text;
  },
};

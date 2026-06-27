// Thin, safe wrappers over the configured AI provider. Every call:
//  - returns null when AI is disabled or errors (callers MUST have a fallback),
//  - is time-boxed so a slow/hung model never blocks the learner,
//  - never throws into the UI.
import type { Schema } from 'firebase/ai';
import { parseAiJson } from './parseJson';
import { isAiEnabled, executeGenerateContent } from './provider';
import { defaultModelForProvider, resolveAiProviderId } from './provider/config';

const DEFAULT_TIMEOUT_MS = 12_000;

/** When the primary openai model is unavailable, retry once with this. */
const OPENAI_FALLBACK_MODEL = 'gpt-4o-mini';

interface GenerateOpts {
  /** Steers tone/role; grounded, subject-specific instructions live here. */
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  model?: string;
  /** Required JSON keys — appended to the prompt for providers without schema enforcement. */
  jsonKeyHint?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), ms),
    ),
  ]);
}

function isQuotaError(err: unknown): boolean {
  const msg = String(err);
  return msg.includes('429') || msg.includes('quota') || msg.includes('Quota exceeded');
}

function isTransientError(err: unknown): boolean {
  const msg = String(err);
  return (
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('timed out')
  );
}

/**
 * True when a request failed because the requested model is unavailable/inaccessible
 * (e.g. gpt-4o not enabled on this key) — distinct from quota (429) or transient 5xx.
 */
function isModelAccessError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('model_not_found') ||
    msg.includes('does not exist') ||
    msg.includes('do not have access to model') ||
    msg.includes('does not have access to model')
  );
}

function retryDelayMs(err: unknown, attempt: number): number {
  const msg = String(err);
  const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000);
  return attempt * 1500;
}

async function generateWithRetry(
  prompt: string,
  opts: GenerateOpts,
  responseSchema: Schema | undefined,
  parse: (text: string) => unknown,
): Promise<unknown | null> {
  if (!isAiEnabled) return null;

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = 2;
  const fullPrompt = opts.jsonKeyHint
    ? `${prompt}\n\nReturn JSON only (no markdown) with these keys: ${opts.jsonKeyHint}`
    : prompt;

  const providerId = resolveAiProviderId();
  let model = opts.model ?? defaultModelForProvider(providerId);
  let triedModelFallback = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const text = await withTimeout(
        executeGenerateContent({
          prompt: fullPrompt,
          systemInstruction: opts.systemInstruction,
          temperature: opts.temperature,
          maxOutputTokens: opts.maxOutputTokens,
          model,
          responseSchema,
          jsonKeyHint: opts.jsonKeyHint,
        }),
        timeoutMs,
      );
      return parse(text);
    } catch (err) {
      // Primary openai model unavailable → retry the same request once on gpt-4o-mini.
      if (
        providerId === 'openai' &&
        !triedModelFallback &&
        model !== OPENAI_FALLBACK_MODEL &&
        isModelAccessError(err)
      ) {
        console.warn(
          `AI model "${model}" unavailable; falling back to ${OPENAI_FALLBACK_MODEL}.`,
          err,
        );
        triedModelFallback = true;
        model = OPENAI_FALLBACK_MODEL;
        attempt--; // the fallback switch shouldn't consume a transient-retry attempt
        continue;
      }
      if (isQuotaError(err)) {
        console.warn('AI quota/rate limit hit; skipping retries.', err);
        return null;
      }
      const retry = attempt < maxAttempts && isTransientError(err);
      if (!retry) {
        console.warn('AI generation failed; falling back.', err);
        return null;
      }
      await new Promise((r) => setTimeout(r, retryDelayMs(err, attempt)));
    }
  }
  return null;
}

/** Free-form text generation. Returns null on disabled/error/timeout. */
export async function generateText(
  prompt: string,
  opts: GenerateOpts = {},
): Promise<string | null> {
  const text = await generateWithRetry(prompt, opts, undefined, (t) => t);
  return (text as string | null) || null;
}

/**
 * Structured JSON generation. Enforces a response schema when the provider supports it.
 * Returns null on disabled/error/timeout/parse failure.
 */
export async function generateJson<T>(
  prompt: string,
  schema: Schema,
  opts: GenerateOpts = {},
): Promise<T | null> {
  const parsed = await generateWithRetry(
    prompt,
    { ...opts, temperature: opts.temperature ?? 0.4, maxOutputTokens: opts.maxOutputTokens ?? 1024 },
    schema,
    (t) => {
      try {
        return parseAiJson(t) as T;
      } catch (err) {
        console.warn('AI JSON parse failed; falling back.', err, t.slice(0, 240));
        throw err;
      }
    },
  );
  return (parsed as T | null) ?? null;
}

import { generateText } from '../generate';
import { TUTOR_SYSTEM_INSTRUCTION, stringifyContext, type StepContext } from '../context';
import { hintLeaksAnswer } from '../hintGuard';
import { normalizeHintResponse, parseAiJson } from '../parseJson';
import type { Step } from '../../../types/content';

const NUDGE_TASK = [
  'The learner just answered incorrectly. In 1-2 sentences, explain what is off about THEIR specific attempt.',
  'Use the validator outcome and what they set, selected, or dragged — be concrete about their mistake.',
  'Nudge them toward the right concept without stating the correct answer, stage number, option label, or target values.',
  'Reply with plain text only — not JSON.',
].join(' ');

function coerceNudgeText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return trimmed;
  try {
    const normalized = normalizeHintResponse(parseAiJson(trimmed));
    if (normalized && !normalized.givesAwayAnswer) return normalized.hint;
  } catch {
    /* use raw text */
  }
  return trimmed;
}

/** Tailored post-wrong nudge grounded in learner state + validator outcome. */
export async function getWrongAnswerNudge(ctx: StepContext, step: Step): Promise<string | null> {
  if (!ctx.result || ctx.result.correct) return null;

  const prompt = [
    NUDGE_TASK,
    '',
    ctx.humanSummary,
    ctx.result.outcome ? `Validator outcome: ${ctx.result.outcome}` : '',
    ctx.result.detail ? `Per-part detail: ${JSON.stringify(ctx.result.detail)}` : '',
    '',
    'Structured state (for grounding only):',
    stringifyContext(ctx),
  ]
    .filter(Boolean)
    .join('\n');

  const text = await generateText(prompt, {
    systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
    temperature: 0.4,
    maxOutputTokens: 220,
  });

  if (!text?.trim()) return null;
  const nudge = coerceNudgeText(text);
  if (hintLeaksAnswer(nudge, step, 'post-wrong')) return null;
  return nudge;
}

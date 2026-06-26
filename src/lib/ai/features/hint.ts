import { generateJson } from '../generate';
import { TUTOR_SYSTEM_INSTRUCTION, stringifyContext, type StepContext } from '../context';
import { normalizeHintResponse } from '../parseJson';
import { hintResponseSchema } from '../schema';
import { hintLeaksAnswer, safeAuthoredHint } from '../hintGuard';
import type { Step } from '../../../types/content';

const HINT_TASK = [
  'Give ONE short hint (1-2 sentences) that nudges the learner toward the right approach.',
  'Do NOT state or strongly imply the correct answer, stage number, option label, target values, or what to set/drag/select.',
  'Focus on which concept to think about — never tell them the solution.',
  'Set givesAwayAnswer to true if your hint would let them pick the answer without thinking.',
].join(' ');

async function tryHint(ctx: StepContext, step: Step): Promise<string | null> {
  const prompt = [
    HINT_TASK,
    '',
    'Lesson context:',
    ctx.humanSummary,
    '',
    'Structured state (for grounding only — do not quote numbers from the answer):',
    stringifyContext(ctx),
  ].join('\n');

  const raw = await generateJson<unknown>(prompt, hintResponseSchema, {
    systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
    temperature: 0.4,
    maxOutputTokens: 200,
    jsonKeyHint: '"hint" (string), "givesAwayAnswer" (boolean)',
  });

  const res = normalizeHintResponse(raw);
  if (!res?.hint) return null;
  if (res.givesAwayAnswer) return null;
  if (hintLeaksAnswer(res.hint, step)) return null;
  return res.hint;
}

/** Returns a safe hint or null if none can be generated without giving away the answer. */
export async function getHint(ctx: StepContext, step: Step): Promise<string | null> {
  const hint = await tryHint(ctx, step);
  if (hint) return hint;
  return safeAuthoredHint(step);
}

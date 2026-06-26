// Grounding layer. Every AI feature is built ON TOP of the lesson's STRUCTURED
// STATE, never raw page text.
import type {
  Step,
  Answer,
  InteractionType,
  StepKind,
  ValidationResult,
} from '../../types/content';
import type { InteractionState } from '../../types/interaction';
import { describeInteraction } from './describeInteraction';

export const SUBJECT = 'AP Human Geography';
export const COURSE = 'The Demographic Transition Model (DTM)';

export const TUTOR_SYSTEM_INSTRUCTION = [
  `You are a patient tutor for ${SUBJECT}, teaching ${COURSE}.`,
  'The learner is ~14-15 years old studying for the AP exam. Be concise, concrete, and encouraging.',
  'Ground everything in the structured lesson state you are given.',
  'Never invent facts about the model. Use real DTM concepts: the 5 stages, crude birth rate (CBR), crude death rate (CDR), natural increase (NIR = CBR - CDR), and population pyramids.',
  'Avoid jargon the learner has not met yet. Keep responses to 1-3 short sentences unless asked otherwise.',
].join(' ');

export interface StepContext {
  subject: string;
  course: string;
  lesson?: { title?: string; concept?: string };
  /** Plain-language summary of what the step asks and what the learner did. */
  humanSummary: string;
  step: {
    id: string;
    kind: StepKind;
    prompt: string;
    concept?: string;
    concepts?: string[];
    difficulty?: number;
  };
  interaction: { type: InteractionType; config: unknown };
  answer?: Answer;
  learnerState?: InteractionState | null;
  result?: { correct: boolean; outcome?: string; detail?: Record<string, boolean> };
}

interface BuildOpts {
  lessonTitle?: string;
  lessonConcept?: string;
  learnerState?: InteractionState | null;
  result?: ValidationResult | null;
  includeAnswer?: boolean;
}

export function buildStepContext(step: Step, opts: BuildOpts = {}): StepContext {
  const includeAnswer = opts.includeAnswer ?? true;
  const learnerState = opts.learnerState ?? undefined;
  return {
    subject: SUBJECT,
    course: COURSE,
    humanSummary: describeInteraction(step, learnerState ?? null, includeAnswer),
    lesson:
      opts.lessonTitle || opts.lessonConcept
        ? { title: opts.lessonTitle, concept: opts.lessonConcept }
        : undefined,
    step: {
      id: step.id,
      kind: step.kind,
      prompt: step.prompt,
      concept: step.concept,
      concepts: step.concepts,
      difficulty: step.difficulty,
    },
    interaction: { type: step.interaction.type, config: step.interaction.config },
    answer: includeAnswer ? step.answer : undefined,
    learnerState,
    result: opts.result
      ? { correct: opts.result.correct, outcome: opts.result.outcome, detail: opts.result.detail }
      : undefined,
  };
}

export function stringifyContext(ctx: StepContext): string {
  return JSON.stringify(ctx);
}

export { describeInteraction };

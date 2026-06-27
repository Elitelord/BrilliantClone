// AI grading for open FRQ parts (describe / explain / compare). A thin, task-verb-aware
// wrapper over the existing explain-back grader — the verb instruction + stimulus are
// injected through the StepContext humanSummary (which gradeExplanation folds into its
// prompt), so the shared grader and schema are reused UNCHANGED. Returns null when AI is
// off or generation fails, so the runner falls back to self-grading.
import { gradeExplanation } from './explainBack';
import { SUBJECT, COURSE, type StepContext } from '../context';
import { partToExplainConfig, type FrqPart, type FrqTaskVerb } from '../../../types/frq';
import type { ValidationResult } from '../../../types/content';

const VERB_INSTRUCTION: Record<FrqTaskVerb, string> = {
  identify: 'The learner must name the correct answer; do not require elaboration.',
  define: 'The learner must give the correct meaning of the term.',
  describe:
    'The learner must state a relevant characteristic or observable pattern — WHAT it is, not why. Do not require causal reasoning to award the point.',
  explain:
    'The learner MUST give a cause→effect link (the HOW/WHY), not just a description. Withhold the point if they only describe a feature without explaining the mechanism.',
  compare: 'The learner must address BOTH items with a relevant similarity or difference.',
};

export async function gradeFrqPart(
  part: FrqPart,
  stimulusSummary: string,
  text: string,
): Promise<{ result: ValidationResult; feedback: string } | null> {
  const humanSummary = [
    `This is an AP Human Geography free-response part (task verb: ${part.taskVerb}). Award one point or none.`,
    VERB_INSTRUCTION[part.taskVerb],
    `Stimulus the learner is working from: ${stimulusSummary}`,
  ].join(' ');

  const ctx: StepContext = {
    subject: SUBJECT,
    course: COURSE,
    humanSummary,
    step: { id: part.id, kind: 'connect', prompt: part.prompt, concepts: part.concepts },
    interaction: { type: 'explain-back', config: {} },
  };

  return gradeExplanation(partToExplainConfig(part), ctx, text);
}

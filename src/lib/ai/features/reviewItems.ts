// AI-generated spaced-review items (Phase 3) — the "rephrase on retrieval" path.
//
// Reuses the existing skill-check pipeline (template selection, CED grounding, formula
// recompute + solver-agreement verification) by synthesizing a transient "review
// lesson" from the due concepts. This means review questions are FRESH and rephrased
// each time, yet pass the exact same verification as the end-of-lesson skill check —
// the model never teaches a wrong answer. Returns null when AI is off or nothing
// verifies, so callers fall back to authored-step replay.
import { generateSkillCheck } from './skillCheck';
import { getConcept } from '../../concepts';
import type { SkillCheckTemplate, VerifiedSkillCheckQuestion } from '../verify';
import type { Lesson, Step } from '../../../types/content';
import type { MasteryRecord } from '../../../types/progress';

/**
 * Generate verified, rephrased review questions for a set of due concepts. The synthetic
 * lesson carries the concepts' tags + CED topics so `skillCheckTemplatesForLesson` picks
 * the right templates and the prompt stays grounded in the right subunit(s).
 */
export async function generateReviewItems(
  concepts: string[],
  mastery: Record<string, MasteryRecord>,
): Promise<VerifiedSkillCheckQuestion[] | null> {
  const known = concepts.filter((c) => getConcept(c));
  if (known.length === 0) return null;

  const cedTopics = [
    ...new Set(known.map((c) => getConcept(c)!.cedTopic).filter((t): t is string => Boolean(t))),
  ];
  const labels = known.map((c) => getConcept(c)!.label);

  const steps: Step[] = known.map((conceptId, i) => ({
    id: `review-${conceptId}-${i}`,
    kind: 'solve',
    prompt: getConcept(conceptId)!.label,
    concepts: [conceptId],
    interaction: { type: 'info', config: { body: getConcept(conceptId)!.label } },
    feedback: {},
  }));

  const lesson: Lesson = {
    id: `review:${known.join(',')}`,
    courseId: 'dtm',
    title: 'Spaced review',
    concept: `Mixed review of: ${labels.join(', ')}`,
    cedTopics,
    order: 0,
    prerequisites: [],
    steps,
  };

  return generateSkillCheck(lesson, mastery);
}

/** Representative concept each computational template exercises (active Unit 2 concepts). */
const TEMPLATE_CONCEPT: Partial<Record<SkillCheckTemplate, string>> = {
  'stage-from-rates': 'dtm-stages',
  'population-trend': 'natural-increase',
  'pyramid-stage': 'pyramid-shape',
  'cause-of-death': 'cause-of-death',
  'net-migration': 'migration',
  'density-measure': 'density',
  'malthus-outcome': 'malthus',
  'doubling-time': 'natural-increase',
  'dependency-ratio': 'dependency-ratio',
  'replacement-level': 'fertility-transition',
};

/**
 * Best-guess concept a generated review question exercises, constrained to the due set
 * so mastery credit always lands on a concept the learner is actually reviewing.
 * Qualitative items (no template→concept map) fall back to the first due concept.
 */
export function attributeReviewConcept(
  template: SkillCheckTemplate,
  dueConcepts: string[],
): string {
  const mapped = TEMPLATE_CONCEPT[template];
  if (mapped && dueConcepts.includes(mapped)) return mapped;
  return dueConcepts[0] ?? mapped ?? '';
}

import type { Lesson, Step } from '../../types/content';
import type { LessonProgress } from '../../types/progress';
import { stepsNeedingReview } from '../mastery';

const PROMPT_MAX = 100;

function truncate(text: string, max = PROMPT_MAX): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function isGradableStep(step: Step): boolean {
  return step.kind !== 'explore' && step.kind !== 'learn' && step.interaction.type !== 'explain-back';
}

function struggleDetail(step: Step, progress?: LessonProgress): string | null {
  if (!progress) return null;
  const attempts = progress.attempts[step.id] ?? 0;
  const firstTry = progress.firstTryCorrect[step.id];
  if (attempts === 0 && firstTry !== false) return null;

  const note = progress.attemptNotes?.[step.id];
  const parts: string[] = [];

  if (attempts > 0) parts.push(`${attempts} wrong check${attempts === 1 ? '' : 's'}`);
  if (firstTry === false) parts.push('not correct on first try');

  if (note?.lastOutcome && step.feedback.byOutcome?.[note.lastOutcome]) {
    parts.push(`feedback: ${step.feedback.byOutcome[note.lastOutcome]}`);
  } else if (note?.lastWrongSummary) {
    parts.push(`attempt: ${note.lastWrongSummary}`);
  } else if (note?.lastOutcome) {
    parts.push(`outcome: ${note.lastOutcome}`);
  }

  return parts.join('; ');
}

/** Structured performance log for skill-check generation (not shown to the learner). */
export function buildSkillCheckLearnerContext(
  lesson: Lesson,
  progress?: LessonProgress,
): string {
  const concepts = [...new Set(lesson.steps.flatMap((s) => s.concepts ?? []))];
  const reviewIds = stepsNeedingReview(progress);
  const struggled: string[] = [];
  const solid: string[] = [];

  for (const step of lesson.steps) {
    if (!isGradableStep(step)) continue;
    const detail = struggleDetail(step, progress);
    const conceptTags = step.concepts?.length ? ` [${step.concepts.join(', ')}]` : '';
    const line = `- ${step.id} (${step.kind})${conceptTags}: "${truncate(step.prompt)}"`;
    if (detail) {
      struggled.push(`${line} — ${detail}`);
    } else if (progress?.completedStepIds.includes(step.id)) {
      solid.push(`${line} — correct on first try`);
    }
  }

  const blocks = [
    `Lesson: "${lesson.title}".`,
    `Concepts covered: ${concepts.join(', ') || 'none tagged'}.`,
    reviewIds.length
      ? `Steps with repeated mistakes (≥2 wrong): ${reviewIds.join(', ')}.`
      : 'No steps hit the repeated-mistake threshold this run.',
  ];

  if (struggled.length) {
    blocks.push('', 'Where the learner struggled:', ...struggled);
  }
  if (solid.length) {
    blocks.push('', 'Where the learner did well (first try):', ...solid);
  }
  if (!struggled.length && !solid.length) {
    blocks.push('', 'No graded step performance recorded yet.');
  }

  blocks.push(
    '',
    'Write 3 AP-exam-level MCQs (application/analysis, not recall) with extra weight on the struggled concepts/steps above. Re-test misconceptions the learner showed, using fresh real-world scenarios. Do not reuse lesson step prompts verbatim.',
  );

  return blocks.join('\n');
}

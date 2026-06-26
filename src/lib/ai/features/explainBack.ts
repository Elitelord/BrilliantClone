import { generateJson } from '../generate';
import { TUTOR_SYSTEM_INSTRUCTION, type StepContext } from '../context';
import { explainBackGradeSchema } from '../schema';
import type { ExplainBackConfig } from '../../../types/content';
import type { ValidationResult } from '../../../types/content';

export interface ExplainBackGrade {
  score: number;
  correct: boolean;
  feedback: string;
  hitPoints: string[];
  missedPoints: string[];
}

const GRADE_TASK = [
  'Grade the learner free-response against the rubric. Score 0-3:',
  '0=misses the idea, 1=touches one point, 2=covers most rubric points, 3=excellent.',
  'Set correct=true if score >= 2. Give encouraging feedback naming what they got right and what they missed.',
  'Do NOT copy the model answer verbatim. Ignore spelling/grammar.',
].join(' ');

export async function gradeExplanation(
  config: ExplainBackConfig,
  ctx: StepContext,
  learnerText: string,
): Promise<{ result: ValidationResult; feedback: string } | null> {
  const prompt = [
    GRADE_TASK,
    '',
    `Question: ${config.question}`,
    `Rubric points: ${config.rubric.map((r: string, i: number) => `${i + 1}. ${r}`).join('; ')}`,
    '',
    `Learner answer: "${learnerText.trim()}"`,
    '',
    ctx.humanSummary,
  ].join('\n');

  const grade = await generateJson<ExplainBackGrade>(prompt, explainBackGradeSchema, {
    systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
    temperature: 0.3,
    maxOutputTokens: 400,
    jsonKeyHint: '"score" (0-3), "correct" (boolean), "feedback" (string), "hitPoints" (string[]), "missedPoints" (string[])',
  });

  if (!grade) return null;

  const correct = grade.score >= 2;
  const detail: Record<string, boolean> = {};
  grade.hitPoints.forEach((p, i) => {
    detail[`hit${i}`] = true;
  });

  return {
    result: {
      correct,
      outcome: `score-${grade.score}`,
      detail,
    },
    feedback: grade.feedback,
  };
}

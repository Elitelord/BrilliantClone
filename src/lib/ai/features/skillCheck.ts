import { generateJson } from '../generate';
import { TUTOR_SYSTEM_INSTRUCTION } from '../context';
import { skillCheckBatchSchema } from '../schema';
import { buildSkillCheckLearnerContext } from '../skillCheckContext';
import {
  verifySkillCheckQuestion,
  normalizeSkillCheckScenario,
  normalizeSkillCheckTemplate,
  skillCheckVerificationFailureReason,
  type VerifiedSkillCheckQuestion,
  type RawSkillCheckQuestion,
} from '../verify';
import type { Lesson } from '../../../types/content';
import type { LessonProgress, MasteryRecord } from '../../../types/progress';
import type { McOption } from '../../../types/content';

const SKILL_CHECK_TASK = [
  'Generate exactly 3 AP Human Geography multiple-choice questions for a skill check after this lesson.',
  'Use ONLY these templates (pick variety):',
  '- stage-from-rates: scenario MUST include numeric cbr and cdr; options labeled Stage 1 through Stage 5',
  '- population-trend: scenario MUST include numeric cbr and cdr; options describe stable/growing/rapid growth/shrinking',
  '- pyramid-stage: scenario MUST include numeric stage (1-5) AND pyramidDescription; options labeled Stage 1-5',
  '- sector-dominant: scenario MUST include numeric primary, secondary, tertiary (percentages); options name dominant sector',
  '- cause-of-death: scenario MUST include numeric stage (1-5); options name infectious vs chronic causes',
  'Each question needs exactly 4 options with ids a,b,c,d and full descriptive labels (not just "A" or "B").',
  'claimedCorrectId MUST be the id (a/b/c/d) of the logically correct option.',
  'Include a one-line explanation for each.',
].join(' ');

const inflight = new Map<string, Promise<VerifiedSkillCheckQuestion[] | null>>();

function parseRatesFromPrompt(prompt: string): { cbr?: number; cdr?: number } {
  const cbrMatch = prompt.match(/\bCBR\b[^0-9]*(\d+(?:\.\d+)?)/i);
  const cdrMatch = prompt.match(/\bCDR\b[^0-9]*(\d+(?:\.\d+)?)/i);
  const birthMatch = prompt.match(/birth rate[^0-9]*(\d+(?:\.\d+)?)/i);
  const deathMatch = prompt.match(/death rate[^0-9]*(\d+(?:\.\d+)?)/i);
  return {
    cbr: cbrMatch ? parseFloat(cbrMatch[1]) : birthMatch ? parseFloat(birthMatch[1]) : undefined,
    cdr: cdrMatch ? parseFloat(cdrMatch[1]) : deathMatch ? parseFloat(deathMatch[1]) : undefined,
  };
}

function mergeScenarioFromPrompt(
  scenario: RawSkillCheckQuestion['scenario'],
  prompt: string,
): RawSkillCheckQuestion['scenario'] {
  const fromPrompt = parseRatesFromPrompt(prompt);
  return {
    ...scenario,
    cbr: scenario.cbr ?? fromPrompt.cbr,
    cdr: scenario.cdr ?? fromPrompt.cdr,
  };
}

function normalizeClaimedId(raw: unknown, options: McOption[]): string {
  if (typeof raw === 'number') return String.fromCharCode(97 + raw);
  const s = String(raw ?? '').trim();
  if (!s) return options[0]?.id ?? 'a';
  if (options.some((o) => o.id === s)) return s;
  const byLabel = options.find((o) => normLabel(o.label) === normLabel(s));
  if (byLabel) return byLabel.id;
  const letter = s.match(/^option\s*([a-d])$/i)?.[1] ?? s.match(/^([a-d])$/i)?.[1];
  if (letter) return letter.toLowerCase();
  return s;
}

function normLabel(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractQuestionList(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  for (const key of [
    'questions',
    'Questions',
    'items',
    'skillCheckQuestions',
    'skill_check_questions',
    'skillCheck',
    'skill_check',
  ]) {
    if (Array.isArray(o[key])) return o[key] as unknown[];
  }
  if (typeof o.template === 'string' || typeof o.type === 'string') return [raw];
  return null;
}

function normalizeOptionsList(raw: unknown): McOption[] {
  if (Array.isArray(raw)) {
    return raw
      .map((opt, i) => normalizeOption(opt, i))
      .filter((opt): opt is McOption => opt !== null);
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .map(([id, label], i) => normalizeOption({ id, label }, i))
      .filter((opt): opt is McOption => opt !== null);
  }
  return [];
}

function normalizeOption(raw: unknown, index: number): McOption | null {
  if (typeof raw === 'string' && raw.trim()) {
    const id = String.fromCharCode(97 + index);
    return { id, label: raw.trim() };
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const label = [o.label, o.text, o.option, o.value].find((v) => typeof v === 'string' && v.trim()) as
    | string
    | undefined;
  if (!label?.trim()) return null;
  const id =
    (typeof o.id === 'string' && o.id.trim()) ||
    (typeof o.id === 'number' ? String(o.id) : '') ||
    String.fromCharCode(97 + index);
  return { id, label: label.trim() };
}

/** Coerce OpenAI json_object batches that use alternate key names or option shapes. */
export function normalizeSkillCheckBatch(raw: unknown): RawSkillCheckQuestion[] | null {
  const list = extractQuestionList(raw);
  if (!list?.length) return null;

  const questions: RawSkillCheckQuestion[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;
    const template = normalizeSkillCheckTemplate(q.template ?? q.type ?? q.questionType);
    if (!template) continue;

    const prompt = [q.prompt, q.question, q.stem, q.text].find(
      (v) => typeof v === 'string' && v.trim(),
    ) as string | undefined;
    if (!prompt?.trim()) continue;

    const rawOptions = q.options ?? q.choices ?? q.answers ?? q.responses;
    const options = normalizeOptionsList(rawOptions);
    if (options.length < 4) continue;

    const scenarioRaw =
      q.scenario && typeof q.scenario === 'object'
        ? q.scenario
        : {
            cbr: q.cbr,
            cdr: q.cdr,
            stage: q.stage,
            primary: q.primary,
            secondary: q.secondary,
            tertiary: q.tertiary,
            pyramidDescription: q.pyramidDescription ?? q.pyramid_description,
            widths: q.widths,
          };

    const scenario = mergeScenarioFromPrompt(
      normalizeSkillCheckScenario(scenarioRaw),
      prompt.trim(),
    );

    const claimedCorrectId = normalizeClaimedId(
      q.claimedCorrectId ?? q.correctId ?? q.correct_id ?? q.answer,
      options,
    );

    const explanation = [q.explanation, q.rationale, q.reason].find(
      (v) => typeof v === 'string' && v.trim(),
    ) as string | undefined;

    questions.push({
      template,
      prompt: prompt.trim(),
      scenario,
      options: options.slice(0, 4),
      claimedCorrectId,
      explanation: explanation?.trim() ?? '',
    });
  }

  return questions.length ? questions : null;
}

function masteryWeakConcepts(mastery: Record<string, MasteryRecord>, conceptIds: string[]): string {
  const weak = conceptIds.filter((c) => (mastery[c]?.strength ?? 0) < 0.5);
  return weak.length ? `Cross-lesson weak concepts (mastery < 50%): ${weak.join(', ')}.` : '';
}

export async function generateSkillCheck(
  lesson: Lesson,
  mastery: Record<string, MasteryRecord>,
  progress?: LessonProgress,
): Promise<VerifiedSkillCheckQuestion[] | null> {
  const existing = inflight.get(lesson.id);
  if (existing) return existing;

  const promise = generateSkillCheckInner(lesson, mastery, progress);
  inflight.set(lesson.id, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(lesson.id);
  }
}

async function generateSkillCheckInner(
  lesson: Lesson,
  mastery: Record<string, MasteryRecord>,
  progress?: LessonProgress,
): Promise<VerifiedSkillCheckQuestion[] | null> {
  const concepts = [...new Set(lesson.steps.flatMap((s) => s.concepts ?? []))];
  const prompt = [
    SKILL_CHECK_TASK,
    '',
    buildSkillCheckLearnerContext(lesson, progress),
    '',
    masteryWeakConcepts(mastery, concepts),
    '',
    `Lesson concept summary: ${lesson.concept}`,
  ]
    .filter(Boolean)
    .join('\n');

  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await generateJson<unknown>(prompt, skillCheckBatchSchema, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      temperature: 0.5,
      maxOutputTokens: 4096,
      timeoutMs: 30_000,
      jsonKeyHint:
        '"questions" (array of 3 objects with template, prompt, scenario, options, claimedCorrectId, explanation)',
    });

    if (raw == null) {
      console.warn('[skill-check] AI returned no JSON.', { attempt, lessonId: lesson.id });
      continue;
    }

    const normalized = normalizeSkillCheckBatch(raw);
    if (!normalized?.length) {
      console.warn('[skill-check] AI batch missing or unparseable.', {
        attempt,
        lessonId: lesson.id,
        rawType: Array.isArray(raw) ? 'array' : typeof raw,
        rawKeys: raw && typeof raw === 'object' ? Object.keys(raw as object) : [],
      });
      continue;
    }

    const verified = normalized
      .map((q) => verifySkillCheckQuestion(q))
      .filter((q): q is VerifiedSkillCheckQuestion => q !== null);

    if (verified.length < normalized.length) {
      console.warn('[skill-check] Some questions failed DTM verification.', {
        attempt,
        lessonId: lesson.id,
        received: normalized.length,
        verified: verified.length,
        failures: normalized
          .filter((q) => !verifySkillCheckQuestion(q))
          .map((q) => ({
            template: q.template,
            reason: skillCheckVerificationFailureReason(q),
            options: q.options.map((o) => o.label),
            scenario: q.scenario,
          })),
      });
    }

    if (verified.length === 3) return verified;
    if (verified.length >= 2) {
      console.warn('[skill-check] Using partial batch.', { lessonId: lesson.id, count: verified.length });
      return verified;
    }
  }

  console.warn('[skill-check] Could not produce 3 verified questions; skipping.', { lessonId: lesson.id });
  return null;
}

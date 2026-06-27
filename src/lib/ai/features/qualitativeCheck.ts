// Qualitative (reasoning) skill-check questions.
//
// Unlike the computational templates in verify.ts — whose answers are recomputed
// from a numeric scenario — these are genuine AP-style reasoning items with no
// formula to recompute. They are trusted via INDEPENDENT-SOLVER AGREEMENT: after
// the writer model produces a question + its claimed answer, two independent
// "cold solvers" answer the question blind (seeing only the stem + options, never
// the claimed key or explanation). A question ships only if BOTH solvers pick the
// claimed answer and neither flags ambiguity. This is consensus, not proof, so the
// skill-check mix always keeps at least one formula-verified computational item.
import { generateJson } from '../generate';
import { qualitativeCheckBatchSchema, solverAnswerSchema } from '../schema';
import { buildSkillCheckLearnerContext } from '../skillCheckContext';
import { cedTopicsText } from '../../ced/unit2';
import type { VerifiedSkillCheckQuestion } from '../verify';
import type { Lesson, McOption } from '../../../types/content';
import type { LessonProgress } from '../../../types/progress';

export interface RawQualitativeQuestion {
  cedTopic: string;
  prompt: string;
  options: McOption[];
  claimedCorrectId: string;
  explanation: string;
}

export interface SolverAnswer {
  chosenId: string;
  reasoning: string;
  ambiguous: boolean;
}

const LETTERS = ['a', 'b', 'c', 'd'];

const QUALITATIVE_SYSTEM_INSTRUCTION = [
  'You are an experienced AP Human Geography exam item writer creating stimulus-based multiple-choice questions for Unit 2: Population & Migration, scoped to the specific CED subunit(s) named in the prompt.',
  'Write QUALITATIVE reasoning questions at genuine AP exam difficulty — application, analysis, cause/effect, comparison, or evaluation. Never bare recall.',
  'Mirror College Board style: a concrete real-world stimulus (a named or described country, region, or scenario) and an AP command term ("which of the following BEST explains", "is most strongly supported by", "would most likely result in").',
  'Exactly ONE option must be defensibly correct; the other three must each encode a specific, common student misconception — never an obvious throwaway.',
  'Output strictly valid JSON. Do not reveal the answer anywhere except claimedCorrectId and the explanation.',
].join(' ');

function qualitativeTask(count: number): string {
  return [
    `Generate exactly ${count} AP-exam-level QUALITATIVE multiple-choice questions for a post-lesson skill check.`,
    '',
    'REQUIREMENTS (every question):',
    '- Reasoning, NOT computation: do not write questions answerable by a single formula or lookup (rate→stage, doubling time, density, dependency ratio, net migration). Those are generated separately.',
    '- Use a concrete stimulus and an AP command term; reward second-order reasoning (why / implication / comparison / evaluation).',
    '- Exactly 4 options with ids a, b, c, d and full descriptive labels (never just "A"); exactly one defensibly correct, three misconception-based distractors.',
    '- Set cedTopic to the CED topic code the question assesses (e.g. "2.6").',
    '- claimedCorrectId MUST be the id of the single best option. Keep the explanation to one sharp sentence naming the principle.',
  ].join('\n');
}

const QUALITATIVE_DIRECTIVE =
  'Weight the questions toward the struggled concepts/steps above, re-testing the misconceptions the learner showed with fresh real-world scenarios. Do not reuse lesson step prompts verbatim.';

// Two distinct framings so the blind solves are genuinely independent, not echoes.
const SOLVER_SYSTEM_A =
  'You are a top AP Human Geography student taking the exam. Read the question carefully and choose the single best answer based only on the geography. Be decisive.';
const SOLVER_SYSTEM_B =
  'You are an AP Human Geography teacher answering a multiple-choice item. Eliminate the distractors methodically, then select the one best-supported option. Flag genuine ambiguity honestly.';

function extractList(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  for (const key of ['questions', 'Questions', 'items', 'qualitativeQuestions']) {
    if (Array.isArray(o[key])) return o[key] as unknown[];
  }
  if (typeof o.prompt === 'string' || typeof o.question === 'string') return [raw];
  return null;
}

function optionLabel(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const label = [o.label, o.text, o.option, o.value].find(
      (v) => typeof v === 'string' && v.trim(),
    );
    return typeof label === 'string' ? label.trim() : null;
  }
  return null;
}

/** Map the model's claimed answer (letter, index, original id, or label) onto our a–d ids. */
function normalizeClaimed(raw: unknown, rawOptions: unknown, labels: string[]): string {
  if (typeof raw === 'number' && raw >= 0 && raw < 4) return LETTERS[raw];
  const s = String(raw ?? '').trim().toLowerCase();
  if (!s) return 'a';
  const letter = s.match(/^(?:option\s*)?([a-d])$/)?.[1];
  if (letter) return letter;
  if (Array.isArray(rawOptions)) {
    const idx = rawOptions.findIndex(
      (o) =>
        o != null &&
        typeof o === 'object' &&
        typeof (o as Record<string, unknown>).id === 'string' &&
        ((o as Record<string, unknown>).id as string).trim().toLowerCase() === s,
    );
    if (idx >= 0 && idx < 4) return LETTERS[idx];
  }
  const byLabel = labels.findIndex((l) => l.toLowerCase() === s);
  if (byLabel >= 0 && byLabel < 4) return LETTERS[byLabel];
  return 'a';
}

export function normalizeQualitativeBatch(raw: unknown): RawQualitativeQuestion[] | null {
  const list = extractList(raw);
  if (!list?.length) return null;

  const out: RawQualitativeQuestion[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;

    const prompt = [q.prompt, q.question, q.stem, q.text].find(
      (v) => typeof v === 'string' && v.trim(),
    ) as string | undefined;
    if (!prompt?.trim()) continue;

    const rawOptions = q.options ?? q.choices ?? q.answers ?? q.responses;
    const labels = Array.isArray(rawOptions)
      ? rawOptions.map(optionLabel).filter((l): l is string => Boolean(l))
      : [];
    if (labels.length < 4) continue;
    const options: McOption[] = labels.slice(0, 4).map((label, i) => ({ id: LETTERS[i], label }));

    const claimedCorrectId = normalizeClaimed(
      q.claimedCorrectId ?? q.correctId ?? q.correct_id ?? q.answer,
      rawOptions,
      labels,
    );

    const explanation = [q.explanation, q.rationale, q.reason].find(
      (v) => typeof v === 'string' && v.trim(),
    ) as string | undefined;

    out.push({
      cedTopic: typeof q.cedTopic === 'string' ? q.cedTopic.trim() : '',
      prompt: prompt.trim(),
      options,
      claimedCorrectId,
      explanation: explanation?.trim() ?? '',
    });
  }
  return out.length ? out : null;
}

export function normalizeSolverAnswer(raw: unknown): SolverAnswer | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const m = String(o.chosenId ?? o.answer ?? o.choice ?? '')
    .trim()
    .toLowerCase()
    .match(/[a-d]/);
  if (!m) return null;
  return {
    chosenId: m[0],
    reasoning: typeof o.reasoning === 'string' ? o.reasoning : '',
    ambiguous: o.ambiguous === true,
  };
}

/**
 * Pure agreement rule: a question passes only when at least `required` valid,
 * non-ambiguous solver answers all chose the claimed option. Conservative —
 * a missing/invalid solver answer counts against agreement.
 */
export function solverAgreementPasses(
  claimedId: string,
  answers: (SolverAnswer | null)[],
  required = 2,
): boolean {
  const valid = answers.filter((a): a is SolverAnswer => a != null);
  if (valid.length < required) return false;
  if (valid.some((a) => a.ambiguous)) return false;
  const agree = valid.filter((a) => a.chosenId === claimedId).length;
  return agree >= required;
}

function solverPrompt(q: RawQualitativeQuestion): string {
  const opts = q.options.map((o) => `${o.id}) ${o.label}`).join('\n');
  return [
    'Answer this AP Human Geography multiple-choice question. Choose the single BEST option.',
    '',
    q.prompt,
    '',
    opts,
    '',
    'Return the id of the best option as chosenId, one sentence of reasoning, and ambiguous=true ONLY if two or more options are equally defensible or the question is unclear.',
  ].join('\n');
}

/** Generate a pool of qualitative questions (unverified). Returns [] on failure. */
export async function generateQualitativeQuestions(
  lesson: Lesson,
  progress: LessonProgress | undefined,
  count: number,
): Promise<RawQualitativeQuestion[]> {
  const cedText = cedTopicsText(lesson.cedTopics ?? []);
  const prompt = [
    qualitativeTask(count),
    '',
    cedText
      ? `CED SUBUNIT(S) THIS LESSON COVERS — every question MUST assess one of these and must NOT drift to other units or topics:\n${cedText}`
      : '',
    '',
    buildSkillCheckLearnerContext(lesson, progress, QUALITATIVE_DIRECTIVE),
    '',
    `Lesson concept summary: ${lesson.concept}`,
  ]
    .filter(Boolean)
    .join('\n');

  const raw = await generateJson<unknown>(prompt, qualitativeCheckBatchSchema, {
    systemInstruction: QUALITATIVE_SYSTEM_INSTRUCTION,
    temperature: 0.6,
    maxOutputTokens: 4096,
    timeoutMs: 30_000,
    jsonKeyHint:
      '"questions" (array of objects with cedTopic, prompt, options[4]{id,label}, claimedCorrectId, explanation)',
  });
  if (raw == null) return [];
  return normalizeQualitativeBatch(raw) ?? [];
}

/**
 * Verify one qualitative question by two INDEPENDENT blind solves. Returns the
 * shippable question on unanimous agreement, or null (discard) otherwise.
 */
export async function verifyBySolverAgreement(
  q: RawQualitativeQuestion,
): Promise<VerifiedSkillCheckQuestion | null> {
  if (!q.prompt?.trim() || q.options.length !== 4) return null;
  if (!q.options.some((o) => o.id === q.claimedCorrectId)) return null;

  const prompt = solverPrompt(q);
  const answers = await Promise.all(
    [
      { systemInstruction: SOLVER_SYSTEM_A, temperature: 0.15 },
      { systemInstruction: SOLVER_SYSTEM_B, temperature: 0.75 },
    ].map((cfg) =>
      generateJson<unknown>(prompt, solverAnswerSchema, {
        systemInstruction: cfg.systemInstruction,
        temperature: cfg.temperature,
        maxOutputTokens: 300,
        timeoutMs: 20_000,
        jsonKeyHint: '"chosenId" (a/b/c/d), "reasoning" (string), "ambiguous" (boolean)',
      }).then(normalizeSolverAnswer),
    ),
  );

  if (!solverAgreementPasses(q.claimedCorrectId, answers, 2)) return null;

  return {
    prompt: q.prompt,
    options: q.options,
    correctId: q.claimedCorrectId,
    explanation: q.explanation || 'Review the lesson if this one surprised you.',
    template: 'qualitative',
  };
}

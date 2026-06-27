import { generateJson } from '../generate';
import { skillCheckBatchSchema } from '../schema';
import { buildSkillCheckLearnerContext } from '../skillCheckContext';
import { cedTopicsText } from '../../ced/unit2';
import { generateQualitativeQuestions, verifyBySolverAgreement } from './qualitativeCheck';
import {
  verifySkillCheckQuestion,
  normalizeSkillCheckScenario,
  normalizeSkillCheckTemplate,
  skillCheckVerificationFailureReason,
  skillCheckTemplatesForLesson,
  type VerifiedSkillCheckQuestion,
  type RawSkillCheckQuestion,
} from '../verify';
import type { Lesson } from '../../../types/content';
import type { LessonProgress, MasteryRecord } from '../../../types/progress';
import type { McOption } from '../../../types/content';

const SKILL_CHECK_SYSTEM_INSTRUCTION = [
  'You are an experienced AP Human Geography exam item writer creating stimulus-based multiple-choice questions for Unit 2: Population & Migration, scoped to the specific CED subunit(s) named in the prompt.',
  'Write at genuine AP exam difficulty: every question must require APPLICATION or ANALYSIS, never bare recall.',
  'Mirror College Board style: a concrete real-world stimulus (a named or described country/region with data), an AP command phrasing ("which of the following BEST explains", "is most strongly supported by", "would most likely result in"), and four plausible options.',
  'Distractors must be genuinely tempting — each should encode a specific, common student misconception, not an obviously wrong throwaway.',
  'Output strictly valid JSON. Do not reveal the answer anywhere except claimedCorrectId and the explanation.',
].join(' ');

const SKILL_CHECK_TASK = [
  'Generate exactly 3 AP-exam-level multiple-choice questions for a skill check after this lesson.',
  '',
  'RIGOR REQUIREMENTS (apply to every question):',
  '- The "prompt" must be an applied stimulus: situate the data in a realistic country/region with a short scenario, then ask a reasoning question. Do NOT write bare lookups like "CBR 38, CDR 20 — which stage?".',
  '- Use AP command terms (BEST explains, most strongly supported, most likely to, primarily because).',
  '- Reward second-order reasoning (cause→effect, implication, comparison), not just classification.',
  '- All 4 distractors must be plausible and target distinct misconceptions; never include filler options.',
  '- Use only the templates listed under ALLOWED TEMPLATES below, and spread your 3 questions across them; weight toward concepts the learner struggled with.',
  '- Do NOT reuse a lesson step prompt verbatim.',
  '',
  'TEMPLATES — pick the template that fits each question. The "scenario" object MUST carry the structured numbers (this is how the answer is independently verified), even though the prompt also weaves them into prose:',
  '- stage-from-rates: scenario MUST include numeric cbr and cdr; one option per relevant DTM stage, labels MUST contain "Stage 1".."Stage 5".',
  '- population-trend: scenario MUST include numeric cbr and cdr; option labels MUST clearly read as stable / growing / rapid growth / shrinking.',
  '- pyramid-stage: scenario MUST include numeric stage (1-5) AND a vivid pyramidDescription; option labels MUST contain "Stage 1".."Stage 5".',
  '- sector-dominant: scenario MUST include numeric primary, secondary, tertiary percentages; option labels MUST name the dominant sector (primary/secondary/tertiary).',
  '- cause-of-death: scenario MUST include numeric stage (1-5); option labels MUST name infectious/communicable vs chronic/degenerative causes.',
  '- net-migration: scenario MUST include numeric cbr, cdr, and netMigration (net migration rate per 1,000, negative for net emigration); option labels MUST read as stable / growing / rapid growth / shrinking. Test how migration flips a country\'s overall population change versus its natural increase.',
  '- density-measure: scenario MUST use ABSOLUTE counts in consistent units — population (number of people), totalLand and arableLand (km²), farmers (number of people) — plus densityType ("arithmetic" | "physiological" | "agricultural"). The 4 option labels MUST be numeric "≈ N per km²" values, and one of them MUST equal the chosen density computed as people ÷ km² (arithmetic = population÷totalLand, physiological = population÷arableLand, agricultural = farmers÷arableLand). Test why physiological/agricultural density reveals pressure that arithmetic density hides.',
  '- malthus-outcome: scenario MUST include numeric pop0, food0, growthRate (population % per year), foodSlope (food units added per year), and horizon (years); option labels MUST clearly read as a Malthusian crisis/catastrophe vs a catastrophe averted/food keeps pace. Test whether exponential population outruns linear food.',
  '- doubling-time: scenario MUST include numeric cbr and cdr with cbr > cdr (so NIR is positive). The 4 option labels MUST be numeric "≈ N years"; one MUST equal the Rule-of-70 doubling time = 70 ÷ ((cbr - cdr) / 10). Make the other three clearly different (e.g. the NIR value itself as years, or half/double the true time). Test the Rule of 70.',
  '- dependency-ratio: scenario MUST include numeric youth (aged 0–14), working (aged 15–64), and elderly (aged 65+) population counts in consistent units. Each of the 4 option labels MUST contain exactly ONE number — the total dependency ratio, e.g. "≈ 72" (read as dependents per 100 working-age); one MUST equal (youth + elderly) ÷ working × 100, the other three clearly different. Do not put a second number (like "100") in a label.',
  '- replacement-level: scenario MUST include a numeric tfr. The 4 option labels MUST clearly read as long-run trajectories: shrinking / stable / growing / rapid growth. The correct one follows from TFR vs replacement (≈ 2.1): clearly below → shrinking, about 2.1 → stable, clearly above → growing (ignore migration and momentum). Test replacement-level fertility reasoning.',
  '',
  'FORMAT: exactly 4 options per question with ids a,b,c,d and full descriptive labels (never just "A"). claimedCorrectId MUST be the id of the logically correct option. Keep the explanation to one sharp sentence that names the principle, not just the answer.',
  '',
  'EXAMPLE of the rigor and exact shape expected (do not copy its content):',
  JSON.stringify({
    template: 'stage-from-rates',
    prompt:
      'Country X has invested heavily in vaccination and clean water over two decades. Its crude death rate has fallen to 9 per 1,000 while its crude birth rate remains high at 36 per 1,000. Which DTM stage BEST characterizes Country X, and why?',
    scenario: { cbr: 36, cdr: 9 },
    options: [
      { id: 'a', label: 'Stage 1 — births and deaths are both high and roughly balanced' },
      { id: 'b', label: 'Stage 2 — deaths have dropped sharply while births stay high, so the gap widens' },
      { id: 'c', label: 'Stage 4 — births and deaths are both low and nearly equal' },
      { id: 'd', label: 'Stage 5 — deaths exceed births and the population declines' },
    ],
    claimedCorrectId: 'b',
    explanation:
      'A collapsing death rate alongside a still-high birth rate is the signature widening gap of Stage 2.',
  }),
].join('\n');

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

const TOTAL_QUESTIONS = 3;
const TARGET_QUALITATIVE = 2;
/** Generate a few extra qualitative candidates so enough survive the agreement gate. */
const QUALITATIVE_POOL = 4;

/**
 * Assemble the skill-check mix: take up to `targetQualitative` agreement-verified
 * questions, fill the rest with formula-verified computational ones, then backfill
 * from whichever pool still has spares. Pure and order-stable (easy to unit-test).
 */
export function selectSkillCheckMix(
  computational: VerifiedSkillCheckQuestion[],
  qualitative: VerifiedSkillCheckQuestion[],
  opts: { total?: number; targetQualitative?: number } = {},
): VerifiedSkillCheckQuestion[] {
  const total = opts.total ?? TOTAL_QUESTIONS;
  const targetQual = Math.min(opts.targetQualitative ?? TARGET_QUALITATIVE, total);
  const out: VerifiedSkillCheckQuestion[] = [];
  out.push(...qualitative.slice(0, targetQual));
  for (const q of computational) {
    if (out.length >= total) break;
    out.push(q);
  }
  for (const q of qualitative.slice(targetQual)) {
    if (out.length >= total) break;
    out.push(q);
  }
  return out.slice(0, total);
}

async function generateSkillCheckInner(
  lesson: Lesson,
  mastery: Record<string, MasteryRecord>,
  progress?: LessonProgress,
): Promise<VerifiedSkillCheckQuestion[] | null> {
  // Computational (formula-verified) and qualitative (agreement-verified)
  // generation run concurrently to stay within the time budget.
  const [computational, qualitative] = await Promise.all([
    generateComputationalQuestions(lesson, mastery, progress),
    generateVerifiedQualitative(lesson, progress),
  ]);

  const mix = selectSkillCheckMix(computational, qualitative);

  if (mix.length === 0) {
    console.warn('[skill-check] No verified questions; skipping.', { lessonId: lesson.id });
    return null;
  }
  if (mix.length < TOTAL_QUESTIONS) {
    console.warn('[skill-check] Shipping a short skill check.', {
      lessonId: lesson.id,
      count: mix.length,
      computational: computational.length,
      qualitative: qualitative.length,
    });
  }
  return mix;
}

/** Generate a pool of qualitative candidates and keep those that pass solver agreement. */
async function generateVerifiedQualitative(
  lesson: Lesson,
  progress?: LessonProgress,
): Promise<VerifiedSkillCheckQuestion[]> {
  const candidates = await generateQualitativeQuestions(lesson, progress, QUALITATIVE_POOL);
  if (!candidates.length) return [];
  const verified = await Promise.all(candidates.map((q) => verifyBySolverAgreement(q)));
  const passed = verified.filter((q): q is VerifiedSkillCheckQuestion => q !== null);
  if (passed.length < candidates.length) {
    console.warn('[skill-check] Some qualitative questions failed solver agreement.', {
      lessonId: lesson.id,
      candidates: candidates.length,
      passed: passed.length,
    });
  }
  return passed;
}

/** Generate + formula-verify computational questions. Returns the best verified set (may be empty). */
async function generateComputationalQuestions(
  lesson: Lesson,
  mastery: Record<string, MasteryRecord>,
  progress?: LessonProgress,
): Promise<VerifiedSkillCheckQuestion[]> {
  const concepts = [...new Set(lesson.steps.flatMap((s) => s.concepts ?? []))];
  const allowedTemplates = skillCheckTemplatesForLesson(lesson);
  const cedText = cedTopicsText(lesson.cedTopics ?? []);
  const cedBlock = cedText
    ? `CED SUBUNIT(S) THIS LESSON COVERS — every question MUST assess one of these and must NOT drift to other units or topics:\n${cedText}`
    : '';
  const prompt = [
    SKILL_CHECK_TASK,
    '',
    cedBlock,
    '',
    `ALLOWED TEMPLATES for this lesson (use ONLY these): ${allowedTemplates.join(', ')}.`,
    '',
    buildSkillCheckLearnerContext(lesson, progress),
    '',
    masteryWeakConcepts(mastery, concepts),
    '',
    `Lesson concept summary: ${lesson.concept}`,
  ]
    .filter(Boolean)
    .join('\n');

  let best: VerifiedSkillCheckQuestion[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await generateJson<unknown>(prompt, skillCheckBatchSchema, {
      systemInstruction: SKILL_CHECK_SYSTEM_INSTRUCTION,
      temperature: 0.4,
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
      console.warn('[skill-check] Some computational questions failed verification.', {
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

    if (verified.length > best.length) best = verified;
    if (best.length >= 2) break; // enough for the mix + a fallback spare
  }

  return best;
}

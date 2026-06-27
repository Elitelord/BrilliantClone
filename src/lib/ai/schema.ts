import { Schema } from 'firebase/ai';

export const hintResponseSchema = Schema.object({
  properties: {
    hint: Schema.string({ description: 'A short nudge toward the concept, never the answer.' }),
    givesAwayAnswer: Schema.boolean({
      description: 'True if the hint reveals or strongly implies the correct answer.',
    }),
  },
});

export const explainBackGradeSchema = Schema.object({
  properties: {
    score: Schema.integer({ description: '0=none, 1=partial, 2=good, 3=excellent' }),
    correct: Schema.boolean(),
    feedback: Schema.string(),
    hitPoints: Schema.array({ items: Schema.string() }),
    missedPoints: Schema.array({ items: Schema.string() }),
  },
});

const skillCheckOptionSchema = Schema.object({
  properties: {
    id: Schema.string(),
    label: Schema.string(),
  },
});

const skillCheckScenarioSchema = Schema.object({
  properties: {
    cbr: Schema.number({ nullable: true }),
    cdr: Schema.number({ nullable: true }),
    stage: Schema.number({ nullable: true }),
    primary: Schema.number({ nullable: true }),
    secondary: Schema.number({ nullable: true }),
    tertiary: Schema.number({ nullable: true }),
    pyramidDescription: Schema.string({ nullable: true }),
    // net-migration
    netMigration: Schema.number({ nullable: true }),
    // density-measure
    population: Schema.number({ nullable: true }),
    totalLand: Schema.number({ nullable: true }),
    arableLand: Schema.number({ nullable: true }),
    farmers: Schema.number({ nullable: true }),
    densityType: Schema.string({ nullable: true }),
    // malthus-outcome
    pop0: Schema.number({ nullable: true }),
    food0: Schema.number({ nullable: true }),
    growthRate: Schema.number({ nullable: true }),
    foodSlope: Schema.number({ nullable: true }),
    horizon: Schema.number({ nullable: true }),
    // dependency-ratio
    youth: Schema.number({ nullable: true }),
    working: Schema.number({ nullable: true }),
    elderly: Schema.number({ nullable: true }),
    // replacement-level
    tfr: Schema.number({ nullable: true }),
  },
  optionalProperties: [
    'cbr',
    'cdr',
    'stage',
    'primary',
    'secondary',
    'tertiary',
    'pyramidDescription',
    'netMigration',
    'population',
    'totalLand',
    'arableLand',
    'farmers',
    'densityType',
    'pop0',
    'food0',
    'growthRate',
    'foodSlope',
    'horizon',
    'youth',
    'working',
    'elderly',
    'tfr',
  ],
});

const skillCheckQuestionSchema = Schema.object({
  properties: {
    template: Schema.enumString({
      enum: [
        'stage-from-rates',
        'population-trend',
        'pyramid-stage',
        'sector-dominant',
        'cause-of-death',
        'net-migration',
        'density-measure',
        'malthus-outcome',
        'doubling-time',
        'dependency-ratio',
        'replacement-level',
      ],
    }),
    prompt: Schema.string(),
    scenario: skillCheckScenarioSchema,
    options: Schema.array({ items: skillCheckOptionSchema, minItems: 4, maxItems: 4 }),
    claimedCorrectId: Schema.string(),
    explanation: Schema.string(),
  },
});

export const skillCheckBatchSchema = Schema.object({
  properties: {
    questions: Schema.array({ items: skillCheckQuestionSchema, minItems: 3, maxItems: 3 }),
  },
});

// ---- Qualitative (reasoning) skill-check questions ------------------------
// No numeric scenario: these are trusted via independent-solver agreement
// rather than deterministic recompute.
const qualitativeQuestionSchema = Schema.object({
  properties: {
    cedTopic: Schema.string({ description: 'CED topic code this question assesses, e.g. "2.6".' }),
    prompt: Schema.string(),
    options: Schema.array({ items: skillCheckOptionSchema, minItems: 4, maxItems: 4 }),
    claimedCorrectId: Schema.string(),
    explanation: Schema.string(),
  },
});

export const qualitativeCheckBatchSchema = Schema.object({
  properties: {
    questions: Schema.array({ items: qualitativeQuestionSchema, minItems: 1, maxItems: 6 }),
  },
});

/** A single blind solver's answer to one question — the independent verifier. */
export const solverAnswerSchema = Schema.object({
  properties: {
    chosenId: Schema.string({ description: 'The id (a, b, c, or d) of the single best option.' }),
    reasoning: Schema.string({ description: 'One sentence justifying the choice.' }),
    ambiguous: Schema.boolean({
      description: 'True ONLY if two or more options are equally defensible, or the question is unclear.',
    }),
  },
});

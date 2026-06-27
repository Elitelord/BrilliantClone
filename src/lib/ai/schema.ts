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

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
  },
  optionalProperties: ['cbr', 'cdr', 'stage', 'primary', 'secondary', 'tertiary', 'pyramidDescription'],
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

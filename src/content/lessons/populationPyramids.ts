import type { Lesson } from '../../types/content';

// Lesson 2 — a population pyramid's shape reveals a country's DTM stage.
export const populationPyramids: Lesson = {
  id: 'population-pyramids',
  courseId: 'dtm',
  title: 'Reading Population Pyramids',
  subtitle: 'How a country\'s shape tells its story',
  concept: 'A population pyramid\'s shape reveals its DTM stage: wide base = high births, column = stable, top-heavy = decline.',
  order: 2,
  prerequisites: ['dtm-engine'],
  steps: [
    {
      id: 'setup',
      kind: 'learn',
      prompt: 'What is a population pyramid?',
      concept:
        'Each bar is an age group — male on the left, female on the right. The width at each level shows how many people are that age.',
      interaction: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          illustrate: true,
          initialWidths: [0.82, 0.68, 0.48, 0.32],
          caption:
            'A population pyramid stacks age groups from youngest at the bottom to oldest at the top. Each bar\'s width shows how many people are that age — male on the left, female on the right.',
        },
      },
      feedback: {
        onExplore: 'Next: reshape a pyramid and match it to a DTM stage.',
      },
    },
    {
      id: 'explore-shape',
      kind: 'explore',
      prompt: 'Drag the targets around to reshape the pyramid.',
      concept:
        'Wide base → high births (Stage 2). Narrowing triangle → births falling (Stage 3). Even column → stable (Stage 4). Top-heavy → aging decline (Stage 5). Stage 1 stays wide at every age.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 1,
      interaction: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          initialWidths: [0.5, 0.45, 0.4, 0.38],
          showStagePicker: true,
          showStagePresets: true,
        },
      },
      feedback: {
        onExplore:
          'The pyramid shape mirrors the rate curves — wide base when births dominate, column when both rates are low, inverted when the elderly outnumber children.',
      },
    },
    {
      id: 'learn-lifespan',
      kind: 'learn',
      prompt: 'Why does the top of the pyramid empty out?',
      concept:
        'High crude death rates mean shorter expected lifespan — fewer people survive to old age, so the upper bars stay thin.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      interaction: {
        type: 'info',
        config: {
          icon: '⏳',
          body:
            'When crude death rates are high, people die younger. Fewer survive to old age, so the pyramid\'s top stays thin. As death rates fall and lifespan lengthens, more people reach older ages and the upper bars fill out.',
          points: ['Longer lifespan → fuller bars at the top.'],
        },
      },
      reference: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          initialWidths: [0.96, 0.48, 0.10, 0.06],
        },
      },
      feedback: {
        onExplore: 'Next: connect birth rates to a wide pyramid base.',
      },
    },
    {
      id: 'predict-wide-base',
      kind: 'predict',
      prompt:
        'This pyramid has a very wide base. Set birth and death rates that would produce lots of young children.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 1,
      reference: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          initialWidths: [0.98, 0.84, 0.38, 0.15],
        },
      },
      interaction: {
        type: 'rate-sliders',
        config: { birthRange: [5, 50], deathRange: [5, 40], initialBirth: 20, initialDeath: 15 },
      },
      answer: { birthMin: 28, gapMin: 10, deathMax: 26 },
      feedback: {
        correct: 'Right — a wide base needs high births and a strong positive NIR (not deaths outpacing births).',
        incorrect: 'Think about what rate pattern would keep the base wide.',
      },
    },
    {
      id: 'pick-stage1-pyramid',
      kind: 'predict',
      prompt: 'Which pyramid shows Stage 1 (High Stationary)? Birth and death rates are both high.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'stage1', label: 'A', pyramid: { widths: [0.96, 0.48, 0.10, 0.06] } },
            { id: 'stage2', label: 'B', pyramid: { widths: [0.95, 0.82, 0.45, 0.18] } },
            { id: 'stage3', label: 'C', pyramid: { widths: [0.58, 0.54, 0.46, 0.36] } },
            { id: 'stage4', label: 'D', pyramid: { widths: [0.40, 0.40, 0.42, 0.44] } },
          ],
        },
      },
      answer: { correctId: 'stage1' },
      feedback: {
        correct: 'Correct — birth and death rates are both high in this stage.',
        incorrect: 'Incorrect — birth and death rates are both high in this stage.',
      },
    },
    {
      id: 'solve-stage2-shape',
      kind: 'solve',
      prompt: 'Reshape the pyramid into a youthful, fast-growing country (Stage 2): give it a wide base.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'shape', initialWidths: [0.4, 0.42, 0.44, 0.45] },
      },
      answer: {
        stages: [2],
        targetWidths: [0.88, 0.76, 0.52, 0.28],
        tolerance: 0.12,
      },
      feedback: {
        correct: 'That broad triangle is the signature of a youthful Stage 2 country.',
        incorrect: 'The shape still doesn\'t match — keep adjusting the handles.',
      },
    },
    {
      id: 'classify-niger',
      kind: 'solve',
      prompt: 'This is Niger\'s population pyramid. Which DTM stage does its shape suggest?',
      concepts: ['pyramid-classify', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'classify', preset: { baseWidth: 0.92, topWidth: 0.16, label: 'Niger' } },
      },
      answer: { stages: [2] },
      feedback: {
        correct: 'Yes — that huge base means very high births: Stage 2.',
        incorrect: 'Look at the overall shape and try another stage.',
      },
    },
    {
      id: 'solve-brazil-stage3',
      kind: 'solve',
      prompt: 'Drag the pyramid to match Brazil — Stage 3.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'shape', initialWidths: [0.85, 0.5, 0.38, 0.35] },
      },
      answer: {
        stages: [3],
        targetWidths: [0.58, 0.54, 0.46, 0.36],
        tolerance: 0.12,
      },
      feedback: {
        correct: 'That narrowing triangle matches Brazil\'s transitional Stage 3 shape.',
        incorrect: 'The shape still doesn\'t match — keep adjusting the handles.',
      },
    },
    {
      id: 'classify-japan',
      kind: 'connect',
      prompt:
        'This is Japan. The youngest row (bottom) is the narrowest. Which DTM stage does this inverted shape suggest?',
      concepts: ['pyramid-classify', 'dtm-stages'],
      difficulty: 3,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'classify', preset: { baseWidth: 0.3, topWidth: 0.72, label: 'Japan' } },
      },
      answer: { stages: [5] },
      feedback: {
        correct: 'Right — more elderly than children means a shrinking, aging Stage 5 country.',
        incorrect: 'Look at the overall shape and try another stage.',
      },
    },
    {
      id: 'solve-stage4-shape',
      kind: 'solve',
      prompt: 'Reshape into a Stage 4 country pyramid.',
      concepts: ['pyramid-shape', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'shape', initialWidths: [0.8, 0.55, 0.35, 0.3] },
      },
      answer: {
        stages: [4],
        targetWidths: [0.40, 0.40, 0.42, 0.44],
        tolerance: 0.10,
      },
      feedback: {
        correct: 'A straight-sided column is the mark of a stable Stage 4 country.',
        incorrect: 'The shape still doesn\'t match — keep adjusting the handles.',
      },
    },
    {
      id: 'classify-usa',
      kind: 'connect',
      prompt: 'This is the United States. Which DTM stage does its shape suggest?',
      concepts: ['pyramid-classify', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: { mode: 'classify', preset: { baseWidth: 0.42, topWidth: 0.5, label: 'United States' } },
      },
      answer: { stages: [4] },
      feedback: {
        correct: 'Right — even bars and a steady base is the stable Stage 4 column.',
        incorrect: 'Look at the overall shape and try another stage.',
      },
    },
    {
      id: 'explain-wide-base',
      kind: 'connect',
      prompt: 'Why does a wide-based pyramid mean a high birth rate?',
      concepts: ['pyramid-shape', 'natural-increase'],
      difficulty: 2,
      interaction: {
        type: 'explain-back',
        config: {
          question: 'Explain what a wide base on a population pyramid tells you about births.',
          rubric: [
            'A wide base means many young people / children.',
            'Many children reflect a high crude birth rate.',
            'This shape is typical of Stage 2 (early expanding).',
          ],
          sampleAnswer:
            'A wide base means lots of young people were born recently, so the birth rate is high. That triangular shape is classic Stage 2, when deaths have fallen but births are still high.',
          minChars: 20,
        },
      },
      feedback: {
        correct: 'You connected pyramid shape to birth rate clearly.',
        incorrect: 'Mention the wide base, young population, and high births.',
      },
    },
  ],
};

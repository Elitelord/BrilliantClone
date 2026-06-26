import type { Lesson } from '../../types/content';

// Lesson 1 — population change is driven by the gap between birth and death
// rates. Opens with framing, real countries, then NIR, then the idealized model.
export const dtmEngine: Lesson = {
  id: 'dtm-engine',
  courseId: 'dtm',
  title: 'The Engine of Growth',
  subtitle: 'Birth rates, death rates, and the gap between them',
  concept: 'Population change = birth rate − death rate. The size of that gap drives everything.',
  order: 1,
  prerequisites: [],
  steps: [
    {
      id: 'setup',
      kind: 'learn',
      prompt: 'Two numbers drive every population.',
      interaction: {
        type: 'info',
        config: {
          icon: '🌍',
          terms: [
            { abbrev: 'CBR', name: 'Crude birth rate', curve: 'birth' },
            { abbrev: 'CDR', name: 'Crude death rate', curve: 'death' },
          ],
          body:
            'These two rates — how many people are born and how many die each year — are the engine behind every population. The Demographic Transition Model shows how both shift as a country develops.',
        },
      },
      feedback: {
        onExplore: 'Next: three real countries over time.',
      },
    },
    {
      id: 'explore-countries',
      kind: 'explore',
      prompt: 'Drag through the years and switch countries below. Watch how birth and death rates change.',
      concept:
        'Real countries don’t follow a neat curve — but the same forces appear everywhere: deaths often fall first, then births follow. Population grows fastest when births stay high while deaths drop.',
      concepts: ['natural-increase'],
      difficulty: 1,
      interaction: {
        type: 'country-model',
        config: { countryIds: ['england', 'nigeria', 'japan'], initialCountryId: 'england' },
      },
      feedback: {
        onExplore: 'Deaths fall first; births follow. The wider the gap between the lines, the faster population grows.',
      },
    },
    {
      id: 'learn-nir',
      kind: 'learn',
      prompt: 'That gap has a name.',
      interaction: {
        type: 'info',
        config: {
          formula: 'NIR = CBR − CDR',
          body:
            'The natural increase rate (NIR) is simply births minus deaths, measured per 1,000 people. When NIR is positive, more people are being born than are dying, so the population grows. When NIR is negative, deaths outnumber births and the population shrinks.',
        },
      },
      concepts: ['natural-increase'],
      feedback: {
        onExplore: 'See how NIR changes across the five-stage model.',
      },
    },
    {
      id: 'explore-model',
      kind: 'explore',
      prompt: 'The idealized model: five stages. Drag the handle across them.',
      concept:
        'The blue line is the crude birth rate (CBR) and the red line is the crude death rate (CDR). The shaded band is NIR. Geographers name the stages: High Stationary, Early Expanding, Late Expanding, Low Stationary, and Declining.',
      concepts: ['natural-increase', 'dtm-stages'],
      difficulty: 1,
      interaction: { type: 'rate-graph', config: { initialStage: 2, showPopulationBar: true, showNirCurveToggle: true } },
      feedback: {
        onExplore:
          'NIR = CBR − CDR (per 1,000). A wide gap means fast growth; when the red line crosses above the blue line, NIR turns negative and population falls.',
      },
    },
    {
      id: 'predict-stage2',
      kind: 'predict',
      prompt:
        'Death rates have fallen sharply while birth rates stay high. Set the natural increase rate you would expect.',
      concepts: ['natural-increase'],
      difficulty: 1,
      reference: {
        type: 'rate-graph',
        config: { initialStage: 2, overview: true, showGap: true, highlightStage: 2 },
      },
      interaction: {
        type: 'nir-slider',
        config: { minGap: -5, maxGap: 28, initialGap: 8, showVerdict: false },
      },
      answer: { minGap: 14, trend: 'rapid-growth' },
      feedback: {
        correct: 'Correct. Deaths fall, births stay high, and the widening gap drives rapid growth — the Early Expanding stage.',
        byOutcome: {
          stable: 'That gap is too small.',
          growing: 'Close.',
          shrinking: 'Not quite.',
        },
        hint: 'Deaths just fell — how does that change the gap if births stay high?',
      },
    },
    {
      id: 'predict-england-1800',
      kind: 'predict',
      prompt:
        'On the England tab you saw its death rate fall fast around 1800 while births stayed high. Tap the stage England was entering.',
      concepts: ['dtm-history', 'dtm-stages'],
      difficulty: 2,
      interaction: { type: 'stage-select', config: {} },
      answer: { stages: [2] },
      feedback: {
        correct: 'Correct — falling deaths with still-high births is the hallmark of Stage 2.',
        byOutcome: {
          stage1: 'Stage 1 comes before death rates fall. Here, deaths are already dropping quickly.',
          stage3: 'Stage 3 is when births finally begin to fall too — that came later for England.',
          stage4: 'Stage 4 is low-and-stable, which England only reached in the 20th century.',
          stage5: 'Stage 5 is decline — England in 1800 was growing fast, not shrinking.',
        },
        hint: 'Find the stage where the red line has dropped but the blue line is still high.',
      },
    },
    {
      id: 'solve-stable',
      kind: 'solve',
      prompt: 'Drag the handle to a stage where the population is stable — barely growing or shrinking.',
      concepts: ['natural-increase', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'rate-graph',
        config: { initialStage: 3, snap: 'stable', showPopulationBar: false, showGap: false, showStats: false },
      },
      answer: { kind: 'trend', trend: 'stable' },
      feedback: {
        correct: 'Correct — the birth and death lines nearly meet, so NIR is near zero and population holds steady.',
        byOutcome: {
          'rapid-growth': 'The gap between the lines is still too wide here.',
          growing: 'There is still a clear gap between the two lines.',
          shrinking: 'Population is declining here.',
        },
      },
    },
    {
      id: 'connect-decline',
      kind: 'connect',
      prompt: 'Drag to the stage where deaths outnumber births and the population declines.',
      concepts: ['dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'rate-graph',
        config: { initialStage: 3, snap: true, showPopulationBar: false, showGap: false, showStats: false },
      },
      answer: { kind: 'trend', trend: 'shrinking' },
      feedback: {
        correct: 'Correct — in Stage 5 the death line rises above the birth line, so NIR is negative and population falls.',
        byOutcome: {
          stable: 'The lines are too close together.',
          growing: 'Births still outnumber deaths here.',
          'rapid-growth': 'That is rapid growth, not decline.',
        },
      },
    },
    {
      id: 'connect-today',
      kind: 'connect',
      prompt:
        'Today, Japan and Italy record more deaths than births each year. Tap the stage they are in.',
      concepts: ['dtm-stages'],
      difficulty: 2,
      interaction: { type: 'stage-select', config: {} },
      answer: { stages: [5] },
      feedback: {
        correct: 'Correct — deaths exceeding births is the defining mark of Stage 5.',
        byOutcome: {
          stage2: 'That is the boom stage, with deaths far below births. These countries are shrinking, not booming.',
          stage3: 'Stage 3 is still growing, just more slowly. These countries are actually shrinking.',
          stage4: 'Stage 4 is stable, with births and deaths balanced. Here, deaths have pulled ahead.',
        },
        hint: 'Find the only stage where the red line sits above the blue line.',
      },
    },
    {
      id: 'build-death',
      kind: 'solve',
      prompt: 'Build the model yourself — start with the death rate. Drag each point to show how deaths change across the stages.',
      concepts: ['dtm-stages'],
      difficulty: 3,
      interaction: {
        type: 'curve-draw',
        config: { curves: ['death'], initial: { death: [25, 25, 25, 25, 25] } },
      },
      answer: { death: [38, 20, 10, 10, 10.5], tolerance: 4 },
      feedback: {
        correct: 'Right — deaths start high and drop fast in Stage 2, then stay low.',
      },
    },
    {
      id: 'build-birth',
      kind: 'solve',
      prompt: 'Now add the birth rate (your death curve is shown faded). Drag to show how births change across the stages.',
      concepts: ['natural-increase', 'dtm-stages'],
      difficulty: 3,
      interaction: {
        type: 'curve-draw',
        config: {
          curves: ['birth'],
          initial: { birth: [25, 25, 25, 25, 25] },
          referenceCurves: { death: [38, 20, 10, 10, 10.5] },
        },
      },
      answer: { birth: [40, 38, 24, 12, 7], tolerance: 6 },
      feedback: {
        correct: 'That is the model. Births stay high while deaths fall, then drop in Stage 3 — and the gap drives the population.',
        byOutcome: {
          'birth-early': 'Birth rates stay high longer than that.',
          off: 'Close.',
        },
        hint: 'Start high, then trace how births change across all five stages.',
      },
    },
    {
      id: 'explain-stage2-boom',
      kind: 'connect',
      prompt: 'In your own words, why does population explode in Stage 2?',
      concepts: ['natural-increase', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'explain-back',
        config: {
          question: 'Explain why population grows rapidly in Stage 2.',
          rubric: [
            'Death rates fall first (sanitation, medicine, food).',
            'Birth rates stay high for a while.',
            'The gap between births and deaths (natural increase) widens.',
          ],
          sampleAnswer:
            'In Stage 2, death rates plunge as public health improves, but birth rates stay high. The big gap between births and deaths means natural increase is large, so population grows fast.',
          placeholder: 'Think about what happens to deaths vs births in Stage 2…',
          minChars: 20,
        },
      },
      feedback: {
        correct: 'Nice — you explained the Stage 2 boom in your own words.',
        incorrect: 'Try to mention deaths falling, births staying high, and the gap between them.',
      },
    },
  ],
};

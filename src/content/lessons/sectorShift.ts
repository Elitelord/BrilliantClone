import type { Lesson } from '../../types/content';

// Lesson 3 - as a country develops through the DTM, its jobs shift from farming
// to industry to services. A third lens on the same development story.
export const sectorShift: Lesson = {
  id: 'sector-shift',
  courseId: 'dtm',
  title: 'From Farms to Factories to Offices',
  subtitle: 'How jobs move as a country develops',
  concept: 'As a country develops through the DTM, employment shifts: farming (primary) -> industry (secondary) -> services (tertiary).',
  order: 3,
  prerequisites: ['population-pyramids'],
  steps: [
    {
      id: 'explore-sectors',
      kind: 'explore',
      prompt:
        'Drag the bars to move jobs between farming, industry, and services. They always add up to 100% of workers.',
      concept:
        'Every worker is in one of three sectors: primary (farming, mining), secondary (factories, building), or tertiary (services - shops, offices, healthcare).',
      concepts: ['sector-shift'],
      difficulty: 1,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'adjust', initial: { primary: 70, secondary: 20, tertiary: 10 } },
      },
      feedback: {
        onExplore: 'Poor, early-stage countries are mostly farming. Rich, late-stage countries are mostly services.',
      },
    },
    {
      id: 'predict-stage2-sector',
      kind: 'predict',
      prompt: 'In an early-stage (Stage 2) country, most people work in which sector?',
      concept: 'Before machines and offices, almost everyone must grow food - so early economies are dominated by farming (the primary sector).',
      concepts: ['sector-shift'],
      difficulty: 1,
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'primary', label: 'Farming (primary)' },
            { id: 'secondary', label: 'Industry (secondary)' },
            { id: 'tertiary', label: 'Services (tertiary)' },
          ],
        },
      },
      answer: { correctId: 'primary' },
      feedback: {
        correct: 'Right - early economies need most people growing food, so farming dominates.',
        byOutcome: {
          secondary: 'Industry peaks in the MIDDLE of development (Stage 3), not the start.',
          tertiary: 'Services dominate only in rich, late-stage economies - not early on.',
        },
        hint: 'Before factories and offices, what must everyone do to survive?',
      },
    },
    {
      id: 'solve-stage4-sector',
      kind: 'solve',
      prompt: 'Drag the mix to match a developed Stage 4 economy, where services dominate.',
      concept: 'In rich economies, machines do the farming and much of the manufacturing, so most people work in services - the tertiary sector leads.',
      concepts: ['sector-shift', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'adjust', initial: { primary: 60, secondary: 25, tertiary: 15 } },
      },
      answer: { dominant: 'tertiary' },
      feedback: {
        correct: 'Yes - in a developed economy, services are the biggest slice by far.',
        byOutcome: {
          primary: 'That is still a farming economy (early stage). Make services the biggest slice.',
          secondary: 'That is an industrializing economy (Stage 3). Push services higher than industry.',
        },
        hint: 'Make the services (tertiary) bar the tallest.',
      },
    },
    {
      id: 'connect-sector-stage',
      kind: 'connect',
      prompt: 'A country\'s jobs are mostly services, and its births and deaths are both low. Which DTM stage is it in?',
      concept: 'A service-based economy with low births and deaths is a developed, stable country - Stage 4. The three lenses (rates, pyramid, jobs) all agree.',
      concepts: ['sector-stage-link', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'stage2', label: 'Stage 2' },
            { id: 'stage3', label: 'Stage 3' },
            { id: 'stage4', label: 'Stage 4' },
          ],
        },
      },
      answer: { correctId: 'stage4' },
      feedback: {
        correct: 'Right - service jobs plus low births and deaths all point to a developed Stage 4.',
        byOutcome: {
          stage2: 'Stage 2 is a farming economy with high births. This one is services with low births.',
          stage3: 'Stage 3 is still industrializing with falling births. This is further along - mostly services.',
        },
        hint: 'Services + low-low rates = the developed, stable stage.',
      },
    },
    {
      id: 'connect-generations',
      kind: 'connect',
      prompt:
        'Maria\'s grandparents were farmers, her parents worked in a factory, and Maria writes software. Her family\'s story mirrors a country moving through which order of sectors?',
      concept:
        'One family across three generations can trace the whole transition: primary -> secondary -> tertiary. The development story is personal, not just national.',
      concepts: ['sector-shift', 'sector-stage-link'],
      difficulty: 2,
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'p-s-t', label: 'Farming -> Industry -> Services' },
            { id: 't-s-p', label: 'Services -> Industry -> Farming' },
            { id: 's-p-t', label: 'Industry -> Farming -> Services' },
          ],
        },
      },
      answer: { correctId: 'p-s-t' },
      feedback: {
        correct: 'Exactly - farming, then factory, then services: the transition in one family.',
        byOutcome: {
          't-s-p': 'That is backwards - development moves TOWARD services, not away from them.',
          's-p-t': 'Not quite - farming comes first, before industry, not after.',
        },
        hint: 'Grandparents (oldest) started where development begins.',
      },
    },
    {
      id: 'classify-service-economy',
      kind: 'solve',
      prompt: 'Here is a country\'s job mix today: mostly services. Which DTM stage does it suggest?',
      concept: 'A heavily service-based economy is a sign of an advanced, developed country - Stage 4 (or beyond).',
      concepts: ['sector-stage-link', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'classify', preset: { primary: 3, secondary: 22, tertiary: 75, label: 'Country X' } },
      },
      answer: { stages: [4] },
      feedback: {
        correct: 'Right - an economy this service-heavy is developed: Stage 4.',
        byOutcome: {
          'stage-2': 'Stage 2 is a FARMING economy. This one is almost all services.',
          'stage-3': 'Stage 3 has lots of industry. Here services dwarf industry - it is further along.',
        },
        hint: 'Which sector is overwhelmingly the largest?',
      },
    },
  ],
};

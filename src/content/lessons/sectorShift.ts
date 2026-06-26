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
      id: 'learn-sectors',
      kind: 'learn',
      prompt: 'Every job sits in one of three sectors.',
      concept:
        'Geographers split all work into three sectors. Primary takes raw materials from the earth, secondary turns them into goods, and tertiary provides services for people.',
      concepts: ['sector-shift'],
      interaction: {
        type: 'info',
        config: {
          icon: '🏭',
          body:
            'Geographers sort every job into one of three sectors, based on what kind of work it is.',
          points: [
            'Primary: take raw materials from the earth — farming, fishing, mining',
            'Secondary: turn those raw materials into goods — factories, construction',
            'Tertiary: provide services for people — shops, hospitals, schools, offices',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: drag the bars to see how the mix shifts as a country develops.',
      },
    },
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
        config: {
          mode: 'adjust',
          initial: { primary: 70, secondary: 20, tertiary: 10 },
          showImpliedStage: true,
          showStagePresets: true,
        },
      },
      feedback: {
        onExplore:
          'Early on, almost everyone farms. Mid-development, factories grow. Late stage, machines do the farming and building — so most people serve, teach, heal, and code.',
      },
    },
    {
      id: 'learn-why-shift',
      kind: 'learn',
      prompt: 'Why do the sectors shift in this order?',
      concept:
        'The same forces that drive the DTM drive the sector shift. As farming mechanizes, freed-up workers move to cities and factories; rising incomes then demand services and draw more women into paid work, which helps births fall in Stage 3.',
      concepts: ['sector-shift', 'dtm-stages'],
      interaction: {
        type: 'info',
        config: {
          icon: '⚙️',
          body:
            'The introduction of farm machines reduced labor requirements for food production. Therefore, those workers move to cities, which also causes urbanization and increases the demand for services. At the same time, more women enter the paid workforce, leading to smaller families and lower birth rates.',
          points: [
            'Machines free farm labor → people move to cities',
            'Factories grow, then services follow as incomes rise',
            'More women in paid work → smaller families → births fall (Stage 3)',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: predict which sector dominates an early-stage country.',
      },
    },
    {
      id: 'predict-stage2-sector',
      kind: 'predict',
      prompt: 'In a Stage 1/2 country, most people work in which sector?',
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
      id: 'solve-stage3-sector',
      kind: 'solve',
      prompt: 'Drag the mix to match a Stage 3 country.',
      concepts: ['sector-shift', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'adjust', initial: { primary: 65, secondary: 20, tertiary: 15 } },
      },
      answer: { dominant: 'secondary' },
      feedback: {
        correct: 'Yes — in a Stage 3 country, factories employ the biggest share due to industrialization.',
        byOutcome: {
          primary: 'That\'s more closely aligned with a Stage 2 country (farming-led). ',
          tertiary: 'That\'s more closely aligned with a Stage 4 country (services-led).',
        },
        hint: 'Make the industry (secondary) bar the tallest.',
      },
    },
    {
      id: 'solve-stage4-sector',
      kind: 'solve',
      prompt: 'Drag the mix to match a Stage 4 country.',
      concepts: ['sector-shift', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'adjust', initial: { primary: 60, secondary: 25, tertiary: 15 } },
      },
      answer: { dominant: 'tertiary', minTertiary: 55 },
      feedback: {
        correct: 'Yes - in a Stage 4 country, services are the biggest slice by far.',
        byOutcome: {
          primary: 'That\'s more closely aligned with a Stage 2 country (farming-led). ',
          secondary: 'That\'s more closely aligned with a Stage 3 country (industry-led).',
          'tertiary-low': 'Services are usually the largest sector in a Stage 4 country.',
        },
        hint: 'Make services (tertiary) clearly the tallest — over half of all jobs.',
      },
    },
    {
      id: 'connect-generations',
      kind: 'connect',
      prompt:
        'Maria\'s family tells the whole story in three generations. Drag each job under the person who did it.',
      concept:
        'One family across three generations can trace the whole transition: primary -> secondary -> tertiary.',
      concepts: ['sector-shift', 'sector-stage-link'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          tiles: [
            { id: 'farm', label: 'Farming', image: '/img/farm.png' },
            { id: 'factory', label: 'Factory', image: '/img/factory.png' },
            { id: 'office', label: 'Office', image: '/img/office.png' },
          ],
          slots: [
            { id: 'grandparents', label: 'Maria\'s grandparents', sublabel: 'oldest generation', image: '/img/grandparents.png' },
            { id: 'parents', label: 'Maria\'s parents', sublabel: 'middle generation', image: '/img/parents.png' },
            { id: 'maria', label: 'Maria', sublabel: 'youngest generation', image: '/img/maria.png' },
          ],
        },
      },
      answer: {
        pairs: { farm: 'grandparents', factory: 'parents', office: 'maria' },
      },
      feedback: {
        correct: 'Exactly - the family would move from farming to industry to services: covering the 3 sectors.',
        incorrect: 'Not quite. Remember how the sectors shift as a country develops.',
        hint: 'The oldest generation started where development begins (farming).',
      },
    },
    {
      id: 'connect-sector-stage',
      kind: 'connect',
      prompt:
        'This country\'s jobs are mostly services. Which population pyramids could belong to it? Select every shape that fits.',
      concepts: ['sector-stage-link', 'dtm-stages'],
      difficulty: 2,
      reference: {
        type: 'sector-bars',
        config: { mode: 'adjust', initial: { primary: 8, secondary: 20, tertiary: 72 } },
      },
      interaction: {
        type: 'pyramid-pick',
        config: {
          multi: true,
          options: [{ stage: 2 }, { stage: 3 }, { stage: 4 }, { stage: 5 }],
        },
      },
      answer: { stages: [4, 5] },
      feedback: {
        correct:
          'Right — a service economy is developed, so its pyramid is a Stage 4 column or a Stage 5 aging shape: both with low births and deaths.',
        incorrect:
          'Not quite — a service-led economy is developed. Pick the narrow-base shapes (low births), not the wide-base early stages.',
        hint: 'Services dominate only after births fall. Which pyramids have narrow bases?',
      },
    },
    {
      id: 'classify-usa',
      kind: 'solve',
      prompt: 'Here is the United States\' job mix today. Which DTM stage does it suggest?',
      concepts: ['sector-stage-link', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'sector-bars',
        config: { mode: 'classify', preset: { primary: 3, secondary: 22, tertiary: 75, label: 'United States' } },
      },
      answer: { stages: [4, 5] },
      feedback: {
        correct: 'Correct, this split can suggest Stage 4 or 5. Although jobs alone can\'t tell Stage 4 from 5, the pyramid and birth rate do (the US is actually Stage 4).',
        byOutcome: {
          'stage-1': 'Stage 1 is a pre-industrial economy.',
          'stage-2': 'Stage 2 is a farming economy.',
          'stage-3': 'Stage 3 has lots of industry.',
        },
        hint: 'Which sector is overwhelmingly the largest?',
      },
    },
    {
      id: 'capstone-three-lens',
      kind: 'connect',
      prompt:
        'Which stage do these two lenses point to?',
      concepts: ['sector-stage-link', 'dtm-stages'],
      difficulty: 3,
      reference: {
        type: 'three-lens',
        config: {
          stage: 3,
          showRates: false,
          sectors: { primary: 25, secondary: 45, tertiary: 30 },
          pyramid: { widths: [0.56, 0.52, 0.44, 0.36] },
        },
      },
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
      answer: { correctId: 'stage3' },
      feedback: {
        correct: 'Exactly — industry leads the jobs and the pyramid is still narrowing: a country mid-development, Stage 3.',
        byOutcome: {
          stage2: 'Stage 2 is farming-led with a wide-base pyramid.',
          stage4: 'Stage 4 is services-led with a column pyramid.',
        },
        hint: 'Which sector is tallest — and is the pyramid still narrowing or already a column?',
      },
    },
  ],
};

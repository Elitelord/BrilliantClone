import type { Lesson } from '../../types/content';
import { ANOMALY_PYRAMIDS, ANOMALY_PYRAMIDS_BY_ID, ANOMALY_AGED, COUNTRY_ANOMALY_MATCH, STAGE_PYRAMID_COHORTS } from '../../lib/dtm';

const ANOMALY_SHAPES = ANOMALY_PYRAMIDS.filter((s) => s.id !== 'smooth');

// Lesson 4 — dependency, momentum, pyramid anomalies, and synthesis ("Reading the Shape").
export const populationStructure: Lesson = {
  id: 'population-structure',
  courseId: 'dtm',
  title: 'Reading the Shape',
  subtitle: 'Who depends, where growth is headed, and the marks events leave',
  concept:
    'A pyramid\'s shape reveals who depends on workers, whether growth has momentum, and the fingerprints wars, migration, and policy carve into age structure.',
  order: 4,
  prerequisites: ['population-pyramids'],
  steps: [
    {
      id: 'learn-age-bands',
      kind: 'learn',
      prompt: 'Not everyone in a country works.',
      concept:
        'Split the population into youth (0–14), working-age (15–64), and elderly (65+). The dependency ratio counts how many dependents each worker supports.',
      concepts: ['dependency-ratio', 'age-structure'],
      interaction: {
        type: 'info',
        config: {
          icon: '👥',
          body:
            'Children and retirees depend on working-age adults for food, schools, pensions, and care. AP Human Geography splits the burden into three ratios — all measured per 100 workers (ages 15–64).',
          points: [
            'Youth dependency = Youth (0–14) ÷ Working-age (15–64)',
            'Elderly dependency = Elderly (65+) ÷ Working-age (15–64)',
            'Total dependency = Youth + Elderly (same denominator)',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: drag a pyramid and watch the bands and ratio change live.',
      },
    },
    {
      id: 'explore-bands',
      kind: 'explore',
      prompt: 'Drag the handles and watch how the age bands and dependency ratios shift.',
      concept:
        'Wide bases spike youth dependency; inverted tops spike elderly dependency. Total dependency is the sum of both — who is loading down workers changes with the shape.',
      concepts: ['dependency-ratio', 'age-structure', 'pyramid-shape'],
      difficulty: 1,
      interaction: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          nineHandles: true,
          initialWidths: [0.5, 0.45, 0.42, 0.4],
          showBands: true,
          showDependencyRatio: true,
        },
      },
      feedback: {
        onExplore:
          'Youth-heavy shapes lift the amber line; aging shapes lift the purple line. Total tracks both — same idea as on the AP exam.',
      },
    },
    {
      id: 'pick-youth-dependency',
      kind: 'predict',
      prompt: 'Which shape has the highest YOUTH dependency?',
      concepts: ['dependency-ratio', 'age-structure', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'pyramid-pick',
        config: {
          options: [{ stage: 2 }, { stage: 3 }, { stage: 4 }, { stage: 5 }],
        },
      },
      answer: { stages: [2] },
      feedback: {
        correct:
          'Right — Stage 2\'s wide base packs in children. Workers support many dependents even before the elderly cohort grows.',
        byOutcome: {
          '3': 'Stage 3 narrows — births are already falling, so youth dependency isn\'t the highest.',
          '4': 'Stage 4 is balanced — few extra children or retirees per worker.',
          '5': 'Stage 5 is elderly-heavy — that is old-age dependency, not youth dependency.',
        },
        hint: 'Youth dependency peaks when the base is widest — which stage has the biggest child cohorts?',
      },
    },
    {
      id: 'solve-elderly-dependency',
      kind: 'solve',
      prompt: 'Reshape this pyramid into a high ELDERLY-dependency country.',
      concepts: ['dependency-ratio', 'aging', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          nineHandles: true,
          initialWidths: [0.55, 0.5, 0.48, 0.46],
        },
      },
      answer: {
        stages: [5],
        targetCohorts: STAGE_PYRAMID_COHORTS[5],
        tolerance: 0.14,
      },
      feedback: {
        correct:
          'Exactly — a narrow base and full top mean few workers supporting many retirees. That is the elderly-dependency crisis of Stage 5.',
      },
    },
    {
      id: 'momentum-mc',
      kind: 'predict',
      prompt: 'A country\'s TFR just hit replacement (2.1), but its population keeps growing for decades. Why?',
      concepts: ['population-momentum', 'age-structure'],
      difficulty: 2,
      interaction: {
        type: 'multiple-choice',
        config: {
          options: [
            { id: 'youth-bulge', label: 'A large youth bulge is still entering childbearing age' },
            { id: 'immigration', label: 'Immigration is adding people faster than births' },
            { id: 'rising-tfr', label: 'The total fertility rate is still rising' },
            { id: 'lifespan', label: 'People are living longer, so everyone counts as "growing"' },
          ],
        },
      },
      answer: { correctId: 'youth-bulge' },
      feedback: {
        correct:
          'Right — momentum. Even at replacement fertility, a big young cohort keeps births high for a generation before growth slows.',
        byOutcome: {
          'immigration':
            'Immigration can add people, but the question is about TFR hitting replacement.',
          'rising-tfr': 'TFR just decreased to 2.1.',
          'lifespan': 'Longer lives add elderly dependents but do not by themselves keep total population growing for decades after TFR hits 2.1.',
        },
      },
    },
    {
      id: 'learn-anomalies',
      kind: 'learn',
      prompt: 'Real pyramids are rarely as smooth as the models.',
      concept:
        'Wars, migration, and policy carve fingerprints into age structure — notches, bulges, and pinches that smooth textbook pyramids hide.',
      concepts: ['pyramid-anomaly'],
      interaction: {
        type: 'info',
        config: {
          icon: '🔍',
          body:
            'Textbook pyramids are idealized versions of reality. Real events leave fingerprints:',
          points: [
            'War creates a notch in the fighting-age male cohort.',
            'Labor migration creates a bulge in the young-male cohort.',
            'One-child policy pinches the base and skews sex ratios toward boys (son preference).',
            'Baby booms can create a bulge in the middle-age cohort.',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: explore each anomaly shape and read what caused it.',
      },
    },
    {
      id: 'explore-anomalies',
      kind: 'explore',
      prompt: 'Switch between anomaly shapes and read what carved each fingerprint.',
      concept:
        'Each irregular pyramid tells a story — match the shape to the event that produced it.',
      concepts: ['pyramid-anomaly', 'migration'],
      difficulty: 1,
      interaction: {
        type: 'anomaly-pyramid',
        config: {
          shapes: ANOMALY_SHAPES,
          selectable: true,
          initialShapeId: 'warNotch',
        },
      },
      feedback: {
        onExplore:
          'These are not different DTM stages — they are scars from specific events layered on top of the underlying transition.',
      },
    },
    {
      id: 'predict-anomaly-aging',
      kind: 'predict',
      prompt: 'This pyramid shows a baby-boom country today. Shape the right pyramid ~25 years later.',
      concepts: ['pyramid-anomaly', 'population-momentum'],
      difficulty: 3,
      reference: {
        type: 'anomaly-pyramid',
        config: {
          shapes: [ANOMALY_PYRAMIDS_BY_ID.babyBoom],
          initialShapeId: 'babyBoom',
          showCaption: false,
        },
      },
      interaction: {
        type: 'anomaly-pyramid',
        config: {
          mode: 'adjust',
          shapes: [ANOMALY_PYRAMIDS_BY_ID.babyBoom],
          initialShapeId: 'babyBoom',
          showCaption: false,
        },
      },
      answer: {
        maleCohorts: ANOMALY_AGED.babyBoom.maleCohorts!,
        femaleCohorts: ANOMALY_AGED.babyBoom.femaleCohorts!,
        tolerance: 0.14,
      },
      feedback: {
        correct:
          'Right — the bulge climbs upward. Same cohort, older ages: that is how a baby boom reads on a pyramid decades later.',
        incorrect: 'Not quite — reshape the right pyramid and try again.',
        hint: 'Populations age in place — think about where a cohort sits after 25 years.',
      },
    },
    {
      id: 'connect-anomalies',
      kind: 'connect',
      prompt: 'Match each pyramid fingerprint to its cause.',
      concepts: ['pyramid-anomaly', 'migration'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each description to the event that caused it.',
          tiles: [
            { id: 'bulge', label: 'Spike of 20-year-old men' },
            { id: 'climb', label: 'Bump that climbs up the pyramid' },
            { id: 'notch', label: 'Fewer men around age 20' },
            { id: 'pinch', label: 'Smaller base favoring males' },
            
          ],
          slots: [
            { id: 'war', label: 'War', icon: '⚔️' },
            { id: 'migration', label: 'Labor migration', icon: '✈️' },
            { id: 'one-child', label: 'One-child policy', icon: '📉' },
            { id: 'baby-boom', label: 'Baby boom', icon: '📈' },
          ],
        },
      },
      answer: {
        pairs: {
          notch: 'war',
          bulge: 'migration',
          pinch: 'one-child',
          climb: 'baby-boom',
        },
      },
      feedback: {
        correct:
          'Exactly — each scar has a cause: war notches fighting-age men, migration spikes guest workers, one-child pinches the base, and baby booms climb the pyramid over decades.',
        incorrect: 'Not quite — match each shape description to the event that carved it.',
      },
    },
    {
      id: 'match-countries-anomalies',
      kind: 'solve',
      prompt: 'Match each pyramid fingerprint to the country it most closely resembles.',
      concepts: ['pyramid-anomaly', 'migration'],
      difficulty: 3,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each pyramid to the country whose age structure it reflects.',
          tiles: [
            { id: 'oneChild', label: '', anomalyId: 'oneChild', hideLabel: true },
            { id: 'guestWorker', label: '', anomalyId: 'guestWorker', hideLabel: true },
            { id: 'babyBoom', label: '', anomalyId: 'babyBoom', hideLabel: true },
            { id: 'warNotch', label: '', anomalyId: 'warNotch', hideLabel: true },
            
            
          ],
          slots: [
            { id: 'germany', label: 'Germany', sublabel: '1945 - 1960' },
            { id: 'qatar', label: 'Qatar', sublabel: '2000 - 2020' },
            { id: 'china', label: 'China', sublabel: '1980 - 2015' },
            { id: 'usa', label: 'United States', sublabel: '1946 - 1964' },
          ],
        },
      },
      answer: {
        pairs: COUNTRY_ANOMALY_MATCH,
      },
      feedback: {
        correct:
          'Exactly — Germany’s fighting-age notch, Qatar’s young-male spike, China’s base pinch, and the U.S. baby-boom bulge climbing upward.',
        incorrect: 'Not quite — match each shape to the country famous for that fingerprint.',
        hint: 'Think of the events that occurred during the time periods listed.',
      },
    },
    {
      id: 'synthesis-one-child-dependency',
      kind: 'connect',
      prompt: 'Synthesize: how China’s one-child policy shaped dependency — now and ahead.',
      concepts: ['dependency-ratio', 'pyramid-anomaly', 'aging'],
      difficulty: 3,
      interaction: {
        type: 'explain-back',
        config: {
          question:
            'What effect did China\'s one-child policy have on its dependency ratio today, and what would it look like 30 years from now?',
          rubric: [
            'The policy sharply reduced births, pinching the pyramid base and leaving fewer children.',
            'Today that means relatively low youth dependency — fewer young dependents per worker.',
            'Over the next ~30 years, smaller cohorts become workers while larger older generations retire.',
            'Elderly dependency will surge — many retirees supported by relatively few workers, so total dependency rises sharply.',
          ],
          sampleAnswer:
            'The one-child policy pinched the pyramid’s base, so China has fewer children today. That keeps youth dependency relatively low now — fewer young dependents per worker. In about 30 years those small cohorts will be working-age while a much larger older generation retires. Elderly dependency will spike and total dependency will climb: too few workers to support so many retirees.',
          minChars: 25,
        },
      },
      feedback: {
        correct:
          'You connected the policy scar to both today’s ratios and tomorrow’s aging burden.',
        incorrect:
          'Cover today’s effect on youth dependency and how aging will raise elderly dependency in about 30 years.',
      },
    },
  ],
};

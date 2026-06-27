import type { Lesson } from '../../types/content';
import { ANOMALY_PYRAMIDS_BY_ID, STAGE_PYRAMID_PROFILES } from '../../lib/dtm';
import { CAPSTONE_COUNTRY_IDS, capstoneIdsByStage, capstoneIdsWithDeviation } from '../../lib/worldCountries';

const MAP_ROSTER = CAPSTONE_COUNTRY_IDS;
const STAGE_3_IDS = capstoneIdsByStage(3);
const STAGE_4_IDS = capstoneIdsByStage(4);
const DEVIATION_IDS = capstoneIdsWithDeviation();const CHINA_ONE_CHILD = ANOMALY_PYRAMIDS_BY_ID.oneChild;
const pickMapConfig = {
  countryIds: MAP_ROSTER,
  mode: 'pick' as const,
  showDataCard: false,
  hideStageColors: true,
};

const pickMultiConfig = {
  countryIds: MAP_ROSTER,
  mode: 'pick-multi' as const,
  showDataCard: false,
  hideStageColors: true,
};

// Lesson 6 — synthesis capstone: classify real countries from rates, pyramids, and indicators.
export const placeCountry: Lesson = {
  id: 'place-country',
  courseId: 'dtm',
  title: 'Place the Country',
  subtitle: 'Classify real countries on the world map',
  concept:
    'Pull together everything from Lessons 1–5 — rates, pyramid shape, why curves move, anomalies, and where the model breaks — to place real countries in the DTM.',
  order: 7,
  prerequisites: ['why-people-move'],
  // This capstone IS the assessment — classifying real countries is the practice,
  // so it doesn't get a separate AI skill check afterward.
  skipSkillCheck: true,
  steps: [
    {
      id: 'learn-synthesis-framing',
      kind: 'learn',
      prompt: 'Putting it all together on the world map.',
      concept:
        'You have five lenses now — birth/death rates and NIR, pyramid shape, why each curve moves, what anomalies carve into a pyramid, and the forces that bend countries off the textbook path. Time to use all of them at once.',
      concepts: ['synthesis', 'dtm-stages'],
      interaction: {
        type: 'info',
        config: {
          icon: '🌍',
          body:
            'Real countries are classified from the evidence you\'ve been building all unit long.',
          points: [
            'Rates: high CBR + falling CDR → Stage 2 boom; births below deaths → Stage 5',
            'Pyramid: wide base vs even column vs top-heavy',
            'Anomalies: war notches, guest-worker bulges, one-child constriction',
            'Model breaks: migration, policy, compressed or stalled transitions',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: explore the roster on the world map before the challenges begin.',
      },
    },
    {
      id: 'explore-world-roster',
      kind: 'explore',
      prompt: 'Tap each pinned country. Study its rates, pyramid, and stage before the challenges.',
      concept:
        'Each pin is a real country positioned by its textbook DTM stage. Explore every card — the graded steps won\'t show full data unless you\'ve seen it here.',
      concepts: ['synthesis', 'dtm-stages'],
      difficulty: 1,
      interaction: {
        type: 'world-map',
        config: {
          countryIds: MAP_ROSTER,
          mode: 'explore',
          showDataCard: true,
          hideStageColors: false,
          caption: 'Pin colors match DTM stage — tap every country at least once.',
        },
      },
      feedback: {
        onExplore: 'Good — you\'ve seen the roster. Next: find a Stage 2 country on the map.',
      },
    },
    {
      id: 'pick-stage-two',
      kind: 'solve',
      prompt: 'Tap a country still in Stage 2 — high births, deaths already fallen, rapid growth.',
      concept:
        'Stage 2 = the population explosion. Deaths dropped first; births stay high — so the natural increase gap is wide and the pyramid base is broad.',
      concepts: ['synthesis', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'world-map',
        config: pickMapConfig,
      },
      answer: { stages: [2] },
      feedback: {
        correct:
          'Right — Niger, Nigeria, Ethiopia, Bangladesh, and Afghanistan all sit in Stage 2: deaths have fallen but births remain high, driving rapid growth.',
        incorrect: 'Not quite — look for a country with high births AND deaths already well below Stage 1 levels.',
        byOutcome: {
          india: 'India has moved into Stage 3 — births are falling and the pyramid is narrowing.',
          brazil: 'Brazil is Stage 3 — births have dropped well below the Stage 2 boom.',
          mexico: 'Mexico is late expanding (Stage 3), not the early boom.',
          indonesia: 'Indonesia is Stage 3 — the pyramid is already narrowing.',
          usa: 'The U.S. is Stage 4 — low births, low deaths, near stable.',
          france: 'France is Stage 4 — low births and deaths, near replacement.',
          uae: 'The UAE has moderate rates (Stage 4) — its boom came from migration, not Stage 2 births.',
          china: 'China\'s births are now near or below deaths — past Stage 2.',
          germany: 'Germany is Stage 5 — shrinking, with deaths above births.',
          japan: 'Japan is Stage 5 — the textbook declining stage.',
          'south-korea': 'South Korea is Stage 5 — the world\'s lowest fertility.',
          italy: 'Italy is Stage 5 — deaths exceed births.',
        },
      },
    },
    {
      id: 'pick-stage-five',
      kind: 'solve',
      prompt: 'Tap a country whose population is now shrinking — Stage 5.',
      concept:
        'Stage 5 = births fall below deaths. The pyramid inverts at the top; natural increase turns negative and total population gently declines (unless migration intervenes).',
      concepts: ['synthesis', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'world-map',
        config: pickMapConfig,
      },
      answer: { stages: [5] },
      feedback: {
        correct:
          'Exactly — Japan, Germany, South Korea, and Italy all show Stage 5: deaths exceed births and populations are shrinking or about to.',
        incorrect: 'Not quite — find a country where deaths now exceed births (negative natural increase).',
        byOutcome: {
          niger: 'Niger is still Stage 2 — births far outpace deaths.',
          afghanistan: 'Afghanistan is Stage 2 — rapid growth, not decline.',
          nigeria: 'Nigeria is Stage 2 — one of the fastest-growing populations on Earth.',
          ethiopia: 'Ethiopia is Stage 2 — still in the early expanding boom.',
          bangladesh: 'Bangladesh is Stage 2 — natural increase is still strongly positive.',
          india: 'India is Stage 3 — still growing, just more slowly.',
          brazil: 'Brazil is Stage 3 — births still exceed deaths.',
          mexico: 'Mexico is Stage 3 — still growing.',
          indonesia: 'Indonesia is Stage 3 — still growing.',
          usa: 'The U.S. is Stage 4 — near replacement, not shrinking yet.',
          france: 'France is Stage 4 — near stable, not declining.',
          uae: 'The UAE is growing — migration adds people even with moderate births.',
          china: 'China is borderline — births ≈ deaths; Germany, Japan, Italy, and S.Korea are clearer Stage 5 cases here.',
        },
      },
    },
    {
      id: 'pick-all-stage-three',
      kind: 'solve',
      prompt: `Tap all ${STAGE_3_IDS.length} countries whose pyramid matches this shape — births falling, triangle narrowing.`,
      concepts: ['synthesis', 'dtm-stages', 'pyramid-classify'],
      difficulty: 3,
      reference: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          illustrate: true,
          initialWidths: STAGE_PYRAMID_PROFILES[3],
          caption: 'A narrowing triangle — births falling, deaths already low.',
        },
      },
      interaction: {
        type: 'world-map',
        config: pickMultiConfig,
      },
      answer: { countryIds: STAGE_3_IDS },
      feedback: {
        correct:
          'Exactly — India, Brazil, Mexico, and Indonesia all sit in Stage 3: the youth bulge is shrinking as birth rates fall.',
        incorrect: `Select exactly ${STAGE_3_IDS.length} countries whose pyramids match the reference — a narrowing triangle, not a wide Stage 2 base or an even Stage 4 column.`,
      },
    },
    {
      id: 'pick-all-stage-four',
      kind: 'solve',
      prompt: `Tap all ${STAGE_4_IDS.length} countries whose pyramid matches this shape — low births, low deaths, near-stable column.`,
      concepts: ['synthesis', 'dtm-stages', 'pyramid-classify'],
      difficulty: 3,
      reference: {
        type: 'population-pyramid',
        config: {
          mode: 'shape',
          illustrate: true,
          initialWidths: STAGE_PYRAMID_PROFILES[4],
          caption: 'An even column — low births, low deaths, near replacement.',
        },
      },
      interaction: {
        type: 'world-map',
        config: pickMultiConfig,
      },
      answer: { countryIds: STAGE_4_IDS },
      feedback: {
        correct:
          'Right — the United States, UAE, China, and France all show Stage 4 profiles: low births, low deaths, and fairly even age structures (even when anomalies or migration bend totals).',
        incorrect: `Select exactly ${STAGE_4_IDS.length} countries with a near-stable column pyramid — not a wide Stage 2 base or a top-heavy Stage 5 shape.`,
      },
    },
    {
      id: 'draw-china-pyramid',
      kind: 'solve',
      prompt:
        'Draw the pyramid that fits China today — use its rates and stage, and remember to account for anomalies.',
      concepts: ['synthesis', 'dtm-stages', 'pyramid-anomaly'],
      difficulty: 3,
      reference: {
        type: 'world-map',
        config: {
          countryIds: ['china'],
          mode: 'explore',
          highlightId: 'china',
          centerOnId: 'china',
          showDataCard: true,
          hidePyramidMini: true,
          hideBlurb: true,
          hideStageColors: true,
        },
      },
      interaction: {
        type: 'anomaly-pyramid',
        config: {
          mode: 'adjust',
          shapes: [ANOMALY_PYRAMIDS_BY_ID.smooth],
          initialShapeId: 'smooth',
          showCaption: false,
        },
      },
      answer: {
        maleCohorts: CHINA_ONE_CHILD.maleCohorts!,
        femaleCohorts: CHINA_ONE_CHILD.femaleCohorts!,
        tolerance: 0.14,
      },
      feedback: {
        correct:
          'Right — China\'s low CBR and CDR fit a mature stage, but the pyramid isn\'t a smooth column. The base is narrower and the top fuller than rates alone would suggest.',
        incorrect:
          'Not quite — start from China\'s low birth and death rates, then adjust for the anomaly you\'d expect from its recent history.',
        hint: 'Rates place China in a mature stage — but does its base look like a textbook column, or something else you\'ve seen before?',
      },
    },
    {
      id: 'pick-all-deviations',
      kind: 'solve',
      prompt:
        'Tap every country whose rates, pyramid shape, or total population change clearly diverge from textbook DTM expectations.',
      concept:
        'The capstone: compare each country\'s stage label to its pyramid and blurb — migration scars, policy fingerprints, and stage–shape mismatches are the countries the simple model cannot fully explain.',
      concepts: ['synthesis', 'dtm-critique', 'pyramid-anomaly', 'migration'],
      difficulty: 3,
      interaction: {
        type: 'world-map',
        config: pickMultiConfig,
      },
      answer: { countryIds: DEVIATION_IDS },
      feedback: {
        correct:
          'Exactly — Niger and Bangladesh bend the DTM timeline, South Korea compressed it, and China and the UAE show pyramid or population patterns that rates alone cannot explain.',
        incorrect:
          'Not quite — tap every country where either the DTM path or the pyramid shape clearly diverges from textbook expectations. Revisit the explore cards if you need a reminder.',
        hint: 'Look for migration booms, policy scars, compressed transitions, prolonged early stages, or a gap between rate-implied stage and pyramid shape.',
      },
    },
    {
      id: 'synthesis-same-rates',
      kind: 'connect',
      prompt: 'Synthesize: China and France have nearly identical rates — so why are their futures so different?',
      concepts: ['synthesis', 'dtm-stages', 'pyramid-anomaly', 'population-momentum'],
      difficulty: 3,
      interaction: {
        type: 'explain-back',
        config: {
          question:
            'China (CBR 7, CDR 8, TFR 1.2) and France (CBR 11, CDR 10, TFR 1.8) both have low birth and death rates and near-zero natural increase — yet their pyramids and futures look very different. Explain why nearly identical rates can hide very different demographic realities.',
          rubric: [
            'Crude birth/death rates are only a present-day snapshot — they reveal neither the age structure nor the history that produced it.',
            'China\'s one-child policy pinched its base, leaving a top-heavy, Stage 5-shaped pyramid; France\'s pyramid is a far more even column near replacement.',
            'China\'s much lower TFR (1.2 vs 1.8) plus the policy scar means steeper aging and faster future decline, with elderly dependency set to surge.',
            'France\'s higher fertility and immigration give it a more stable age structure and a gentler trajectory.',
            'Conclusion: a country must be placed with multiple lenses — pyramid shape, TFR, anomalies, and momentum — not crude rates alone.',
          ],
          sampleAnswer:
            'Crude rates are just a snapshot of one year — they don\'t show a country\'s age structure or how it got there. China\'s one-child policy carved a narrow base, so its pyramid is top-heavy and already aging toward decline, and its very low TFR of 1.2 locks in a shrinking, elderly-heavy future with surging old-age dependency. France has a more even pyramid, a higher TFR of 1.8, and immigration topping up its workforce, so its age structure and future are far more stable. Identical-looking rates hide those differences, which is why you place a country using its pyramid, TFR, anomalies, and momentum — not rates alone.',
          minChars: 30,
        },
      },
      feedback: {
        correct:
          'Exactly — you used every lens at once: similar rates, but China\'s pinched pyramid, lower TFR, and policy scar point to a steeper decline than France\'s steadier path.',
        incorrect:
          'Not Quite, remember how rates are only a snapshot of the present, the future has other factors that can make it different.',
      },
    },
  ],
};

// Authored FRQ (free-response) practice items — stimulus-based, AP Unit-2 style, spanning
// the exam's three stimulus types (none / one / two) and a broad slice of Unit 2 (DTM,
// migration, policy, structure/momentum, fertility, density, dependency). Parts build
// identify → describe → explain → compare/evaluate (the College Board pattern).
//
// "identify" parts carry an `autoCheck` graded deterministically from dtm.ts (see
// lib/frqGrading.ts) — verified in frqBank.test.ts. Open parts use the explain-back rubric
// grader (AI) or self-grade against the rubric + model answer when AI is off. Authoring
// rule: give the data, never name the answer in the prompt; distractors live nowhere —
// open prompts demand reasoning.
import type { Frq } from '../types/frq';
import type { Interaction } from '../types/content';

const PYRAMID_STAGE2: Interaction = {
  type: 'population-pyramid',
  config: {
    mode: 'shape',
    illustrate: true,
    initialWidths: [0.92, 0.76, 0.4, 0.2], // STAGE_PYRAMID_PROFILES[2]
    caption: 'Country A — most recent census',
  },
};

const PYRAMID_STAGE3: Interaction = {
  type: 'population-pyramid',
  config: {
    mode: 'shape',
    illustrate: true,
    initialWidths: [0.56, 0.52, 0.44, 0.36], // STAGE_PYRAMID_PROFILES[3]
    caption: 'Country C — population pyramid',
  },
};

export const FRQ_BANK: Frq[] = [
  // ── FRQ 1 — no stimulus · DTM + migration + policy ────────────────────────
  {
    id: 'frq-decline-and-migration',
    title: 'Decline and migration',
    intro:
      'Country X is a wealthy country with a crude birth rate of 9 and a crude death rate of 11 per 1,000, plus significant net in-migration of working-age adults.',
    cedTopics: ['2.4', '2.5', '2.7', '2.10', '2.12'],
    stimulusSummary:
      'Country X: a wealthy country with crude birth rate 9 and crude death rate 11 per 1,000, attracting significant net in-migration of working-age adults.',
    parts: [
      {
        id: 'a',
        label: 'A',
        taskVerb: 'identify',
        prompt: 'Identify the stage of the demographic transition model Country X is in.',
        rubric: ['Correctly identifies Stage 5 (declining).'],
        sampleAnswer: 'Stage 5.',
        concepts: ['dtm-stages'],
        autoCheck: { kind: 'stage-rates', cbr: 9, cdr: 11 },
      },
      {
        id: 'b',
        label: 'B',
        taskVerb: 'identify',
        prompt: "Considering births and deaths only, identify what is happening to Country X's population from natural change.",
        rubric: ['States the population is shrinking / declining from natural change (deaths exceed births).'],
        sampleAnswer: 'It is shrinking — deaths outnumber births, so natural change is negative.',
        concepts: ['natural-increase'],
        autoCheck: { kind: 'trend', cbr: 9, cdr: 11 },
      },
      {
        id: 'c',
        label: 'C',
        taskVerb: 'explain',
        prompt: "Explain how net in-migration can change Country X's overall population trend even though its natural change is negative.",
        rubric: [
          'Explains that migration is a component of population change (total change = natural change + net migration), so enough in-migration adds people faster than natural decline removes them — offsetting the decline and producing overall growth or stability.',
        ],
        sampleAnswer:
          'Total population change = (births − deaths) + net migration. Even with deaths exceeding births, a large enough flow of in-migrants adds people faster than natural decline removes them, so the overall population can hold steady or even grow.',
        concepts: ['migration', 'natural-increase'],
        minChars: 30,
      },
      {
        id: 'd',
        label: 'D',
        taskVerb: 'describe',
        prompt: 'Describe ONE pull factor that would attract migrants to a wealthy country like Country X.',
        rubric: ['Names a plausible pull factor — e.g. jobs / higher wages, safety / political stability, family reunification, or access to education or healthcare.'],
        sampleAnswer:
          'Plentiful, higher-paying jobs: a strong economy with labor shortages pulls in working-age migrants seeking better wages than they could earn at home.',
        concepts: ['push-pull'],
        minChars: 20,
      },
      {
        id: 'e',
        label: 'E',
        taskVerb: 'explain',
        prompt: 'Explain ONE effect that the emigration of young workers has on their origin country.',
        rubric: [
          'States an effect AND links it to who leaves — e.g. brain drain removes young/skilled workers, slowing the origin economy and aging its structure; OR remittances sent home raise incomes in the origin.',
        ],
        sampleAnswer:
          'Because emigrants are usually young and often skilled, the origin loses part of its workforce (brain drain), which can slow its economy and leave an older age structure — though the remittances they send home can raise incomes for families who stay.',
        concepts: ['brain-drain', 'remittances'],
        minChars: 30,
      },
      {
        id: 'f',
        label: 'F',
        taskVerb: 'explain',
        prompt: 'A government facing decline introduces a pro-natalist policy (baby bonuses, paid leave). Explain ONE reason such a policy may fail to reverse the decline.',
        rubric: [
          'Gives a causal reason pro-natalist policies often underperform — e.g. fertility norms tied to female education/careers and the high cost of children are slow to change, so births stay low; OR the age structure is already old, so few women of childbearing age remain.',
        ],
        sampleAnswer:
          'Once fertility norms shift — with women in education and careers and children expensive to raise — small cash incentives rarely change family-size decisions, so births stay low. The already-old age structure compounds this: with few women of childbearing age, even a small rise in fertility cannot offset the deaths.',
        concepts: ['population-policy', 'pro-natalist', 'fertility-transition'],
        minChars: 30,
      },
    ],
  },

  // ── FRQ 2 — one stimulus (Stage-2 pyramid) · structure / momentum / fertility ──
  {
    id: 'frq-pyramid-stage2',
    title: 'Reading a population pyramid',
    intro: "Country A just released its latest census. Use the population pyramid to answer each part.",
    cedTopics: ['2.3', '2.4', '2.8'],
    stimuli: [PYRAMID_STAGE2],
    stimulusSummary:
      'A population pyramid for Country A with a very wide base, broad young-adult bands, and very few elderly — a classic expansive (wide-base, fast-tapering) shape.',
    parts: [
      {
        id: 'a',
        label: 'A',
        taskVerb: 'identify',
        prompt: "Identify the stage of the demographic transition model most consistent with Country A's population pyramid.",
        rubric: ['Correctly identifies Stage 2 (Early Expanding).'],
        sampleAnswer: 'Stage 2.',
        concepts: ['dtm-stages', 'pyramid-shape'],
        autoCheck: { kind: 'stage', controls: [0.92, 0.76, 0.4, 0.2] },
      },
      {
        id: 'b',
        label: 'B',
        taskVerb: 'describe',
        prompt: "Describe ONE characteristic of Country A's age structure shown by the pyramid.",
        rubric: [
          'Names a structural feature visible in the shape — e.g. a very large youth (0–14) cohort / wide base, very few elderly, or a heavy youth-dependency burden.',
        ],
        sampleAnswer:
          'A very large share of the population is children — the 0–14 base is by far the widest band — while very few people survive to old age, so the pyramid narrows sharply toward the top.',
        concepts: ['age-structure', 'pyramid-shape'],
        minChars: 20,
      },
      {
        id: 'c',
        label: 'C',
        taskVerb: 'explain',
        prompt: "Explain ONE challenge this age structure is likely to create for Country A's government in the coming decades.",
        rubric: [
          'States a specific challenge AND links it to the youthful structure — e.g. the youth bulge will demand schools then jobs/housing; high youth dependency strains public services funded by a smaller working-age base.',
        ],
        sampleAnswer:
          'The huge youth cohort will move through the system as a wave: first overwhelming demand for schools, then for jobs and housing as they reach working age — all funded by a comparatively small current working-age population, straining the budget.',
        concepts: ['age-structure', 'natural-increase'],
        minChars: 30,
      },
      {
        id: 'd',
        label: 'D',
        taskVerb: 'define',
        prompt: 'Define demographic momentum.',
        rubric: [
          'Correctly defines demographic momentum — a population’s tendency to keep growing (or shrinking) for decades after fertility reaches replacement, because of its current age structure.',
        ],
        sampleAnswer:
          'Demographic momentum is the tendency of a population to keep growing for years even after fertility falls to replacement level, because a large cohort of young people has yet to pass through its childbearing years.',
        concepts: ['population-momentum'],
        minChars: 20,
      },
      {
        id: 'e',
        label: 'E',
        taskVerb: 'explain',
        prompt: "Explain how Country A's current age structure will produce demographic momentum.",
        rubric: [
          'Causal link: the very large youth cohort will reach childbearing age, so even if each woman has fewer children, the sheer number of potential parents keeps births high for decades — momentum.',
        ],
        sampleAnswer:
          'Its huge base of children will, in 15–25 years, become a huge cohort of adults of childbearing age. Even if each has fewer children than their parents, so many potential parents means the number of births stays high for decades, so the population keeps growing from momentum.',
        concepts: ['population-momentum', 'natural-increase'],
        minChars: 30,
      },
      {
        id: 'f',
        label: 'F',
        taskVerb: 'explain',
        prompt: "Explain ONE reason Country A's fertility is likely to fall in the coming decades.",
        rubric: [
          'Gives a causal driver of falling fertility — e.g. rising female education/employment, access to contraception, falling infant mortality reducing "insurance" births, or urbanization raising the cost of children.',
        ],
        sampleAnswer:
          'As more girls stay in school and women enter paid work, and as infant mortality falls so parents no longer need "extra" births as insurance, families choose to have fewer children — pulling the birth rate down.',
        concepts: ['fertility-transition'],
        minChars: 30,
      },
    ],
  },

  // ── FRQ 3 — two stimuli (pyramid + table) · transition / density / dependency ──
  {
    id: 'frq-transition-table',
    title: 'A country in transition',
    intro: 'Country C is industrializing. Use BOTH the population pyramid and the table of vital statistics.',
    cedTopics: ['2.2', '2.3', '2.5', '2.9'],
    stimuli: [
      PYRAMID_STAGE3,
      {
        kind: 'table',
        caption: 'Country C — vital statistics, 1990–2020',
        columns: ['Year', 'CBR', 'CDR', 'Population (M)', 'Arable land (k km²)'],
        rows: [
          [1990, 38, 14, 40, 90],
          [2005, 31, 11, 58, 92],
          [2020, 25, 10, 78, 95],
        ],
      },
    ],
    stimulusSummary:
      "Country C: a population pyramid shaped as a narrowing triangle (Stage-3), shown with a 1990–2020 table in which the crude birth rate falls from 38 to 25 and the crude death rate to 10, while population rises from 40M to 78M on roughly constant arable land (~95k km²).",
    parts: [
      {
        id: 'a',
        label: 'A',
        taskVerb: 'identify',
        prompt: "Using the population pyramid, identify the stage of the demographic transition model for Country C.",
        rubric: ['Correctly identifies Stage 3 (Late Expanding).'],
        sampleAnswer: 'Stage 3.',
        concepts: ['pyramid-shape', 'dtm-stages'],
        autoCheck: { kind: 'stage', controls: [0.56, 0.52, 0.44, 0.36] },
      },
      {
        id: 'b',
        label: 'B',
        taskVerb: 'identify',
        prompt: "Using the 2020 row of the table, identify what is happening to Country C's population from natural change.",
        rubric: ['States the population is still growing (births still exceed deaths — positive natural increase).'],
        sampleAnswer: 'It is still growing — births (25) remain above deaths (10).',
        concepts: ['natural-increase'],
        autoCheck: { kind: 'trend', cbr: 25, cdr: 10 },
      },
      {
        id: 'c',
        label: 'C',
        taskVerb: 'describe',
        prompt: "Describe how the pyramid's narrowing base is consistent with the trend in crude birth rate shown in the table.",
        rubric: [
          'Connects the falling CBR in the table to the narrowing base / smaller youngest cohorts in the pyramid (fewer children born each year → narrower base).',
        ],
        sampleAnswer:
          'As the table’s crude birth rate falls from 38 to 25, fewer children are born each year, so the youngest cohorts get smaller — which is exactly why the pyramid’s base is narrowing rather than staying wide.',
        concepts: ['pyramid-shape', 'fertility-transition'],
        minChars: 30,
      },
      {
        id: 'd',
        label: 'D',
        taskVerb: 'compare',
        prompt: "Compare Country C's population growth pressure to that of a Stage-2 country.",
        rubric: [
          'Addresses BOTH: a Stage-2 country grows faster / has more growth pressure (wide birth–death gap), while Stage-3 Country C still grows but its falling births are narrowing the gap, so its growth is slowing.',
        ],
        sampleAnswer:
          'A Stage-2 country has a much wider gap between high births and falling deaths, so it grows explosively. Country C in Stage 3 still grows, but its falling birth rate is shrinking that gap, so its growth is slowing relative to a Stage-2 country.',
        concepts: ['dtm-stages', 'natural-increase'],
        minChars: 30,
      },
      {
        id: 'e',
        label: 'E',
        taskVerb: 'explain',
        prompt: "Country C's population nearly doubled while its arable land barely changed. Explain why its physiological density can be high even if its arithmetic density seems moderate.",
        rubric: [
          'Explains that physiological density = people ÷ ARABLE land (vs arithmetic = people ÷ TOTAL land), so when population grows on limited farmland, the pressure on food-producing land rises even if overall crowding looks moderate.',
        ],
        sampleAnswer:
          'Arithmetic density spreads people over all land, but physiological density divides them by only the arable land that grows food. With population nearly doubling on the same farmland, far more people now depend on each unit of cropland, so physiological density — the real pressure on the food system — is high even if the country looks uncrowded overall.',
        concepts: ['density'],
        minChars: 30,
      },
      {
        id: 'f',
        label: 'F',
        taskVerb: 'explain',
        prompt: "Explain ONE challenge Country C will face as its large young-adult cohort ages over the next several decades.",
        rubric: [
          'Links the aging of the current young-adult bulge to a future challenge — e.g. a rising elderly-dependency ratio straining pensions/healthcare, or a shrinking workforce supporting more retirees.',
        ],
        sampleAnswer:
          "Today's large young-adult cohort will become a large elderly cohort, so the elderly-dependency ratio will climb — a shrinking share of workers must support growing numbers of retirees, straining pensions and healthcare.",
        concepts: ['dependency-ratio', 'aging'],
        minChars: 30,
      },
    ],
  },
];

export function getFrq(id?: string): Frq | undefined {
  if (!id) return FRQ_BANK[0];
  return FRQ_BANK.find((f) => f.id === id);
}

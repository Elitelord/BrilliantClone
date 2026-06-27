// Authored, review-ONLY question bank (Phase 3). These never appear inside lessons —
// they exist to give spaced reviews more variety, especially with AI off, so retrieval
// isn't the same handful of replayed lesson steps every time ("parallel diagnostic
// items," per the learning-science notes).
//
// Every item carries a computational `template` + `scenario`, so its answer is recomputed
// from dtm.ts by the SAME verifier that guards runtime generation (see verify.ts). A unit
// test (reviewBank.test.ts) recomputes each one and asserts the authored `claimedCorrectId`
// matches — so the bank can't drift wrong. Authoring rule: the scenario data is given
// (it's what the learner reasons from), but the answer is never named in the prompt or
// restated in an option; the three distractors each encode a specific, common misconception.
import { verifySkillCheckQuestion, type VerifiedSkillCheckQuestion } from '../lib/ai/verify';
import type { RawSkillCheckQuestion } from '../lib/ai/verify';

export interface ReviewBankItem extends RawSkillCheckQuestion {
  /** Catalog concept ids this item exercises (drives due-concept selection). */
  concepts: string[];
}

// Reused trend options — labels chosen so the verifier's trend matcher maps each to
// exactly one trend (no synonym collisions).
const TREND_OPTIONS = [
  { id: 'a', label: 'The population shrinks' },
  { id: 'b', label: 'Roughly stable' },
  { id: 'c', label: 'Moderate growth' },
  { id: 'd', label: 'Rapid growth' },
];

export const REVIEW_BANK: ReviewBankItem[] = [
  // ---- natural-increase --------------------------------------------------
  {
    template: 'population-trend',
    prompt:
      'A country reports a crude birth rate of 34 and a crude death rate of 11 per 1,000. Ignoring migration, how is its population changing from natural increase alone?',
    scenario: { cbr: 34, cdr: 11 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'd',
    explanation: 'A 23-per-1,000 gap (NIR ≈ 2.3%) is well into the rapid-growth range.',
    concepts: ['natural-increase'],
  },
  {
    template: 'population-trend',
    prompt:
      'An aging high-income country reports a crude birth rate of 8 and a crude death rate of 11 per 1,000. Ignoring migration, what is happening from natural change alone?',
    scenario: { cbr: 8, cdr: 11 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'a',
    explanation: 'Deaths exceed births (gap −3), so natural change alone shrinks the population.',
    concepts: ['natural-increase'],
  },
  {
    template: 'population-trend',
    prompt:
      'A country reports a crude birth rate of 18 and a crude death rate of 9 per 1,000. Ignoring migration, how is its population changing?',
    scenario: { cbr: 18, cdr: 9 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'c',
    explanation: 'A +9 gap (NIR 0.9%) is steady growth — positive but short of the rapid-growth (≥16) range.',
    concepts: ['natural-increase'],
  },
  {
    template: 'doubling-time',
    prompt:
      "A country's population grows with a crude birth rate of 30 and a crude death rate of 10 per 1,000, with negligible migration. About how long would it take the population to double?",
    scenario: { cbr: 30, cdr: 10 },
    options: [
      { id: 'a', label: '≈ 20 years' },
      { id: 'b', label: '≈ 35 years' },
      { id: 'c', label: '≈ 50 years' },
      { id: 'd', label: '≈ 70 years' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Rule of 70: NIR = (30−10)/10 = 2%, so 70 ÷ 2 ≈ 35 years.',
    concepts: ['natural-increase'],
  },

  // ---- dtm-stages (stage from rates) -------------------------------------
  {
    template: 'stage-from-rates',
    prompt:
      'Country X has a crude birth rate of 38 and a crude death rate of 12 per 1,000. Which DTM stage BEST characterizes it?',
    scenario: { cbr: 38, cdr: 12 },
    options: [
      { id: 'a', label: 'Stage 1 — births and deaths both very high, near balance' },
      { id: 'b', label: 'Stage 2 — deaths have dropped while births stay high (a wide gap)' },
      { id: 'c', label: 'Stage 3 — births falling toward deaths, growth slowing' },
      { id: 'd', label: 'Stage 4 — births and deaths both low, population steady' },
    ],
    claimedCorrectId: 'b',
    explanation: 'CBR still 38 with CDR fallen to 12 is the wide-gap signature of Stage 2.',
    concepts: ['dtm-stages'],
  },
  {
    template: 'stage-from-rates',
    prompt:
      'Country Y has a crude birth rate of 12 and a crude death rate of 9 per 1,000. Which DTM stage BEST characterizes it?',
    scenario: { cbr: 12, cdr: 9 },
    options: [
      { id: 'a', label: 'Stage 2 — births still very high (30+)' },
      { id: 'b', label: 'Stage 3 — births falling but still well above deaths' },
      { id: 'c', label: 'Stage 4 — births and deaths both low and close, population steady' },
      { id: 'd', label: 'Stage 5 — deaths above births, population shrinking' },
    ],
    claimedCorrectId: 'c',
    explanation: 'A low CBR (12) just above a low CDR (9) — both low, near balance — is Stage 4.',
    concepts: ['dtm-stages'],
  },
  {
    template: 'stage-from-rates',
    prompt:
      'Country Z has a crude birth rate of 42 and a crude death rate of 36 per 1,000. Which DTM stage BEST characterizes it?',
    scenario: { cbr: 42, cdr: 36 },
    options: [
      { id: 'a', label: 'Stage 1 — births and deaths both very high, only a small gap' },
      { id: 'b', label: 'Stage 2 — deaths have dropped sharply, opening a wide gap' },
      { id: 'c', label: 'Stage 3 — births falling toward deaths' },
      { id: 'd', label: 'Stage 4 — births and deaths both low' },
    ],
    claimedCorrectId: 'a',
    explanation: 'Very high CBR and CDR with only a 6-point gap is Stage 1.',
    concepts: ['dtm-stages'],
  },
  {
    template: 'stage-from-rates',
    prompt:
      'Country W has a crude birth rate of 24 and a crude death rate of 9 per 1,000. Which DTM stage BEST characterizes it?',
    scenario: { cbr: 24, cdr: 9 },
    options: [
      { id: 'a', label: 'Stage 1 — births and deaths both very high' },
      { id: 'b', label: 'Stage 2 — births still very high (30+)' },
      { id: 'c', label: 'Stage 3 — births falling but still clearly above deaths' },
      { id: 'd', label: 'Stage 5 — deaths above births, population shrinking' },
    ],
    claimedCorrectId: 'c',
    explanation: 'CBR down to 24 (falling, but still well above CDR 9) is Stage 3.',
    concepts: ['dtm-stages'],
  },

  // ---- pyramid-shape (shape -> stage) ------------------------------------
  {
    template: 'pyramid-stage',
    prompt:
      'A population pyramid has a very wide base and broad young-adult bands that taper gradually upward — many children and young workers, relatively few elderly. Which DTM stage does this shape indicate?',
    scenario: { stage: 2, pyramidDescription: 'wide base, broad youth, tapering, few elderly' },
    options: [
      { id: 'a', label: 'Stage 1 — wide base but a very steep drop, almost no elderly' },
      { id: 'b', label: 'Stage 2 — wide base, broad youth bulge, few elderly' },
      { id: 'c', label: 'Stage 3 — base narrowing as births fall' },
      { id: 'd', label: 'Stage 4 — nearly even, column-like bars' },
    ],
    claimedCorrectId: 'b',
    explanation: 'A wide base with broad young-adult bands (an expansive pyramid) is the Stage 2 shape.',
    concepts: ['pyramid-shape'],
  },
  {
    template: 'pyramid-stage',
    prompt:
      'A population pyramid is pinched at the bottom, widest through the middle and upper-middle, with large bars among the elderly. Which DTM stage does this shape indicate?',
    scenario: { stage: 5, pyramidDescription: 'narrow base, top-heavy, aging, more old than young' },
    options: [
      { id: 'a', label: 'Stage 2 — wide base, lots of children' },
      { id: 'b', label: 'Stage 3 — base just starting to narrow' },
      { id: 'c', label: 'Stage 4 — even, column-like bars' },
      { id: 'd', label: 'Stage 5 — pinched base, top-heavy, more old than young' },
    ],
    claimedCorrectId: 'd',
    explanation: 'A top-heavy pyramid with a pinched base (more old than young) is Stage 5.',
    concepts: ['pyramid-shape'],
  },
  {
    template: 'pyramid-stage',
    prompt:
      'A population pyramid looks almost like a rectangle — the bars are nearly equal in width from the youngest groups up through late-middle age, tapering only at the very top. Which DTM stage does this shape indicate?',
    scenario: { stage: 4, pyramidDescription: 'even column, near-equal bars, slight taper at top' },
    options: [
      { id: 'a', label: 'Stage 1 — wide base, steep drop' },
      { id: 'b', label: 'Stage 2 — wide base, broad youth' },
      { id: 'c', label: 'Stage 4 — near-even, column-like bars (births ≈ deaths)' },
      { id: 'd', label: 'Stage 5 — pinched base, top-heavy' },
    ],
    claimedCorrectId: 'c',
    explanation: 'Near-vertical, even-width sides (a column) mean births ≈ deaths — Stage 4.',
    concepts: ['pyramid-shape'],
  },

  // ---- cause-of-death / epidemiological transition -----------------------
  {
    template: 'cause-of-death',
    prompt:
      'A country is still early in its demographic transition (Stage 2). Which category of causes accounts for MOST of its deaths?',
    scenario: { stage: 2 },
    options: [
      { id: 'a', label: 'Infectious and communicable diseases like cholera and tuberculosis' },
      { id: 'b', label: 'Chronic, degenerative diseases such as heart disease and cancer' },
      { id: 'c', label: 'Accidents and occupational injuries' },
      { id: 'd', label: 'Diseases of advanced old age' },
    ],
    claimedCorrectId: 'a',
    explanation: 'Early in the transition, infectious and communicable disease dominate mortality (Omran’s first phase).',
    concepts: ['cause-of-death', 'etm'],
  },
  {
    template: 'cause-of-death',
    prompt:
      'A developed country sits in Stage 4 of the transition. Which category of causes accounts for MOST of its deaths?',
    scenario: { stage: 4 },
    options: [
      { id: 'a', label: 'Infectious and communicable diseases' },
      { id: 'b', label: 'Chronic and degenerative diseases such as heart disease and cancer' },
      { id: 'c', label: 'Childhood and maternal mortality' },
      { id: 'd', label: 'Drought and crop failure' },
    ],
    claimedCorrectId: 'b',
    explanation: 'By Stage 4, chronic degenerative diseases dominate — the later epidemiological phase.',
    concepts: ['cause-of-death', 'etm'],
  },

  // ---- fertility-transition (replacement level) --------------------------
  {
    template: 'replacement-level',
    prompt:
      "A country's total fertility rate has fallen to 1.3 children per woman and holds there for decades. Ignoring migration and momentum, what is the long-run trajectory of its population?",
    scenario: { tfr: 1.3 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'a',
    explanation: 'A TFR of 1.3 is far below the ~2.1 replacement level, so each generation is smaller — long-run decline.',
    concepts: ['fertility-transition'],
  },
  {
    template: 'replacement-level',
    prompt:
      'A country sustains a total fertility rate of about 3.6 children per woman. Ignoring migration, what is the long-run trajectory of its population?',
    scenario: { tfr: 3.6 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'c',
    explanation: 'A TFR of 3.6 is well above replacement (~2.1), so the population grows over the long run.',
    concepts: ['fertility-transition'],
  },
  {
    template: 'replacement-level',
    prompt:
      "A country's total fertility rate holds steady at about 2.1 children per woman. Ignoring migration and momentum, what is the long-run trajectory?",
    scenario: { tfr: 2.1 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'b',
    explanation: '~2.1 is replacement level — each generation just replaces itself, so the population holds roughly stable.',
    concepts: ['fertility-transition'],
  },

  // ---- density (the three measures) --------------------------------------
  {
    template: 'density-measure',
    prompt:
      'A country has about 60 million people on 300,000 km² of territory, of which only 30,000 km² is arable, worked by 3 million farmers. Its physiological density (people per km² of arable land) is closest to which value?',
    scenario: { population: 60_000_000, totalLand: 300_000, arableLand: 30_000, farmers: 3_000_000, densityType: 'physiological' },
    options: [
      { id: 'a', label: '≈ 200 per km²' },
      { id: 'b', label: '≈ 2,000 per km²' },
      { id: 'c', label: '≈ 100 per km²' },
      { id: 'd', label: '≈ 600 per km²' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Physiological density = people ÷ arable land = 60M ÷ 30,000 ≈ 2,000/km² — far above the arithmetic density, revealing real pressure on farmland.',
    concepts: ['density'],
  },
  {
    template: 'density-measure',
    prompt:
      'A country has 50 million people on 500,000 km², with 25,000 km² of arable land worked by 5 million farmers. Its agricultural density (farmers per km² of arable land) is closest to which value?',
    scenario: { population: 50_000_000, totalLand: 500_000, arableLand: 25_000, farmers: 5_000_000, densityType: 'agricultural' },
    options: [
      { id: 'a', label: '≈ 100 per km²' },
      { id: 'b', label: '≈ 200 per km²' },
      { id: 'c', label: '≈ 2,000 per km²' },
      { id: 'd', label: '≈ 50 per km²' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Agricultural density = farmers ÷ arable land = 5M ÷ 25,000 ≈ 200/km²; a high value signals labor-intensive, less-mechanized farming.',
    concepts: ['density'],
  },

  // ---- Malthus (population vs food) --------------------------------------
  {
    template: 'malthus-outcome',
    prompt:
      "A region's population starts at 100 and grows 3% a year, while its food supply starts at 130 and rises by just 1 unit a year. Over the next 50 years, what happens?",
    scenario: { pop0: 100, food0: 130, growthRate: 3, foodSlope: 1, horizon: 50 },
    options: [
      { id: 'a', label: 'Food keeps pace and any shortfall is averted' },
      { id: 'b', label: 'Population overtakes the food supply — a Malthusian crisis' },
      { id: 'c', label: 'Population and food rise in lockstep and never meet' },
      { id: 'd', label: 'Population levels off on its own well before the food limit' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Exponential 3% growth overtakes linear food (+1/yr) within ~12 years — the crisis Malthus predicted.',
    concepts: ['malthus', 'carrying-capacity'],
  },
  {
    template: 'malthus-outcome',
    prompt:
      "A region's population starts at 100 and grows 1% a year, while new farming technology raises its food supply by 6 units a year from a starting 150. Over the next 50 years, what happens?",
    scenario: { pop0: 100, food0: 150, growthRate: 1, foodSlope: 6, horizon: 50 },
    options: [
      { id: 'a', label: 'Population outstrips the food supply — a Malthusian crisis' },
      { id: 'b', label: 'Food more than keeps pace; the population never catches it' },
      { id: 'c', label: 'Both population and food collapse to zero' },
      { id: 'd', label: 'They rise in perfect balance, exactly equal every year' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Linear food gains of +6/yr easily outrun 1% population growth, so the curves never cross — the Boserup/technology rebuttal to Malthus.',
    concepts: ['malthus', 'boserup'],
  },

  // ---- dependency ratio --------------------------------------------------
  {
    template: 'dependency-ratio',
    prompt:
      "A country's population is 40% children (0–14), 55% working-age (15–64), and 5% elderly (65+). Its total dependency ratio (dependents per 100 working-age) is closest to which value?",
    scenario: { youth: 40, working: 55, elderly: 5 },
    options: [
      { id: 'a', label: '≈ 45' },
      { id: 'b', label: '≈ 82' },
      { id: 'c', label: '≈ 100' },
      { id: 'd', label: '≈ 18' },
    ],
    claimedCorrectId: 'b',
    explanation: 'Dependency ratio = (youth + elderly) ÷ working-age × 100 = (40+5)/55×100 ≈ 82 — a heavy youth burden.',
    concepts: ['dependency-ratio'],
  },
  {
    template: 'dependency-ratio',
    prompt:
      'An aging country is 15% children, 60% working-age, and 25% elderly. Its total dependency ratio is closest to which value?',
    scenario: { youth: 15, working: 60, elderly: 25 },
    options: [
      { id: 'a', label: '≈ 25' },
      { id: 'b', label: '≈ 67' },
      { id: 'c', label: '≈ 40' },
      { id: 'd', label: '≈ 92' },
    ],
    claimedCorrectId: 'b',
    explanation: '(15+25)/60×100 ≈ 67 — here the burden is driven by the elderly, not youth.',
    concepts: ['dependency-ratio', 'aging'],
  },

  // ---- migration (net change) --------------------------------------------
  {
    template: 'net-migration',
    prompt:
      'A wealthy country has a crude birth rate of 9, a crude death rate of 11, and net in-migration of 10 per 1,000. Counting births, deaths, AND migration, what is happening to its population?',
    scenario: { cbr: 9, cdr: 11, netMigration: 10 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'c',
    explanation: 'Total change = (9−11) + 10 = +8 per 1,000: natural decrease is more than offset by in-migration, so the population grows.',
    concepts: ['migration'],
  },
  {
    template: 'net-migration',
    prompt:
      'A developing country has a crude birth rate of 30, a crude death rate of 9, but net OUT-migration of 14 per 1,000 as workers leave. Counting births, deaths, and migration, what is happening to its population?',
    scenario: { cbr: 30, cdr: 9, netMigration: -14 },
    options: TREND_OPTIONS,
    claimedCorrectId: 'c',
    explanation: 'Total change = (30−9) − 14 = +7 per 1,000: strong natural increase is cut to moderate growth by heavy emigration.',
    concepts: ['migration'],
  },
];

export interface VerifiedBankItem {
  question: VerifiedSkillCheckQuestion;
  /** The due concept(s) this item was selected for (for mastery attribution). */
  concepts: string[];
}

/**
 * Verified bank items whose concepts intersect `dueConcepts`. Each is re-checked through
 * the same `verifySkillCheckQuestion` gate at load time, so a malformed item is dropped
 * rather than shown.
 */
export function bankItemsForConcepts(dueConcepts: string[]): VerifiedBankItem[] {
  const due = new Set(dueConcepts);
  const out: VerifiedBankItem[] = [];
  for (const item of REVIEW_BANK) {
    const hit = item.concepts.filter((c) => due.has(c));
    if (hit.length === 0) continue;
    const question = verifySkillCheckQuestion(item);
    if (question) out.push({ question, concepts: hit });
  }
  return out;
}

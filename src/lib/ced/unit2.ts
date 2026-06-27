// AP Human Geography — Unit 2 (Population & Migration) College Board CED topics.
// Used to ground AI-generated skill-check questions in the SPECIFIC subunit(s) a
// lesson covers, instead of a hardcoded "Unit 2 / DTM" framing. Authored from the
// official CED topic outline + research/ap-human-geography-dtm-teaching-knowledge-base.md
// and research/unit2-lesson-architecture.md (the locked per-lesson topic mapping).
//
// `learningObjective` is the CED LO in plain language; `essentialKnowledge` lists
// the specific ideas students are assessed on for that topic. Corrections are a
// one-file data edit here.

export interface CedTopic {
  /** CED topic code, e.g. '2.6'. */
  code: string;
  /** CED topic title. */
  title: string;
  /** The learning objective, in plain language. */
  learningObjective: string;
  /** Specific testable ideas under this topic. */
  essentialKnowledge: string[];
}

export const CED_UNIT2: Record<string, CedTopic> = {
  '2.1': {
    code: '2.1',
    title: 'Population Distribution',
    learningObjective:
      'Identify the factors that influence the distribution of human populations at different scales.',
    essentialKnowledge: [
      'Physical factors (climate, landforms, bodies of water, soil) and human factors (culture, economics, history, politics) shape where people live.',
      'Population is concentrated in a small number of regions; the pattern observed depends on the scale of analysis (global, national, local).',
    ],
  },
  '2.2': {
    code: '2.2',
    title: 'Consequences of Population Distribution (Density)',
    learningObjective:
      'Explain how population distribution and density affect society and the environment, including the three density measures and carrying capacity.',
    essentialKnowledge: [
      'Arithmetic density = total population ÷ total land area (overall crowding).',
      'Physiological density = total population ÷ arable land (pressure on food-producing land).',
      'Agricultural density = number of farmers ÷ arable land (a measure of agricultural development / mechanization — low = more mechanized).',
      'Carrying capacity is the maximum population an environment can sustainably support.',
      'Physiological and agricultural density reveal pressure that arithmetic density hides.',
    ],
  },
  '2.3': {
    code: '2.3',
    title: 'Population Composition',
    learningObjective:
      'Describe elements of population composition and interpret population pyramids (age–sex structure).',
    essentialKnowledge: [
      'Population pyramids show the age and sex structure of a population (males left, females right, in cohorts).',
      'Shape signals growth and DTM stage: expansive (wide base) = rapid growth; stationary (column) = stable; constrictive (narrow base) = decline.',
      'Pyramids are used to predict future growth, dependency burdens, and demand for goods, services, and markets.',
    ],
  },
  '2.4': {
    code: '2.4',
    title: 'Population Dynamics',
    learningObjective:
      'Explain factors that account for contemporary and historical trends in population growth and decline using demographic rates and measures.',
    essentialKnowledge: [
      'Crude birth rate (CBR) and crude death rate (CDR) are per 1,000 people per year; rate of natural increase (RNI/NIR) = CBR − CDR (divide by 10 for a percentage).',
      'Total fertility rate (TFR) = average lifetime children per woman; replacement-level fertility ≈ 2.1.',
      'Infant mortality rate (IMR) = infant deaths under age 1 per 1,000 live births.',
      'Doubling time via the Rule of 70 ≈ 70 ÷ growth rate (%).',
      'Demographic (population) momentum: a youthful age structure keeps a population growing even after TFR falls to replacement.',
    ],
  },
  '2.5': {
    code: '2.5',
    title: 'The Demographic Transition Model',
    learningObjective:
      'Explain theories of population growth and decline using the demographic transition model and the epidemiological transition (IMP-2.B).',
    essentialKnowledge: [
      'DTM stages: 1 high stationary (high CBR & CDR); 2 early expanding (CDR plunges first → boom); 3 late expanding (CBR falls); 4 low stationary (low CBR & CDR); 5 declining (CBR below CDR).',
      'Death rates fall before birth rates; the lag between them is the Stage-2 population explosion.',
      'Epidemiological transition (IMP-2.B.2): dominant causes of death shift from infectious/communicable disease and famine (early stages) to chronic/degenerative disease (later stages).',
      'The DTM is a generalized model and a classification scheme — real countries deviate in timing, speed, and path.',
    ],
  },
  '2.6': {
    code: '2.6',
    title: 'Malthusian Theory',
    learningObjective:
      'Explain and evaluate the theory of Thomas Malthus and its critiques (IMP-2.B.3).',
    essentialKnowledge: [
      'Malthus argued population grows exponentially while food supply grows linearly, so population would outrun food → crisis.',
      'Positive checks (famine, disease, war) raise the death rate; preventive checks (later marriage, lower fertility) lower the birth rate.',
      'Critiques: technological and agricultural innovation (Green Revolution; Boserup — necessity drives intensification) and the DTM fertility decline let food keep pace.',
      'Neo-Malthusians extend the argument to finite resources such as water, energy, and a changing climate.',
    ],
  },
  '2.7': {
    code: '2.7',
    title: 'Population Policies',
    learningObjective: 'Explain the intent and effects of pro-natalist and anti-natalist population policies.',
    essentialKnowledge: [
      'Anti-natalist policies aim to lower fertility (e.g., China’s one-child policy, family-planning and contraception campaigns).',
      'Pro-natalist policies aim to raise fertility (baby bonuses, paid parental leave, childcare subsidies — e.g., France, Hungary, Japan).',
      'Policies attempt to override the slow, personal pace at which fertility norms change.',
    ],
  },
  '2.8': {
    code: '2.8',
    title: 'Women and Demographic Change',
    learningObjective:
      'Explain how changes in the role and status of women have demographic consequences.',
    essentialKnowledge: [
      'Rising female education, paid employment, access to contraception, later marriage, and changing values lower TFR.',
      'Falling infant mortality (IMR) removes the need for “insurance” births, further lowering fertility.',
      'These personal/cultural shifts are why birth rates fall later and more slowly than death rates (Stage 3).',
    ],
  },
  '2.9': {
    code: '2.9',
    title: 'Aging Populations',
    learningObjective: 'Explain the causes and consequences of an aging population (IMP-2.C).',
    essentialKnowledge: [
      'Falling fertility plus rising life expectancy shift the age structure older.',
      'Dependency ratio = (population aged 0–14 + population aged 65+) ÷ working-age population (15–64), often ×100.',
      'Youth dependency dominates in Stages 2–3; elderly dependency dominates in Stages 4–5.',
      'Aging strains pensions, healthcare, and the size of the labor force.',
    ],
  },
  '2.10': {
    code: '2.10',
    title: 'Causes of Migration',
    learningObjective:
      'Explain the causes of migration, including push and pull factors and intervening factors.',
    essentialKnowledge: [
      'Push factors drive people away; pull factors attract them. Both fall into economic, political, environmental, and social/cultural categories.',
      'Intervening obstacles block a move; intervening opportunities divert it before the destination.',
      'Distance decay and Ravenstein’s laws: most migrants move short distances, often in steps.',
    ],
  },
  '2.11': {
    code: '2.11',
    title: 'Forced and Voluntary Migration',
    learningObjective: 'Explain types of forced and voluntary migration.',
    essentialKnowledge: [
      'Voluntary migration is a choice: economic, transnational, guest-worker, chain, and step migration; internal vs international.',
      'Forced migration is not a choice: refugees (cross a border), asylum seekers, internally displaced persons (IDPs), and trafficking.',
    ],
  },
  '2.12': {
    code: '2.12',
    title: 'Effects of Migration',
    learningObjective: 'Explain the effects of migration on origin and destination regions.',
    essentialKnowledge: [
      'Migrants are age- and sex-selective (often young, working-age, and disproportionately male in labor flows).',
      'Origin regions gain remittances but lose labor and talent (brain drain) and skew older.',
      'Destination regions gain labor and cultural diversity and a young-adult bulge in the pyramid.',
    ],
  },
};

/**
 * Compact, prompt-ready description of a set of CED topics for grounding
 * AI-generated questions. Unknown codes are skipped; returns '' when none resolve.
 */
export function cedTopicsText(codes: string[]): string {
  const blocks = codes
    .map((code) => CED_UNIT2[code])
    .filter((t): t is CedTopic => Boolean(t))
    .map((t) => {
      const ek = t.essentialKnowledge.map((e) => `  - ${e}`).join('\n');
      return `Topic ${t.code} — ${t.title}: ${t.learningObjective}\n${ek}`;
    });
  return blocks.join('\n\n');
}

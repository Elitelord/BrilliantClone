import type { Lesson } from '../../types/content';

// Lesson 3 — Why the curves move: deaths fall fast and first (the epidemiological
// transition / Stage 2 plunge), births fall later and slowly (the fertility
// transition / Stage 3), and the lag between them is the Stage 2 population boom.
export const epiTransition: Lesson = {
  id: 'epi-transition',
  courseId: 'dtm',
  title: 'Why the Curves Move',
  subtitle: 'Why deaths fall fast, births fall slow, and the lag between them',
  concept:
    'Deaths fall first and fast because public health (clean water, vaccines, food, medicine) reaches everyone quickly. Births fall later and slowly because family size is a personal choice that only changes as farms become cities and children become school + cost. That lag — fast death drop, slow birth drop — is the Stage 2 boom you saw in Lesson 1.',
  cedTopics: ['2.5', '2.8', '2.7'],
  order: 3,
  prerequisites: ['population-pyramids'],
  steps: [
    {
      id: 'learn-deaths-first',
      kind: 'learn',
      prompt: 'Death rates fell first — and fast.',
      concept:
        'In Lesson 1 you saw the red death curve plunge in Stage 2 while births stayed high. That plunge tracks a real shift in what kills people — driven by public-health breakthroughs that reached whole populations quickly.',
      concepts: ['etm', 'cause-of-death', 'dtm-stages'],
      interaction: {
        type: 'info',
        config: {
          icon: '📉',
          body:
            'Before modern development, most deaths came from infectious disease and famine. As countries develop, those causes shrink fast — because the fixes are external and reach everyone in a few years. People then increasingly die from chronic conditions like heart disease and cancer.',
          points: [
            'This shift in causes is the epidemiological transition (ETM)',
            'Stage 2 levers: clean water & sanitation, vaccines & medicine, reliable food',
            'These are external fixes — they cut deaths quickly, for everyone at once',
            'That is why the crude death rate (CDR) crashes in Stage 2',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: explore how the causes of death shift as a country develops.',
      },
    },
    {
      id: 'explore-cause-mix',
      kind: 'explore',
      prompt: 'Drag the development handle. Watch which causes lead — and how many people die in total each year.',
      concept:
        'Early societies lose huge numbers to infectious disease and famine. Developed societies see chronic disease lead the mix, but the total number of deaths falls sharply — fewer people die overall, even as heart disease and cancer become the top causes.',
      concepts: ['etm', 'cause-of-death'],
      difficulty: 1,
      interaction: {
        type: 'category-bars',
        config: { initialDev: 1 },
      },
      feedback: {
        onExplore:
          'Chronic disease leads in developed stages, but total deaths are far lower than in Stage 1–2 — the mix shifts and the death rate falls together.',
      },
    },
    {
      id: 'predict-stage1-killer',
      kind: 'predict',
      prompt:
        'In a Stage 1 society, which causes kill the most people? Drag up on each card to show the mix.',
      concepts: ['etm', 'cause-of-death', 'dtm-stages'],
      difficulty: 1,
      interaction: {
        type: 'category-bars',
        config: {
          mode: 'adjust',
          initialFigures: { infectious: 2, famine: 2, accidents: 1, chronic: 1 },
        },
      },
      answer: {
        minFigures: { infectious: 5, famine: 4 },
        maxFigures: { accidents: 2, chronic: 2 },
      },
      feedback: {
        correct:
          'Right — before clean water, vaccines, and reliable food, infectious disease and famine stack highest.',
        byOutcome: {
          chronic: 'Chronic disease dominates only after development — when people live long enough for those conditions to matter.',
          accidents: 'Injuries arent as relevant because there arent many cars and other machines yet.',
          'infectious-low': 'Remember the lack of medical care and vaccines.',
          'famine-low': 'Food shortages were common in Stage 1.',
        },
        hint: 'Drag up on infectious disease and famine. Keep accidents and chronic low.',
      },
    },
    {
      id: 'predict-stage3-killer',
      kind: 'predict',
      prompt:
        'Now a Stage 3 society, well into development. Which causes kill the most people? Drag up on each card to show the mix.',
      concepts: ['etm', 'cause-of-death', 'dtm-stages'],
      difficulty: 2,
      interaction: {
        type: 'category-bars',
        config: {
          mode: 'adjust',
          initialFigures: { infectious: 2, famine: 2, accidents: 2, chronic: 2 },
        },
      },
      answer: {
        minFigures: { chronic: 5 },
        maxFigures: { infectious: 4, famine: 2, accidents: 4 },
      },
      feedback: {
        correct:
          'Right — Stage 3 is the age of degenerative and "man-made" disease: chronic illness like heart disease and cancer leads, while accidents and injuries also climb as cars, machines, and factories spread. Infectious disease and famine have receded.',
        byOutcome: {
          'chronic-low':
            'By Stage 3 chronic disease becomes more prevalent.',
          infectious:
            'Infectious disease has receded by Stage 3 thanks to clean water and vaccines.',
          famine: 'Famine is rare by Stage 3 with reliable food supplies.',
          accidents:
            'Accidents and injuries do rise with industry, but they are not the main killer.',
        },
        hint: 'Chronic disease leads. Accidents/injuries are a notable secondary (industry, cars, machines). Infectious and famine are lower now.',
      },
    },
    {
      id: 'learn-why-births-fall',
      kind: 'learn',
      prompt: 'So why do births fall later — and so slowly?',
      concept:
        'Cutting deaths is something a government can do for you. Having fewer children is a decision each family makes — and those decisions only change as life changes from farm to city. That is why births lag deaths by a whole stage.',
      concepts: ['fertility-transition', 'dtm-stages', 'population-boom'],
      interaction: {
        type: 'info',
        config: {
          icon: '👶',
          formula: 'IMR = infant deaths (under age 1) per 1,000 live births',
          body:
            'Family size is a personal choice and mainly shrinks as the reasons to have children disappear. These changes are enacted over a generation and with cultural shifts. One of the biggest reasons is the infant mortality rate (IMR).',
          points: [
            'On a farm, children provide labor, so families stay large even as death rates fall.',
            'In a city, children require education and other resources, so families get smaller to save on costs',
            'IMR plays two roles: it is a top development indicator (low IMR = developed) AND a driver of fertility.',
            'When IMR is high, families expect more children to die, so they require more births; when IMR falls, that need disappears, so births drop.',
            'Increased access to education and paid work for women also contribute to smaller families.',
          ],
        },
      },
      feedback: {
        onExplore:
          'Deaths drop fast (external + for everyone); births drop slowly (personal + one family at a time). That gap is the Stage 2 boom from Lesson 1.',
      },
    },
    {
      id: 'explore-births',
      kind: 'explore',
      prompt: 'Tap each change to see how it pulls the average birth rate down.',
      concept:
        'No single policy crashes births the way clean water crashes deaths. Instead, births fall as many slow changes stack up — surviving children, city jobs, girls in school, contraception, pensions. Each one only nudges family size down, and none happen overnight. That is why births fall gradually, a full stage after deaths.',
      concepts: ['fertility-transition', 'dtm-stages', 'population-boom'],
      difficulty: 1,
      interaction: {
        type: 'family-size',
        config: { mode: 'explore' },
      },
      feedback: {
        onExplore:
          'Each change only nudges births down, and they stack slowly — that is why the birth fall lags the fast death fall.',
      },
    },
    {
      id: 'learn-population-policy',
      kind: 'learn',
      prompt: 'What if a government wants to move the birth curve faster?',
      concept:
        'Births normally fall on their own as a society changes — but that takes a generation. Governments sometimes try to speed the curve up (or push it back up) with deliberate policy. These pull in two opposite directions.',
      concepts: ['population-policy', 'pro-natalist', 'anti-natalist', 'fertility-transition'],
      interaction: {
        type: 'info',
        config: {
          icon: '🏛️',
          body:
            'Population policy is when a government tries to move the birth curve faster than culture would on its own. It runs in two directions: anti-natalist and pro-natalist.',
          points: [
            'Anti-natalist policy lowers births: China\u2019s one-child policy and India\u2019s sterilization campaigns are the classic cases.',
            'Pro-natalist policy raises births: France, Sweden, and Hungary offer baby bonuses, paid parental leave, and cheaper childcare; Japan adds incentives to fight its shrinking, aging population.',
          ],
        },
      },
      feedback: {
        onExplore:
          'Next: run a policy lab — toggle anti-natalist and pro-natalist levers and watch a country\u2019s population respond over decades.',
      },
    },
    {
      id: 'explore-policy-lab',
      kind: 'explore',
      prompt:
        'This country is booming. Toggle policy levers and watch the running population total respond over the next 50 years.',
      concept:
        'Anti-natalist levers (birth caps, free contraception, female education, later marriage) bend the curve down; pro-natalist levers (baby bonuses, parental leave, childcare, immigration) push it up. No single lever flips a fast-growing country — it takes a coherent package.',
      concepts: ['population-policy', 'pro-natalist', 'anti-natalist'],
      difficulty: 1,
      interaction: {
        type: 'policy-lab',
        config: { showCount: true, initialPopulation: 50, baselineGrowth: 14, decades: 5 },
      },
      feedback: {
        onExplore:
          'Pro-natalist policies push the total higher; anti-natalist policies bend it down. One lever rarely does much — strong policy stacks several together.',
      },
    },
    {
      id: 'solve-policy-guess',
      kind: 'solve',
      prompt:
        'A fast-growing country (50M today) locks in this mix of policies. Estimate its population 50 years from now.',
      concepts: ['population-policy', 'pro-natalist', 'anti-natalist'],
      difficulty: 3,
      interaction: {
        type: 'policy-lab',
        config: {
          mode: 'guess',
          initialPopulation: 50,
          baselineGrowth: 14,
          decades: 5,
          preset: ['birthcaps', 'femaleed', 'babybonus', 'childcare'],
          guessMin: 30,
          guessMax: 120,
        },
      },
      answer: { guessWithin: 8 },
      feedback: {
        correct:
          'Right around 74M. The package nearly cancels: the birth caps and female-education drive (strongly anti-natalist) outweigh the baby bonus and cheaper childcare (mildly pro-natalist), so growth eases from the +14 baseline to about +8 per 1,000. The country still grows — just slower — from 50M to roughly 74M over 50 years.',
        byOutcome: {
          'too-high':
            'Too high. You went the right direction, but you leaned too much on the pro-natalist policies.',
          'too-low':
            'Too low. The anti-natalist policies slow growth but do not reverse it — net growth stays positive (about +8 per 1,000).',
        },
        hint: 'Weigh the two strong anti-natalist policies (birth caps, female education) against the two milder pro-natalist ones (baby bonus, childcare).',
      },
    },
    {
      id: 'sort-which-rate',
      kind: 'connect',
      prompt: 'Does each change lower DEATHS or BIRTHS first? Sort all four into the right bucket.',
      concepts: ['etm', 'fertility-transition', 'population-boom'],
      difficulty: 3,
      interaction: {
        type: 'match-pairs',
        config: {
          multiPerSlot: true,
          instruction: 'Sort each change into the rate it lowers first.',
          tiles: [
            { id: 'womenwork', label: 'Women in paid work', icon: '💼' },
            { id: 'water', label: 'Clean water', icon: '💧' },
            { id: 'foodsupply', label: 'Reliable food', icon: '🌽' },
            { id: 'girlsed', label: "Girls' education", icon: '🎓' },
            { id: 'vaccines', label: 'Vaccines', icon: '💉' },
            { id: 'sanitation', label: 'Sewers & sanitation', icon: '🚿' },
            { id: 'contraception', label: 'Contraception', icon: '🩺' },
          ],
          slots: [
            { id: 'deaths', label: 'Lowers DEATHS', sublabel: 'fast, external', icon: '📉' },
            { id: 'births', label: 'Lowers BIRTHS', sublabel: 'slow, personal', icon: '👶' },
          ],
        },
      },
      answer: {
        pairs: {
          water: 'deaths',
          vaccines: 'deaths',
          sanitation: 'deaths',
          foodsupply: 'deaths',
          girlsed: 'births',
          contraception: 'births',
          womenwork: 'births',
        },
      },
      feedback: {
        correct:
          'That is the lag: sanitation, vaccines, clean water and reliable food reach everyone in years and cut deaths fast; education, contraception and women working change family choices and cut births a generation later. Deaths fall first, births follow — that gap is the boom.',
        incorrect:
          'Not quite, try again.',
        hint: 'Ask of each: does a government roll this out for everyone (deaths), or does each family decide it (births)?',
      },
    },
    {
      id: 'explain-deaths-before-births',
      kind: 'connect',
      prompt: 'Why do death rates fall before birth rates?',
      concepts: ['etm', 'fertility-transition', 'population-boom'],
      difficulty: 2,
      interaction: {
        type: 'explain-back',
        config: {
          question: 'Explain why deaths drop before births in the demographic transition.',
          rubric: [
            'Deaths fall fast due to external improvements (water, medicine, food).',
            'Births fall later due to personal/cultural choices (education, contraception, cost of children).',
            'The lag between them creates the Stage 2 population boom.',
          ],
          sampleAnswer:
            'Death rates fall first because clean water, vaccines, and better food reach everyone quickly. Birth rates fall later because families slowly choose smaller families as kids become costly and women gain education. That lag is the Stage 2 boom.',
          minChars: 20,
        },
      },
      feedback: {
        correct: 'You explained the timing difference well.',
        incorrect: 'Cover why deaths fall fast, births fall slow, and what the lag causes.',
      },
    },
  ],
};

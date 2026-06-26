import type { Lesson } from '../../types/content';

// Lesson 5 — migration as a force, types of migration, DTM critique, and policy ("When the Model Breaks").
export const modelBreaks: Lesson = {
  id: 'model-breaks',
  courseId: 'dtm',
  title: 'When the Model Breaks',
  subtitle: 'Migration, policy, and the limits of the textbook model',
  concept:
    'The DTM is a compass, not a GPS — an average path, not a law. Migration, government policy, Eurocentric timing, and real-world surprises push countries off the predicted curve.',
  order: 5,
  prerequisites: ['population-structure'],
  steps: [
    {
      id: 'learn-model-not-law',
      kind: 'learn',
      prompt: 'The DTM is a model — not a law.',
      concept:
        'Textbook curves average out centuries of European history. Real countries can skip stages, stall, or bend off the path because migration, policy, and local culture are forces the simple model ignores.',
      concepts: ['dtm-critique'],
      interaction: {
        type: 'info',
        config: {
          icon: '🧭',
          body:
            'Like Population Pyramids, the Demographic Transition Model (DTM) is a model. It shows the general direction many countries travel in during their development, but it doesn\'t map onto every one. Real countries can skip stages, stall, or bend off the path.',
          points: [
            'Migration can add or subtract people regardless of birth/death rates',
            'Government policy can push births up or down overnight',
            'The European timeline is just one of many possible paths',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: see how migration alone can flip total population change.',
      },
    },
    {
      id: 'explore-migration-flow',
      kind: 'explore',
      prompt: 'Drag the in- and out-migration arrows. Watch total population change even when natural increase stays fixed.',
      concept:
        'Total population change = natural increase + net migration. A country with near-zero natural increase can still grow fast through immigration — or shrink through emigration.',
      concepts: ['migration', 'natural-increase'],
      difficulty: 1,
      interaction: {
        type: 'migration-flow',
        config: {
          naturalChange: 0.5,
          countryPresets: [
            { id: 'stable', label: 'Stable country', birthRate: 10, deathRate: 9.5 },
            { id: 'japan', label: 'Japan', flag: '🇯🇵', birthRate: 6, deathRate: 13 },
            { id: 'england', label: 'England', flag: '🏴', birthRate: 10, deathRate: 9 },
            { id: 'nigeria', label: 'Nigeria', flag: '🇳🇬', birthRate: 42, deathRate: 10 },
          ],
          initialPresetId: 'stable',
          initialIn: 6,
          initialOut: 4,
          showVerdict: true,
        },
      },
      feedback: {
        onExplore:
          'Natural increase is barely positive — but net migration can overpower it. That is why the DTM alone cannot explain every country.',
      },
    },
    {
      id: 'solve-migration-shrink',
      kind: 'solve',
      prompt: 'This country has near-zero natural increase. Use migration to make its population shrink.',
      concepts: ['migration', 'natural-increase'],
      difficulty: 2,
      interaction: {
        type: 'migration-flow',
        config: {
          naturalChange: 0.5,
          countryPresets: [
            { id: 'stable', label: 'Stable country', birthRate: 10, deathRate: 9.5 },
          ],
          initialPresetId: 'stable',
          lockCountry: true,
          initialIn: 4,
          initialOut: 2,
          showVerdict: false,
        },
      },
      answer: { trend: 'shrinking' },
      feedback: {
        correct:
          'Right — heavy out-migration can shrink a country even when births barely exceed deaths. Migration is a force on totals, not just a pyramid shape.',
        incorrect: 'Not Quite — try again.',
        hint: 'Look at the natural increase rate, what does the net migration need to be to make the population shrink?',
      },
    },
    {
      id: 'explore-deviation-countries',
      kind: 'explore',
      prompt: 'Compare the textbook DTM path to what really happened. Switch countries and drag the year — both charts move together.',
      concept:
        'South Korea compressed the transition in decades. The UAE exploded through labor migration. Niger stayed in prolonged Stage 2. None matched the idealized textbook curve.',
      concepts: ['dtm-critique', 'migration'],
      difficulty: 1,
      interaction: {
        type: 'country-model',
        config: {
          countryIds: ['south-korea', 'uae', 'niger'],
          initialCountryId: 'south-korea',
          comparison: true,
          showTotalPopulationLine: true,
        },
      },
      feedback: {
        onExplore:
          'Each country bends the model differently — speed, migration, or a stuck early stage. That is why critics call the DTM Eurocentric and incomplete.',
      },
    },
    {
      id: 'match-country-deviations',
      kind: 'connect',
      prompt: 'Match each country to how it most clearly breaks the textbook model.',
      concepts: ['dtm-critique', 'migration'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each critique to the country it best describes.',
          tiles: [
            { id: 'ignores-policy', label: 'The government capped family size for a generation' },
            { id: 'eurocentric', label: 'The country is stuck in early transition period for many years' },
            { id: 'no-timing', label: 'The transition happened in a few decades, not centuries, a much faster pace' },
            { id: 'ignores-migration', label: 'The population boom was driven by foreign workers' },
          ],
          slots: [
            { id: 'uae', label: 'United Arab Emirates', icon: '🇦🇪' },
            { id: 'niger', label: 'Niger', icon: '🇳🇪' },
            { id: 'south-korea', label: 'South Korea', icon: '🇰🇷' },
            { id: 'china', label: 'China', icon: '🇨🇳' },
          ],
        },
      },
      answer: {
        pairs: {
          'no-timing': 'south-korea',
          'ignores-migration': 'uae',
          'ignores-policy': 'china',
          'eurocentric': 'niger',
        },
      },
      feedback: {
        correct:
          'Exactly — Korea compressed the timeline, the UAE grew through migration, China\'s policy carved the pyramid, and Niger shows a non-European path stuck in Stage 2.',
        incorrect: 'Not quite — match each country to the critique it best illustrates.',
      },
    },
    {
      id: 'draw-transition-speed',
      kind: 'solve',
      prompt:
        'Draw South Korea\'s death rate curve. Drag the red points to show how deaths change across time for the country.',
      concepts: ['dtm-critique'],
      difficulty: 2,
      interaction: {
        type: 'curve-draw',
        config: {
          curves: ['death'],
          xLabel: 'Year',
          xTicks: ['1950', '1970', '1990', '2010', '2020'],
          referenceCurves: { death: [24, 20, 15, 10, 8] },
          initial: { death: [40, 40, 40, 40, 40] },
        },
      },
      answer: { death: [24, 8, 6, 6, 6] },
      feedback: {
        correct:
          'Exactly — your curve plunges in the first interval instead of drifting down slowly.',
        incorrect:
          'Not quite — try again.',
        hint: 'Remember the death rate curve, what does it look like for South Korea?',
      },
    },
    {
      id: 'learn-migration-types',
      kind: 'learn',
      prompt: 'People move for reasons — and not always by choice.',
      concept:
        'Geographers sort migration two ways. Push vs pull asks which direction the force points: a reason that drives people away (push) or one that draws them in (pull). Forced vs voluntary asks how much choice people had: fleeing war or disaster (forced) versus moving for a better life (voluntary).',
      concepts: ['migration', 'push-pull', 'forced-migration'],
      interaction: {
        type: 'info',
        config: {
          icon: '🧳',
          body:
            'Factors for migration can be considered as push or pull factors. Migration is also described as forced or voluntary. ',
          points: [
            'Push factors drive people away, this includes war, persecution, famine, and lost jobs',
            'Pull factors draw people in like jobs, safety, family, and schools',
            'Forced migration leaves no real choice, this includes refugees fleeing war or disaster',
            'Voluntary migration is a decision, this includes people moving for a better life or a job opportunity',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: sort real scenarios into the right type of migration.',
      },
    },
    {
      id: 'match-migration-types',
      kind: 'connect',
      prompt: 'Every reason for migration has a direction and a level of choice it offers. Drop each scenario into both categories it fits.',
      concepts: ['migration', 'push-pull', 'forced-migration'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction:
            'Each scenario belongs in TWO categories — one of push / pull, and one of forced / voluntary. Drag it into both.',
          multiPerTile: true,
          maxPerTile: 2,
          tiles: [
            { id: 'push-famine', label: 'Crop failure and famine drive families out' },
            { id: 'forced-war', label: 'Refugees flee across a border after civil war' },
            { id: 'pull-city', label: 'A safe city full of jobs attracts newcomers' },
            { id: 'voluntary-job', label: 'A nurse moves abroad for a better-paying job' },
            { id: 'voluntary-family', label: 'A family moves to a country another member is already in' },
            { id: 'push-policy', label: 'A government enacts an unfavorable policy' },
          ],
          slots: [
            { id: 'forced', label: 'Forced migration', icon: '🆘', sublabel: 'No real choice' },
            { id: 'pull', label: 'Pull factor', icon: '🧲', sublabel: 'Draws people in' },
            { id: 'voluntary', label: 'Voluntary migration', icon: '🧭', sublabel: 'A free decision' },
            { id: 'push', label: 'Push factor', icon: '💥', sublabel: 'Drives people away' },
          ],
        },
      },
      answer: {
        tileSlots: {
          'push-famine': ['push', 'forced'],
          'forced-war': ['push', 'forced'],
          'pull-city': ['pull', 'voluntary'],
          'voluntary-job': ['pull', 'voluntary'],
          'voluntary-family': ['pull', 'voluntary'],
          'push-policy': ['push', 'voluntary'],
        },
      },
      feedback: {
        correct:
          'Exactly — direction (push/pull) and choice (forced/voluntary) are two separate axes. Famine and war push people out, but famine and war leave no choice (forced), while an unfavorable policy still pushes people who choose to leave (voluntary). Jobs, safety, and family pull people in by choice.',
        incorrect:
          'Not quite — each scenario needs one direction tag (push or pull) AND one choice tag (forced or voluntary).',
      },
    },
    {
      id: 'pick-civil-war-chart',
      kind: 'predict',
      prompt: 'A civil war erupts in a country. Which birth/death rate chart shows its effect over time?',
      concepts: ['dtm-critique'],
      difficulty: 2,
      interaction: {
        type: 'chart-pick',
        config: {
          instruction: 'Tap the chart whose death rate (red) spikes sharply during the war years, then falls back.',
          showTotalPopulationLine: true,
          options: [
            {
              id: 'normal-transition',
              caption: 'Country A',
              series: [
                { year: 1990, birth: 42, death: 38, pop: 20 },
                { year: 1995, birth: 41, death: 30, pop: 23 },
                { year: 2000, birth: 38, death: 20, pop: 27 },
                { year: 2005, birth: 30, death: 14, pop: 31 },
                { year: 2010, birth: 20, death: 11, pop: 35 },
                { year: 2015, birth: 14, death: 9, pop: 38 },
                { year: 2020, birth: 11, death: 8, pop: 40 },
              ],
            },
            {
              id: 'civil-war',
              caption: 'Country B',
              series: [
                { year: 1990, birth: 32, death: 9, pop: 30 },
                { year: 1995, birth: 31, death: 10, pop: 33 },
                { year: 2000, birth: 20, death: 42, pop: 30 },
                { year: 2005, birth: 22, death: 28, pop: 22 },
                { year: 2010, birth: 30, death: 11, pop: 25 },
                { year: 2015, birth: 31, death: 9, pop: 27 },
                { year: 2020, birth: 31, death: 9, pop: 29 },
              ],
            },
            {
              id: 'baby-boom',
              caption: 'Country C',
              series: [
                { year: 1990, birth: 20, death: 10, pop: 25 },
                { year: 1995, birth: 21, death: 10, pop: 27 },
                { year: 2000, birth: 38, death: 9, pop: 30 },
                { year: 2005, birth: 36, death: 9, pop: 34 },
                { year: 2010, birth: 24, death: 9, pop: 38 },
                { year: 2015, birth: 20, death: 9, pop: 41 },
                { year: 2020, birth: 19, death: 9, pop: 44 },
              ],
            },
            {
              id: 'aging',
              caption: 'Country D',
              series: [
                { year: 1990, birth: 14, death: 9, pop: 50 },
                { year: 1995, birth: 13, death: 9, pop: 51 },
                { year: 2000, birth: 12, death: 10, pop: 51 },
                { year: 2005, birth: 11, death: 11, pop: 51 },
                { year: 2010, birth: 10, death: 12, pop: 50 },
                { year: 2015, birth: 9, death: 14, pop: 49 },
                { year: 2020, birth: 8, death: 16, pop: 48 },
              ],
            },
          ],
        },
      },
      answer: { correctId: 'civil-war' },
      feedback: {
        correct:
          'Exactly — Country B is the war. The death rate (red) spikes sharply for just a few years, and the total population (violet) drops at the same time — not only from those deaths, but from refugees and emigrants fleeing the fighting. That sharp population fall from migration is exactly the force the DTM ignores; the smooth textbook curves can never show it.',
        byOutcome: {
          'normal-transition':
            'That is Country A — a normal, smooth DTM transition. Deaths fall gradually, births follow later, and total population grows steadily.',
          'baby-boom':
            'That is Country C — a baby boom. The BIRTH rate (blue) spikes while deaths stay low, so total population climbs faster than ever. ',
          'aging':
            'That is Country D — an aging, Stage 5 country. The death rate slowly rises above a low birth rate and population gently plateaus and edges down. That is a slow, gradual decline.',
        },
        incorrect:
          'Not quite — a civil war causes a sharp, temporary SPIKE in the death rate (red) AND a sharp drop in total population (violet) as people die and flee as refugees.',
      },
    },
    {
      id: 'synthesis-model-breaks',
      kind: 'connect',
      prompt: 'Synthesize: why the DTM is a model, not a law.',
      concepts: ['dtm-critique', 'migration', 'population-policy'],
      difficulty: 3,
      interaction: {
        type: 'explain-back',
        config: {
          question:
            'Why can\'t we treat the DTM as a law? Name one real country that breaks it and explain how.',
          rubric: [
            'The DTM is an average/idealized path — not a rule every country must follow.',
            'Names a real country that diverges from the textbook curve (e.g. UAE, South Korea, Niger, China).',
            'Explains a specific force: migration, policy, compressed timing, or a prolonged stage.',
            'Connects that force to why the simple birth/death model alone is incomplete.',
          ],
          sampleAnswer:
            'The DTM averages European history — it is a compass, not a GPS. The UAE breaks it because migration added millions of workers while birth rates stayed moderate, so total population grew far faster than births and deaths alone predict. That shows the model ignores migration as a force on totals.',
          minChars: 30,
        },
      },
      feedback: {
        correct: 'You connected the model\'s limits to a real country and a real force.',
        incorrect: 'Explain why the DTM is an average, name a country, and say what pushes it off the path.',
      },
    },
  ],
};

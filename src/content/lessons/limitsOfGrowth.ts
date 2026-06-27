import type { Lesson } from '../../types/content';

// Lesson 4 — The Limits of Growth. Half A sharpens "how crowded?" into three
// densities (arithmetic / physiological / agricultural) and the idea of a
// carrying capacity. Half B runs Malthus's exponential-population-vs-linear-food
// argument, lets the learner trigger and then avert the catastrophe (Boserup /
// Green Revolution / the Lesson 3 fertility decline), shows how U.S. innovation
// kept food ahead of population, and ends by extending the same logic to modern
// finite resources (water, energy, climate).
export const limitsOfGrowth: Lesson = {
  id: 'limits-of-growth',
  courseId: 'dtm',
  title: 'The Limits of Growth',
  subtitle: 'Density, carrying capacity, and whether the boom can outrun its food',
  concept:
    'People crowd onto the small share of land that can feed them, so "people per country" hides the real pressure — physiological and agricultural density reveal it. Malthus predicted exponential population would outrun linear food and trigger a crisis. It mostly did not: more food (Boserup, the Green Revolution) and the Lesson 3 fertility decline bent the curves apart. The same logic still raises worries today about water, energy, and climate.',
  cedTopics: ['2.2', '2.6'],
  order: 4,
  prerequisites: ['dtm-engine', 'epi-transition'],
  steps: [
    // ---- Half A: density --------------------------------------------------
    {
      id: 'learn-clustering',
      kind: 'learn',
      prompt: 'People do not spread out evenly when settling in a new place. So how do we measure "crowded"?',
      concept:
        'Half the planet is desert, mountain, ice, or rainforest where almost no one lives. People pile onto the thin slice of land that can feed them — so "people per country" tells you very little about real pressure.',
      concepts: ['density'],
      interaction: {
        type: 'info',
        config: {
          icon: '🌍',
          body:
            'Buman population is clustered in some places and empty in others. Typically we see people living in riverbanks, coasts, and farm belts, places with water and fertile soil. Egypt looks half-empty on paper, yet almost everyone is squeezed onto a sliver of land along the Nile.',
          points: [
            'Arithmetic density = people \u00f7 total land — the crude "how many per square km" measure',
            'Physiological density = people \u00f7 arable (farmable) land — pressure on the food system',
            'Agricultural density = farmers \u00f7 arable land — how many people it takes to work that land',
            'The three densities are very different numbers and offer different insights into the population distribution.',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: build all three densities yourself and watch them diverge.',
      },
    },
    {
      id: 'explore-density',
      kind: 'explore',
      prompt: 'Drag the sliders — or load a country — and watch the three densities split apart.',
      concept:
        'Arithmetic density shrinks when total land is huge (Canada). Physiological density spikes when farmland is scarce relative to people (Egypt). Agricultural density is high where many people still farm by hand (subsistence) and low where a few mechanized farmers feed everyone.',
      concepts: ['density', 'carrying-capacity'],
      difficulty: 1,
      interaction: {
        type: 'density-calc',
        config: {
          mode: 'explore',
          initial: { population: 109, totalLand: 1000, arableLand: 30, farmers: 25 },
          initialPresetId: 'egypt',
          maxPopulation: 250,
          maxLand: 12000,
          maxArable: 1500,
          maxFarmers: 120,
          presets: [
            { id: 'egypt', label: 'Egypt', flag: '🇪🇬', population: 109, totalLand: 1000, arableLand: 30, farmers: 25 },
            { id: 'canada', label: 'Canada', flag: '🇨🇦', population: 39, totalLand: 9985, arableLand: 460, farmers: 0 },
            { id: 'bangladesh', label: 'Bangladesh', flag: '🇧🇩', population: 171, totalLand: 148, arableLand: 95, farmers: 47 },
          ],
        },
      },
      feedback: {
        onExplore:
          'Notice Egypt: a modest arithmetic density but a sky-high physiological one — almost everyone depends on the tiny strip of farmable Nile valley. Canada is the opposite: enormous land makes arithmetic density tiny.',
      },
    },
    {
      id: 'predict-fingerprint',
      kind: 'predict',
      prompt: 'Match each country to its density fingerprint.',
      concepts: ['density'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each country onto the density fingerprint that fits it.',
          tiles: [
            { id: 'egypt', label: 'Egypt', icon: '🇪🇬' },
            { id: 'canada', label: 'Canada', icon: '🇨🇦' },
            { id: 'bangladesh', label: 'Bangladesh', icon: '🇧🇩' },
          ],
          slots: [
            { id: 'fp-egypt', label: 'High physiological only', sublabel: 'crowded onto scarce farmland', icon: '🌾' },
            { id: 'fp-canada', label: 'Low arithmetic', sublabel: 'few people across vast land', icon: '🗺️' },
            { id: 'fp-bangladesh', label: 'High arithmetic AND physiological', sublabel: 'crowded everywhere', icon: '👥' },
          ],
        },
      },
      answer: {
        pairs: { egypt: 'fp-egypt', canada: 'fp-canada', bangladesh: 'fp-bangladesh' },
      },
      feedback: {
        correct:
          'Exactly. Egypt hides its crowding in arithmetic density but reveals it in physiological density; Canada\u2019s vast land keeps arithmetic density tiny; Bangladesh is densely packed by every measure.',
        incorrect: 'Not quite — think about how much of each country is actually farmable.',
        hint: 'Which country is mostly desert? Which is mostly empty land? Which is a small, crowded, farmable delta?',
      },
    },
    {
      id: 'explore-carrying-capacity',
      kind: 'explore',
      prompt: 'Every environment has a ceiling — set by whichever resource runs out first. Adjust farmland, technology, and water, and watch the carrying capacity.',
      concept:
        'Carrying capacity is the maximum population an environment can sustain with its resources. Food is one limit (farmland × yield), water is another — and the ceiling is whichever is SMALLER (Liebig\u2019s law of the minimum). It is not fixed: better technology (irrigation, fertilizer, high-yield crops) or more water raises the binding limit. When the ceiling sits below the population, something gives: food shortages, water stress, strained services.',
      concepts: ['carrying-capacity'],
      difficulty: 1,
      interaction: {
        type: 'carrying-capacity',
        config: {
          mode: 'explore',
          initialLand: 180,
          initialYield: 4,
          initialWater: 500,
          landRange: [0, 250],
          yieldRange: [1, 8],
          waterRange: [0, 2000],
          population: 650,
        },
      },
      feedback: {
        onExplore:
          'Did you spot it? At the start water is the limit — so piling on more farmland does nothing; the ceiling stays stuck until you raise water. Carrying capacity = the smaller of food and water. Whichever runs out first is the binding constraint.',
      },
    },
    {
      id: 'solve-carrying-capacity',
      kind: 'solve',
      prompt: 'A region needs to support 800 million people. Set its farmland, technology, and water so its carrying capacity reaches that target without overshooting.',
      concepts: ['carrying-capacity'],
      difficulty: 2,
      interaction: {
        type: 'carrying-capacity',
        config: {
          mode: 'solve',
          showCapacity: false,
          initialLand: 80,
          initialYield: 3,
          initialWater: 500,
          landRange: [0, 250],
          yieldRange: [1, 8],
          waterRange: [0, 2000],
          targetCapacity: 800,
        },
      },
      answer: { targetCapacity: 800, tolerance: 40 },
      feedback: {
        correct:
          'That hits the ceiling: you lifted BOTH food (farmland × yield) and water to about 800M. Because capacity is the smaller of the two, both had to clear the target. But what happens if the population keeps growing past that ceiling? That is exactly the question Thomas Malthus tried to answer over 200 years ago.',
        byOutcome: {
          'too-low':
            'Still below 800M — find the limiting resource (whichever is smaller, food or water) and raise it. ',
          'too-high':
            'You overshot 800M. Ease the binding resource back down until the bar lands on the target notch.',
        },
        hint: 'Carrying capacity = the smaller of food (farmland × yield) and water. BOTH need to reach about 800 — e.g. farmland 200 × yield 4 for food, and water 800+.',
      },
    },
    // ---- Half B: Malthus --------------------------------------------------
    {
      id: 'learn-malthus',
      kind: 'learn',
      prompt: "Malthus's warning: population grows faster than food supply.",
      concept:
        'In 1798 Thomas Malthus argued that population grows exponentially (it doubles and doubles) while food supply grows only linearly (a little more each year). If true, population must eventually catch and overtake food — and then the limit enforces itself.',
      concepts: ['malthus', 'carrying-capacity'],
      interaction: {
        type: 'info',
        config: {
          icon: '📈',
          body:
            'Malthus saw two curves heading for a collision: an exponential population curve and a linear food curve. If they cross, the amount of people outnumber the food supply, which causes the population to go back down. He sorted the forces that pull it down into two kinds of "checks."',
          points: [
            'Positive checks RAISE the death rate and kill people: famine, war, and disease',
            'Preventive checks LOWER the birth rate and stop people from being born: delayed marriage and "moral restraint"',
            'A third solution was to raise the food supply',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: drag the curves and find out whether — and when — they collide.',
      },
    },
    {
      id: 'explore-growth',
      kind: 'explore',
      prompt: 'Population is racing toward a crisis. Toggle positive checks, preventive checks, or the food supply, and watch what happens to the curves.',
      concept:
        'A fast-growing population (steep red curve) catches even a rising food line, because exponential growth always overtakes a straight line eventually. Malthus said two kinds of "checks" pull the population back: positive checks (famine, war, disease) raise the death rate, and preventive checks (later marriage, contraception, smaller families) lower the birth rate. Boosting the food supply instead lifts the green line out of reach.',
      concepts: ['malthus', 'carrying-capacity'],
      difficulty: 1,
      interaction: {
        type: 'growth-plotter',
        config: {
          controls: 'levers',
          horizonYears: 50,
          initialPop: 100,
          initialFood: 130,
          initialGrowthRate: 2.4,
          growthRateRange: [0, 4],
          initialFoodSlope: 1.5,
          foodSlopeRange: [0, 8],
        },
      },
      feedback: {
        onExplore:
          'See it? Checks bend the red population curve down; food levers lift the green line up. Either route can pull the curves apart — or, left alone, they collide at Malthus\u2019s crisis point.',
      },
    },
    {
      id: 'solve-avert',
      kind: 'solve',
      prompt: 'Avert the catastrophe. Choose up to 3 forces (positive checks, preventive checks, or more food) that keep population from outrunning the food supply.',
      concepts: ['malthus', 'boserup', 'carrying-capacity'],
      difficulty: 3,
      interaction: {
        type: 'growth-plotter',
        config: {
          controls: 'levers',
          showChart: false,
          maxLevers: 3,
          horizonYears: 50,
          initialPop: 100,
          initialFood: 130,
          initialGrowthRate: 2.4,
          growthRateRange: [0, 4],
          initialFoodSlope: 1.5,
          foodSlopeRange: [0, 8],
        },
      },
      answer: { averted: true },
      feedback: {
        correct:
          'Right, your selections prevented the population curve from catching the food supply.',
        byOutcome: {
          crisis:
            'Not enough — population still catches food.',
        },
        hint: 'You get 3 picks. Positive checks (famine/war/disease) and preventive checks (later marriage/contraception/smaller families) slow population; food levers (Green Revolution, irrigation) raise the food line. A couple of strong picks is enough to prevent the crossover.',
      },
    },
    {
      id: 'explore-us-history',
      kind: 'explore',
      prompt:
        'Malthus predicted population would outrun food. The United States is the test case — population exploded, yet food kept climbing even faster. Tap each policy and innovation to see why.',
      concept:
        'In the real United States the food line never collided with the population line. Two centuries of innovation and policy — mechanization, the Homestead Act and land-grant farm science, synthetic fertilizer, and the Green Revolution — kept raising how much the land could feed, faster than population grew. Setbacks like the Dust Bowl show the line can dip, but the long-run trend bent the curves apart — just as Boserup argued, more people can spur the very innovation that feeds them.',
      concepts: ['malthus', 'boserup', 'carrying-capacity'],
      difficulty: 1,
      interaction: {
        type: 'food-history',
        config: {
          title: 'United States, 1800–2020',
          populationLabel: 'U.S. population',
          foodLabel: 'Food the land can support',
          unit: 'million',
          startYear: 1800,
          endYear: 2020,
          maxValue: 800,
          population: [
            { year: 1800, value: 5 },
            { year: 1820, value: 10 },
            { year: 1840, value: 17 },
            { year: 1860, value: 31 },
            { year: 1880, value: 50 },
            { year: 1900, value: 76 },
            { year: 1920, value: 106 },
            { year: 1940, value: 132 },
            { year: 1960, value: 181 },
            { year: 1980, value: 227 },
            { year: 2000, value: 281 },
            { year: 2020, value: 331 },
          ],
          food: [
            { year: 1800, value: 6 },
            { year: 1820, value: 12 },
            { year: 1840, value: 22 },
            { year: 1860, value: 40 },
            { year: 1880, value: 66 },
            { year: 1900, value: 105 },
            { year: 1920, value: 150 },
            { year: 1940, value: 205 },
            { year: 1960, value: 330 },
            { year: 1980, value: 470 },
            { year: 2000, value: 620 },
            { year: 2020, value: 760 },
          ],
          events: [
            {
              id: 'mechanization',
              year: 1837,
              icon: '🚜',
              label: 'Steel plow & reaper',
              kind: 'innovation',
              note: "John Deere's steel plow (1837) and McCormick's mechanical reaper let a single farmer break and harvest far more land — food output began outrunning mouths.",
            },
            {
              id: 'homestead',
              year: 1862,
              icon: '📜',
              label: 'Homestead Act & land-grant science',
              kind: 'innovation',
              note: 'The Homestead Act handed settlers free prairie farmland while land-grant colleges and the new USDA spread scientific farming — a deliberate government push that expanded the food supply.',
            },
            {
              id: 'fertilizer',
              year: 1910,
              icon: '🧪',
              label: 'Synthetic fertilizer',
              kind: 'innovation',
              note: 'The Haber–Bosch process pulled nitrogen from the air to make cheap fertilizer, lifting yields on land already being farmed.',
            },
            {
              id: 'dustbowl',
              year: 1934,
              icon: '🌵',
              label: 'Dust Bowl',
              kind: 'setback',
              note: 'Drought and over-plowing turned the Great Plains to dust and wrecked harvests — a real-world reminder that the food line can fall, not only rise.',
            },
            {
              id: 'greenrev',
              year: 1945,
              icon: '🌾',
              label: 'Green Revolution',
              kind: 'innovation',
              note: "High-yield hybrid seeds, tractors, irrigation, and agrochemicals after WWII sent food production far above population — exactly the rescue Malthus didn't foresee.",
            },
            {
              id: 'biotech',
              year: 1996,
              icon: '🧬',
              label: 'Biotech crops',
              kind: 'innovation',
              note: 'Genetically engineered, pest-resistant crops pushed yields higher still, keeping the green food line climbing.',
            },
          ],
          baselineCaption:
            'The U.S. population (red) climbed fast — but the food the land could support (green) climbed faster. Tap a policy or innovation to see what kept food ahead of people.',
        },
      },
      feedback: {
        onExplore:
          "That's Malthus's failed prediction in one chart: each innovation lifted the green food line, and across two centuries it pulled away from population instead of colliding with it.",
      },
    },
    {
      id: 'connect-modern-limits',
      kind: 'connect',
      prompt: 'Malthus was wrong about food — but the same logic still worries people about other finite resources. Pick one and make the case.',
      concept:
        'Malthus focused on food and was largely proven wrong about it. The same exponential-demand-vs-fixed-ceiling logic still applies to limits technology has not (yet) lifted — fresh water, energy, and the climate\u2019s capacity to absorb emissions — where growing demand could overshoot the limit unless new technology raises the ceiling or demand slows.',
      concepts: ['carrying-capacity', 'malthus'],
      difficulty: 3,
      interaction: {
        type: 'explain-back',
        config: {
          question:
            'Pick a modern finite resource (fresh water, energy, or the climate) and explain how growing demand could outrun its limit — then say what could prevent the crisis, just like the Green Revolution and falling fertility did for food.',
          rubric: [
            'Names a finite resource with a ceiling (water, energy, or climate / emissions capacity).',
            'Explains how growing demand (population × consumption) could outrun that fixed limit.',
            'Identifies what could prevent it — new technology (raising the ceiling) and/or slower growth in demand.',
          ],
          sampleAnswer:
            'Fresh water is a finite ceiling: as population and consumption climb, demand can outrun the supply that aquifers and rivers refill, causing shortages. But just as the Green Revolution raised the food line and falling fertility slowed the population curve, better technology (desalination, efficient irrigation) can raise the water ceiling, and conservation plus slower growth can lower demand — pulling the curves apart again.',
          minChars: 40,
        },
      },
      feedback: {
        correct:
          'Strong — you carried Malthus\u2019s growing-demand-vs-fixed-ceiling logic onto a modern resource and named the levers (new technology and slower growth) that could prevent the crisis.',
        incorrect:
          'Make sure you name a finite resource, explain how growing demand could overshoot its ceiling, and say what could prevent it.',
      },
    },
  ],
};

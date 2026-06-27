import type { Lesson } from '../../types/content';

// Lesson 6 — migration as the third demographic force. The interactives carry
// the teaching: an upgraded journey explore teaches push/pull + factor
// categories + forced/voluntary + intervening obstacles/opportunities (with
// motive-aware outcomes and distance decay), and a new effects explore teaches
// the origin-vs-destination consequences. Two short learn cards provide context
// and vocabulary; everything else is explore / apply. Replaces the old "When the
// Model Breaks" lesson (modelBreaks.ts).
export const whyPeopleMove: Lesson = {
  id: 'why-people-move',
  courseId: 'dtm',
  title: 'Why People Move',
  subtitle: 'Push, pull, and the obstacles in the way',
  concept:
    'Migration is the third force on population — the one the DTM ignores. People move for reasons (push/pull, sorted into economic, political, environmental, and social factors) with varying freedom (forced/voluntary). Intervening obstacles and opportunities bend the journey, most migrants travel only as far as they must (distance decay), and migration reshapes both the place left and the place joined.',
  order: 6,
  prerequisites: ['population-structure'],
  steps: [
    // ---- Setup -----------------------------------------------------------
    {
      id: 'learn-third-force',
      kind: 'learn',
      prompt: 'Migration is a major force of change on population — the one the DTM ignores.',
      concept:
        'Births add people and deaths remove them; migration moves them between places. The Demographic Transition Model tracks only births and deaths, so migration is the force it leaves out entirely. People move for reasons that push or pull them, with more or less choice — and the journey in between can be blocked or diverted.',
      concepts: ['migration', 'dtm-critique', 'push-pull', 'forced-migration'],
      interaction: {
        type: 'info',
        config: {
          icon: '🧳',
          body:
            "Births add people, deaths remove them, and migration moves them in or out of a place. The DTM doesn't account for it, but it reshapes populations all the same — and unlike births and deaths, a move has a direction, a degree of choice, and a path that can go wrong.",
          points: [
            'Push factors drive people away from home; pull factors draw them toward a destination',
            'Some moves are forced (no real choice), others voluntary (a decision)',
            'Intervening obstacles can block the trip; intervening opportunities can divert it',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: give a family a reason to move and see what carries them through — or stops them.',
      },
    },
    // ---- Core explore: the journey (teaches push/pull + categories + choice) ----
    {
      id: 'explore-journey',
      kind: 'explore',
      prompt:
        'Give this family a reason to move, then send them off. Add a push at home or a pull at the destination, choose what lies in the way, and press "Set out".',
      concept:
        'A push at home and a pull at the destination create the motivation to move, and each factor is economic, political, environmental, or social. Whether a forced or voluntary move, an intervening obstacle (a wall, a desert, an ocean, a visa denial) can block it — but an intervening opportunity only diverts a move whose motive matches it. A closer job tempts someone chasing pay, not a family fleeing war. And because most migrants stop at the first good chance, many never reach their original goal (distance decay).',
      concepts: ['migration', 'push-pull', 'intervening-obstacle', 'forced-migration', 'distance-decay'],
      difficulty: 1,
      interaction: {
        type: 'migration-journey',
        config: {
          origin: { label: 'Home village', flag: '🏚️' },
          destination: { label: 'City abroad', flag: '🏙️' },
          pushFactors: [
            { id: 'war', icon: '💥', label: 'War & conflict', category: 'political', choice: 'forced' },
            { id: 'drought', icon: '🌵', label: 'Drought & crop failure', category: 'environmental', choice: 'forced' },
            { id: 'nojobs', icon: '📉', label: 'No jobs at home', category: 'economic', choice: 'voluntary' },
          ],
          pullFactors: [
            { id: 'jobs', icon: '💼', label: 'Jobs & higher pay', category: 'economic', choice: 'voluntary' },
            { id: 'safety', icon: '🕊️', label: 'Safety & stability', category: 'political' },
            { id: 'family', icon: '👪', label: 'Family already there', category: 'social', choice: 'voluntary' },
          ],
          events: [
            {
              id: 'desert',
              icon: '🏜️',
              label: 'A desert',
              kind: 'obstacle',
              position: 0.3,
              outcome:
                'Intervening obstacle: a harsh desert stops the family early. Distance and terrain are classic intervening obstacles that block the journey no matter the reason for moving.',
            },
            {
              id: 'closerjob',
              icon: '💡',
              label: 'A closer job',
              kind: 'opportunity',
              matchesMotive: 'economic',
              position: 0.42,
              outcome:
                'Intervening opportunity: a good job appears partway, so the family settles there instead. Most migrants move only as far as they need to — the trip ends short of the original destination (distance decay).',
              passOutcome:
                "A closer job can't stop a family fleeing war or drought — they're seeking safety, not a paycheck, so they press on past it. An opportunity only diverts a move whose motive matches.",
            },
            {
              id: 'safetown',
              icon: '🏘️',
              label: 'A safe town nearby',
              kind: 'opportunity',
              matchesMotive: 'safety',
              position: 0.5,
              outcome:
                'Intervening opportunity: a safe town appears partway, and a family fleeing danger settles in the first safe place rather than pressing on — a short move, just as Ravenstein observed (distance decay).',
              passOutcome:
                "A family moving for a better job or to join relatives isn't tempted to stop at just any safe town — with no danger to escape, they continue to their chosen destination.",
            },
            {
              id: 'wall',
              icon: '🧱',
              label: 'A border wall',
              kind: 'obstacle',
              position: 0.62,
              outcome:
                'Intervening obstacle: a closed border wall blocks the way. Even a strong push and pull can be stopped by what lies between — and walls stop those fleeing danger too.',
            },
            {
              id: 'ocean',
              icon: '🌊',
              label: 'An ocean',
              kind: 'obstacle',
              position: 0.74,
              outcome:
                'Intervening obstacle: a dangerous ocean crossing halts the journey. Distance and physical barriers are classic intervening obstacles.',
            },
            {
              id: 'visa',
              icon: '🛂',
              label: 'A visa denial',
              kind: 'obstacle',
              position: 0.86,
              outcome:
                'Intervening obstacle: a visa denial turns the family back near the end. Obstacles are not only physical — laws and borders count too.',
            },
          ],
          arriveCaption:
            'Nothing stood in the way: the push at home and the pull abroad carried the family all the way to the destination.',
        },
      },
      feedback: {
        onExplore:
          "A push and a pull set the reason and its direction; whether it's forced or voluntary sets the choice. But the path matters just as much: an obstacle blocks the trip, while an opportunity only diverts a move whose motive matches it — and because most migrants stop at the first good chance, many never reach their original goal (distance decay).",
      },
    },
    {
      id: 'connect-classify-axes',
      kind: 'connect',
      prompt:
        'Every reason to move has a direction and a level of choice. Drop each scenario into both categories it fits.',
      concepts: ['migration', 'push-pull', 'forced-migration', 'intervening-obstacle'],
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
            { id: 'voluntary-family', label: 'A family moves to where a relative already lives' },
            { id: 'unfavorable-policy', label: 'A government implements an unfavorable policy' },
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
          'unfavorable-policy': ['push', 'voluntary'],
        },
      },
      feedback: {
        correct:
          'Exactly — direction (push/pull) and choice (forced/voluntary) are separate axes. Drought and war push people out AND leave no choice (forced); jobs, safety, and family pull people in by choice (voluntary). A government implementing an unfavorable policy is a push factor that is still voluntary.',
        incorrect:
          'Not quite — each scenario needs one direction tag (push or pull) AND one choice tag (forced or voluntary).',
      },
    },
    // ---- Forms of migration: one combined card, two applications ----------
    {
      id: 'learn-forms',
      kind: 'learn',
      prompt: 'Migration comes in forms — by distance, by pattern, and (when forced) by legal status.',
      concept:
        'Beyond why people move, geographers name how. Internal migration stays inside a country (often rural → urban); international migration crosses a border. Step migration climbs the settlement hierarchy in stages; chain migration follows people who already moved; guest workers and other transnational migrants move (often temporarily) for work while keeping ties to home. When people are forced out, their legal status depends on whether they crossed a border: refugees and asylum-seekers have, internally displaced persons have not.',
      concepts: ['migration', 'internal-migration', 'chain-migration', 'step-migration', 'forced-migration', 'refugees'],
      interaction: {
        type: 'info',
        config: {
          icon: '🗺️',
          body:
            'Beyond why people move, geographers describe how far, in what pattern, and — when the move is forced — what legal status the person holds. The differences are not just labels: for forced migrants they decide what protection and rights a person has.',
          points: [
            'Internal migration stays within one country (often rural → urban); international migration crosses a border',
            'Step migration moves up the settlement hierarchy in stages (village → town → city)',
            'Chain migration follows family or community members who already settled somewhere',
            'Guest workers / transnational migrants move (often temporarily) for work, keeping ties to home',
            'Refugee: crossed a border and is recognized as fleeing danger · Asylum-seeker: crossed and still awaiting that decision · IDP: forced to flee but stayed inside their own country',
          ],
        },
      },
      feedback: {
        onExplore: 'Next: name the form for each real-world move.',
      },
    },
    {
      id: 'connect-migration-types',
      kind: 'predict',
      prompt: 'Match each move to the pattern it best illustrates.',
      concepts: ['migration', 'internal-migration', 'chain-migration', 'step-migration'],
      difficulty: 2,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each scenario onto the migration type it best fits.',
          tiles: [
            { id: 'step', label: 'A worker moves from a village to a town, then years later to the capital' },
            { id: 'chain', label: 'A woman emigrates to the country where her brother already settled' },
            { id: 'internal', label: 'A family moves from the countryside to a city in the same country' },
            { id: 'international', label: 'An engineer relocates permanently from India to Canada' },
            { id: 'guest', label: 'Construction workers take a multi-year Gulf contract and send wages home' },
          ],
          slots: [
            { id: 'step-slot', label: 'Step migration', icon: '🪜' },
            { id: 'chain-slot', label: 'Chain migration', icon: '🔗' },
            { id: 'internal-slot', label: 'Internal migration', icon: '🏘️' },
            { id: 'international-slot', label: 'International migration', icon: '🌍' },
            { id: 'guest-slot', label: 'Guest-worker / transnational', icon: '👷' },
          ],
        },
      },
      answer: {
        pairs: {
          step: 'step-slot',
          chain: 'chain-slot',
          internal: 'internal-slot',
          international: 'international-slot',
          guest: 'guest-slot',
        },
      },
      feedback: {
        correct:
          'Exactly — step migration climbs the settlement hierarchy in stages, chain migration follows someone who already moved, internal stays inside one country, international crosses a border permanently, and guest-worker / transnational moves are temporary labor migration with ties kept back home.',
        incorrect:
          'Not quite — look for the key clue: "in stages" is step, "following a relative" is chain, "same country" is internal, "relocates permanently" across a border is international, and a "multi-year contract sending wages home" is a guest-worker / transnational move.',
      },
    },
    {
      id: 'predict-refugee-chart',
      kind: 'predict',
      prompt: 'A civil war erupts in a country, producing a wave of refugees. Which birth/death chart shows it?',
      concepts: ['migration', 'forced-migration', 'refugees', 'dtm-critique'],
      difficulty: 2,
      interaction: {
        type: 'chart-pick',
        config: {
          instruction:
            'Tap the chart whose death rate (red) spikes sharply during the war years while total population (violet) drops as people die and flee.',
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
          'Exactly — Country B is the war. The death rate (red) spikes sharply for just a few years, and total population (violet) drops at the same time — not only from deaths, but from refugees and asylum-seekers fleeing the fighting. That sharp fall from forced migration is exactly the force the DTM ignores; smooth textbook curves can never show it.',
        byOutcome: {
          'normal-transition':
            'That is Country A — a normal, smooth DTM transition. Deaths fall gradually, births follow later, and population grows steadily. No refugee wave here.',
          'baby-boom':
            'That is Country C — a baby boom. The BIRTH rate (blue) spikes while deaths stay low, so population climbs faster than ever. That is births, not forced migration.',
          'aging':
            'That is Country D — an aging, Stage 5 country. The death rate slowly rises above a low birth rate and population gently edges down. A slow, gradual decline, not a sudden refugee crisis.',
        },
        incorrect:
          'Not quite — a refugee crisis from civil war shows a sharp, temporary SPIKE in the death rate (red) AND a sharp drop in total population (violet) as people die and flee.',
      },
    },
    // ---- Effects explore (teaches origin vs destination) + check ----------
    {
      id: 'explore-effects',
      kind: 'explore',
      prompt: 'One flow of migrants, two very different ledgers. Drag the slider up and watch the effects pile up on each side.',
      concept:
        'Migrants are not a random slice of a population — they skew young and working-age (often male). So the same flow has opposite effects on each end: the origin (sending country) gains remittances but loses talent (brain drain) and young workers, leaving it older; the destination (receiving country) gains a labor supply and cultural diversity, and grows an age-sex bulge in its pyramid.',
      concepts: ['migration', 'remittances', 'brain-drain', 'age-sex-selectivity'],
      difficulty: 1,
      interaction: {
        type: 'migration-effects',
        config: {
          origin: { label: 'Sending country', flag: '📤' },
          destination: { label: 'Receiving country', flag: '📥' },
          originEffects: [
            { id: 'remittances', icon: '💸', label: 'Remittances sent home', tone: 'positive' },
            { id: 'braindrain', icon: '🧠', label: 'Brain drain — talent leaves', tone: 'negative' },
            { id: 'aging', icon: '👵', label: 'Aging — young workers gone', tone: 'negative' },
          ],
          destinationEffects: [
            { id: 'labor', icon: '💪', label: 'Labor supply fills jobs', tone: 'positive' },
            { id: 'diversity', icon: '🌐', label: 'Cultural diversity', tone: 'positive' },
            { id: 'bulge', icon: '📊', label: 'Young-male pyramid bulge', tone: 'neutral' },
          ],
          caption:
            'One selective flow of mostly young, working-age migrants — opposite effects on each end. The origin gains money but loses talent and youth; the destination gains workers, diversity, and a guest-worker bulge like the one in "Reading the Shape".',
        },
      },
      feedback: {
        onExplore:
          'Same migrants, opposite books: the origin gains remittances but loses talent and youth (brain drain, aging), while the destination gains labor, diversity, and that young-male bulge. That selectivity is why migration reshapes both ends at once.',
      },
    },
    {
      id: 'connect-effects',
      kind: 'connect',
      prompt: 'Sort each effect of migration onto the place it affects.',
      concepts: ['migration', 'remittances', 'brain-drain', 'age-sex-selectivity'],
      difficulty: 3,
      interaction: {
        type: 'match-pairs',
        config: {
          instruction: 'Drag each effect into the bucket it belongs to. Each bucket holds several effects.',
          multiPerSlot: true,
          tiles: [
            { id: 'remittances', label: 'Workers send money back to their families', icon: '💸' },
            { id: 'brain-drain', label: 'Skilled doctors and engineers leave, draining talent', icon: '🧠' },
            { id: 'aging-left', label: 'Young adults gone, leaving an older population behind', icon: '👵' },
            { id: 'labor-supply', label: 'A boost in working-age labor fills job shortages', icon: '💪' },
            { id: 'cultural', label: 'New languages, foods, and religions add diversity', icon: '🌐' },
            { id: 'male-bulge', label: 'A bulge of young working-age men appears in the pyramid', icon: '📊' },
          ],
          slots: [
            { id: 'origin', label: 'Origin', icon: '📤', sublabel: 'The place left' },
            { id: 'destination', label: 'Destination', icon: '📥', sublabel: 'The place joined' },
          ],
        },
      },
      answer: {
        pairs: {
          remittances: 'origin',
          'brain-drain': 'origin',
          'aging-left': 'origin',
          'labor-supply': 'destination',
          cultural: 'destination',
          'male-bulge': 'destination',
        },
      },
      feedback: {
        correct:
          'Exactly — the origin gains remittances but loses talent (brain drain) and young workers, leaving it older. The destination gains labor, cultural diversity, and — because migrants skew young and male — that guest-worker bulge you saw in "Reading the Shape". Same selective migrants, opposite effects on each end.',
        incorrect:
          'Not quite — ask "who experiences this?" Money sent home, lost talent, and an aging population hit the ORIGIN; new labor, new culture, and a young-male pyramid bulge show up at the DESTINATION.',
      },
    },
    // ---- Net migration math + DTM callback capstone -----------------------
    {
      id: 'explore-net-migration',
      kind: 'explore',
      prompt:
        'Drag the in- and out-migration arrows. Watch total population change even when natural increase barely moves.',
      concept:
        'Total population change = natural increase + net migration. A country with near-zero natural increase can still grow fast through immigration — or shrink through emigration. The factors and obstacles you studied decide how big these flows are.',
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
          'Natural increase is barely positive — but net migration can overpower it. The push/pull factors and obstacles you studied are what set the size of these flows. This is the force the DTM cannot show.',
      },
    },
    {
      id: 'connect-uae-dtm',
      kind: 'connect',
      prompt:
        'Back to the model. Compare the textbook DTM path to the UAE. Drag the year — both charts move together. What drove the boom?',
      concept:
        "The UAE's population tripled with only moderate birth rates. The textbook DTM, which tracks only births and deaths, cannot explain that boom — it came from labor migration, the exact force the model leaves out.",
      concepts: ['migration', 'dtm-critique'],
      difficulty: 2,
      interaction: {
        type: 'country-model',
        config: {
          countryIds: ['uae'],
          initialCountryId: 'uae',
          comparison: true,
          showTotalPopulationLine: true,
        },
      },
      feedback: {
        correct:
          'See the gap: the textbook curve (left) predicts steady, birth-and-death-driven growth, but the UAE (right) exploded far faster while birth rates stayed only moderate. That extra growth is net migration — millions of foreign workers — and it is exactly the third force the DTM ignores. Migration, not births or deaths, drove the boom.',
        incorrect:
          'Scrub the year and compare the two charts, then check again.',
      },
    },
  ],
};

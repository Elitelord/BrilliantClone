# Population Path — Unit 2 Lesson Architecture & Component Inventory

> **Purpose:** Lay out the *pieces we're working with* — every existing interaction primitive, the small set of new ones we'd need, and a concept-by-concept interactive design for each Unit 2 lesson — to design a coherent **7-lesson arc** covering as much of AP HUG Unit 2 as possible. (See the locked arc in the header and Part D.)
>
> Companion to `ap-human-geography-dtm-teaching-knowledge-base.md` (the research). This doc is the *engineering/design* translation of that research.
>
> **Last updated:** June 2026 (the **7-lesson arc is fully BUILT, wired, and verified** — new "Limits of Growth" at slot 4, migration rebuilt as L6, TFR→L1 / IMR→L3. `npm run type-check && test && build` all green: 151 tests pass.)
>
> **THE LOCKED 7-LESSON ARC (user):**
> 1. **The Engine of Growth** — rates, NIR, 5 stages *(ships)*
> 2. **Reading Population Pyramids** — shape ↔ stage *(ships)*
> 3. **Why the Curves Move** — ETM + fertility transition **+ population policy 2.7** *(ships; +policy edit)*
> 4. **The Limits of Growth** — **density (2.2) + carrying capacity + Malthus (2.6) + Boserup/neo-Malthusian** *(NEW — locked)*
> 5. **Reading the Shape** — dependency + momentum + pyramid anomalies *(ships; was L4)*
> 6. **Why People Move** — migration 2.10–2.12 *(rebuild — replaces the old "When the Model Breaks"; was slotted L5)*
> 7. **Place the Country** — synthesis capstone *(was L6)*
>
> **Sectors** stay in the backend as a non-core bonus. **Status: ALL 7 lessons SHIPPED & wired.** The Limits lesson (L4 `limitsOfGrowth.ts`) and the migration rebuild (L6 `whyPeopleMove.ts`) are built; the old `modelBreaks.ts` is removed from the course (file kept on disk). `src/content/index.ts` carries the final order; type-check/test/build all pass.
>
> **JUNE 2026 RESTRUCTURE (locked):**
> - **Population policy (2.7) moves into L3, not the migration lesson.** Policy (pro-/anti-natalist) is a *force on fertility*, so it belongs with the "why births fall" half of L3. Shipped L3 steps 7–8 (`predict-stage4-family`, `connect-dev-stage`) are **replaced** with a policy block: **learn → explore (shows a live population count) → solve (count hidden; pick anti-natalist policies to drive population down)**, taking L3 to **11 steps**. See C1-policy.
> - **NEW Lesson 4 "The Limits of Growth" (2.2 + 2.6).** Density/carrying-capacity and Malthus are the same family of ideas, so they combine into one lesson placed right after the growth-mechanism lessons — it answers "can the boom (L1) outrun food and space?" while L1's boom and L3's fertility decline are fresh. **Topic 2.1 (pure distribution) is set aside** (map-heavy, weakly interactive — like Sectors). See C1b.
> - **The old "When the Model Breaks" lesson is removed and replaced by "Why People Move" (now L6).** Once migration is its own lesson, the leftover (pure DTM critique) was too thin and pyramid anomalies already live in L5. The migration lesson **reuses most of the old lesson's migration assets** and **adds** the missing CED vocab (chain/step, intervening obstacles/opportunities, internal vs international, deeper refugees/IDPs/asylum) and an effects beat. See C3.
>
> **TFR / IMR (now LOCKED — see Part F2):** **TFR** is taught as a 1–2 step CBR-vs-TFR beat in **L1** (the rates toolkit); **IMR** is added as a **copy-edit** to L3's existing infant-mortality card (named/defined, no new step). Both are zero new components. (Malthus 2.6 and density 2.2 are resolved into the new L4; 2.1 distribution is set aside.) **No open decisions remain — the arc is fully spec'd for implementation.** The DTM-critique material orphaned by the old-lesson removal is rehomed: "ignores migration" becomes L6's framing, and South Korea/Niger deviations live in the L7 capstone.
>
> **HISTORICAL NOTE (shape vs model rebalance):** pyramid anomalies (war notch / guest-worker bulge / one-child constriction / baby boom) were moved into "Reading the Shape" so that lesson = everything a pyramid's *shape* tells you. China's one-child policy spans the arc — its *shape* in Reading the Shape (L5), its *policy* now in L3.

---

## Part A — The interaction primitives we already have (13)

All are wired through `InteractionRenderer` + `LessonRunner`, graded by outcome-based validators in `validators.ts`, and authored as DATA (`Interaction` union in `types/content.ts`). Reordering/adding lessons is a **data edit** to `src/content/index.ts` (`dtmCourse.lessonIds` + each lesson's `order`/`prerequisites`).

| # | Primitive | What the learner does | Graded? | Reuse potential for new lessons |
|---|-----------|----------------------|---------|---------------------------------|
| 1 | `rate-graph` | Drag a stage handle across CBR/CDR curves; live NIR band + population bar | ✓ (stage/trend) | **High** — death-curve focus (ETM), population bar (migration), reference panels |
| 2 | `country-model` | Scrub years on a real country's birth/death/pop series | ✗ explore | **High** — add countries (Limits: S. Korea, Saudi; Migration cases) = data only |
| 3 | `curve-draw` | Drag one point per stage to *build* the birth/death curve | ✓ (per-point) | **High** — ETM capstone (redraw death plunge, now causally explained) |
| 4 | `stage-select` | Tap the DTM stage band matching a scenario | ✓ (stages) | **High** — every lesson can ask "which stage?" |
| 5 | `info` | Read a concept card (body, formula, bullets, icon, term cards) | ✗ | **High** — framing/definition beats in every lesson |
| 6 | `population-pyramid` | Drag 4 control handles to reshape a pyramid; classify presets | ✓ (stages/widths) | **High** — base for the *banded* dependency pyramid |
| 7 | `sector-bars` | Drag a 3-way split (auto-normalized to 100); classify presets | ✓ (dominant/stage/minTertiary) | **High if generalized** — see "category-bars" (ETM cause-of-death mix) |
| 8 | `multiple-choice` | Pick one option (optionally with mini-pyramid art) | ✓ (correctId) | **High** — predict/connect beats everywhere |
| 9 | `nir-slider` | Set the birth−death gap; live trend verdict | ✓ (gap/trend) | Medium — momentum, migration net-change |
| 10 | `rate-sliders` | Set CBR and CDR independently; live gap/trend | ✓ | Medium — fertility (women/education) beats |
| 11 | `three-lens` | Read-only panel: rates + pyramid + sectors side-by-side for one stage | ✗ (seen) | Medium — synthesis screens; sector content can live here |
| 12 | `match-pairs` | Drag image/label tiles onto fixed slots | ✓ (pairs, per-tile detail) | **Very high** — cause→stage, factor→type, challenge→stage (works for ETM, migration, limits, dependency) |
| 13 | `pyramid-pick` | Tap one/many mini-pyramid cards | ✓ (stages) | **High** — "which shapes fit X?" across pyramid-linked lessons |

**Supporting data/logic already built:** `dtm.ts` (stage rates, names, chip styles, example countries, sector profiles, pyramid profiles, NIR/doubling-time math), `countries.ts` (England/Nigeria/Japan + others; fields: `year, birth, death, pop`).

> **Key reuse insight:** `match-pairs`, `multiple-choice`, `stage-select`, `info`, `rate-graph`, `curve-draw`, and `country-model` together can carry **most** of a new lesson with **zero new components** — the only question per lesson is whether its *hero* explore step needs a new manipulable visual.

---

## Part B — New primitives that unlock new lessons (only 3–4 ever needed)

| New primitive | Build on | Unlocks | Rough cost |
|---|---|---|---|
| **`category-bars`** / **`family-size`** *(BUILT, L3)* | Generalized cause-of-death buckets + a figurine family-size explorer | ETM cause-of-death mix; fertility transition | **Built** — shipped in L3 (plus a `match-pairs` bucket/sort mode) |
| **`population-pyramid` band+ratio** | Add opt-in `showBands` (0–14 / 15–64 / 65+) + `showDependencyRatio` flags to the existing `population-pyramid` — **not a new type** | Dependency ratio, aging, momentum (L4 Half A) | **Med** — render layer + ratio math; reuses all existing pyramid geometry/handles/grading |
| **`anomaly-pyramid`** | New small interaction rendering **explicit 9-cohort widths** (the existing pyramid interpolates only 4 control points, so it *cannot* draw a single-cohort war notch or the spiky one-child shape) | Pyramid anomalies (L4 Half B); reused as a policy reference in L5 | **Low–Med** — mirror-bar SVG + a gallery selector; explore/reference only (ungraded) |
| **`migration-flow`** | A net-migration slider (and/or in/out arrows) feeding the existing population bar | Migration's effect on total change (Lesson 5) | **Med–High** — new input + wire to pop bar; `match-pairs`/`mc` carry the rest |
| **`world-map`** | `react-simple-maps` (PRD-deferred; `Interaction` union already reserves the slot) | "Place the Country" synthesis capstone | **High** — defer beyond the MVP |
| **`growth-plotter`** *(NEW, L4)* | A 2-curve plot: population (exponential) vs food/resources (linear). Learner drags the population growth rate and/or the food slope; live readout of **whether & when the curves cross** (the Malthusian crisis point) and a Boserup "raise the food line" mode. No existing primitive does exponential-vs-linear (`chart-pick` only *picks* presets; `rate-graph`/`country-model` are DTM-specific). | Malthus + carrying capacity (L4 hero) | **Med** — new SVG plot + crossover math; graded by whether a crossover occurs / is averted |
| **`density-calc`** *(NEW, L4)* | Adjust population / total land / **arable** land / number of farmers; the three densities (arithmetic / physiological / agricultural) compute live, with country presets (Egypt / Canada / Bangladesh) to classify. | Density (2.2) — disambiguates the three densities students confuse | **Low–Med** — number inputs + live formula readout + a classify mode (reuses the validator pattern) |

**Takeaway:** every component the arc needs is now **built**: `population-pyramid` band+ratio extension + `anomaly-pyramid` (Reading the Shape), `migration-flow` + the new `migration-journey` hero (L6), `world-map` (L7), `policy-lab` (L3), and the two L4 components `growth-plotter` + `density-calc`. Each is wired through the full pipeline (`content.ts` → `interaction.ts` → `InteractionRenderer.tsx` → `validators.ts` → exhaustive `describeInteraction.ts`). Everything else is content + data.

---

## Part C — Per-lesson interactive designs

Each design lists CED topic, one-line concept, prereq, a step-by-step outline (primitive in **bold**; *new/extended* flagged), difficulty ramp, and build cost. Steps follow the house pattern: `learn → explore → predict → solve → connect`.

### C1. "Why the Curves Move"  *(Lesson 3 — covers why BOTH rates fall + population policy)*
> Expanded from "Why Death Rates Fall (ETM)" to also cover **why birth rates fall**. This makes L3 the single *mechanism* lesson behind both curves students built in L1, and **moves the fertility/women "why births fall" beat out of L4** (which becomes a pure structure/consequence lesson). Suggested title: **"Why the Curves Move"** (or "What Drives the Change").
- **CED:** Topic 2.5 / **IMP-2.B.2** (ETM, required) **+ Topic 2.8** (changing role of women / fertility decline) **+ Topic 2.7** (population policy — *added June 2026*). **Prereq:** `dtm-engine`. **Ramp:** 1→3.
- **Concept:** In L1 you saw deaths fall first (S2) and births fall later (S3). This lesson explains *why each curve moves* — and why their timing differs.
  - **Deaths fall first & fast — the epidemiological transition.** Dominant causes of death shift from infectious disease & famine to chronic/degenerative disease, driven by clean water, sanitation, vaccines, medicine, food. These are **external** improvements that reach everyone quickly → CDR plunges in S2.
  - **Births fall later & slow — the fertility transition.** Kids shift from farm labor (asset) to school + cost; falling infant mortality removes the need for "extra" births; female education + women in paid work + contraception + changing values shrink families. These are **personal/cultural** decisions that take a generation → CBR doesn't fall until S3.
  - **Unifying "aha" (ties to L1's NIR gap):** deaths drop the moment outside help arrives; births drop only when millions of private choices slowly change. **That lag = the Stage 2 population explosion.**
- **Steps:**
  1. **`info`** — "Deaths fell first. But *why*?" Callback to L1's plunging red curve. *(reuse)*
  2. **`category-bars`** *(new, optional)* — drag a development handle; the cause-of-death mix flows infectious/famine → chronic/degenerative. **Zero-build fallback:** **`rate-graph`** death curve. *(reuse or 1 new)*
  3. **`info`** — Stage-2 levers that crash the CDR: clean water, sanitation, vaccines, food supply, basic medicine. *(reuse)*
  4. **`multiple-choice`** — "In Stage 1, what kills the most people?" → infectious/famine; misconception feedback per option. *(reuse)*
  5. **`info`** *(NEW — why births fall)* — kids become cost not labor; lower infant mortality; female education + paid work; contraception + changing values. *(reuse)*
  6. **`info`** *(NEW — the lag insight)* — deaths = external + fast; births = personal + slow; the gap between them is the S2 boom from L1. *(reuse)*
  7. **`match-pairs`** *(NEW — the signature contrast)* — sort each change by which rate it lowers first: sanitation/vaccines/food → **deaths (S2)**; education/contraception/urban life → **births (S3)**. *(needs a "many tiles → 2 buckets" validator mode; fallback = `multiple-choice`)*
  8. **`stage-select`** + **`rate-graph`** reference — "Births finally fall most sharply *here*." (S3) and/or "deaths fall sharpest here" (S2). *(reuse)*
  9. **`multiple-choice`** — aging twist: "In a Stage 4/5 country, what now kills most?" → chronic; tie to L2 full-top pyramids. *(reuse)*
  10. **`curve-draw`** (death + birth) — capstone: "You now know *why* — redraw the S2 death plunge *and* the S3 birth drop." Reuses L1's exact build-the-curve interaction, now causally explained. *(reuse)*
- **Build cost:** **Still lowest of all candidates.** 0–1 new component (`category-bars` optional). The new birth-rate content is `info` + `match-pairs` (one small "bucket" validator tweak, or fall back to `multiple-choice`). New content file `epiTransition.ts` + concept tags (`etm`, `cause-of-death`, `fertility-transition`).

#### C1-policy. Population-policy add-on (Topic 2.7) — *LOCKED June 2026*
> **Why here:** policy is a deliberate *force on fertility* (governments pushing births up or down), so it slots naturally after the fertility-transition half of L3 — right where the learner has just internalized that births are personal choices that change slowly. It reframes policy as "what happens when a government tries to *override* those slow private choices."
- **Edit:** **replace shipped steps 7 (`predict-stage4-family`) and 8 (`connect-dev-stage`)** with the three-step policy block below. Net effect: 10 → **11 steps**. (`predict-stage4-family`/`connect-dev-stage` work is partly preserved by the family-size and dev→stage beats already earlier in the lesson, so removing them costs little.)
- **New steps:**
  1. **`info`** *(learn — replaces step 7)* — two policy directions: **anti-natalist** (lower births — China's one-child policy, India sterilization campaigns) vs **pro-natalist** (raise births — France/Sweden/Hungary baby bonuses, parental leave, Japan incentives). Frame as "a government trying to move the birth curve faster than culture would on its own."
  2. **`policy-lab`** *(explore — replaces step 8) — shows a live population count.* A small policy-selection board: the learner toggles policy levers — pro-natalist (baby bonus, paid parental leave, cheaper childcare, immigration) vs anti-natalist (birth caps, free contraception, "later marriage" campaigns, female-education drives) — and watches the **running population count** respond up or down over a few decades. This is the *teaching* version: cause → visible effect on the total. *(Built as a small extension of `family-size`: same lever idiom, but surfaces a population total instead of only average children.)*
  3. **`policy-lab`** *(solve — the graded 11th step) — population count hidden.* **Same component, count hidden.** Prompt: *"This country is growing too fast. Choose policies to bring its population down."* The learner must select a coherent **anti-natalist** package strong enough that the (hidden) trend turns to decline. **Graded** on outcome: pass when the chosen levers yield a shrinking trend; misconception feedback when they pick pro-natalist or too-weak levers. Reuses the existing trend-validator pattern.
- **Build cost:** **Low** — one small `policy-lab` component (or a `family-size` extension that exposes a population total + a `showCount` flag the explore sets true and the solve sets false). `info` is reuse. New concept tags: `population-policy`, `pro-natalist`, `anti-natalist`. China's one-child can reuse L5's `anomaly-pyramid` as an optional reference panel.
- **Coverage win:** closes the **2.7 gap** (previously only implicit, as a pyramid anomaly in Reading the Shape).

### C1b. "The Limits of Growth" — density, carrying capacity & Malthus  *(Lesson 4 — NEW, locked)*
> **LOCKED June 2026.** Resolves the old Part-F open questions on Malthus (2.6) and density (2.2) by **combining them into one lesson** — they're the same family of ideas (how many people can a place hold, and what happens when growth pushes that limit). **Topic 2.1 (pure distribution) is set aside.**
- **CED:** **Topic 2.2** (population density / carrying capacity) **+ Topic 2.6 / IMP-2.B.3** (Malthusian theory). **Prereq:** L1 (the boom) **and** L3 (the fertility decline — needed so the "why Malthus was wrong" payoff lands). **Ramp:** 1→3.
- **Placement rationale:** sits right after the growth-mechanism lessons. L1 showed the population explosion and L3 explained why births eventually fall; this lesson answers the question they provoke — *"can a booming population outrun its food and space?"* — while both are fresh. The arc then returns to structure (Reading the Shape) and movement (migration).
- **Concept — two halves:**
  - *Half A — density & crowding (2.2):* "how crowded" needs a better measure than people-per-country. **Arithmetic** (pop ÷ total land), **physiological** (pop ÷ *arable* land — pressure on the food system), **agricultural** (farmers ÷ arable land — subsistence vs mechanized). Every environment has a **carrying capacity**.
  - *Half B — Malthus & the limits (2.6):* Malthus predicted population (exponential) would outrun food (linear) → catastrophe (**positive checks**: famine/war/disease; **preventive checks**: later marriage/fewer births). **Boserup**, the **Green Revolution**, and the **L3 fertility decline** explain why it mostly didn't happen. **Neo-Malthusians** revive the worry for water/energy/climate.
- **Steps (~9, learn → explore → predict → solve → connect):**
  - *Half A — density:*
  1. **`info`** *(learn)* — people cluster; not all land is equal; we need a sharper measure of "crowded." *(reuse)*
  2. **`density-calc`** *(explore — NEW comp)* — adjust population / total land / arable land / farmers; the three densities compute live. *(1 new component)*
  3. **`match-pairs` or `multiple-choice`** *(predict/connect)* — match a country to its density fingerprint (Egypt = high physiological; Canada = low arithmetic; Bangladesh = high arithmetic + physiological), or "which density shows pressure on farmland?" *(reuse)*
  4. **`info`** *(learn)* — **carrying capacity**: every environment has a ceiling; crowding has consequences for food, water, services. *(reuse)*
  - *Half B — Malthus:*
  5. **`info`** *(learn)* — Malthus's argument: exponential population vs linear food → a crisis point; positive vs preventive checks. *(reuse)*
  6. **`growth-plotter`** *(explore — NEW hero comp)* — drag the population growth rate and/or the food slope; watch **whether & when** the two curves cross (the Malthusian crisis point). *(1 new component)*
  7. **`growth-plotter`** *(solve)* — **avert the catastrophe**: raise the food line (Green-Revolution innovation, à la Boserup) and/or lower the growth rate (the L3 fertility decline) until the curves no longer cross. **Graded** on whether the crossover is averted. *(reused comp, graded mode)*
  8. **`match-pairs` / `multiple-choice`** *(connect)* — positive checks (famine/war/disease) vs preventive checks (later marriage/contraception); and "why didn't the catastrophe happen?" → Green Revolution + the L3 fertility decline. *(reuse)*
  9. **`explain-back`** *(connect, capstone)* — **neo-Malthusian**: apply Malthus's logic to a modern finite resource (water / energy / climate) — is the planet nearing carrying capacity? *(reuse)*
- **Build cost:** **Medium** — **two new components** (`growth-plotter` hero + `density-calc`); everything else reuses `info` / `match-pairs` / `multiple-choice` / `explain-back`. New content file `limitsOfGrowth.ts`; concept tags `density`, `carrying-capacity`, `malthus`, `boserup`, `neo-malthusian`. Plus a `lessonIds`/`order`/`prerequisites` edit in `src/content/index.ts` (insert at slot 4; bump Reading the Shape → 5, Why People Move → 6, Place the Country → 7).

### C2. Reading the Shape — "Who Depends, and Where Shapes Break"  *(Lesson 5 — was Lesson 4)*
- **CED:** Topics **2.3 / 2.4 / 2.9** (+ a 2.3 anomaly callback). **Prereq:** `population-pyramids`. **Ramp:** 1→3.
- *(Note: the 2.8 "why births fall" beat lives in L3. **Pyramid anomalies moved here from the old L5** in the shape/model rebalance, so L4 = everything a pyramid's *shape* tells you.)*
- **Concept — two halves, one through-line (read meaning out of a pyramid's shape):**
  - *Half A — dependency + momentum:* split a pyramid into youth (0–14) / working (15–64) / elderly (65+); dependency ratio = (young+old) ÷ working; youth-heavy in S2/3, elderly-heavy in S4/5. **Momentum:** a youth bulge keeps population growing even after TFR hits replacement.
  - *Half B — pyramid anomalies:* smooth pyramids are idealized; real events carve fingerprints — **war** (fighting-age male notch), **labor migration** (young-male guest-worker bulge), **one-child policy** (sharp constriction + sex imbalance), **baby boom** (a bulge that climbs the pyramid over time). The one-child *shape* is the spine L5 later revisits as *policy + critique*.
- **Steps (10, two balanced halves):**
  - *Half A — dependency + momentum:*
  1. **`info`** — "Not everyone works." Three age bands + the ratio. *(reuse)*
  2. **`population-pyramid` + bands/ratio** *(extended)* — drag a banded pyramid; live dependency-ratio readout updates as you reshape. *(extension, not a new type)*
  3. **`pyramid-pick`** — "Which shape has the highest *youth* dependency?" → wide-base S2. *(reuse)*
  4. **`population-pyramid` + bands/ratio** *(extended)* — "Reshape into a high *elderly*-dependency country" → top-heavy S5. *(reuse extension)*
  5. **`multiple-choice`** — momentum: "TFR just hit 2.1 but population keeps growing — why?" → youth bulge. *(reuse)*
  - *Half B — pyramid anomalies:*
  6. **`info`** — smooth pyramids are idealized; the four anomaly fingerprints. *(reuse)*
  7. **`anomaly-pyramid`** *(new)* — gallery of explicit 9-cohort shapes (war notch / guest-worker bulge / one-child / baby boom) with a caption per shape. *(1 new component)*
  8. **`multiple-choice`** (+ `anomaly-pyramid` reference) — identify the cause of a guest-worker bulge → labor migration. *(reuse + new comp as reference)*
  9. **`match-pairs`** — anomaly shape/description → cause (war / migration / one-child / baby boom). *(reuse)*
  10. **`multiple-choice`** (+ `anomaly-pyramid` reference) — consequence of the one-child constriction → high elderly dependency + sex imbalance (loops Half B back to Half A). *(reuse + new comp as reference)*
- **Build cost:** **Medium** — two reuse-heavy build areas: the `population-pyramid` band+ratio extension (Half A) and one small new `anomaly-pyramid` component for explicit 9-cohort shapes (Half B). The anomaly component is built **reusable so L5 reuses it** for the China policy callback.

### C3. "Why People Move" — migration as the third demographic force  *(Lesson 6 — REPLACES "When the Model Breaks"; was slotted L5)*
> **LOCKED June 2026.** The old "When the Model Breaks" lesson is **removed**. Migration was the strongest, most interactive half of it (and is half the *unit title*), so it graduates into its own lesson. The thin remainder (pure DTM critique) didn't justify a slot, and pyramid anomalies already live in Reading the Shape (L5). **Focus (user):** the lesson is centered on the **factors that drive movement and the obstacles in the way** — the quantitative net-migration content is secondary.
- **CED:** **Topics 2.10 (causes of migration), 2.11 (forced & voluntary), 2.12 (effects of migration)** — plus the *"DTM ignores migration"* critique folded in as framing. **Prereq:** L1–L5. **Ramp:** 1→3.
- **Concept:** Births and deaths are only two of the three forces on population. **Migration** is the third — and the one the DTM ignores. People move for **reasons** (push/pull), with varying **freedom** (forced/voluntary), but the journey is rarely a straight line — **intervening obstacles and opportunities** block or divert it. Migration *reshapes both the place they leave and the place they arrive*.
- **Reused from the old lesson:** `migration-flow` (net migration bends total change), the push/pull + forced/voluntary `match-pairs`, the **UAE migration-boom** deviation in `country-model` (the "two-chart drag"), and the **civil-war refugee `chart-pick`** (reframed as a forced-migration / refugee case).
- **New content (this lesson's reason to exist):** **the migration-journey explore visual** (below), chain & step migration, **intervening obstacles & opportunities**, internal vs international migration, a deeper **refugees / IDPs / asylum-seekers** treatment, and **effects of migration** (remittances, brain drain, age-sex selectivity, cultural/political impact on origin & destination).
- **🔄 RESTRUCTURED June 2026 (the explores now do the teaching).** Review flagged the lesson was *learn-heavy* — 5 `info` cards each followed by a recall `match-pairs`. Reorganized so **interactives carry the teaching and learns are reduced to 2 short context/vocab cards**: (a) **`learn-axes` removed** — its push/pull + forced/voluntary framing folds into the opening card and the upgraded journey explore; (b) **`learn-scale-type` + `learn-refugees` merged** into one "Forms of migration" card; (c) **`learn-effects` replaced** by a new `migration-effects` explore. Also added CED scope the user requested: **factor categories** (economic/political/environmental/social), **distance decay / Ravenstein**, and **guest-worker / transnational** as a named type. The journey sim was **upgraded to be motive-aware** (see step 2). Net: **5 learns → 2**, three explores (journey, effects, net-migration) + interactive capstone.
- **Steps (10 — explore-led):**
  1. **`info`** *(learn — context)* — the third force the DTM ignores; one card now also frames push/pull + forced/voluntary + obstacles/opportunities (absorbs the old `learn-axes`).
  2. **`migration-journey`** *(explore — UPGRADED hero)* — a family moves origin → destination. Push/pull factors are now **tagged by category (economic/political/environmental/social) and forced/voluntary** (shown on each chip), and the journey is **motive-aware**: obstacles (desert, wall, ocean, visa) block any move, but an **intervening opportunity only diverts a move whose motive matches** — *a "closer job" tempts an economic mover but is ignored by a family fleeing war*; a "safe town nearby" diverts a forced/safety move but not an economic one. Reinforces **distance decay** (most migrants stop at the first good chance). Motive logic lives in `MigrationJourneyEvent.matchesMotive` + `passOutcome`.
  3. **`match-pairs`** *(connect)* — sort scenarios into push/pull **and** forced/voluntary. *(reused asset)*
  4. **`info`** *(learn — MERGED "Forms of migration")* — internal vs international, **step**, **chain**, **guest-worker / transnational**, plus the forced-status vocabulary **refugee / asylum-seeker / IDP** in one card.
  5. **`match-pairs`** *(predict)* — classify vignettes as step / chain / internal / international / **guest-worker** (tile + slot added).
  6. **`chart-pick`** *(predict)* — the **civil-war / refugee** chart (death spike + population drop as people flee). *(reused asset)*
  7. **`migration-effects`** *(explore — NEW comp)* — one selective flow of mostly young, working-age migrants; a "how many migrate?" slider grows effect bars on each side: **origin** gains remittances but loses talent (brain drain) and youth (aging); **destination** gains labor, diversity, and a young-male **bulge** (callback to L5). Teaches effects *by doing* instead of an info card.
  8. **`match-pairs`** *(connect)* — sort effects into origin / destination (the check after the explore). *(reused asset)*
  9. **`migration-flow`** *(explore)* — net migration bends total change; a stable-NIR country still grows or shrinks. *(reused asset)*
  10. **`country-model` (UAE two-chart drag)** *(connect — back to the DTM)* — compare the UAE's real boom against the textbook DTM path; migration, not births/deaths, drove it. *(reused asset)*
- **Build cost:** **Medium.** **One upgraded component** (`migration-journey` — factor category/choice tags + motive-aware `matchesMotive`/`passOutcome` outcomes) and **one new component** (`migration-effects` — origin⇄destination effects explore, wired through `content.ts` → `interaction.ts` → `InteractionRenderer.tsx` → `validators.ts` → `describeInteraction.ts`). Everything else reuses `migration-flow`, `match-pairs`, `chart-pick`, `country-model`, `info`. Content lives in `whyPeopleMove.ts`.
- **Orphaned-critique note:** the old lesson's pure DTM-critique beats (Eurocentric one-path, compressed-timing South Korea, prolonged-Stage-2 Niger) are **not lost** — South Korea/Niger already appear in the **L7 capstone deviations step**, and the "ignores migration" critique is now this lesson's framing (and its step-11 callback). Confirm during build that no critique beat the team wants to keep falls through the cracks.

### C4. Place the Country — synthesis capstone  *(Lesson 7 — was Lesson 6)*
- **CED:** synthesis of L1–L6. **Prereq:** L1–L6. **Concept:** classify real countries into DTM stages from their data (rates, pyramid shape, indicators) on an interactive world map.
- **Build:** needs **`world-map`** (`react-simple-maps`; PRD-deferred, the `Interaction` union already reserves the slot). Once the map surfaces a country, grading reuses `stage-select` / `multiple-choice` / `match-pairs`.
- **Build cost:** **Highest single component** (`world-map`). Sequence it last.

### C5. Sectors — keep in the backend (non-core bonus)
- **CED:** Unit 7 (Topic 7.2) — off Unit 2. **Action:** relabel "Bonus: The Economic Story (Unit 7 preview)," unlock after the core path, **non-gating**. **Build:** zero (data edit). Optionally lift its polished `three-lens` capstone into a synthesis screen.

---

## Part D — The locked 7-lesson Unit 2 arc

Maximum in-scope Unit 2 coverage in 7 lessons with a coherent prerequisite chain. (Topic 2.1 distribution is set aside; TFR/IMR placement is the only open item.)

| # | Lesson | Core concept | CED | Prereq | New build |
|---|--------|--------------|-----|--------|-----------|
| 1 | **The Engine of Growth** *(shipped; +TFR beat)* | rates, NIR, 5 stages **+ TFR vs crude CBR** | 2.4 / 2.5 | — | ✅ none (TFR = content) |
| 2 | **Reading Population Pyramids** *(shipped)* | age structure ↔ stage | 2.3 | L1 | ✅ none |
| 3 | **Why the Curves Move** *(shipped; +policy edit, +IMR card)* | ETM (why deaths fall) + fertility transition (why births fall, **IMR named**) **+ population policy (pro/anti-natalist, explore→solve)** | 2.5 / IMP-2.B.2 + 2.8 **+ 2.7** | L1 | ✅ `policy-lab`; IMR = copy-edit |
| 4 | **The Limits of Growth** *(shipped — NEW)* | density (3 measures) + carrying capacity + Malthus + Boserup/neo-Malthusian | **2.2 + 2.6** | L1, L3 | ✅ `growth-plotter` (hero) + `density-calc` |
| 5 | **Reading the Shape** *(shipped; was L4)* | dependency ratio, momentum **+ pyramid anomalies** | 2.3 / 2.4 / 2.9 | L2 | ✅ `population-pyramid` band+ratio + `anomaly-pyramid` |
| 6 | **Why People Move** *(shipped; replaced old L5; restructured explore-led June 2026)* | migration **factors + obstacles** (push/pull w/ **categories**, forced/voluntary, intervening obstacles/opportunities, **distance decay**), chain/step/**guest-worker**, internal/international, refugees/IDPs/asylum, effects | 2.10–2.12 | L5 | ✅ `migration-journey` (upgraded, motive-aware) + `migration-effects` (new) — rest reuse |
| 7 | **Place the Country** *(shipped — capstone)* | classify real countries from their data | synthesis | L6 | ✅ `world-map` |

**Coverage (after the June 2026 restructure):** 2.2 (L4), 2.3, **2.4 (rates + TFR in L1, IMR named in L3)**, 2.5, **2.6 (L4)**, **2.7 (L3)**, 2.8, 2.9, **2.10–2.12 (L6 — incl. factor categories, distance decay, guest-worker/transnational, effects via the new `migration-effects` explore)**, + critique + synthesis. **Set aside:** 2.1 (pure distribution — map-heavy, weakly interactive, like Sectors). **No open decisions remain — and nothing left to build.** **All net-new components shipped:** `policy-lab` (L3), `growth-plotter` + `density-calc` + `carrying-capacity` + `food-history` (L4), `migration-journey` (L6, upgraded motive-aware) + `migration-effects` (L6, new), plus the previously built `category-bars`/`family-size` (L3), `population-pyramid` band+ratio + `anomaly-pyramid` (L5), `migration-flow` (L6), `world-map` (L7). **TFR (L1) and IMR (L3) are content-only.** **Backend bonus (non-core):** Sectors (Unit 7).

---

## Part E — The Lesson 3 decision *(HISTORICAL — superseded by the header + Part D)*

> Kept for the reasoning behind slot 3. The arc has since grown to 7 lessons; the "DECIDED" block below describes the *old* L5 ("When the Model Breaks"), which has been replaced by the migration lesson (now L6). Treat the header and Part D as current.

Two defensible choices for slot 3; both are genuine Unit 2 "third lenses." Pick by what you want slot 3 to *do*:

| | **ETM (candidate A)** | **Dependency + Momentum (candidate B)** |
|---|---|---|
| Role | *Mechanism* — completes L1's death curve ("here's *why* it fell") | *Consequences* — extends L2's pyramids ("so what?") |
| CED | Required, explicitly DTM-paired (IMP-2.B.2) | Topics 2.3/2.4/2.9 |
| Build | **Lowest** (0–1 new comp) | Medium (1 new `banded-pyramid`) |
| Narrative | Tightest callback to L1 | Tightest callback to L2 |
| Risk | Feels close to L1 (mitigate with the cause-of-death mix) | Slightly heavier first build |

**DECIDED:** ✅ **L3 = "Why the Curves Move"** (ETM *why deaths fall* + fertility transition *why births fall*), ✅ **L4 = "Reading the Shape"** (dependency + momentum **+ pyramid anomalies**), ✅ **L5 = "When the Model Breaks"** (migration force + critique + policy + Malthus). L3 completed *both* curves students built in L1 (shipped). Dependency extends pyramids one slot later, now bundled with pyramid anomalies after the **shape/model rebalance** (see the rebalance note at the top and C2/C3). **Sectors stay in the backend** as a non-core bonus (data edit to `lessonIds`/`order`/`prerequisites` — no code).

**No-regret edits to the sector content (still valid wherever it lives):**
1. Add a named developing-country classification (Nigeria/Brazil) to the current content.
2. Remove the two passive stimulus→MCQ steps (`predict-stage2-sector`, `capstone-three-lens` as MC), since their work is better done by drag steps.
3. Moving sectors out of the core path is a data edit (`lessonIds`/`order`/`prerequisites`) + relabel — no code.

---

## Part F — Resolved (no open decisions)

> **F1 (Malthus 2.6) and F3 (density 2.2)** are combined into the locked **Lesson 4 "The Limits of Growth"** (see C1b). **Topic 2.1 (pure distribution) is set aside.** **F2 (TFR/IMR) is now decided** — see below.

### F2. TFR & IMR — LOCKED (TFR → L1, IMR → L3 copy-edit)
> **DECIDED June 2026:** TFR is taught as a **1–2 step CBR-vs-TFR beat in L1**; IMR is a **copy-edit to L3's existing infant-mortality card** (no new step). Zero new components.
- **What IMR is:** **Infant Mortality Rate** = deaths of children **under age 1 per 1,000 live births**. Two roles: (1) a top-tier **development indicator** (low IMR ⇒ developed); (2) a **driver of fertility** — high IMR pushes families to have *more* children as insurance, and falling IMR is a major reason births drop in Stage 3. **L3 already gestures at this** ("when infant mortality falls, birth rates drop") but never names or defines it.
- **What TFR is / why "more depth":** **Total Fertility Rate** = average children a woman would have over her lifetime at current age-specific rates; **replacement ≈ 2.1.** It's the **better fertility measure than the crude CBR**, because CBR is distorted by age structure (a youthful country posts a high CBR even at modest fertility). The app already *uses* TFR (L5 "TFR hit 2.1"; L7 China 1.2 vs France 1.8) but never *teaches* it.

- **The locked additions (no new components):**
  - **TFR → 1–2 steps in L1 "The Engine of Growth"** (the rates toolkit), inserted right after `learn-nir`:
    1. **`info`** *(learn)* — define TFR (lifetime children per woman; replacement ≈ 2.1) and contrast it with the *crude* CBR: "CBR counts births against *everyone*; a country full of young adults looks high-birth even if each woman has few kids. TFR fixes that."
    2. **`multiple-choice`** *(predict, optional)* — "Countries A and B both have CBR 20, but A's TFR is 3.6 and B's is 1.5 — why?" → A is youthful (many women of childbearing age); B has an older age structure. Ties TFR → age structure → momentum (sets up L5).
  - **IMR → a copy-edit (no new step) of L3's existing `learn-why-births-fall` card**, which already says falling infant mortality lowers births. Name and define IMR there and state its two roles (development indicator **and** fertility driver: high IMR → "insurance" births; falling IMR → fewer births in Stage 3). Optionally one `multiple-choice`: "Why does falling IMR pull the birth rate down?" → families no longer need extra births to ensure survivors.
  - **Why this placement:** TFR is a *rate*, so it belongs with the rate toolkit in L1; putting it in L3 would overload a lesson already going to 11 steps with the policy block. IMR is *already* in L3's fertility narrative, so naming it there costs one card, not a step.

- **Rejected alternative (for the record):** a standalone "better measures" beat (2–3 steps) appended to L1 or opening L3 — heavier and risks duplicating L1's rate framing. Not chosen.

---

## Build status — COMPLETE (7-lesson arc shipped)

All build workstreams are done, wired, and verified (`npm run type-check && npm run test && npm run build` all green; 151 tests pass). For the record, what landed:

1. ✅ **L3 policy edit** — `policy-lab` built as its own component (two lever directions, projected population total, `showCount` flag, trend grading — richer than a `family-size` extension). `epiTransition.ts` steps 7–8 replaced with the learn → explore (count shown) → solve (count hidden, graded "shrinking") policy block → **11 steps**.
2. ✅ **TFR/IMR additions** — `dtmEngine.ts` gained `learn-tfr` (info) + `predict-tfr-cbr` (MC) after `learn-nir`; `epiTransition.ts`'s `learn-why-births-fall` card now names/defines IMR (formula + its two roles). Content-only.
3. ✅ **L6 "Why People Move"** — `whyPeopleMove.ts`, **restructured explore-led June 2026 to 10 steps (5 learns → 2)**: upgraded **motive-aware** `migration-journey` (factor category/choice tags, `matchesMotive`/`passOutcome`), new `migration-effects` explore, merged "Forms of migration" card (incl. guest-worker/transnational), plus reused `migration-flow`/`match-pairs`/`chart-pick`/`country-model`. `id: 'why-people-move'`, `order: 6`, prereq `population-structure`.
4. ✅ **L4 "The Limits of Growth"** — new `limitsOfGrowth.ts` (9 steps) + the two new components `growth-plotter` (hero) and `density-calc`; shared math (`computeDensities`, `malthusCrossover`) added to `dtm.ts`. `order: 4`, prereqs `['dtm-engine','epi-transition']`.
5. ✅ **`src/content/index.ts` wiring** — final order `['dtm-engine','population-pyramids','epi-transition','limits-of-growth','population-structure','why-people-move','place-country']`. `modelBreaks` removed from imports + `LESSONS` map + `lessonIds` (file kept on disk). `populationStructure` bumped to `order: 5`; `placeCountry` to `order: 7` with prereq retargeted `model-breaks` → `why-people-move`. The exhaustive `describeInteraction.ts` switch gained the `migration-journey` case (the one type-check gap surfaced post-wiring).

Standing trade-offs (informational, not blocking):
- **Sectors' sunk value** — the polished sector lesson stays a backend bonus; its `three-lens` capstone could still be folded into a synthesis screen.
- **Production bundle** — `vite build` warns the main chunk is >500 kB (pre-existing); consider `manualChunks`/dynamic imports if it becomes a concern.

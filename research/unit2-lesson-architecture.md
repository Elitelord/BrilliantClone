# Population Path — Unit 2 Lesson Architecture & Component Inventory

> **Purpose:** Lay out the *pieces we're working with* — every existing interaction primitive, the small set of new ones we'd need, and a concept-by-concept interactive design for each candidate Unit 2 lesson — so we can decide what Lesson 3 should be and design a coherent **6-lesson arc** covering as much of AP HUG Unit 2 as possible.
>
> Companion to `ap-human-geography-dtm-teaching-knowledge-base.md` (the research). This doc is the *engineering/design* translation of that research.
>
> **Last updated:** June 2026 (L4/L5 rebalanced along shape vs model)
>
> **DECISIONS FINALIZED (user):** L3 = **"Why the Curves Move"** (ETM *why deaths fall* + fertility transition *why births fall*), L4 = **"Reading the Shape"** (dependency + momentum **+ pyramid anomalies**), L5 = **"When the Model Breaks"** (migration as a *force* + DTM critique + policy + Malthus), L6 = **Place the Country**. **Sectors** stay in the backend as a non-core bonus. **Status: L3 shipped; L4 in progress.**
>
> **L4/L5 REBALANCED (shape vs model):** the old L5 was overloaded (~10 steps, two themes) while L4 was thin. **Pyramid anomalies** (war notch / guest-worker bulge / one-child constriction / baby-boom bulge) **moved from L5 into L4**, so **L4 = everything a pyramid's *shape* tells you** (dependency, momentum, anomalies) and **L5 = where the *model* fails** (migration force, critique, policy, Malthus). Migration appears in both on purpose: a *shape* in L4, a *force* in L5. China's one-child policy is the spine — its *shape* in L4, its *policy/critique* in L5.

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
| **`world-map`** | `react-simple-maps` (PRD-deferred; `Interaction` union already reserves the slot) | "Place the Country" synthesis capstone | **High** — defer beyond the 6-lesson MVP |

**Takeaway:** with L3's components shipped, the rest of the arc needs only a `population-pyramid` band+ratio extension + a small `anomaly-pyramid` (L4), then `migration-flow` (L5, which *reuses* L4's `anomaly-pyramid`), and finally `world-map` (L6). Everything else is content + data.

---

## Part C — Per-lesson interactive designs

Each design lists CED topic, one-line concept, prereq, a step-by-step outline (primitive in **bold**; *new/extended* flagged), difficulty ramp, and build cost. Steps follow the house pattern: `learn → explore → predict → solve → connect`.

### C1. "Why the Curves Move"  *(Lesson 3 — covers why BOTH rates fall)*
> Expanded from "Why Death Rates Fall (ETM)" to also cover **why birth rates fall**. This makes L3 the single *mechanism* lesson behind both curves students built in L1, and **moves the fertility/women "why births fall" beat out of L4** (which becomes a pure structure/consequence lesson). Suggested title: **"Why the Curves Move"** (or "What Drives the Change").
- **CED:** Topic 2.5 / **IMP-2.B.2** (ETM, required) **+ Topic 2.8** (changing role of women / fertility decline). **Prereq:** `dtm-engine`. **Ramp:** 1→3.
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

### C2. Reading the Shape — "Who Depends, and Where Shapes Break"  *(Lesson 4)*
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

### C3. When the Model Breaks — DTM critique + migration + policy + Malthus  *(Lesson 5)*
- **CED:** Topic 2.5 critique + **2.6 Malthus** + **2.7 policy** + **2.10–2.12 migration**. **Prereq:** L1–L4 (the "ignores migration" and aging critiques only land once students know the model *and* its structure). **Ramp:** 2→3.
- *(Note: **pyramid anomalies moved to L4** in the shape/model rebalance. L5 is now the focused "the DTM is a model, not a law" lesson — the forces that bend countries off its predicted path, no longer two sub-themes.)*
- **Concept:** The idealized DTM curve is an *average, not a law* — a compass, not a GPS. **Migration** (as a *force*, not just a shape), **government policy**, the model's **Eurocentric origins**, and its **lack of timing** all push real countries off the predicted path. China is the spine carried over from L4: the one-child *shape* there becomes *policy + critique* here.
- **Themes:** migration as a quantitative force (net migration on totals; push/pull, forced/voluntary); DTM critique (Eurocentric/one-path, ignores migration, ignores policy, no timing); real deviations (South Korea compressed, Sub-Saharan prolonged Stage 2, Saudi high TFR despite high GDP); population policy (pro- vs anti-natalist); Malthus vs. reality.
- **Steps (~8):**
  1. **`info`** — the model is an *average*, not a law; a compass, not a GPS. *(reuse)*
  2. **`migration-flow`** *(new)* — net migration bends total change; a stable-NIR country still grows (immigration) or shrinks (emigration). *(1 new component)*
  3. **`multiple-choice`** — push/pull and forced/voluntary classification. *(reuse)*
  4. **`country-model`** — compare deviation from the European timeline (add **South Korea, Saudi Arabia, a Sub-Saharan case** = *data only*). *(reuse + data)*
  5. **`multiple-choice`** — "Which DTM critique applies here?" (Eurocentric / ignores migration / ignores policy / no timing). *(reuse)*
  6. **`match-pairs`** — country → how it breaks the model. *(reuse)*
  7. **`multiple-choice`/`stage-select`** — policy beat: pro- vs anti-natalist; **China one-child reuses L4's `anomaly-pyramid` shape as a reference**; European pro-natal contrast. *(reuse + reused comp)*
  8. **(optional) `multiple-choice`** — Malthus: food (linear) vs population (exponential) vs reality. *(reuse)*
- **Build cost:** **Medium** — one new `migration-flow` input + `countries.ts` data; the anomaly pyramid it needs for the China beat is **already built in L4**. ~8 steps, balanced with L4 after the rebalance (the old ~10-step two-theme version is retired).

### C4. Place the Country — synthesis capstone  *(Lesson 6)*
- **CED:** synthesis of L1–L5. **Prereq:** L1–L5. **Concept:** classify real countries into DTM stages from their data (rates, pyramid shape, indicators) on an interactive world map.
- **Build:** needs **`world-map`** (`react-simple-maps`; PRD-deferred, the `Interaction` union already reserves the slot). Once the map surfaces a country, grading reuses `stage-select` / `multiple-choice` / `match-pairs`.
- **Build cost:** **Highest single component** (`world-map`). Sequence it last.

### C5. Sectors — keep in the backend (non-core bonus)
- **CED:** Unit 7 (Topic 7.2) — off Unit 2. **Action:** relabel "Bonus: The Economic Story (Unit 7 preview)," unlock after the core path, **non-gating**. **Build:** zero (data edit). Optionally lift its polished `three-lens` capstone into a synthesis screen.

---

## Part D — Recommended 6-lesson Unit 2 arc

Targeting **maximum Unit 2 coverage in 6 lessons** with a coherent prerequisite chain and only **2 net-new components**.

| # | Lesson | Core concept | CED | Prereq | New build |
|---|--------|--------------|-----|--------|-----------|
| 1 | **The DTM Engine** *(ships)* | rates, NIR, 5 stages | 2.4/2.5 | — | none |
| 2 | **Reading Population Pyramids** *(ships)* | age structure ↔ stage | 2.3 | L1 | none |
| 3 | **Why the Curves Move** *(SHIPPED)* | why deaths fall first (ETM) **and** why births fall later (fertility transition); the lag = the boom | 2.5 / IMP-2.B.2 + 2.8 | L1 | `category-bars` + `family-size` + match-pairs bucket (built) |
| 4 | **Reading the Shape** *(in progress)* | dependency ratio, momentum **+ pyramid anomalies** (war / migration / one-child / baby boom) | 2.3/2.4/2.9 | L2 | `population-pyramid` band+ratio extension + `anomaly-pyramid` |
| 5 | **When the Model Breaks** *(NEW)* | migration as a *force* + DTM critique + policy + Malthus | 2.5–2.7, 2.10–2.12 | L1–L4 | 1 (`migration-flow`) + `countries.ts` data (reuses L4's `anomaly-pyramid`) |
| 6 | **Place the Country** *(NEW, capstone)* | classify real countries from their data | synthesis | L1–L5 | 1 (`world-map`, high) |

**Coverage:** 2.3, 2.4, 2.5 (DTM+ETM), 2.6, 2.7, 2.8 (in L3), 2.9, 2.10, 2.11, 2.12, + critique + synthesis. **Omitted:** 2.1/2.2 (distribution/density — least interactive, least central to the through-line). **Net-new components for the whole arc:** `category-bars` + `family-size` (L3, built), `population-pyramid` band+ratio extension + `anomaly-pyramid` (L4), `migration-flow` (L5; reuses L4's `anomaly-pyramid`), `world-map` (L6). **Backend bonus (non-core):** Sectors (Unit 7).

---

## Part E — The Lesson 3 decision

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

## Open trade-offs for the human

- **Mechanism vs. consequences at slot 3** (ETM vs Dependency) — see Part E.
- **Does ETM feel too close to L1?** Build the optional `category-bars` cause-of-death mix so the explore step is genuinely new content rather than another death-curve drag.
- **Sectors' sunk value** — demoting your most polished lesson to a bonus "wastes" some work; recoup the `three-lens` capstone by folding it into a synthesis screen.
- **Build order** — ETM + Limits are the two cheapest new lessons (little/no new components); Dependency and Migration each cost one new component; Place the Country costs the big world-map. Sequencing builds cheap→expensive lets you ship coverage fast.

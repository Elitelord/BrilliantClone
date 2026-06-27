// Content model for lessons. Lessons are DATA, not hardcoded JSX.
// Designed to scale to future interaction types (e.g. world-map) and AI-generated
// steps with no migration: interaction configs are a typed discriminated union and
// validation/feedback are outcome-based.

export type StepKind = 'explore' | 'predict' | 'solve' | 'connect' | 'mc' | 'learn';

export type Trend = 'stable' | 'growing' | 'rapid-growth' | 'shrinking';
export type Sector = 'primary' | 'secondary' | 'tertiary';

// ---------------------------------------------------------------------------
// Interaction configs (one per interaction type)
// ---------------------------------------------------------------------------

export interface RateGraphConfig {
  // The learner drags a vertical "stage handle" along the time/development axis.
  initialStage?: number; // 1..5 (may be fractional); defaults to 1 (e.g. overview mode)
  // Snap the handle to whole stages (1..5) instead of free, continuous dragging.
  // `'stable'` snaps only to the two stable inflection points (Stage 1 and Stage 4).
  snap?: boolean | 'stable';
  showPopulationBar?: boolean;
  // The "Population: growing/stable/declining" verdict line. Hide it on graded
  // "drag to a stable/shrinking stage" steps so it doesn't give away the answer.
  showVerdict?: boolean;
  // Shaded NIR band between the curves. Hide on graded drag steps so the gap
  // size doesn't reveal stable vs growth vs decline.
  showGap?: boolean;
  /** Yellow NIR curve overlaid on the graph (gap per stage). */
  showNirCurve?: boolean;
  /** Explore-only: toggle button to show/hide the yellow NIR curve. */
  showNirCurveToggle?: boolean;
  // CBR/CDR readouts under the graph. Hide on graded drag steps so learners
  // read the curves rather than the numeric gap.
  showStats?: boolean;
  // Overview/reference mode: just the curves + stage axis (no handle, no stats,
  // no population panel). Used as frozen graph context on multiple-choice steps.
  overview?: boolean;
  /** Frozen reference: highlight a stage band (like stage-select). */
  highlightStage?: number;
  historical?: {
    country: string;
    // marker years rendered as ticks; purely illustrative labels for the axis
    yearLabels: { stage: number; label: string }[];
    // key events pinned to a stage, drawn as icon + caption along the timeline
    events?: { stage: number; icon: string; label: string }[];
  };
}

export interface PyramidConfig {
  mode: 'shape' | 'classify';
  // shape mode: learner drags control handles at four age levels
  initialBaseWidth?: number; // 0..1 — used when initialWidths omitted (youngest cohort)
  initialTopWidth?: number; // 0..1 — used when initialWidths omitted (oldest cohort)
  /** Four width values (0..1) at young → old control cohorts; overrides base/top defaults. */
  initialWidths?: [number, number, number, number];
  // classify mode: a fixed preset pyramid the learner must classify
  preset?: { baseWidth: number; topWidth: number; label?: string };
  /** Frozen diagram with age/sex annotations — no drag handles (setup slides). */
  illustrate?: boolean;
  /** Short explanatory text shown below the diagram (illustrate mode). */
  caption?: string;
  /** Explore-only: live read-only stage chip above the chart (not on graded drag steps). */
  showStagePicker?: boolean;
  stagePickerHint?: string;
  /** Explore-only: preset buttons that snap handles to each stage profile. */
  showStagePresets?: boolean;
  /** Shade youth (0–14) / working (15–64) / elderly (65+) bands over the pyramid. */
  showBands?: boolean;
  /** Live readout of approx. dependents per 100 workers as the shape changes. */
  showDependencyRatio?: boolean;
  /** Drag nine per-cohort handles (male side) instead of four interpolated controls. */
  nineHandles?: boolean;
  /** Nine cohort widths (young → old, 0..1) when nineHandles is set; overrides initialWidths. */
  initialCohorts?: [number, number, number, number, number, number, number, number, number];
}

export interface SectorConfig {
  mode: 'adjust' | 'classify';
  // adjust mode: learner drags the three-sector split (auto-normalized to 100)
  initial?: { primary: number; secondary: number; tertiary: number };
  // classify mode: fixed preset split, learner picks the stage
  preset?: { primary: number; secondary: number; tertiary: number; label?: string };
  /** adjust mode: show a live implied-stage chip while dragging (only when confidence is high). */
  showImpliedStage?: boolean;
  /** adjust mode: show Stage 2/3/4 preset chips that snap the mix. */
  showStagePresets?: boolean;
}

export interface PyramidPreset {
  baseWidth?: number;
  topWidth?: number;
  widths?: [number, number, number, number];
}

export interface McOption {
  id: string;
  label: string;
  pyramid?: PyramidPreset;
}
export interface McConfig {
  options: McOption[];
}

export interface NirSliderConfig {
  minGap?: number;
  maxGap?: number;
  initialGap?: number;
  hint?: string;
  showVerdict?: boolean;
}

export interface RateSlidersConfig {
  birthRange?: [number, number];
  deathRange?: [number, number];
  initialBirth?: number;
  initialDeath?: number;
  showFormula?: boolean;
}

export interface CountryModelConfig {
  // Real-country explorer: tabs of countries, each with its own birth/death
  // curve over real years plus an animated population total. Currently an
  // explore-only interaction (no graded answer).
  countryIds: string[];
  initialCountryId?: string;
  /**
   * Textbook-vs-actual comparison mode: renders two synced charts side by side
   * — LEFT = idealized DTM path, RIGHT = the real country data — with the
   * country picker on top and a single shared year scrubber across both charts.
   * Defaults to the original single-chart explorer when omitted (backward
   * compatible). Comparison mode hides the figurine readout and CBR/CDR stats
   * and draws the total-population line by default.
   */
  comparison?: boolean;
  /** Overlay a scaled total-population line on the chart(s). Defaults on in comparison mode. */
  showTotalPopulationLine?: boolean;
  /** Hide the population figurine readout panel. Defaults true in comparison mode. */
  hideFigurines?: boolean;
  /** Hide the CBR / CDR / stage numeric readouts. Defaults true in comparison mode. */
  hideRates?: boolean;
}

export interface MigrationFlowPreset {
  id: string;
  label: string;
  flag?: string;
  birthRate: number;
  deathRate: number;
}

export interface MigrationFlowConfig {
  /** Label on the population pool when no country presets are used. */
  countryLabel?: string;
  /** Fixed natural increase per 1,000 when countryPresets omitted. */
  naturalChange: number;
  /** Selectable countries — NIR derived from birth − death per preset. */
  countryPresets?: MigrationFlowPreset[];
  initialPresetId?: string;
  /** Graded steps: hide country selector and lock NIR. */
  lockCountry?: boolean;
  initialIn?: number;
  initialOut?: number;
  /** Max migration rate per 1,000 for draggable arrows; default 20. */
  maxFlow?: number;
  /** Live trend label in the verdict panel (hide on graded steps). Default true. */
  showVerdict?: boolean;
  /** Optional fixed birth/death when countryPresets omitted. */
  birthRate?: number;
  deathRate?: number;
}

export interface CurveDrawConfig {
  // The learner constructs the model by dragging one point per stage (1..5) for
  // each enabled curve. Graded against per-stage target values with tolerance.
  curves: ('birth' | 'death')[];
  initial?: { birth?: number[]; death?: number[] }; // starting y per stage (length 5)
  // Non-draggable curves drawn faintly for context (e.g. show the death curve
  // already built while the learner draws the birth curve).
  referenceCurves?: { birth?: number[]; death?: number[] };
  /**
   * Relabel the x-axis. By default the five points read as DTM stages (1..5).
   * Provide `xTicks` (five labels mapped left→right onto the points) and `xLabel`
   * to repurpose the same chart for a TIME axis — e.g. drawing how fast a real
   * country's transition happened (decades vs centuries). Geometry is unchanged.
   */
  xLabel?: string;
  xTicks?: (string | number)[];
}

export interface StageSelectConfig {
  // The full idealized DTM curve is shown; the learner taps the stage band that
  // matches a scenario in the prompt. Graded against the accepted stage(s).
  showRates?: boolean; // show CBR/CDR readout for the tapped stage (default true)
}

export interface InfoRateTerm {
  abbrev: string;
  name: string;
  curve: 'birth' | 'death';
}

export interface InfoConfig {
  // A read-only "concept card": short framing text used sparingly between
  // interactions (setup, a key definition, etc.). No grading.
  body: string;
  formula?: string; // highlighted equation, e.g. "NIR = CBR − CDR"
  points?: string[]; // optional bullet takeaways
  icon?: string; // optional emoji accent
  /** Key rate abbreviations shown as prominent cards (e.g. CBR / CDR on lesson open). */
  terms?: InfoRateTerm[];
}

export interface ThreeLensConfig {
  // The stage these panels jointly depict (drives the rate snapshot highlight).
  stage: number;
  sectors: { primary: number; secondary: number; tertiary: number };
  pyramid: PyramidPreset;
  rateLabel?: string; // e.g. "Low births, low deaths"
  /** Show the birth/death rate panel. Default true; set false to hide it (e.g.
   *  so the rate curve doesn't give away the answer — only pyramid + sectors). */
  showRates?: boolean;
}

export interface MatchTile {
  id: string;
  label: string;
  image?: string; // served path, e.g. "/img/farm.png"
  icon?: string; // emoji fallback when no image
  /** Render a population-pyramid anomaly thumbnail (no text label when hideLabel is set). */
  anomalyId?: string;
  hideLabel?: boolean;
}

export interface MatchSlot {
  id: string;
  label: string; // e.g. "Maria's grandparents"
  sublabel?: string;
  image?: string;
  icon?: string;
}

export interface CategoryBarsConfig {
  /** explore: development handle drives mix. adjust: learner drags each card vertically. */
  mode?: 'explore' | 'adjust';
  /** Development position on 1..5 axis; defaults to 1 (least developed). Explore only. */
  initialDev?: number;
  /** Population used for estimated death counts; default 10,000,000. Explore only. */
  population?: number;
  /** Display label for population, e.g. "10 million". */
  populationLabel?: string;
  /** Starting figurine count per bucket (adjust mode). */
  initialFigures?: { infectious: number; famine: number; accidents: number; chronic: number };
  /** Max figurines per bucket in adjust mode; default 7. */
  maxFigures?: number;
}

export interface MatchPairsConfig {
  // Fixed targets shown in order (e.g. the three people). The learner drags a
  // tile (e.g. a job/sector) into the drop zone beneath each slot.
  slots: MatchSlot[];
  // Draggable tiles (e.g. farm / factory / office).
  tiles: MatchTile[];
  instruction?: string; // small helper line under the prompt
  /** Bucket/sort mode: a slot can hold multiple tiles (e.g. 4 tiles into 2 buckets). */
  multiPerSlot?: boolean;
  /**
   * Multi-category mode: a single tile can be placed into MULTIPLE slots at once
   * (e.g. a scenario that is both a "push factor" AND "forced migration"). Tiles
   * stay available in the tray so they can be dropped into several categories.
   * Grade with `MatchPairsAnswer.tileSlots` (exact set per tile).
   */
  multiPerTile?: boolean;
  /**
   * multiPerTile only: cap how many categories a single tile can occupy (e.g. 2 for
   * "one direction + one choice"). Drops past the cap are ignored, and Check stays
   * disabled until every tile is placed in exactly this many slots.
   */
  maxPerTile?: number;
}

export interface FamilySizeConfig {
  /** explore: development handle drives average family size. adjust: learner drags up/down. */
  mode?: 'explore' | 'adjust';
  /** Development position on 1..5 axis; defaults to 1 (least developed). Explore only. */
  initialDev?: number;
  /** Starting children count (adjust mode); defaults to 4. */
  initialChildren?: number;
  /** Max children the learner can set in adjust mode; default 8. */
  maxChildren?: number;
}

export interface PolicyLabConfig {
  /**
   * 'toggle' (default): learner toggles levers themselves.
   * 'guess': levers are preset and locked (a country's chosen mix); the learner
   * estimates the resulting population with a slider instead of picking policies.
   */
  mode?: 'toggle' | 'guess';
  /** Show the live running population total + trend verdict (explore). Hidden on the graded solve; ignored in 'guess' mode. */
  showCount?: boolean;
  /** Starting population in millions; default 50. */
  initialPopulation?: number;
  /** Baseline growth per 1,000 before any policy (the country grows too fast); default 14. */
  baselineGrowth?: number;
  /** Decades to project the running total; default 5 (50 years). */
  decades?: number;
  /** 'guess' mode: lever ids pre-selected and locked (a mix of pro/anti for the country shown). */
  preset?: string[];
  /** 'guess' mode: slider lower/upper bounds in millions (defaults derive from the starting population). */
  guessMin?: number;
  guessMax?: number;
}

export interface ExplainBackConfig {
  question: string;
  /** Key points a full-credit answer must touch (grounds the AI grader). */
  rubric: string[];
  /** Model answer shown on reveal / when AI is off. */
  sampleAnswer: string;
  placeholder?: string;
  minChars?: number;
}

export interface PyramidPickOption {
  stage: number;   // which STAGE_PYRAMID_PROFILES shape to render (1..5)
  label?: string;  // defaults to `Stage ${stage}` in the component
}
export interface PyramidPickConfig {
  options: PyramidPickOption[];
  multi?: boolean; // allow selecting multiple options (default false)
}

export interface ChartPickSeriesPoint {
  year: number;
  birth: number; // crude birth rate (per 1,000)
  death: number; // crude death rate (per 1,000)
  pop: number; // total population (millions) — drives the secondary-axis pop line
}
export interface ChartPickOption {
  id: string;
  caption?: string; // short label shown under the mini chart
  series: ChartPickSeriesPoint[]; // small birth/death rate chart (small multiple)
}
export interface ChartPickConfig {
  instruction?: string; // small helper line under the prompt
  options: ChartPickOption[];
  showCaptions?: boolean; // show per-option captions (default true)
  /**
   * Overlay a scaled total-population line (violet) on each mini chart, like
   * CountryModel's comparison mode. Each card scales pop to its OWN secondary
   * axis so the line is readable next to the shared 0–55 rate axis. Default ON.
   */
  showTotalPopulationLine?: boolean;
}

export interface AnomalyPyramidShape {
  id: string;
  label: string;
  /** Nine cohort widths (youngest → oldest), each 0..1 — symmetric fallback when sex-specific arrays omitted. */
  cohorts: [number, number, number, number, number, number, number, number, number];
  /** Optional male-side widths per cohort (left bars). */
  maleCohorts?: [number, number, number, number, number, number, number, number, number];
  /** Optional female-side widths per cohort (right bars). */
  femaleCohorts?: [number, number, number, number, number, number, number, number, number];
  caption: string;
}

export interface AnomalyPyramidConfig {
  shapes: AnomalyPyramidShape[];
  /** Gallery mode: learner can switch between shapes. */
  selectable?: boolean;
  /** Which shape to show initially (reference / static mode). */
  initialShapeId?: string;
  /** view = read-only; adjust = drag nine cohort handles on the male side. */
  mode?: 'view' | 'adjust';
  /** Show caption text under selectors (default true). */
  showCaption?: boolean;
}

export type MigrationFactorCategory = 'economic' | 'political' | 'environmental' | 'social';

export interface MigrationJourneyFactor {
  id: string;
  icon: string;
  label: string;
  /** CED factor category (economic / political / environmental / social). */
  category?: MigrationFactorCategory;
  /** Degree of choice this factor implies. Push factors drive forced vs voluntary moves. */
  choice?: 'forced' | 'voluntary';
}

export interface MigrationJourneyEvent {
  id: string;
  icon: string;
  label: string;
  /** obstacle = blocks the trip; opportunity = diverts it and ends it early. */
  kind: 'obstacle' | 'opportunity';
  /** Position along the route, 0 (origin) → 1 (destination). */
  position: number;
  /** Caption shown when this event stops / diverts the family. */
  outcome: string;
  /**
   * Opportunities only divert a move whose motive matches:
   * 'economic' — a closer job only tempts an economically-motivated, voluntary move;
   * 'safety'   — a safe place nearby only diverts a forced / safety-seeking move;
   * 'any'      — diverts regardless of motive.
   * Obstacles ignore this (they block every move).
   */
  matchesMotive?: 'economic' | 'safety' | 'any';
  /** Caption shown when an opportunity does NOT match the motive and the family passes it by. */
  passOutcome?: string;
}

export interface MigrationJourneyConfig {
  // Explore-only hero: a family tries to move origin → destination. The learner
  // toggles push (home) / pull (destination) factors to motivate the move, then
  // sets out and watches intervening obstacles block or an intervening
  // opportunity divert the journey. Ungraded (no Answer).
  origin: { label: string; flag?: string };
  destination: { label: string; flag?: string };
  pushFactors: MigrationJourneyFactor[];
  pullFactors: MigrationJourneyFactor[];
  events: MigrationJourneyEvent[];
  /** Caption shown when the family completes the trip with nothing in the way. */
  arriveCaption?: string;
}

export interface MigrationEffect {
  id: string;
  icon: string;
  label: string;
  /** Drives the bar color: a gain (positive), a loss (negative), or a structural shift (neutral). */
  tone: 'positive' | 'negative' | 'neutral';
}

export interface MigrationEffectsConfig {
  // Explore-only hero: one flow of migrants, opposite effects on each end. The
  // learner drags a "how many migrate?" slider and watches effect bars grow on
  // the origin (remittances, brain drain, aging) and destination (labor,
  // diversity, age-sex bulge). Ungraded (no Answer).
  origin: { label: string; flag?: string };
  destination: { label: string; flag?: string };
  originEffects: MigrationEffect[];
  destinationEffects: MigrationEffect[];
  /** Caption under the panels. */
  caption?: string;
}

export interface FoodHistoryEvent {
  id: string;
  /** Year the policy/innovation lands on the timeline. */
  year: number;
  icon: string;
  label: string;
  /** innovation = lifted the food line; setback = pushed it down. */
  kind: 'innovation' | 'setback';
  /** Detail shown when the learner selects this event. */
  note: string;
}

export interface FoodHistoryConfig {
  // Explore-only hero: a real country's population vs food-capacity curves over
  // history, annotated with a clickable timeline of policies/innovations. Shows
  // how innovation kept food ahead of population (Malthus's failed prediction).
  // Ungraded (no Answer).
  title?: string;
  populationLabel?: string;
  foodLabel?: string;
  startYear: number;
  endYear: number;
  /** Y-axis ceiling for both series. */
  maxValue: number;
  /** Unit shown in the caption, e.g. "million people". */
  unit?: string;
  population: { year: number; value: number }[];
  food: { year: number; value: number }[];
  events: FoodHistoryEvent[];
  /** Caption before any event is selected. */
  baselineCaption?: string;
}

export interface GrowthPlotterConfig {
  // A 2-curve plot: population (exponential) vs food (linear). The learner drags
  // the population growth rate and/or the food-supply slope and watches whether &
  // when the curves cross (the Malthusian crisis point).
  /** Years to project across the x-axis. Default 50. */
  horizonYears?: number;
  /** Starting population index (left edge). Default 100. */
  initialPop?: number;
  /** Starting food capacity (left edge); begins above pop. Default 130. */
  initialFood?: number;
  /** Initial population growth rate, % per year. Default 2.4. */
  initialGrowthRate?: number;
  /** Draggable growth-rate range [min, max] in % per year. Default [0, 4]. */
  growthRateRange?: [number, number];
  /** Initial food-supply slope (capacity units added per year). Default 1.5. */
  initialFoodSlope?: number;
  /** Draggable food-slope range [min, max]. Default [0, 8]. */
  foodSlopeRange?: [number, number];
  /** Lock the food line (only the growth-rate handle is draggable). */
  lockFood?: boolean;
  /** Lock the growth rate (only the food handle is draggable). */
  lockGrowth?: boolean;
  /**
   * How the learner moves the curves.
   * 'drag' (default): drag the right-edge handles directly.
   * 'levers': toggle Malthusian checks (positive/preventive, which slow population)
   * and food-supply levers (which raise/lower the food line).
   */
  controls?: 'drag' | 'levers';
  /** Show the curve chart + crisis/no-crisis verdict. Default true; set false on a graded solve to make the learner choose blind. */
  showChart?: boolean;
  /** Lever mode: cap how many levers the learner may select at once. */
  maxLevers?: number;
}

export interface CarryingCapacityConfig {
  // Carrying capacity = the BINDING resource ceiling: min(food, water), where
  // food = farmland × yield-per-unit and water = water supply. Whichever runs out
  // first sets the ceiling (Liebig's law of the minimum).
  /** explore: shows the live capacity number + a population marker. solve: capacity hidden, learner hits a target. */
  mode?: 'explore' | 'solve';
  /** Show the numeric carrying-capacity readout. Default true in explore, false in solve. */
  showCapacity?: boolean;
  /** Initial farmland (resource) value. */
  initialLand?: number;
  /** Initial yield/technology value. */
  initialYield?: number;
  /** Initial water-supply ceiling (people water can sustain, same unit as capacity). */
  initialWater?: number;
  /** Slider range for farmland [min, max]. Default [0, 400]. */
  landRange?: [number, number];
  /** Slider range for yield/technology [min, max]. Default [1, 12]. */
  yieldRange?: [number, number];
  /** Slider range for water supply [min, max]. Default [0, 2000]. */
  waterRange?: [number, number];
  landLabel?: string; // default 'Farmland'
  yieldLabel?: string; // default 'Yield per unit (technology)'
  waterLabel?: string; // default 'Water supply'
  landUnit?: string; // default 'M hectares'
  yieldUnit?: string; // default 'people / hectare'
  waterUnit?: string; // default 'M people'
  /** Suffix on the capacity number, e.g. 'M people'. Default 'M people'. */
  capacityUnit?: string;
  /** explore: a current population (same unit as capacity) to compare against the ceiling. */
  population?: number;
  /** solve: target capacity to hit (drawn as a notch; the prompt states the number). */
  targetCapacity?: number;
}

export interface CarryingCapacityAnswer {
  /** Pass when computed capacity (farmland × yield) is within `tolerance` of this target. */
  targetCapacity: number;
  /** Absolute tolerance in capacity units; defaults to 5% of the target. */
  tolerance?: number;
}

export interface DensityPreset {
  id: string;
  label: string;
  flag?: string;
  population: number; // millions of people
  totalLand: number; // thousand km²
  arableLand: number; // thousand km²
  farmers: number; // millions of farmers
}

export interface DensityCalcConfig {
  // Adjust population / total land / arable land / farmers; the three densities
  // (arithmetic / physiological / agricultural) compute live.
  /** explore: free calculator with presets. solve: graded against density thresholds. */
  mode?: 'explore' | 'solve';
  /** Starting input values. */
  initial?: { population: number; totalLand: number; arableLand: number; farmers: number };
  /** Country preset chips that snap all four inputs (e.g. Egypt / Canada / Bangladesh). */
  presets?: DensityPreset[];
  initialPresetId?: string;
  /** Slider maxima for each input (UI only). */
  maxPopulation?: number;
  maxLand?: number;
  maxArable?: number;
  maxFarmers?: number;
}

export interface WorldMapConfig {
  /** Country ids from worldCountries.ts to show as map markers. */
  countryIds: string[];
  /** explore = data card; pick = single-select; pick-multi = select exact set. */
  mode?: 'explore' | 'pick' | 'pick-multi';
  /** Reference mode: ring + static card for this country. */
  highlightId?: string;
  /** Pan/zoom the map so this country sits near the center on load. */
  centerOnId?: string;
  /** Show full rates/pyramid card on tap (default true in explore, false in pick). */
  showDataCard?: boolean;
  /** Hide the mini pyramid on the data card (rates-only reference). */
  hidePyramidMini?: boolean;
  /** Hide the country blurb under the rates grid. */
  hideBlurb?: boolean;
  /** Hide stage-colored pins (use neutral markers) — default true for pick modes. */
  hideStageColors?: boolean;
  caption?: string;
}

export type Interaction =
  | { type: 'rate-graph'; config: RateGraphConfig }
  | { type: 'country-model'; config: CountryModelConfig }
  | { type: 'curve-draw'; config: CurveDrawConfig }
  | { type: 'stage-select'; config: StageSelectConfig }
  | { type: 'info'; config: InfoConfig }
  | { type: 'population-pyramid'; config: PyramidConfig }
  | { type: 'sector-bars'; config: SectorConfig }
  | { type: 'multiple-choice'; config: McConfig }
  | { type: 'nir-slider'; config: NirSliderConfig }
  | { type: 'rate-sliders'; config: RateSlidersConfig }
  | { type: 'three-lens'; config: ThreeLensConfig }
  | { type: 'match-pairs'; config: MatchPairsConfig }
  | { type: 'pyramid-pick'; config: PyramidPickConfig }
  | { type: 'chart-pick'; config: ChartPickConfig }
  | { type: 'category-bars'; config: CategoryBarsConfig }
  | { type: 'family-size'; config: FamilySizeConfig }
  | { type: 'policy-lab'; config: PolicyLabConfig }
  | { type: 'anomaly-pyramid'; config: AnomalyPyramidConfig }
  | { type: 'migration-flow'; config: MigrationFlowConfig }
  | { type: 'migration-journey'; config: MigrationJourneyConfig }
  | { type: 'migration-effects'; config: MigrationEffectsConfig }
  | { type: 'food-history'; config: FoodHistoryConfig }
  | { type: 'explain-back'; config: ExplainBackConfig }
  | { type: 'growth-plotter'; config: GrowthPlotterConfig }
  | { type: 'density-calc'; config: DensityCalcConfig }
  | { type: 'carrying-capacity'; config: CarryingCapacityConfig }
  | { type: 'world-map'; config: WorldMapConfig };

export type InteractionType = Interaction['type'];

// ---------------------------------------------------------------------------
// Answers (typed per interaction type)
// ---------------------------------------------------------------------------

export interface RateGraphAnswer {
  kind: 'stage' | 'trend';
  stages?: number[]; // accepted stages (matched within tolerance)
  trend?: Trend; // accepted trend at the chosen stage
  tolerance?: number; // stage tolerance, default 0.5
}
export interface PyramidAnswer {
  stages: number[]; // accepted DTM stage(s) for the shape/preset
  /** Ideal four control widths for per-handle feedback (four-handle mode). */
  targetWidths?: [number, number, number, number];
  /** Ideal nine cohort widths for per-handle feedback (nine-handle mode). */
  targetCohorts?: [number, number, number, number, number, number, number, number, number];
  tolerance?: number; // per-control tolerance, default 0.12
}
export interface SectorAnswer {
  dominant?: Sector; // the sector that must dominate
  stages?: number[]; // or an accepted stage classification
  minTertiary?: number; // adjust mode: require tertiary >= this value (tightened Stage 4 solve)
}
export interface McAnswer {
  correctId: string;
}
export interface NirSliderAnswer {
  minGap?: number;
  trend?: Trend;
}
export interface RateSlidersAnswer {
  birthMin?: number;
  birthMax?: number;
  deathMin?: number;
  deathMax?: number;
  gapMin?: number;
  trend?: Trend;
}
export interface CurveDrawAnswer {
  birth?: number[]; // target rate per stage (length 5)
  death?: number[];
  tolerance?: number; // per-point tolerance, default 5
}
export interface StageSelectAnswer {
  stages: number[]; // accepted DTM stage(s)
}
export interface MatchPairsAnswer {
  // Correct slot id for each tile id, e.g. { farm: 'grandparents', ... }.
  // One tile -> one slot (single-match and bucket modes).
  pairs?: Record<string, string>;
  // Multi-category mode (multiPerTile): the exact SET of correct slots per tile,
  // e.g. { 'forced-war': ['push', 'forced'] }. A tile is correct only when its
  // placements equal this set exactly (no missing and no extra slots).
  tileSlots?: Record<string, string[]>;
}
export interface PyramidPickAnswer {
  stages: number[]; // accepted stage(s); for multi, the full correct set
}
export interface ChartPickAnswer {
  correctId: string; // id of the chart option that matches the scenario
}

export type CauseKey = 'infectious' | 'famine' | 'accidents' | 'chronic';

export interface CategoryBarsAnswer {
  minFigures?: Partial<Record<CauseKey, number>>;
  maxFigures?: Partial<Record<CauseKey, number>>;
}

export interface FamilySizeAnswer {
  minChildren?: number;
  maxChildren?: number;
}

export interface PolicyLabAnswer {
  /** Pass when the projected trend matches (e.g. 'shrinking'). */
  trend?: Trend;
  /** Optional: require growth at/under this per-1,000 value. */
  maxGrowth?: number;
  /** 'guess' mode: pass when the learner's population estimate is within this many millions of the model's true projection. */
  guessWithin?: number;
}

export interface AnomalyPyramidAnswer {
  maleCohorts: [number, number, number, number, number, number, number, number, number];
  femaleCohorts: [number, number, number, number, number, number, number, number, number];
  tolerance?: number;
}

export interface MigrationFlowAnswer {
  trend?: Trend;
  minNet?: number;
  maxNet?: number;
}

export interface GrowthPlotterAnswer {
  /** Pass when the population curve never crosses the food line within the horizon. */
  averted?: boolean;
}

export interface DensityCalcAnswer {
  // solve mode: grade the computed densities against thresholds (people per km²).
  minArithmetic?: number;
  maxArithmetic?: number;
  minPhysiological?: number;
  maxPhysiological?: number;
  minAgricultural?: number;
  maxAgricultural?: number;
}

export interface WorldMapAnswer {
  /** Single pick: accepted id(s). Multi pick: exact set required (all must match). */
  countryIds?: string[];
  /** Single pick only: correct when tapped country's stage is in this list. */
  stages?: number[];
}

export type Answer =
  | RateGraphAnswer
  | PyramidAnswer
  | SectorAnswer
  | McAnswer
  | NirSliderAnswer
  | RateSlidersAnswer
  | CurveDrawAnswer
  | StageSelectAnswer
  | MatchPairsAnswer
  | PyramidPickAnswer
  | ChartPickAnswer
  | CategoryBarsAnswer
  | FamilySizeAnswer
  | PolicyLabAnswer
  | AnomalyPyramidAnswer
  | MigrationFlowAnswer
  | GrowthPlotterAnswer
  | DensityCalcAnswer
  | CarryingCapacityAnswer
  | WorldMapAnswer;

// ---------------------------------------------------------------------------
// Validation + feedback (outcome-based)
// ---------------------------------------------------------------------------

export interface ValidationResult {
  correct: boolean;
  outcome?: string; // e.g. 'confused-stage4-5' for misconception-specific feedback
  detail?: Record<string, boolean>; // per-item correctness (multi-part answers)
}

export interface Feedback {
  correct?: string;
  incorrect?: string; // default wrong-answer message
  hint?: string;
  onExplore?: string; // shown in 'explore' steps that have no right answer
  byOutcome?: Record<string, string>; // outcome-keyed messages (overrides incorrect)
}

// ---------------------------------------------------------------------------
// Step + Lesson + Course
// ---------------------------------------------------------------------------

export interface Step {
  id: string;
  kind: StepKind;
  prompt: string;
  concept?: string; // the "why", shown after acting
  concepts?: string[]; // concept tags (mastery + future SRS/interleaving)
  difficulty?: 1 | 2 | 3;
  interaction: Interaction;
  // Optional non-graded visual shown above the interaction (e.g. a frozen rate
  // graph on a multiple-choice step) so questions stay grounded in the model.
  reference?: Interaction;
  answer?: Answer; // omitted for 'explore'
  feedback: Feedback;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  concept: string; // one-line summary of the idea taught
  order: number;
  prerequisites: string[]; // lesson ids
  steps: Step[];
  /** Skip the post-lesson AI skill check (e.g. synthesis/practice lessons that are themselves the assessment). */
  skipSkillCheck?: boolean;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  lessonIds: string[];
}

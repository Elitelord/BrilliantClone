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
}

export interface SectorConfig {
  mode: 'adjust' | 'classify';
  // adjust mode: learner drags the three-sector split (auto-normalized to 100)
  initial?: { primary: number; secondary: number; tertiary: number };
  // classify mode: fixed preset split, learner picks the stage
  preset?: { primary: number; secondary: number; tertiary: number; label?: string };
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
}

export interface CurveDrawConfig {
  // The learner constructs the model by dragging one point per stage (1..5) for
  // each enabled curve. Graded against per-stage target values with tolerance.
  curves: ('birth' | 'death')[];
  initial?: { birth?: number[]; death?: number[] }; // starting y per stage (length 5)
  // Non-draggable curves drawn faintly for context (e.g. show the death curve
  // already built while the learner draws the birth curve).
  referenceCurves?: { birth?: number[]; death?: number[] };
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
  | { type: 'rate-sliders'; config: RateSlidersConfig };
// future: | { type: 'world-map'; config: WorldMapConfig }

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
  /** Ideal control widths for per-handle feedback (does not change stage grading). */
  targetWidths?: [number, number, number, number];
  tolerance?: number; // per-control tolerance, default 0.12
}
export interface SectorAnswer {
  dominant?: Sector; // the sector that must dominate
  stages?: number[]; // or an accepted stage classification
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

export type Answer =
  | RateGraphAnswer
  | PyramidAnswer
  | SectorAnswer
  | McAnswer
  | NirSliderAnswer
  | RateSlidersAnswer
  | CurveDrawAnswer
  | StageSelectAnswer;

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
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  lessonIds: string[];
}

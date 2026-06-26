// Per-interaction-type validator registry. Each validator is a pure function that
// returns an OUTCOME (not just true/false), so feedback can be misconception-specific
// and multi-part answers stay expressible.
import type {
  Interaction,
  Answer,
  ValidationResult,
  Step,
  RateGraphAnswer,
  PyramidAnswer,
  SectorAnswer,
  McAnswer,
  CurveDrawAnswer,
  NirSliderAnswer,
  RateSlidersAnswer,
  StageSelectAnswer,
  MatchPairsAnswer,
  CategoryBarsAnswer,
  CauseKey,
  PyramidPickAnswer,
  ChartPickAnswer,
  AnomalyPyramidAnswer,
  FamilySizeAnswer,
  MigrationFlowAnswer,
  WorldMapAnswer,
} from '../types/content';
import type {
  RateGraphState,
  PyramidState,
  SectorState,
  McState,
  CurveDrawState,
  StageSelectState,
  NirSliderState,
  RateSlidersState,
  MatchPairsState,
  PyramidPickState,
  ChartPickState,
  CategoryBarsState,
  FamilySizeState,
  AnomalyPyramidState,
  MigrationFlowState,
  WorldMapState,
} from '../types/interaction';
import { dominantSector } from './dtm';
import { getMapCountry } from './worldCountries';

function validateRateGraph(answer: RateGraphAnswer | undefined, st: RateGraphState): ValidationResult {
  if (!answer) return { correct: true };
  if (answer.kind === 'stage') {
    const tol = answer.tolerance ?? 0.5;
    const ok = (answer.stages ?? []).some((s) => Math.abs(st.stage - s) <= tol);
    return { correct: ok, outcome: `stage-${Math.round(st.stage)}` };
  }
  // trend-based
  return { correct: st.trend === answer.trend, outcome: st.trend };
}

/** All control/cohort widths within tolerance of the answer profile. */
export function pyramidAllControlsOk(controls: number[], answer: PyramidAnswer): boolean {
  const target = answer.targetCohorts ?? answer.targetWidths;
  if (!target || controls.length < target.length) return false;
  const tol = answer.tolerance ?? 0.12;
  return target.every((t, i) => Math.abs(controls[i] - t) <= tol);
}

function validatePyramid(
  mode: 'shape' | 'classify',
  answer: PyramidAnswer | undefined,
  st: PyramidState,
): ValidationResult {
  if (!answer) return { correct: true };

  const detail: Record<string, boolean> | undefined =
    (answer.targetCohorts || answer.targetWidths) && st.controlWidths
      ? Object.fromEntries(
          st.controlWidths.map((_, i) => [`c${i}`, pyramidControlOk(st.controlWidths!, answer, i)]),
        )
      : undefined;

  if (mode === 'classify') {
    const stage = st.selectedStage ?? -1;
    return { correct: answer.stages.includes(stage), outcome: `stage-${stage}`, detail };
  }

  // Shape mode with target profile: grade the same way handle dots do.
  const controls = st.controlWidths;
  const target = answer.targetCohorts ?? answer.targetWidths;
  if (target && controls && controls.length >= target.length) {
    const correct = pyramidAllControlsOk(controls, answer);
    return { correct, outcome: `stage-${st.impliedStage}`, detail };
  }

  const stage = st.impliedStage;
  return { correct: answer.stages.includes(stage), outcome: `stage-${stage}`, detail };
}

/** Per-handle check for pyramid drag UI dots (matches validator detail). */
export function pyramidControlOk(
  controls: number[],
  answer: PyramidAnswer,
  index: number,
): boolean {
  const target = answer.targetCohorts ?? answer.targetWidths;
  if (!target) return true;
  const tol = answer.tolerance ?? 0.12;
  return Math.abs(controls[index] - target[index]) <= tol;
}

function validateSector(
  mode: 'adjust' | 'classify',
  answer: SectorAnswer | undefined,
  st: SectorState,
): ValidationResult {
  if (!answer) return { correct: true };
  if (mode === 'classify') {
    const sel = st.selectedStage ?? -1;
    return { correct: (answer.stages ?? []).includes(sel), outcome: `stage-${sel}` };
  }
  // adjust mode
  if (answer.minTertiary != null) {
    if (st.tertiary < answer.minTertiary) {
      // tertiary leads but is too low -> 'tertiary-low'; otherwise blame the leading sector
      const outcome = st.dominant === 'tertiary' ? 'tertiary-low' : st.dominant;
      return { correct: false, outcome };
    }
    if (answer.dominant && st.dominant !== answer.dominant) {
      return { correct: false, outcome: st.dominant };
    }
    return { correct: true, outcome: st.dominant };
  }
  if (answer.dominant) {
    // Grade on the ROUNDED values the learner actually sees on the bars, not the
    // raw drag values behind st.dominant. This prevents a near-tie (e.g. raw
    // secondary 40.4 vs primary 39.6, both displayed as "40%") from grading as
    // correct. dominantSector returns 'secondary' only when it is the strict
    // maximum, which enforces industry (secondary) > farming (primary).
    const rounded = dominantSector(st.primary, st.secondary, st.tertiary);
    return { correct: rounded === answer.dominant, outcome: rounded };
  }
  return { correct: (answer.stages ?? []).includes(st.impliedStage), outcome: `stage-${st.impliedStage}` };
}

function validateMc(answer: McAnswer | undefined, st: McState): ValidationResult {
  if (!answer) return { correct: true };
  return { correct: st.selectedId === answer.correctId, outcome: st.selectedId };
}

function validateNirSlider(answer: NirSliderAnswer | undefined, st: NirSliderState): ValidationResult {
  if (!answer) return { correct: true };
  let correct = true;
  if (answer.minGap != null) correct = st.gap >= answer.minGap;
  if (answer.trend) correct = correct && st.trend === answer.trend;
  return { correct, outcome: st.trend };
}

function validateMigrationFlow(
  answer: MigrationFlowAnswer | undefined,
  st: MigrationFlowState,
): ValidationResult {
  if (!answer) return { correct: true };
  let correct = true;
  if (answer.trend) correct = correct && st.trend === answer.trend;
  if (answer.minNet != null) correct = correct && st.netMigration >= answer.minNet;
  if (answer.maxNet != null) correct = correct && st.netMigration <= answer.maxNet;
  return { correct, outcome: st.trend };
}

function validateRateSliders(answer: RateSlidersAnswer | undefined, st: RateSlidersState): ValidationResult {
  if (!answer) return { correct: true };
  let correct = true;
  if (answer.birthMin != null) correct = correct && st.birth >= answer.birthMin;
  if (answer.birthMax != null) correct = correct && st.birth <= answer.birthMax;
  if (answer.deathMin != null) correct = correct && st.death >= answer.deathMin;
  if (answer.deathMax != null) correct = correct && st.death <= answer.deathMax;
  if (answer.gapMin != null) correct = correct && st.gap >= answer.gapMin;
  if (answer.trend) correct = correct && st.trend === answer.trend;
  return { correct, outcome: st.trend };
}

function validateStageSelect(answer: StageSelectAnswer | undefined, st: StageSelectState): ValidationResult {
  if (!answer) return { correct: true };
  const sel = st.selectedStage ?? -1;
  return { correct: answer.stages.includes(sel), outcome: `stage${sel}` };
}

function curveClose(actual: number[], target: number[], tol: number): boolean {
  return target.every((t, i) => Math.abs((actual[i] ?? 0) - t) <= tol);
}

/** Death curve: Stage 2 must fall steeply from Stage 1 (not linger near the top). */
function deathCurveOk(death: number[], target: number[], tol: number): boolean {
  if (!curveClose(death, target, tol)) return false;
  if (death[0] - death[1] < 12) return false;
  if (death[1] > target[1] + 3) return false;
  return true;
}

function deathPointOk(death: number[], target: number[], tol: number, index: number): boolean {
  const val = death[index];
  const t = target[index];
  if (Math.abs(val - t) > tol) return false;
  if (index === 1) {
    if (death[0] - val < 12) return false;
    if (val > t + 3) return false;
  }
  return true;
}

/** Per-point check for curve-draw UI dots (matches validator rules). */
export function curveDrawPointOk(
  curve: 'birth' | 'death',
  death: number[],
  birth: number[],
  answer: CurveDrawAnswer,
  index: number,
): boolean {
  const tol = answer.tolerance ?? 5;
  const target = answer[curve];
  if (!target) return false;
  const val = curve === 'death' ? death[index] : birth[index];
  if (curve === 'death') return deathPointOk(death, target, tol, index);
  return Math.abs(val - target[index]) <= tol;
}

function validateCurveDraw(answer: CurveDrawAnswer | undefined, st: CurveDrawState): ValidationResult {
  if (!answer) return { correct: true };
  const tol = answer.tolerance ?? 5;
  const birthOk = !answer.birth || curveClose(st.birth, answer.birth, tol);
  const deathOk = !answer.death || deathCurveOk(st.death, answer.death, tol);

  let outcome: string | undefined;
  if (answer.death && !deathOk) {
    if (st.death[0] - st.death[1] < 12 || st.death[1] > answer.death[1] + 3) {
      outcome = 'death-flat';
    } else {
      outcome = 'off';
    }
  } else if (answer.birth && !birthOk) {
    if (answer.birth[1] - st.birth[1] > tol) outcome = 'birth-early';
    else outcome = 'off';
  }

  return { correct: birthOk && deathOk, outcome, detail: { birth: birthOk, death: deathOk } };
}

function validateMatchPairs(answer: MatchPairsAnswer | undefined, st: MatchPairsState): ValidationResult {
  if (!answer) return { correct: true };
  const detail: Record<string, boolean> = {};
  let correct = true;

  // Multi-category mode: each tile must occupy EXACTLY its set of correct slots.
  if (answer.tileSlots) {
    for (const tileId of Object.keys(answer.tileSlots)) {
      const want = [...answer.tileSlots[tileId]].sort();
      const got = Object.keys(st.placements)
        .filter((slotId) => st.placements[slotId]?.includes(tileId))
        .sort();
      const ok = want.length === got.length && want.every((s, i) => s === got[i]);
      detail[tileId] = ok;
      if (!ok) correct = false;
    }
    return { correct, detail };
  }

  for (const tileId of Object.keys(answer.pairs ?? {})) {
    const correctSlot = answer.pairs![tileId];
    const ok = st.placements[correctSlot]?.includes(tileId) ?? false;
    detail[tileId] = ok;
    if (!ok) correct = false;
  }
  return { correct, detail };
}

function validateAnomalyPyramid(
  answer: AnomalyPyramidAnswer | undefined,
  st: AnomalyPyramidState,
): ValidationResult {
  if (!answer || !st.maleCohorts || !st.femaleCohorts) return { correct: true };
  const tol = answer.tolerance ?? 0.14;
  let correct = true;
  for (let i = 0; i < 9; i++) {
    if (Math.abs(st.maleCohorts[i] - answer.maleCohorts[i]) > tol) correct = false;
    if (Math.abs(st.femaleCohorts[i] - answer.femaleCohorts[i]) > tol) correct = false;
  }
  return { correct };
}

function validatePyramidPick(answer: PyramidPickAnswer | undefined, st: PyramidPickState): ValidationResult {
  if (!answer) return { correct: true };
  const sel = [...st.selectedStages].sort((a, b) => a - b);
  const want = [...answer.stages].sort((a, b) => a - b);
  const correct = sel.length === want.length && sel.every((s, i) => s === want[i]);
  const outcome = sel.length === 1 ? String(sel[0]) : sel.join('-');
  return { correct, outcome };
}

function validateChartPick(answer: ChartPickAnswer | undefined, st: ChartPickState): ValidationResult {
  if (!answer) return { correct: true };
  return { correct: st.selectedId === answer.correctId, outcome: st.selectedId };
}

const CAUSE_KEYS: CauseKey[] = ['infectious', 'famine', 'accidents', 'chronic'];

function validateCategoryBars(answer: CategoryBarsAnswer | undefined, st: CategoryBarsState): ValidationResult {
  if (!answer) return { correct: true };
  const fig = st.figures;
  let correct = true;
  let outcome: string | undefined;

  for (const k of CAUSE_KEYS) {
    const min = answer.minFigures?.[k];
    if (min != null && fig[k] < min) {
      correct = false;
      outcome = `${k}-low`;
    }
    const max = answer.maxFigures?.[k];
    if (max != null && fig[k] > max) {
      correct = false;
      outcome = k;
    }
  }

  return { correct, outcome };
}

function validateFamilySize(answer: FamilySizeAnswer | undefined, st: FamilySizeState): ValidationResult {
  if (!answer) return { correct: true };
  let correct = true;
  let outcome: string | undefined;
  if (answer.minChildren != null && st.children < answer.minChildren) {
    correct = false;
    outcome = 'too-few';
  }
  if (answer.maxChildren != null && st.children > answer.maxChildren) {
    correct = false;
    outcome = 'too-many';
  }
  return { correct, outcome };
}

function validateWorldMap(
  answer: WorldMapAnswer | undefined,
  st: WorldMapState,
  mode?: 'pick' | 'pick-multi' | 'explore',
): ValidationResult {
  if (!answer) return { correct: true };

  if (mode === 'pick-multi') {
    const selected = [...(st.selectedIds ?? [])].sort();
    const want = [...(answer.countryIds ?? [])].sort();
    if (selected.length === 0) return { correct: false, outcome: 'none' };
    const correct =
      selected.length === want.length && selected.every((id, i) => id === want[i]);
    return { correct, outcome: correct ? 'all' : 'wrong-set' };
  }

  const id = st.selectedId;
  if (!id) return { correct: false, outcome: 'none' };
  const country = getMapCountry(id);
  if (!country) return { correct: false, outcome: id };

  let correct = false;
  if (answer.countryIds?.length) {
    correct = answer.countryIds.includes(id);
  }
  if (answer.stages?.length) {
    correct = correct || answer.stages.includes(country.stage);
  }
  return { correct, outcome: id };
}

export function validate(
  interaction: Interaction,
  answer: Answer | undefined,
  state: unknown,
): ValidationResult {
  switch (interaction.type) {
    case 'rate-graph':
      return validateRateGraph(answer as RateGraphAnswer | undefined, state as RateGraphState);
    case 'country-model':
    case 'info':
    case 'three-lens':
      // Explore/read-only: any interaction counts as complete.
      return { correct: true };
    case 'category-bars':
      if (interaction.config.mode === 'adjust') {
        return validateCategoryBars(answer as CategoryBarsAnswer | undefined, state as CategoryBarsState);
      }
      return { correct: true };
    case 'family-size':
      if (interaction.config.mode === 'adjust') {
        return validateFamilySize(answer as FamilySizeAnswer | undefined, state as FamilySizeState);
      }
      return { correct: true };
    case 'anomaly-pyramid':
      if (interaction.config.mode === 'adjust') {
        return validateAnomalyPyramid(answer as AnomalyPyramidAnswer | undefined, state as AnomalyPyramidState);
      }
      return { correct: true };
    case 'curve-draw':
      return validateCurveDraw(answer as CurveDrawAnswer | undefined, state as CurveDrawState);
    case 'stage-select':
      return validateStageSelect(answer as StageSelectAnswer | undefined, state as StageSelectState);
    case 'population-pyramid':
      return validatePyramid(interaction.config.mode, answer as PyramidAnswer | undefined, state as PyramidState);
    case 'sector-bars':
      return validateSector(interaction.config.mode, answer as SectorAnswer | undefined, state as SectorState);
    case 'multiple-choice':
      return validateMc(answer as McAnswer | undefined, state as McState);
    case 'nir-slider':
      return validateNirSlider(answer as NirSliderAnswer | undefined, state as NirSliderState);
    case 'migration-flow':
      return validateMigrationFlow(answer as MigrationFlowAnswer | undefined, state as MigrationFlowState);
    case 'rate-sliders':
      return validateRateSliders(answer as RateSlidersAnswer | undefined, state as RateSlidersState);
    case 'match-pairs':
      return validateMatchPairs(answer as MatchPairsAnswer | undefined, state as MatchPairsState);
    case 'pyramid-pick':
      return validatePyramidPick(answer as PyramidPickAnswer | undefined, state as PyramidPickState);
    case 'chart-pick':
      return validateChartPick(answer as ChartPickAnswer | undefined, state as ChartPickState);
    case 'world-map':
      if (interaction.config.mode === 'pick' || interaction.config.mode === 'pick-multi') {
        return validateWorldMap(
          answer as WorldMapAnswer | undefined,
          state as WorldMapState,
          interaction.config.mode,
        );
      }
      return { correct: true };
    case 'explain-back':
      return { correct: true };
    default:
      return { correct: false };
  }
}

// Resolve which feedback string to show given a validation result.
export function resolveFeedback(
  feedback: { correct?: string; incorrect?: string; byOutcome?: Record<string, string> },
  result: ValidationResult,
): string {
  if (result.correct) return feedback.correct ?? 'Correct!';
  if (result.outcome && feedback.byOutcome && feedback.byOutcome[result.outcome]) {
    return feedback.byOutcome[result.outcome];
  }
  return feedback.incorrect ?? 'Not quite — try again.';
}

/** Wrong-answer message: authored byOutcome → incorrect → interaction default → generic fallback. */
export function resolveWrongFeedback(step: Step, result: ValidationResult): string {
  const { feedback, interaction } = step;
  if (result.outcome && feedback.byOutcome?.[result.outcome]) {
    return feedback.byOutcome[result.outcome];
  }
  if (feedback.incorrect) {
    return feedback.incorrect;
  }
  switch (interaction.type) {
    case 'population-pyramid':
      if (interaction.config.mode === 'classify') {
        return 'That stage doesn\'t match — try again.';
      }
      return 'Keep adjusting — the shape isn\'t right yet.';
    case 'rate-sliders':
      return 'Not quite — think about what keeps a pyramid\'s base wide.';
    case 'nir-slider':
      return 'Not quite — think about how falling deaths affect natural increase.';
    case 'curve-draw':
      return 'Some points still need adjusting.';
    case 'category-bars':
      if (interaction.config.mode === 'adjust') {
        return 'Not quite — stack more figures on infectious disease and famine, and keep chronic and accidents low.';
      }
      break;
    case 'family-size':
      if (interaction.config.mode === 'adjust') {
        return 'Not quite — a developed country has small families. Drag the count down.';
      }
      break;
    case 'anomaly-pyramid':
      if (interaction.config.mode === 'adjust') {
        return 'Keep adjusting — the shape isn\'t right yet.';
      }
      break;
    default:
      break;
  }
  return 'Not quite — try again.';
}

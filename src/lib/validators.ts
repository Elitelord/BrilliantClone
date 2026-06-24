// Per-interaction-type validator registry. Each validator is a pure function that
// returns an OUTCOME (not just true/false), so feedback can be misconception-specific
// and multi-part answers stay expressible.
import type {
  Interaction,
  Answer,
  ValidationResult,
  RateGraphAnswer,
  PyramidAnswer,
  SectorAnswer,
  McAnswer,
  CurveDrawAnswer,
  NirSliderAnswer,
  RateSlidersAnswer,
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
} from '../types/interaction';

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

/** All four control widths within tolerance of the answer profile. */
export function pyramidAllControlsOk(controls: number[], answer: PyramidAnswer): boolean {
  if (!answer.targetWidths || controls.length < 4) return false;
  const tol = answer.tolerance ?? 0.12;
  return answer.targetWidths.every((t, i) => Math.abs(controls[i] - t) <= tol);
}

function validatePyramid(
  mode: 'shape' | 'classify',
  answer: PyramidAnswer | undefined,
  st: PyramidState,
): ValidationResult {
  if (!answer) return { correct: true };

  const detail: Record<string, boolean> | undefined =
    answer.targetWidths && st.controlWidths
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
  if (answer.targetWidths && controls && controls.length >= 4) {
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
  if (!answer.targetWidths) return true;
  const tol = answer.tolerance ?? 0.12;
  return Math.abs(controls[index] - answer.targetWidths[index]) <= tol;
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
  if (answer.dominant) {
    return { correct: st.dominant === answer.dominant, outcome: st.dominant };
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
      // Explore/read-only: any interaction counts as complete.
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
    case 'rate-sliders':
      return validateRateSliders(answer as RateSlidersAnswer | undefined, state as RateSlidersState);
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
  return feedback.incorrect ?? 'Not quite - give it another try.';
}

// Plain-language summaries of typed interaction state for AI grounding.
import type { Step, Answer } from '../../types/content';
import type {
  InteractionState,
  RateGraphState,
  PyramidState,
  SectorState,
  McState,
  StageSelectState,
  MatchPairsState,
  PyramidPickState,
  ChartPickState,
  CategoryBarsState,
  FamilySizeState,
  PolicyLabState,
  AnomalyPyramidState,
  CurveDrawState,
  NirSliderState,
  RateSlidersState,
  ExplainBackState,
  MigrationFlowState,
  GrowthPlotterState,
  DensityCalcState,
  CarryingCapacityState,
  WorldMapState,
} from '../../types/interaction';
import { TREND_LABEL, stageName, SECTOR_LABEL } from '../dtm';

function targetStages(answer?: Answer): string {
  if (!answer) return '';
  if ('stages' in answer && answer.stages?.length) {
    return `Target stage(s): ${answer.stages.join(', ')}.`;
  }
  if ('correctId' in answer && answer.correctId) {
    return `Correct option id: ${answer.correctId}.`;
  }
  if ('trend' in answer && answer.trend) {
    return `Target trend: ${TREND_LABEL[answer.trend] ?? answer.trend}.`;
  }
  if ('dominant' in answer && answer.dominant) {
    return `Target dominant sector: ${SECTOR_LABEL[answer.dominant] ?? answer.dominant}.`;
  }
  return '';
}

export function describeInteraction(
  step: Step,
  state: InteractionState | null | undefined,
  includeTarget = true,
): string {
  const { interaction } = step;
  const prompt = step.prompt;
  const target = includeTarget ? targetStages(step.answer) : '';

  if (!state) {
    return `Step asks: "${prompt}". Learner has not interacted yet. ${target}`.trim();
  }

  switch (interaction.type) {
    case 'rate-graph': {
      const s = state as RateGraphState;
      return (
        `Step asks: "${prompt}". Learner set the stage handle to ~${s.stage.toFixed(1)} ` +
        `(CBR ${Math.round(s.birth)}, CDR ${Math.round(s.death)}, gap ${Math.round(s.gap)}, ` +
        `trend ${TREND_LABEL[s.trend]}). ${target}`
      );
    }
    case 'population-pyramid': {
      const s = state as PyramidState;
      if (interaction.config.mode === 'classify') {
        return (
          `Step asks: "${prompt}". Learner classified the preset pyramid as Stage ${s.selectedStage ?? '?'}. ${target}`
        );
      }
      const w = s.controlWidths ?? [s.baseWidth, s.baseWidth, s.topWidth, s.topWidth];
      return (
        `Step asks: "${prompt}". Learner shaped the pyramid (young→old widths: ` +
        `${w.map((x) => x.toFixed(2)).join(', ')}); implied Stage ${s.impliedStage}. ${target}`
      );
    }
    case 'sector-bars': {
      const s = state as SectorState;
      if (interaction.config.mode === 'classify') {
        return (
          `Step asks: "${prompt}". Learner picked Stage ${s.selectedStage ?? '?'} for the preset sector mix. ${target}`
        );
      }
      return (
        `Step asks: "${prompt}". Learner set farming ${Math.round(s.primary)}%, industry ${Math.round(s.secondary)}%, ` +
        `services ${Math.round(s.tertiary)}% (dominant: ${SECTOR_LABEL[s.dominant]}). ${target}`
      );
    }
    case 'multiple-choice': {
      const s = state as McState;
      const opt = interaction.config.options.find((o) => o.id === s.selectedId);
      return (
        `Step asks: "${prompt}". Learner selected "${opt?.label ?? s.selectedId ?? 'nothing'}". ${target}`
      );
    }
    case 'stage-select': {
      const s = state as StageSelectState;
      const st = s.selectedStage ?? -1;
      return (
        `Step asks: "${prompt}". Learner tapped Stage ${st} (${stageName(st)}). ${target}`
      );
    }
    case 'match-pairs': {
      const s = state as MatchPairsState;
      const tiles = interaction.config.tiles;
      const slots = interaction.config.slots;
      const slotLabel = (id: string) => slots.find((sl) => sl.id === id)?.label ?? id;
      const tileLabel = (id: string) => tiles.find((t) => t.id === id)?.label ?? id;
      const placements: string[] = [];
      for (const tile of tiles) {
        const slotId = Object.entries(s.placements).find(([, arr]) => arr.includes(tile.id))?.[0];
        placements.push(`${tileLabel(tile.id)} → ${slotId ? slotLabel(slotId) : 'unplaced'}`);
      }
      return `Step asks: "${prompt}". Learner placements: ${placements.join('; ')}. ${target}`;
    }
    case 'pyramid-pick': {
      const s = state as PyramidPickState;
      return (
        `Step asks: "${prompt}". Learner picked pyramid stage(s): ${s.selectedStages.join(', ') || 'none'}. ${target}`
      );
    }
    case 'chart-pick': {
      const s = state as ChartPickState;
      const opt = interaction.config.options.find((o) => o.id === s.selectedId);
      return (
        `Step asks: "${prompt}". Learner picked chart "${opt?.caption ?? s.selectedId ?? 'none'}". ${target}`
      );
    }
    case 'category-bars': {
      const s = state as CategoryBarsState;
      const f = s.figures;
      return (
        `Step asks: "${prompt}". Cause-of-death mix: infectious ${f.infectious}, famine ${f.famine}, ` +
        `accidents ${f.accidents}, chronic ${f.chronic}. ${target}`
      );
    }
    case 'family-size': {
      const s = state as FamilySizeState;
      return `Step asks: "${prompt}". Learner set average children per family to ${s.children}. ${target}`;
    }
    case 'policy-lab': {
      const s = state as PolicyLabState;
      const base =
        `Step asks: "${prompt}". A preset/learner policy mix (${s.activeAnti} anti-natalist, ${s.activePro} pro-natalist) ` +
        `yields growth ${s.growthRate >= 0 ? '+' : ''}${Math.round(s.growthRate)} per 1,000 (${TREND_LABEL[s.trend]}), ` +
        `true projected population ${Math.round(s.population)}M.`;
      const guessPart =
        s.guess != null ? ` Learner estimated ${Math.round(s.guess)}M.` : '';
      return `${base}${guessPart} ${target}`;
    }
    case 'anomaly-pyramid': {
      const s = state as AnomalyPyramidState;
      if (interaction.config.mode === 'adjust' && s.maleCohorts) {
        return (
          `Step asks: "${prompt}". Learner adjusted anomaly cohort widths (male: ` +
          `${s.maleCohorts.map((x) => x.toFixed(2)).join(', ')}). ${target}`
        );
      }
      const shapes = interaction.config.shapes;
      const shape = shapes.find((sh) => sh.id === s.selectedId);
      return (
        `Step asks: "${prompt}". Learner is viewing anomaly shape "${shape?.label ?? s.selectedId ?? 'none'}". ${target}`
      );
    }
    case 'curve-draw': {
      const s = state as CurveDrawState;
      return (
        `Step asks: "${prompt}". Birth curve points: [${s.birth.map((n) => Math.round(n)).join(', ')}]; ` +
        `death curve: [${s.death.map((n) => Math.round(n)).join(', ')}]. ${target}`
      );
    }
    case 'nir-slider': {
      const s = state as NirSliderState;
      return (
        `Step asks: "${prompt}". Learner set NIR gap to ${Math.round(s.gap)} (${TREND_LABEL[s.trend]}). ${target}`
      );
    }
    case 'migration-flow': {
      const s = state as MigrationFlowState;
      return (
        `Step asks: "${prompt}". Learner set in-migration +${s.inMigration.toFixed(1)}, out-migration −${s.outMigration.toFixed(1)}, ` +
        `net migration ${s.netMigration >= 0 ? '+' : ''}${s.netMigration.toFixed(1)}, total change ` +
        `${s.totalChange >= 0 ? '+' : ''}${s.totalChange.toFixed(1)} (${TREND_LABEL[s.trend]}). ${target}`
      );
    }
    case 'growth-plotter': {
      const s = state as GrowthPlotterState;
      return (
        `Step asks: "${prompt}". Learner set population growth ${s.growthRate.toFixed(1)}%/yr and food supply ` +
        `+${s.foodSlope.toFixed(1)}/yr — ${s.crosses ? `the curves cross at year ${s.crossYear} (Malthusian crisis)` : 'the curves never cross (catastrophe averted)'}. ${target}`
      );
    }
    case 'density-calc': {
      const s = state as DensityCalcState;
      return (
        `Step asks: "${prompt}". Learner set population ${s.population}M, total land ${s.totalLand}k km², ` +
        `arable land ${s.arableLand}k km², farmers ${s.farmers}M → arithmetic ${Math.round(s.arithmetic)}, ` +
        `physiological ${Math.round(s.physiological)}, agricultural ${Math.round(s.agricultural)} per km². ${target}`
      );
    }
    case 'carrying-capacity': {
      const s = state as CarryingCapacityState;
      return (
        `Step asks: "${prompt}". Learner set farmland ${Math.round(s.land)} × yield ${s.yieldLevel} = food ceiling ` +
        `${Math.round(s.foodCeiling)}, water ceiling ${Math.round(s.waterCeiling)} → carrying capacity ≈ ` +
        `${Math.round(s.capacity)} (limited by ${s.binding}). ${target}`
      );
    }
    case 'world-map': {
      const s = state as WorldMapState;
      const ids = s.selectedIds?.length ? s.selectedIds.join(', ') : s.selectedId ?? 'none';
      return `Step asks: "${prompt}". Learner selected: ${ids}. ${target}`;
    }
    case 'rate-sliders': {
      const s = state as RateSlidersState;
      return (
        `Step asks: "${prompt}". Learner set CBR ${Math.round(s.birth)}, CDR ${Math.round(s.death)}, ` +
        `gap ${Math.round(s.gap)} (${TREND_LABEL[s.trend]}). ${target}`
      );
    }
    case 'explain-back': {
      const s = state as ExplainBackState;
      const preview = s.text.trim().slice(0, 120);
      return `Step asks: "${prompt}". Learner wrote: "${preview}${s.text.length > 120 ? '…' : ''}".`;
    }
    case 'info':
    case 'three-lens':
    case 'country-model':
    case 'migration-journey':
    case 'migration-effects':
    case 'food-history':
      return `Step asks: "${prompt}". Explore/read-only step — learner is viewing content.`;
    default: {
      const _exhaustive: never = interaction;
      return `Step asks: "${prompt}". Interaction type: ${(_exhaustive as { type: string }).type}. State: ${JSON.stringify(state)}. ${target}`;
    }
  }
}

// Shared "is this step's input ready to check?" logic, used by the lesson runner and
// the spaced-review runner so both gate the Check button identically.
import type { Step } from '../../types/content';
import type {
  InteractionState,
  McState,
  MatchPairsState,
  PyramidState,
  PyramidPickState,
  ChartPickState,
  SectorState,
  StageSelectState,
  CategoryBarsState,
  FamilySizeState,
  AnomalyPyramidState,
  MigrationFlowState,
  ExplainBackState,
  WorldMapState,
} from '../../types/interaction';

export function canCheck(step: Step, st: InteractionState | null): boolean {
  if (!st) return false;
  const { interaction } = step;
  if (interaction.type === 'multiple-choice') return !!(st as McState).selectedId;
  if (interaction.type === 'stage-select') return (st as StageSelectState).selectedStage != null;
  if (interaction.type === 'population-pyramid' && interaction.config.mode === 'classify')
    return (st as PyramidState).selectedStage != null;
  if (interaction.type === 'sector-bars' && interaction.config.mode === 'classify')
    return (st as SectorState).selectedStage != null;
  if (interaction.type === 'match-pairs') {
    const p = (st as MatchPairsState).placements;
    if (interaction.config.multiPerTile) {
      // Multi-category mode: if a per-tile cap is set, require every tile filled to
      // exactly that many categories; otherwise just require each placed somewhere.
      const cap = interaction.config.maxPerTile;
      return interaction.config.tiles.every((t) => {
        const count = Object.values(p).filter((arr) => arr.includes(t.id)).length;
        return cap != null ? count === cap : count > 0;
      });
    }
    if (interaction.config.multiPerSlot) {
      // Bucket mode: require every TILE to be placed somewhere.
      return interaction.config.tiles.every((t) => Object.values(p).some((arr) => arr.includes(t.id)));
    }
    // Single-match mode: require every slot to hold a tile.
    return interaction.config.slots.every((s) => (p[s.id]?.length ?? 0) > 0);
  }
  if (interaction.type === 'pyramid-pick') return (st as PyramidPickState).selectedStages.length > 0;
  if (interaction.type === 'chart-pick') return (st as ChartPickState).selectedId != null;
  if (interaction.type === 'category-bars' && interaction.config.mode === 'adjust') {
    const fig = (st as CategoryBarsState).figures;
    return fig.infectious + fig.famine + fig.accidents + fig.chronic >= 4;
  }
  if (interaction.type === 'family-size' && interaction.config.mode === 'adjust') {
    return (st as FamilySizeState).children > 0;
  }
  if (interaction.type === 'anomaly-pyramid' && interaction.config.mode === 'adjust') {
    const s = st as AnomalyPyramidState;
    return (s.maleCohorts?.length ?? 0) === 9 && (s.femaleCohorts?.length ?? 0) === 9;
  }
  if (interaction.type === 'explain-back') {
    const min = interaction.config.minChars ?? 15;
    return ((st as ExplainBackState).text?.trim().length ?? 0) >= min;
  }
  if (interaction.type === 'migration-flow') {
    const s = st as MigrationFlowState;
    return s.inMigration > 0 || s.outMigration > 0;
  }
  if (interaction.type === 'world-map' && interaction.config.mode === 'pick') {
    return (st as WorldMapState).selectedId != null;
  }
  if (interaction.type === 'world-map' && interaction.config.mode === 'pick-multi') {
    const required = (step.answer as { countryIds?: string[] } | undefined)?.countryIds?.length ?? 0;
    return (st as WorldMapState).selectedIds?.length === required;
  }
  return true;
}

// Selection-style steps reset their pick on "Try again" (a fresh remount so the
// learner re-chooses). Drag steps instead keep their current shape to nudge.
export function isSelectionStep(step: Step): boolean {
  const { interaction } = step;
  if (interaction.type === 'multiple-choice' || interaction.type === 'stage-select') return true;
  if (interaction.type === 'population-pyramid' && interaction.config.mode === 'classify') return true;
  if (interaction.type === 'sector-bars' && interaction.config.mode === 'classify') return true;
  if (interaction.type === 'pyramid-pick') return true;
  if (interaction.type === 'chart-pick') return true;
  if (interaction.type === 'world-map' && (interaction.config.mode === 'pick' || interaction.config.mode === 'pick-multi'))
    return true;
  return false;
}

// The "learner state" each interaction component emits, consumed by validators.
import type { Trend, Sector } from './content';

export interface RateGraphState {
  stage: number;
  birth: number;
  death: number;
  gap: number;
  trend: Trend;
}

export interface PyramidState {
  baseWidth: number;
  topWidth: number;
  controlWidths?: number[];
  impliedStage: number;
  selectedStage?: number; // classify mode
}

export interface SectorState {
  primary: number;
  secondary: number;
  tertiary: number;
  dominant: Sector;
  impliedStage: number;
  selectedStage?: number; // classify mode
}

export interface McState {
  selectedId?: string;
}

export interface CountryModelState {
  countryId: string;
  year: number;
  birth: number;
  death: number;
  gap: number;
  pop: number;
  trend: Trend;
}

export interface CurveDrawState {
  birth: number[]; // current rate per stage (length 5)
  death: number[];
}

export interface StageSelectState {
  selectedStage?: number;
}

export interface NirSliderState {
  gap: number;
  trend: Trend;
}

export interface RateSlidersState {
  birth: number;
  death: number;
  gap: number;
  trend: Trend;
}

export interface InfoState {
  seen: boolean;
}

export interface ThreeLensState {
  seen?: boolean;
}

export interface MatchPairsState {
  // slot id -> array of tile ids placed in that slot (empty array = nothing dropped).
  // Single-match mode keeps at most one tile per slot; bucket mode (multiPerSlot)
  // allows several tiles in the same slot.
  placements: Record<string, string[]>;
}

export interface PyramidPickState {
  selectedStages: number[];
}

export interface ChartPickState {
  selectedId?: string;
}

export interface CategoryBarsState {
  dev?: number;
  figures: { infectious: number; famine: number; accidents: number; chronic: number };
  infectious: number;
  famine: number;
  accidents: number;
  chronic: number;
  totalDeaths?: number;
  counts?: { infectious: number; famine: number; accidents: number; chronic: number };
}

export interface FamilySizeState {
  dev?: number; // explore mode: development position on the 1..5 axis
  children: number; // average children per family
}

export interface ExplainBackState {
  text: string;
}

export interface AnomalyPyramidState {
  selectedId?: string;
  seen?: boolean;
  maleCohorts?: number[];
  femaleCohorts?: number[];
}

export interface MigrationFlowState {
  inMigration: number;
  outMigration: number;
  netMigration: number;
  totalChange: number;
  trend: Trend;
  presetId?: string;
}

export interface WorldMapState {
  selectedId?: string;
  selectedIds?: string[];
  seen?: boolean;
}

export type InteractionState =
  | RateGraphState
  | PyramidState
  | SectorState
  | McState
  | CountryModelState
  | CurveDrawState
  | StageSelectState
  | NirSliderState
  | RateSlidersState
  | InfoState
  | ThreeLensState
  | MatchPairsState
  | PyramidPickState
  | ChartPickState
  | CategoryBarsState
  | FamilySizeState
  | AnomalyPyramidState
  | MigrationFlowState
  | ExplainBackState
  | WorldMapState;

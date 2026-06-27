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

export interface PolicyLabState {
  growthRate: number; // effective growth per 1,000 after policy levers
  trend: Trend;
  population: number; // projected (true) population after the configured decades
  hasProNatalist: boolean; // any pro-natalist lever active
  activeAnti: number; // count of active anti-natalist levers
  activePro: number; // count of active pro-natalist levers
  guess?: number; // 'guess' mode: the learner's slider estimate, in millions
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

export interface MigrationJourneyState {
  pushIds: string[];
  pullIds: string[];
  activeEventId?: string;
  motivated: boolean;
  departed: boolean;
  result?: 'arrived' | 'blocked' | 'diverted';
  seen: boolean;
}

export interface MigrationEffectsState {
  flow: number; // 0–100, how many migrate
  seen: boolean;
}

export interface FoodHistoryState {
  activeEventId?: string;
  seen: boolean;
}

export interface GrowthPlotterState {
  growthRate: number; // % per year
  foodSlope: number; // food capacity added per year
  crosses: boolean; // population catches the food line within the horizon
  crossYear: number | null; // year of the Malthusian crisis point (if any)
}

export interface CarryingCapacityState {
  land: number;
  yieldLevel: number;
  waterSupply: number;
  foodCeiling: number; // land × yieldLevel
  waterCeiling: number; // waterSupply
  capacity: number; // min(foodCeiling, waterCeiling) — the binding constraint
  binding: 'food' | 'water';
}

export interface DensityCalcState {
  population: number;
  totalLand: number;
  arableLand: number;
  farmers: number;
  arithmetic: number;
  physiological: number;
  agricultural: number;
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
  | PolicyLabState
  | AnomalyPyramidState
  | MigrationFlowState
  | MigrationJourneyState
  | MigrationEffectsState
  | FoodHistoryState
  | ExplainBackState
  | GrowthPlotterState
  | DensityCalcState
  | CarryingCapacityState
  | WorldMapState;

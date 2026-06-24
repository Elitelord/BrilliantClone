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
  | InfoState;

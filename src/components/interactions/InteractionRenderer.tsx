import RateGraph from './RateGraph';
import CountryModel from './CountryModel';
import CurveDraw from './CurveDraw';
import StageSelect from './StageSelect';
import InfoCard from './InfoCard';
import PopulationPyramid from './PopulationPyramid';
import SectorBars from './SectorBars';
import ThreeLensPanel from './ThreeLensPanel';
import MultipleChoice from './MultipleChoice';
import NirSlider from './NirSlider';
import RateSliders from './RateSliders';
import MatchPairs from './MatchPairs';
import PyramidPick from './PyramidPick';
import ChartPick from './ChartPick';
import CategoryBars from './CategoryBars';
import FamilySize from './FamilySize';
import AnomalyPyramid from './AnomalyPyramid';
import MigrationFlow from './MigrationFlow';
import ExplainBack from './ExplainBack';
import WorldMap from './WorldMap';
import type { Interaction, Answer, AnomalyPyramidAnswer, ChartPickAnswer, CurveDrawAnswer, PyramidAnswer, PyramidPickAnswer, ValidationResult, WorldMapAnswer } from '../../types/content';
import type { InteractionState } from '../../types/interaction';

interface Props {
  interaction: Interaction;
  answer?: Answer;
  onChange: (s: InteractionState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
  explainShowSample?: boolean;
}

// Dispatch on interaction type. Adding a new interaction type is a one-line change here.
export default function InteractionRenderer({
  interaction,
  answer,
  onChange,
  disabled,
  result,
  explainShowSample,
}: Props) {
  switch (interaction.type) {
    case 'rate-graph':
      return <RateGraph config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'country-model':
      return <CountryModel config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'curve-draw':
      return (
        <CurveDraw
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          answer={answer as CurveDrawAnswer | undefined}
          result={result}
        />
      );
    case 'stage-select':
      return <StageSelect config={interaction.config} onChange={onChange} disabled={disabled} result={result} />;
    case 'info':
      return <InfoCard config={interaction.config} onChange={onChange} />;
    case 'population-pyramid':
      return (
        <PopulationPyramid
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          answer={answer as PyramidAnswer | undefined}
          result={result}
        />
      );
    case 'sector-bars':
      return <SectorBars config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'three-lens':
      return <ThreeLensPanel config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'multiple-choice':
      return (
        <MultipleChoice
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          result={result}
        />
      );
    case 'nir-slider':
      return <NirSlider config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'rate-sliders':
      return <RateSliders config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'match-pairs':
      return <MatchPairs config={interaction.config} onChange={onChange} disabled={disabled} result={result} />;
    case 'pyramid-pick':
      return (
        <PyramidPick
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          answer={answer as PyramidPickAnswer | undefined}
          result={result}
        />
      );
    case 'chart-pick':
      return (
        <ChartPick
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          answer={answer as ChartPickAnswer | undefined}
          result={result}
        />
      );
    case 'category-bars':
      return <CategoryBars config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'family-size':
      return <FamilySize config={interaction.config} onChange={onChange} disabled={disabled} />;
    case 'anomaly-pyramid':
      return (
        <AnomalyPyramid
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          answer={answer as AnomalyPyramidAnswer | undefined}
          result={result}
        />
      );
    case 'migration-flow':
      return (
        <MigrationFlow
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'explain-back':
      return (
        <ExplainBack
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          showSample={explainShowSample}
        />
      );
    case 'world-map':
      return (
        <WorldMap
          config={interaction.config}
          onChange={onChange}
          disabled={disabled}
          result={result}
          answer={answer as WorldMapAnswer | undefined}
        />
      );
    default:
      return null;
  }
}

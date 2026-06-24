import RateGraph from './RateGraph';
import CountryModel from './CountryModel';
import CurveDraw from './CurveDraw';
import StageSelect from './StageSelect';
import InfoCard from './InfoCard';
import PopulationPyramid from './PopulationPyramid';
import SectorBars from './SectorBars';
import MultipleChoice from './MultipleChoice';
import NirSlider from './NirSlider';
import RateSliders from './RateSliders';
import type { Interaction, Answer, CurveDrawAnswer, PyramidAnswer, ValidationResult } from '../../types/content';
import type { InteractionState } from '../../types/interaction';

interface Props {
  interaction: Interaction;
  answer?: Answer;
  onChange: (s: InteractionState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
}

// Dispatch on interaction type. Adding a new interaction type is a one-line change here.
export default function InteractionRenderer({ interaction, answer, onChange, disabled, result }: Props) {
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
    default:
      return null;
  }
}

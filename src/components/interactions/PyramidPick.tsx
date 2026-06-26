import { useEffect, useRef, useState } from 'react';
import PyramidMini from './PyramidMini';
import { STAGE_PYRAMID_PROFILES } from '../../lib/dtm';
import type { PyramidPickConfig, PyramidPickAnswer, ValidationResult } from '../../types/content';
import type { PyramidPickState } from '../../types/interaction';

interface Props {
  config: PyramidPickConfig;
  onChange: (s: PyramidPickState) => void;
  disabled?: boolean;
  answer?: PyramidPickAnswer;
  result?: ValidationResult | null;
}

export default function PyramidPick({ config, onChange, disabled, answer, result }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [selectedStages, setSelectedStages] = useState<number[]>([]);

  useEffect(() => {
    onChangeRef.current({ selectedStages: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (next: number[]) => {
    setSelectedStages(next);
    onChangeRef.current({ selectedStages: next });
  };

  const toggle = (stage: number) => {
    if (disabled) return;
    if (config.multi) {
      const next = selectedStages.includes(stage)
        ? selectedStages.filter((s) => s !== stage)
        : [...selectedStages, stage];
      commit(next);
    } else {
      commit(selectedStages.includes(stage) ? [] : [stage]);
    }
  };

  const showResult = !!result && !!answer;

  const cardClass = (stage: number): string => {
    const selected = selectedStages.includes(stage);
    const inAnswer = answer?.stages.includes(stage) ?? false;
    if (showResult) {
      // Only color what the learner actually picked — never highlight an
      // unselected correct answer, which would give the answer away.
      if (selected && inAnswer) return 'border-emerald-500 bg-emerald-50';
      if (selected && !inAnswer) return 'border-amber-500 bg-amber-50';
      return 'border-slate-200 bg-white';
    }
    if (selected) return 'border-brand-500 bg-brand-50';
    return 'border-slate-200 bg-white';
  };

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 gap-3">
        {config.options.map((opt) => {
          const label = opt.label ?? `Stage ${opt.stage}`;
          return (
            <button
              key={opt.stage}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.stage)}
              className={`flex min-h-[44px] flex-col items-center gap-1 rounded-2xl border-2 p-3 transition disabled:cursor-default ${cardClass(opt.stage)}`}
            >
              <PyramidMini widths={STAGE_PYRAMID_PROFILES[opt.stage]} width={120} height={96} />
              <span className="text-sm font-bold text-slate-700">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

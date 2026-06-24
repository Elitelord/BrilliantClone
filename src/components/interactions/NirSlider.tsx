import { useEffect, useRef, useState } from 'react';
import { trendFromGap } from '../../lib/dtm';
import type { NirSliderConfig } from '../../types/content';
import type { NirSliderState } from '../../types/interaction';
import NirPanel from './NirPanel';

interface Props {
  config: NirSliderConfig;
  onChange: (s: NirSliderState) => void;
  disabled?: boolean;
}

export default function NirSlider({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const minGap = config.minGap ?? -5;
  const maxGap = config.maxGap ?? 28;
  const [gap, setGap] = useState(config.initialGap ?? 8);

  const emit = (g: number) => {
    onChangeRef.current({ gap: g, trend: trendFromGap(g) });
  };

  useEffect(() => {
    emit(gap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full select-none">
      {config.hint && <p className="mb-3 text-sm text-slate-500">{config.hint}</p>}
      <NirPanel
        gap={gap}
        disabled={disabled}
        interactive
        minGap={minGap}
        maxGap={maxGap}
        showVerdict={config.showVerdict ?? false}
        onGapChange={(g) => {
          setGap(g);
          emit(g);
        }}
      />
    </div>
  );
}

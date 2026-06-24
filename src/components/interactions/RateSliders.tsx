import { useEffect, useRef, useState } from 'react';
import { trendFromGap } from '../../lib/dtm';
import type { RateSlidersConfig } from '../../types/content';
import type { RateSlidersState } from '../../types/interaction';

interface Props {
  config: RateSlidersConfig;
  onChange: (s: RateSlidersState) => void;
  disabled?: boolean;
}

export default function RateSliders({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const birthRange = config.birthRange ?? [5, 50];
  const deathRange = config.deathRange ?? [5, 50];
  const [birth, setBirth] = useState(config.initialBirth ?? 25);
  const [death, setDeath] = useState(config.initialDeath ?? 15);

  const emit = (b: number, d: number) => {
    const gap = b - d;
    onChangeRef.current({ birth: b, death: d, gap, trend: trendFromGap(gap) });
  };

  useEffect(() => {
    emit(birth, death);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gap = birth - death;
  const nirColor = gap >= 12 ? '#15803d' : gap >= 5 ? '#16a34a' : gap >= 0 ? '#64748b' : '#dc2626';

  return (
    <div className="w-full select-none space-y-3">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3.5 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Set these rates</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-lg font-bold text-slate-800">
          <span className="text-blue-600">{birth}</span>
          <span className="text-slate-400">−</span>
          <span className="text-red-600">{death}</span>
          <span className="text-slate-500">=</span>
          <span className="text-2xl font-extrabold tabular-nums lg:text-3xl" style={{ color: nirColor }}>
            {gap >= 0 ? '+' : ''}
            {gap}
          </span>
          <span className="text-sm font-semibold text-slate-500">(NIR per 1,000)</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-4">
        <SliderRow
          label="Crude birth rate"
          abbrev="CBR"
          color="#2563eb"
          min={birthRange[0]}
          max={birthRange[1]}
          value={birth}
          disabled={disabled}
          onChange={(v) => {
            setBirth(v);
            emit(v, death);
          }}
        />
        <SliderRow
          label="Crude death rate"
          abbrev="CDR"
          color="#dc2626"
          min={deathRange[0]}
          max={deathRange[1]}
          value={death}
          disabled={disabled}
          onChange={(v) => {
            setDeath(v);
            emit(birth, v);
          }}
        />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  abbrev,
  color,
  min,
  max,
  value,
  disabled,
  onChange,
}: {
  label: string;
  abbrev: string;
  color: string;
  min: number;
  max: number;
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="ml-1.5 text-xs font-bold" style={{ color }}>{abbrev}</span>
        </div>
        <span className="text-xl font-extrabold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-slate-200">
        <div
          className="absolute top-0 left-0 h-full rounded-full opacity-90"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{min}</span>
        <span>per 1,000</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

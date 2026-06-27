import { useEffect, useRef, useState } from 'react';
import type { FoodHistoryConfig } from '../../types/content';
import type { FoodHistoryState } from '../../types/interaction';

interface Props {
  config: FoodHistoryConfig;
  onChange: (s: FoodHistoryState) => void;
  disabled?: boolean;
}

const POP_COLOR = '#dc2626';
const FOOD_COLOR = '#16a34a';

const W = 360;
const H = 210;
const PAD_L = 30;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 24;

// Linear interpolation of a {year,value}[] series at an arbitrary year.
function valueAt(series: { year: number; value: number }[], year: number): number {
  if (series.length === 0) return 0;
  const sorted = [...series].sort((a, b) => a.year - b.year);
  if (year <= sorted[0].year) return sorted[0].value;
  if (year >= sorted[sorted.length - 1].year) return sorted[sorted.length - 1].value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year);
      return a.value + t * (b.value - a.value);
    }
  }
  return sorted[sorted.length - 1].value;
}

export default function FoodHistory({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    onChangeRef.current({ activeEventId, seen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId]);

  const { startYear, endYear, maxValue } = config;
  const popLabel = config.populationLabel ?? 'Population';
  const foodLabel = config.foodLabel ?? 'Food the land can support';

  const xFor = (year: number) =>
    PAD_L + ((year - startYear) / (endYear - startYear)) * (W - PAD_L - PAD_R);
  const yFor = (val: number) =>
    H - PAD_B - (val / maxValue) * (H - PAD_B - PAD_T);

  const pathFor = (series: { year: number; value: number }[]) =>
    'M ' +
    [...series]
      .sort((a, b) => a.year - b.year)
      .map((p) => `${xFor(p.year).toFixed(1)},${yFor(p.value).toFixed(1)}`)
      .join(' L ');

  const events = [...config.events].sort((a, b) => a.year - b.year);
  const activeEvent = events.find((e) => e.id === activeEventId);

  // Year gridlines (start, two thirds-ish, end).
  const yearTicks = [startYear, Math.round((startYear + endYear) / 2), endYear];
  const valueTicks = [0, maxValue / 2, maxValue];

  const toggleEvent = (id: string) => {
    if (disabled) return;
    setActiveEventId((prev) => (prev === id ? undefined : id));
  };

  const eventColor = (kind: 'innovation' | 'setback') =>
    kind === 'setback' ? POP_COLOR : FOOD_COLOR;

  return (
    <div className="w-full select-none">
      {config.title && (
        <p className="mb-2 text-center text-sm font-semibold text-slate-700">{config.title}</p>
      )}

      {/* Legend */}
      <div className="mb-2 flex flex-wrap justify-center gap-2">
        <div
          className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: POP_COLOR, color: POP_COLOR }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: POP_COLOR }} />
          {popLabel}
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: FOOD_COLOR, color: FOOD_COLOR }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: FOOD_COLOR }} />
          {foodLabel}
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[460px]">
        {/* value gridlines */}
        {valueTicks.map((v) => (
          <g key={`v-${v}`}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text x={PAD_L - 4} y={yFor(v) + 3} textAnchor="end" className="fill-slate-400 text-[8px]">
              {Math.round(v)}
            </text>
          </g>
        ))}

        {/* year labels */}
        {yearTicks.map((yr) => (
          <text
            key={`y-${yr}`}
            x={xFor(yr)}
            y={H - PAD_B + 14}
            textAnchor="middle"
            className="fill-slate-400 text-[8px]"
          >
            {yr}
          </text>
        ))}

        {/* active-year guide */}
        {activeEvent && (
          <line
            x1={xFor(activeEvent.year)}
            x2={xFor(activeEvent.year)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke={eventColor(activeEvent.kind)}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        )}

        {/* curves */}
        <path d={pathFor(config.food)} fill="none" stroke={FOOD_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor(config.population)} fill="none" stroke={POP_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* highlighted values at the active year */}
        {activeEvent && (
          <>
            <circle cx={xFor(activeEvent.year)} cy={yFor(valueAt(config.food, activeEvent.year))} r={3.5} fill={FOOD_COLOR} stroke="#fff" strokeWidth={1.5} />
            <circle cx={xFor(activeEvent.year)} cy={yFor(valueAt(config.population, activeEvent.year))} r={3.5} fill={POP_COLOR} stroke="#fff" strokeWidth={1.5} />
          </>
        )}

        {/* event markers on the x-axis */}
        {events.map((e) => {
          const on = e.id === activeEventId;
          return (
            <g
              key={e.id}
              className={disabled ? '' : 'cursor-pointer'}
              onClick={() => toggleEvent(e.id)}
            >
              <circle
                cx={xFor(e.year)}
                cy={H - PAD_B}
                r={on ? 5 : 3.5}
                fill={on ? eventColor(e.kind) : '#fff'}
                stroke={eventColor(e.kind)}
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Timeline of policies/innovations */}
      <p className="mb-1.5 mt-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
        Policies & innovations — tap one
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {events.map((e) => {
          const on = e.id === activeEventId;
          const onClasses =
            e.kind === 'setback'
              ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300 text-rose-900'
              : 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300 text-emerald-900';
          return (
            <button
              key={e.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleEvent(e.id)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                on ? onClasses : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-sm leading-none">{e.icon}</span>
              <span className="tabular-nums text-slate-400">{e.year}</span>
              {e.label}
            </button>
          );
        })}
      </div>

      {/* Caption */}
      <div
        className="mt-3 rounded-2xl border-2 px-4 py-3 text-center text-sm font-medium"
        style={
          activeEvent
            ? {
                borderColor: `${eventColor(activeEvent.kind)}55`,
                background: `${eventColor(activeEvent.kind)}0f`,
                color: eventColor(activeEvent.kind) === POP_COLOR ? '#b91c1c' : '#15803d',
              }
            : { borderColor: '#cbd5e155', background: '#f8fafc', color: '#475569' }
        }
      >
        {activeEvent ? (
          <>
            <span className="font-bold">
              {activeEvent.year} · {activeEvent.label}
            </span>
            <span className="mt-0.5 block font-normal">{activeEvent.note}</span>
          </>
        ) : (
          config.baselineCaption ??
          'Tap a policy or innovation to see when it landed — and watch how the green food line keeps climbing above the red population line.'
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import type { ChartPickConfig, ChartPickOption, ChartPickAnswer, ValidationResult } from '../../types/content';
import type { ChartPickState } from '../../types/interaction';

interface Props {
  config: ChartPickConfig;
  onChange: (s: ChartPickState) => void;
  disabled?: boolean;
  answer?: ChartPickAnswer;
  result?: ValidationResult | null;
}

// Fixed rate axis so every small multiple is directly comparable and a death
// spike reads as an unmistakable peak (not auto-scaled away).
const RATE_MAX = 55;
const W = 150;
const H = 104;
const PAD = { top: 8, right: 8, bottom: 8, left: 8 };

const BIRTH_COLOR = '#2563eb';
const DEATH_COLOR = '#dc2626';
const POP_COLOR = '#7c3aed';

const yScale = scaleLinear().domain([0, RATE_MAX]).range([H - PAD.bottom, PAD.top]);

function MiniChart({ series, showPop }: { series: ChartPickOption['series']; showPop: boolean }) {
  const { birthPath, deathPath, popPath } = useMemo(() => {
    const years = series.map((p) => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const x = scaleLinear()
      .domain(minYear === maxYear ? [minYear - 1, maxYear + 1] : [minYear, maxYear])
      .range([PAD.left, W - PAD.right]);
    const y = yScale;
    // Per-card population axis (+10% headroom) so the line fills its own card and
    // stays readable next to the shared 0–55 rate axis — mirrors ComparisonChart.
    const popMax = Math.max(...series.map((p) => p.pop), 1) * 1.1;
    const yPop = scaleLinear().domain([0, popMax]).range([H - PAD.bottom, PAD.top]);
    const birthLine = line<{ year: number; birth: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.birth))
      .curve(curveMonotoneX);
    const deathLine = line<{ year: number; death: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.death))
      .curve(curveMonotoneX);
    const popLine = line<{ year: number; pop: number }>()
      .x((d) => x(d.year))
      .y((d) => yPop(d.pop))
      .curve(curveMonotoneX);
    return {
      birthPath: birthLine(series) ?? '',
      deathPath: deathLine(series) ?? '',
      popPath: popLine(series) ?? '',
    };
  }, [series]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[160px]" role="img" aria-label="Birth rate, death rate, and total population over time">
      {[0, RATE_MAX / 2, RATE_MAX].map((v) => {
        const gy = yScale(v);
        return <line key={v} x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} stroke="#eef2f7" strokeWidth={1} />;
      })}
      {showPop && <path d={popPath} fill="none" stroke={POP_COLOR} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
      <path d={deathPath} fill="none" stroke={DEATH_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={birthPath} fill="none" stroke={BIRTH_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChartPick({ config, onChange, disabled, answer, result }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    onChangeRef.current({ selectedId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    if (disabled) return;
    const next = selectedId === id ? undefined : id;
    setSelectedId(next);
    onChangeRef.current({ selectedId: next });
  };

  const showResult = !!result && !!answer;
  const showCaptions = config.showCaptions !== false;
  const showPop = config.showTotalPopulationLine !== false;

  const cardClass = (id: string): string => {
    const selected = selectedId === id;
    if (showResult) {
      // Only color what the learner actually picked — never reveal an unselected
      // correct answer.
      if (selected && id === answer?.correctId) return 'border-emerald-500 bg-emerald-50';
      if (selected && id !== answer?.correctId) return 'border-amber-500 bg-amber-50';
      return 'border-slate-200 bg-white';
    }
    if (selected) return 'border-brand-500 bg-brand-50';
    return 'border-slate-200 bg-white';
  };

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 gap-3">
        {config.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => select(opt.id)}
            className={`flex min-h-[44px] flex-col items-center gap-1 rounded-2xl border-2 p-2.5 transition disabled:cursor-default ${cardClass(opt.id)}`}
          >
            <MiniChart series={opt.series} showPop={showPop} />
            {showCaptions && opt.caption && (
              <span className="text-center text-xs font-semibold leading-tight text-slate-600">{opt.caption}</span>
            )}
          </button>
        ))}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: BIRTH_COLOR }} />
          Birth rate (CBR)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: DEATH_COLOR }} />
          Death rate (CDR)
        </span>
        {showPop && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-4 rounded" style={{ background: POP_COLOR }} />
            Total population
          </span>
        )}
      </div>
    </div>
  );
}

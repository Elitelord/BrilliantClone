import { useEffect, useRef, useState } from 'react';
import { ratesAtStage, STAGE_MIN, STAGE_MAX } from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import PersonIcon from './PersonIcon';
import type { CategoryBarsConfig } from '../../types/content';
import type { CategoryBarsState } from '../../types/interaction';

interface Props {
  config: CategoryBarsConfig;
  onChange: (s: CategoryBarsState) => void;
  disabled?: boolean;
}

type CauseKey = 'infectious' | 'famine' | 'accidents' | 'chronic';
type Figures = Record<CauseKey, number>;

const DEFAULT_POPULATION = 10_000_000;
const DEATHS_PER_FIGURE = 35_000;
const DEFAULT_MAX_FIGURES = 7;
const DRAG_PX_PER_FIGURE = 28;

const FIGURE_H = 18;
const FIGURE_GAP = 2;
const FIGURE_AREA_HEIGHT = DEFAULT_MAX_FIGURES * (FIGURE_H + FIGURE_GAP) + 10;
const CARD_HEIGHT = FIGURE_AREA_HEIGHT + 80;

const BUCKETS: Array<{ key: CauseKey; label: string; sub: string; color: string }> = [
  { key: 'infectious', label: 'Infectious', sub: 'disease', color: '#dc2626' },
  { key: 'famine', label: 'Famine', sub: 'malnutrition', color: '#ea580c' },
  { key: 'accidents', label: 'Accidents', sub: 'injuries', color: '#64748b' },
  { key: 'chronic', label: 'Chronic', sub: 'degenerative', color: '#6366f1' },
];

const CAUSE_PROFILES: Record<number, Figures> = {
  1: { infectious: 42, famine: 38, accidents: 6, chronic: 14 },
  2: { infectious: 32, famine: 18, accidents: 10, chronic: 40 },
  3: { infectious: 14, famine: 6, accidents: 14, chronic: 56 },
  4: { infectious: 6, famine: 3, accidents: 11, chronic: 78 },
  5: { infectious: 5, famine: 2, accidents: 9, chronic: 84 },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mixAtDev(dev: number): Figures {
  const s = clamp(dev, STAGE_MIN, STAGE_MAX);
  const lower = Math.floor(s);
  const upper = Math.min(STAGE_MAX, lower + 1);
  const t = s - lower;
  const a = CAUSE_PROFILES[lower];
  const b = CAUSE_PROFILES[upper];
  return {
    infectious: lerp(a.infectious, b.infectious, t),
    famine: lerp(a.famine, b.famine, t),
    accidents: lerp(a.accidents, b.accidents, t),
    chronic: lerp(a.chronic, b.chronic, t),
  };
}

function totalDeathsAtDev(dev: number, population: number): number {
  const { death } = ratesAtStage(dev);
  return Math.round((death * population) / 1000);
}

function countsFromMix(total: number, mix: Figures): Figures {
  const keys = BUCKETS.map((b) => b.key);
  const rounded = keys.map((k) => Math.round((total * mix[k]) / 100));
  const sum = rounded.reduce((s, n) => s + n, 0);
  const diff = total - sum;
  if (diff !== 0) {
    const maxIdx = keys.reduce((best, k, i) => (mix[k] > mix[keys[best]] ? i : best), 0);
    rounded[maxIdx] += diff;
  }
  return {
    infectious: rounded[0],
    famine: rounded[1],
    accidents: rounded[2],
    chronic: rounded[3],
  };
}

function figureCountFromDeaths(count: number): number {
  if (count <= 0) return 0;
  return Math.min(DEFAULT_MAX_FIGURES, Math.max(1, Math.ceil(count / DEATHS_PER_FIGURE)));
}

function fmtCount(n: number): string {
  return n.toLocaleString('en-US');
}

function dominantLabel(mix: Figures): string {
  const entries = BUCKETS.map((b) => ({ label: `${b.label} ${b.sub}`, pct: mix[b.key] }));
  const top = entries.reduce((a, b) => (b.pct > a.pct ? b : a));
  if (top.pct >= 55) return `Most deaths: ${top.label.toLowerCase()}`;
  return 'Death causes are shifting across the four categories';
}

function sharePct(figures: Figures, key: CauseKey): number {
  const total = BUCKETS.reduce((s, b) => s + figures[b.key], 0);
  if (total <= 0) return 0;
  return Math.round((figures[key] / total) * 100);
}

function BucketColumn({
  label,
  sub,
  color,
  figures,
  footer,
  interactive,
  disabled,
  onFiguresChange,
}: {
  label: string;
  sub: string;
  color: string;
  figures: number;
  footer: string;
  interactive?: boolean;
  disabled?: boolean;
  onFiguresChange?: (n: number) => void;
}) {
  const dragRef = useRef<{ startY: number; startFigures: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive || disabled) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { startY: e.clientY, startFigures: figures };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !interactive || disabled || !onFiguresChange) return;
    const delta = dragRef.current.startY - e.clientY;
    const change = Math.round(delta / DRAG_PX_PER_FIGURE);
    const next = clamp(dragRef.current.startFigures + change, 0, DEFAULT_MAX_FIGURES);
    onFiguresChange(next);
  };

  const onUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white ${
        interactive && !disabled ? 'touch-none cursor-ns-resize' : ''
      }`}
      style={{ height: CARD_HEIGHT }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <div
        className="flex flex-col items-center justify-end gap-0.5 bg-slate-50/80 px-1 pb-1 pt-2"
        style={{ height: FIGURE_AREA_HEIGHT }}
      >
        {Array.from({ length: figures }).map((_, i) => (
          <PersonIcon key={i} color={color} />
        ))}
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center border-t-[3px] px-1 py-2 text-center"
        style={{ borderTopColor: color }}
      >
        <div className="text-[10px] font-bold leading-tight text-slate-700">{label}</div>
        <div className="text-[9px] leading-tight text-slate-400">{sub}</div>
        <div className="mt-1 text-[11px] font-bold tabular-nums text-slate-800">{footer}</div>
      </div>
    </div>
  );
}

function DevelopmentSlider({
  dev,
  disabled,
  onDevChange,
}: {
  dev: number;
  disabled?: boolean;
  onDevChange: (d: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const W = 280;
  const H = 120;
  const pad = { left: 16, right: 16, bottom: 36 };
  const axisY = H - pad.bottom;
  const trackW = W - pad.left - pad.right;

  const devToX = (stage: number) =>
    pad.left + ((clamp(stage, STAGE_MIN, STAGE_MAX) - STAGE_MIN) / (STAGE_MAX - STAGE_MIN)) * trackW;

  const xToDev = (x: number) => {
    const t = clamp((x - pad.left) / trackW, 0, 1);
    return STAGE_MIN + t * (STAGE_MAX - STAGE_MIN);
  };

  const onDown = (e: React.PointerEvent) => {
    if (disabled || !svgRef.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x } = clientToSvg(svgRef.current, e.clientX, 0);
    onDevChange(xToDev(x));
  };

  const onMove = (e: React.PointerEvent) => {
    if (disabled || !svgRef.current) return;
    const { x } = clientToSvg(svgRef.current, e.clientX, 0);
    onDevChange(xToDev(x));
  };

  const onUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const handleX = devToX(dev);

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="mb-2 text-center text-sm font-semibold text-slate-600">Development level</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[300px] touch-none"
        role="slider"
        aria-label="Development level"
        aria-valuemin={STAGE_MIN}
        aria-valuemax={STAGE_MAX}
        aria-valuenow={dev}
      >
        <line x1={pad.left} x2={W - pad.right} y1={axisY} y2={axisY} stroke="#cbd5e1" strokeWidth={2} />
        {[1, 2, 3, 4, 5].map((s) => {
          const cx = devToX(s);
          return (
            <g key={s}>
              <line x1={cx} x2={cx} y1={axisY - 5} y2={axisY + 5} stroke="#94a3b8" strokeWidth={1} />
              <text x={cx} y={axisY + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill="#64748b">
                {s}
              </text>
            </g>
          );
        })}
        <text x={pad.left} y={axisY + 32} textAnchor="start" fontSize={9} fill="#94a3b8">
          Less developed
        </text>
        <text x={W - pad.right} y={axisY + 32} textAnchor="end" fontSize={9} fill="#94a3b8">
          More developed
        </text>
        {!disabled && (
          <g
            style={{ cursor: 'ew-resize' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            <line x1={handleX} x2={handleX} y1={axisY - 32} y2={axisY} stroke="#0f172a" strokeWidth={2} />
            <circle cx={handleX} cy={axisY - 36} r={11} fill="#fff" stroke="#0f172a" strokeWidth={2.5} />
          </g>
        )}
      </svg>
      <p className="mt-1 text-center text-xs text-slate-500">Drag to shift development</p>
    </div>
  );
}

function stateFromExplore(dev: number, population: number): CategoryBarsState {
  const mix = mixAtDev(dev);
  const totalDeaths = totalDeathsAtDev(dev, population);
  const counts = countsFromMix(totalDeaths, mix);
  return {
    dev,
    figures: {
      infectious: figureCountFromDeaths(counts.infectious),
      famine: figureCountFromDeaths(counts.famine),
      accidents: figureCountFromDeaths(counts.accidents),
      chronic: figureCountFromDeaths(counts.chronic),
    },
    infectious: mix.infectious,
    famine: mix.famine,
    accidents: mix.accidents,
    chronic: mix.chronic,
    totalDeaths,
    counts,
  };
}

function stateFromAdjust(figures: Figures): CategoryBarsState {
  return {
    figures,
    infectious: figures.infectious,
    famine: figures.famine,
    accidents: figures.accidents,
    chronic: figures.chronic,
  };
}

export default function CategoryBars({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isAdjust = config.mode === 'adjust';
  const population = config.population ?? DEFAULT_POPULATION;
  const popLabel = config.populationLabel ?? '10 million';
  const maxFigures = config.maxFigures ?? DEFAULT_MAX_FIGURES;

  const defaultFigures: Figures = config.initialFigures ?? {
    infectious: 2,
    famine: 2,
    accidents: 1,
    chronic: 1,
  };

  const [dev, setDev] = useState(config.initialDev ?? 1);
  const [figures, setFigures] = useState<Figures>(defaultFigures);

  useEffect(() => {
    if (isAdjust) {
      onChangeRef.current(stateFromAdjust(figures));
    } else {
      onChangeRef.current(stateFromExplore(dev, population));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitAdjust = (next: Figures) => {
    setFigures(next);
    onChangeRef.current(stateFromAdjust(next));
  };

  const setFigure = (key: CauseKey, n: number) => {
    emitAdjust({ ...figures, [key]: clamp(n, 0, maxFigures) });
  };

  const handleDevChange = (d: number) => {
    setDev(d);
    onChangeRef.current(stateFromExplore(d, population));
  };

  if (isAdjust) {
    const totalFig = BUCKETS.reduce((s, b) => s + figures[b.key], 0);
    return (
      <div className="w-full select-none">
        <p className="mb-3 text-center text-sm text-slate-500">
          Drag up on a card to add deaths from that cause. Drag down to remove.
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {BUCKETS.map((b) => (
            <BucketColumn
              key={b.key}
              label={b.label}
              sub={b.sub}
              color={b.color}
              figures={figures[b.key]}
              footer={totalFig > 0 ? `${sharePct(figures, b.key)}%` : '0%'}
              interactive
              disabled={disabled}
              onFiguresChange={(n) => setFigure(b.key, n)}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-slate-500">
          Stack more figures on the causes that kill the most.
        </p>
      </div>
    );
  }

  const mix = mixAtDev(dev);
  const totalDeaths = totalDeathsAtDev(dev, population);
  const counts = countsFromMix(totalDeaths, mix);
  const caption = dominantLabel(mix);

  return (
    <div className="w-full select-none">
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cause of death mix</p>
        <p className="mt-1 text-base font-bold text-slate-900">
          About {fmtCount(totalDeaths)} deaths per year
        </p>
        <p className="text-xs text-slate-500">in a country of {popLabel} people</p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {BUCKETS.map((b) => (
            <BucketColumn
              key={b.key}
              label={b.label}
              sub={b.sub}
              color={b.color}
              figures={figureCountFromDeaths(counts[b.key])}
              footer={fmtCount(counts[b.key])}
            />
          ))}
        </div>

        <div className="mt-5 lg:mt-0">
          <DevelopmentSlider dev={dev} disabled={disabled} onDevChange={handleDevChange} />
          <p className="mt-2 text-center text-sm font-medium text-slate-700">{caption}</p>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-slate-500">
        Each figure ≈ {fmtCount(DEATHS_PER_FIGURE)} deaths. More figures = more deaths from that cause.
      </p>
    </div>
  );
}

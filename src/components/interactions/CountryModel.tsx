import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TREND_LABEL,
  stageName,
  stageFromRates,
  gapToPopColor,
  STAGE_CHIP_STYLE,
} from '../../lib/dtm';
import {
  COUNTRY_RATE_MAX,
  MILLIONS_PER_ICON,
  getCountry,
  sampleCountry,
  yearBounds,
} from '../../lib/countries';
import { clientToSvg, clamp } from '../../lib/svg';
import type { CountryModelConfig } from '../../types/content';
import type { CountryModelState } from '../../types/interaction';

interface Props {
  config: CountryModelConfig;
  onChange: (s: CountryModelState) => void;
  disabled?: boolean;
}

const W = 360;
const PLOT_H = 168;
const PAD = { top: 30, right: 16, bottom: 26, left: 38 };
const H = PAD.top + PLOT_H + PAD.bottom;
const plotTop = PAD.top;
const plotBottom = PAD.top + PLOT_H;

const TREND_CAPTION: Record<string, string> = {
  'rapid-growth': 'Births far outnumber deaths — population is booming.',
  growing: 'Births outnumber deaths — population is rising.',
  stable: 'Births and deaths nearly balance — population holds steady.',
  shrinking: 'Deaths outnumber births — population is shrinking.',
};

export default function CountryModel({ config, onChange, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const ids = config.countryIds;
  const [countryId, setCountryId] = useState(config.initialCountryId ?? ids[0]);
  const country = getCountry(countryId);
  const [minYear, maxYear] = yearBounds(country);

  const [year, setYear] = useState(minYear);
  const [dragging, setDragging] = useState(false);

  const x = useMemo(
    () => scaleLinear().domain([minYear, maxYear]).range([PAD.left, W - PAD.right]),
    [minYear, maxYear],
  );
  const y = useMemo(() => scaleLinear().domain([0, COUNTRY_RATE_MAX]).range([plotBottom, plotTop]), []);

  const { birthPath, deathPath } = useMemo(() => {
    const birthLine = line<{ year: number; birth: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.birth))
      .curve(curveMonotoneX);
    const deathLine = line<{ year: number; death: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.death))
      .curve(curveMonotoneX);
    return {
      birthPath: birthLine(country.series) ?? '',
      deathPath: deathLine(country.series) ?? '',
    };
  }, [country, x, y]);

  // Only label years that won't visually collide. First & last are always kept;
  // middle ticks are dropped if they crowd a neighbour (fixes 2000/2021 overlap).
  const yearTicks = useMemo(() => {
    const pts = country.series;
    const MIN_GAP = 30;
    const lastX = x(pts[pts.length - 1].year);
    const kept: typeof pts = [];
    let lastKeptX = -Infinity;
    pts.forEach((p, i) => {
      const px = x(p.year);
      if (i === 0 || i === pts.length - 1) {
        kept.push(p);
        lastKeptX = px;
        return;
      }
      if (px - lastKeptX >= MIN_GAP && lastX - px >= MIN_GAP) {
        kept.push(p);
        lastKeptX = px;
      }
    });
    return kept;
  }, [country, x]);

  const emit = (cid: string, yr: number) => {
    const s = sampleCountry(getCountry(cid), yr);
    onChangeRef.current({ countryId: cid, year: s.year, birth: s.birth, death: s.death, gap: s.gap, pop: s.pop, trend: s.trend });
  };

  useEffect(() => {
    emit(countryId, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCountry = (cid: string) => {
    if (disabled) return;
    const [lo] = yearBounds(getCountry(cid));
    setCountryId(cid);
    setYear(lo);
    emit(cid, lo);
  };

  const yearFromPointer = (clientX: number): number => {
    if (!svgRef.current) return year;
    const { x: localX } = clientToSvg(svgRef.current, clientX, 0);
    return clamp(x.invert(localX), minYear, maxYear);
  };
  const moveTo = (clientX: number) => {
    const yr = yearFromPointer(clientX);
    setYear(yr);
    emit(countryId, yr);
  };
  const handleDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!dragging || disabled) return;
    moveTo(e.clientX);
  };
  const handleUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const sample = sampleCountry(country, year);
  const hx = x(year);
  const displayYear = Math.round(year);
  const iconCount = Math.max(1, Math.round(sample.pop / MILLIONS_PER_ICON));
  const estStage = stageFromRates(sample.birth, sample.death);

  const PILL_W = 58;
  const pillX = clamp(hx, PILL_W / 2 + 2, W - PILL_W / 2 - 2);

  const iconColor = gapToPopColor(sample.gap);
  const stageStyle = STAGE_CHIP_STYLE[estStage] ?? STAGE_CHIP_STYLE[4];

  return (
    <div className="w-full select-none">
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-5">
      {/* left column on desktop: population readout + CBR/CDR/stage stats */}
      <div>
      {/* population readout */}
      <div className="rounded-xl bg-slate-50 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-600">Population</span>
          <motion.span
            key={sample.pop.toFixed(1)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="text-lg font-extrabold"
            style={{ color: iconColor }}
          >
            {sample.pop.toFixed(1)}M
          </motion.span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Each figure ≈ {MILLIONS_PER_ICON} million people</div>
        <div className="mt-1.5 flex min-h-[44px] flex-wrap content-start gap-1">
          <AnimatePresence>
            {Array.from({ length: iconCount }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, color: iconColor }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.12, color: { duration: 0.15 } }}
              >
                <PersonIcon />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-2 text-center text-sm font-semibold" style={{ color: iconColor }}>
          {TREND_CAPTION[sample.trend] ?? TREND_LABEL[sample.trend]}
        </div>
      </div>

      {/* CBR / CDR / stage stats — under the population readout */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Crude birth rate" sub="CBR" value={sample.birth.toFixed(0)} color="#2563eb" />
        <Stat label="Crude death rate" sub="CDR" value={sample.death.toFixed(0)} color="#dc2626" />
        <div className="flex flex-col justify-center rounded-xl bg-slate-50 py-2">
          <div
            className="mx-auto rounded-full border px-2 py-0.5 text-xs font-bold"
            style={{
              background: stageStyle.bg,
              color: stageStyle.text,
              borderColor: stageStyle.border,
            }}
          >
            Stage {estStage}
          </div>
          <div className="mt-1 text-xs font-bold leading-tight" style={{ color: stageStyle.text }}>
            {stageName(estStage)}
          </div>
        </div>
      </div>
      </div>

      {/* right column on desktop: the graph plus its controls */}
      <div className="mt-3 lg:mt-0 lg:min-w-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="max-h-chart w-full touch-none"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        role="img"
        aria-label={`Birth and death rates for ${country.name} over time`}
      >
        {/* y grid + labels */}
        {[0, 10, 20, 30, 40, 50].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#eef2f7" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">
              {v}
            </text>
          </g>
        ))}

        {/* curves */}
        <path d={deathPath} fill="none" stroke="#dc2626" strokeWidth={2.5} />
        <path d={birthPath} fill="none" stroke="#2563eb" strokeWidth={2.5} />

        {/* year tick labels — de-cluttered so close years never overlap */}
        {yearTicks.map((p) => {
          const isFirst = p.year === country.series[0].year;
          const isLast = p.year === country.series[country.series.length - 1].year;
          const edge = isFirst ? 'start' : isLast ? 'end' : 'middle';
          const active = Math.abs(displayYear - p.year) < 8;
          return (
            <text
              key={p.year}
              x={x(p.year)}
              y={plotBottom + 15}
              textAnchor={edge}
              fontSize={9}
              fill={active ? '#4f46e5' : '#94a3b8'}
              fontWeight={active ? 700 : 400}
            >
              {p.year}
            </text>
          );
        })}

        {/* current-year emphasis */}
        <line x1={hx} x2={hx} y1={y(sample.birth)} y2={y(sample.death)} stroke="#4f46e5" strokeWidth={2} strokeDasharray="3 3" />
        <circle cx={hx} cy={y(sample.birth)} r={4.5} fill="#2563eb" />
        <circle cx={hx} cy={y(sample.death)} r={4.5} fill="#dc2626" />

        {/* draggable handle */}
        <g style={{ cursor: disabled ? 'default' : 'ew-resize' }}>
          <line x1={hx} x2={hx} y1={plotTop} y2={plotBottom} stroke="#4f46e5" strokeWidth={1} opacity={0.4} />
          <circle cx={hx} cy={plotBottom} r={dragging ? 11 : 9} fill="#4f46e5" stroke="#fff" strokeWidth={2} />
          <circle cx={hx} cy={plotBottom} r={3} fill="#fff" />
        </g>

        {/* moving year marker */}
        <g transform={`translate(${pillX}, ${plotTop - 14})`}>
          <rect x={-PILL_W / 2} y={-14} width={PILL_W} height={22} rx={11} fill="#4f46e5" />
          <text x={0} y={1} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
            {displayYear}
          </text>
          <path d="M-4,8 L4,8 L0,13 Z" fill="#4f46e5" />
        </g>
      </svg>

      {/* country tabs - placed below the graph so a finger reaching for them
          never covers the curves or readouts above. */}
      <div className="mt-2 flex gap-2">
        {ids.map((id) => {
          const c = getCountry(id);
          const activeTab = id === countryId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectCountry(id)}
              className={`flex-1 rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                activeTab
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: '#2563eb' }} />
          Crude birth rate (CBR)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: '#dc2626' }} />
          Crude death rate (CDR)
        </span>
      </div>
      </div>
      </div>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg width="13" height="18" viewBox="0 0 13 18" fill="currentColor" aria-hidden>
      <circle cx="6.5" cy="3.5" r="3.2" />
      <path d="M6.5 7.5c-2.6 0-4.5 1.9-4.5 4.6V18h9v-5.9c0-2.7-1.9-4.6-4.5-4.6z" />
    </svg>
  );
}

function Stat({
  label,
  sub,
  value,
  color,
}: {
  label: string;
  sub?: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col justify-center rounded-xl bg-slate-50 py-2">
      <div className="text-lg font-bold leading-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      {sub && <div className="text-[10px] font-bold text-slate-400">{sub}</div>}
    </div>
  );
}

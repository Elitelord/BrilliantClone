import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, area, curveMonotoneX } from 'd3-shape';
import {
  STAGE_DATA,
  STAGE_MIN,
  STAGE_MAX,
  RATE_MAX,
  ratesAtStage,
  trendFromGap,
  stageName,
  stableSnapTargets,
} from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import NirPanel from './NirPanel';
import type { RateGraphConfig } from '../../types/content';
import type { RateGraphState } from '../../types/interaction';

interface Props {
  config: RateGraphConfig;
  onChange: (s: RateGraphState) => void;
  disabled?: boolean;
}

const W = 360;
const PLOT_H = 196;
const PAD = { right: 16, left: 40 };

const MAGNETIC_THRESHOLD = 0.22;

export default function RateGraph({ config, onChange, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialStage = config.initialStage ?? 1;
  const [stage, setStage] = useState(initialStage);
  const [dragging, setDragging] = useState(false);
  const [nirCurveVisible, setNirCurveVisible] = useState(!!config.showNirCurve);

  const isHist = !!config.historical;
  const overview = !!config.overview;
  const highlightStage = config.highlightStage;
  const showGapBand =
    config.showGap !== false && (!overview || highlightStage != null);
  const showNirCurve =
    !overview && (config.showNirCurve || (config.showNirCurveToggle && nirCurveVisible));
  const showStats = config.showStats !== false && !overview;
  // The population/NIR explore variant splits into two columns on wide screens:
  // graph + legend + toggle on the left, stats + population bar on the right.
  const twoCol = !overview && !isHist && config.showPopulationBar !== false;
  // Historical mode needs a top band for the moving "era" marker and a taller
  // bottom band for the icon + year + event timeline.
  const padTop = isHist ? 44 : 16;
  const padBottom = isHist ? 58 : 40;
  const plotTop = padTop;
  const plotBottom = padTop + PLOT_H;
  const H = plotBottom + padBottom;

  const { x, y } = useMemo(() => {
    return {
      x: scaleLinear().domain([STAGE_MIN, STAGE_MAX]).range([PAD.left, W - PAD.right]),
      y: scaleLinear().domain([0, RATE_MAX]).range([plotBottom, plotTop]),
    };
  }, [plotTop, plotBottom]);

  const { birthPath, deathPath, areaPath, nirPath } = useMemo(() => {
    const birthLine = line<{ stage: number; birth: number }>()
      .x((d) => x(d.stage))
      .y((d) => y(d.birth))
      .curve(curveMonotoneX);
    const deathLine = line<{ stage: number; death: number }>()
      .x((d) => x(d.stage))
      .y((d) => y(d.death))
      .curve(curveMonotoneX);
    const gapArea = area<{ stage: number; birth: number; death: number }>()
      .x((d) => x(d.stage))
      .y0((d) => y(d.death))
      .y1((d) => y(d.birth))
      .curve(curveMonotoneX);
    const nirPts: { stage: number; nir: number }[] = [];
    for (let s = STAGE_MIN; s <= STAGE_MAX; s += 0.05) {
      const { birth, death } = ratesAtStage(s);
      nirPts.push({ stage: s, nir: birth - death });
    }
    const nirLine = line<{ stage: number; nir: number }>()
      .x((d) => x(d.stage))
      .y((d) => y(d.nir))
      .curve(curveMonotoneX);
    return {
      birthPath: birthLine(STAGE_DATA) ?? '',
      deathPath: deathLine(STAGE_DATA) ?? '',
      areaPath: gapArea(STAGE_DATA) ?? '',
      nirPath: nirLine(nirPts) ?? '',
    };
  }, [x, y]);

  const emit = (s: number) => {
    const { birth, death } = ratesAtStage(s);
    const gap = birth - death;
    onChangeRef.current({ stage: s, birth, death, gap, trend: trendFromGap(gap) });
  };

  useEffect(() => {
    emit(initialStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageFromPointer = (clientX: number): number => {
    if (!svgRef.current) return stage;
    const { x: localX } = clientToSvg(svgRef.current, clientX, 0);
    return clamp(x.invert(localX), STAGE_MIN, STAGE_MAX);
  };

  const snapMode = config.snap;
  const stableTargets = snapMode === 'stable' ? stableSnapTargets() : null;

  const moveTo = (clientX: number) => {
    let s = stageFromPointer(clientX);
    if (snapMode === 'stable' && stableTargets) {
      for (const target of stableTargets) {
        if (Math.abs(s - target) < MAGNETIC_THRESHOLD) {
          s = target;
          break;
        }
      }
    } else if (snapMode === true) {
      s = clamp(Math.round(s), STAGE_MIN, STAGE_MAX);
    }
    setStage(s);
    emit(s);
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

  const { birth, death } = ratesAtStage(stage);
  const gap = birth - death;
  const hx = x(stage);

  const hist = config.historical;
  const nearestStage = Math.round(clamp(stage, STAGE_MIN, STAGE_MAX));
  const nearestYear = hist?.yearLabels.find((l) => l.stage === nearestStage)?.label ?? '';
  const nearestEvent = hist?.events?.find((e) => e.stage === nearestStage);

  const bandLeft = (s: number) => clamp(x(s - 0.5), PAD.left, W - PAD.right);
  const bandRight = (s: number) => clamp(x(s + 0.5), PAD.left, W - PAD.right);

  // Keep the moving era pill fully inside the chart horizontally.
  const pillText = `${nearestEvent ? nearestEvent.icon + '  ' : ''}${nearestYear}`;
  const PILL_W = clamp(pillText.length * 7 + 22, 64, W - 8);
  const pillX = clamp(hx, PILL_W / 2 + 2, W - PILL_W / 2 - 2);

  // Keep a bottom-axis label centered on its stage but nudged inward so the
  // edge stages (e.g. "Aging society") don't clip off the right side.
  const labelX = (cx: number, len: number, fontSize: number) => {
    const half = (len * fontSize) / 3.4;
    return clamp(cx, half + 2, W - half - 2);
  };

  return (
    <div className="w-full select-none">
      <div className={twoCol ? 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-5' : ''}>
      {/* chart block (left column on desktop): graph + legend + toggle */}
      <div className={twoCol ? 'lg:min-w-0' : ''}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="max-h-chart w-full touch-none"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        role="img"
        aria-label="Birth and death rate graph across the five demographic stages"
      >
        {/* y grid + labels */}
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#eef2f7" strokeWidth={1} />
            <text x={PAD.left - 7} y={y(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
              {v}
            </text>
          </g>
        ))}
        <text
          x={12}
          y={(plotTop + plotBottom) / 2}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
          transform={`rotate(-90 12 ${(plotTop + plotBottom) / 2})`}
        >
          per 1,000 people
        </text>

        {/* shaded natural-increase gap */}
        {showGapBand && <path d={areaPath} fill="#c7d2fe" opacity={0.5} />}

        {/* frozen stage highlight (reference context) */}
        {highlightStage != null && (
          <rect
            x={bandLeft(highlightStage)}
            y={plotTop}
            width={bandRight(highlightStage) - bandLeft(highlightStage)}
            height={plotBottom - plotTop}
            fill="rgba(79,70,229,0.12)"
            stroke="#4f46e5"
            strokeWidth={1.5}
            rx={6}
          />
        )}

        {/* birth + death curves */}
        <path d={deathPath} fill="none" stroke="#dc2626" strokeWidth={2.5} />
        <path d={birthPath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
        {showNirCurve && (
          <path d={nirPath} fill="none" stroke="#eab308" strokeWidth={2.5} strokeDasharray="5 3" />
        )}

        {/* stage separators */}
        {[1, 2, 3, 4, 5].map((s) => {
          const active = isHist && s === nearestStage;
          return (
            <line
              key={s}
              x1={x(s)}
              x2={x(s)}
              y1={plotTop}
              y2={plotBottom}
              stroke={active ? '#c7d2fe' : '#f1f5f9'}
              strokeWidth={active ? 2 : 1}
            />
          );
        })}

        {/* --- non-historical: simple numbered stage axis --- */}
        {!isHist &&
          [1, 2, 3, 4, 5].map((s) => (
            <text
              key={s}
              x={x(s)}
              y={plotBottom + 16}
              textAnchor="middle"
              fontSize={10}
              fill={highlightStage === s ? '#4f46e5' : '#64748b'}
              fontWeight={highlightStage === s ? 800 : 600}
            >
              {s}
            </text>
          ))}
        {!isHist && (
          <text x={(PAD.left + W - PAD.right) / 2} y={H - 6} textAnchor="middle" fontSize={9} fill="#94a3b8">
            DTM Stage (time / development)
          </text>
        )}

        {/* --- historical: rich icon + year + event timeline --- */}
        {isHist &&
          [1, 2, 3, 4, 5].map((s) => {
            const yr = hist?.yearLabels.find((l) => l.stage === s)?.label ?? '';
            const ev = hist?.events?.find((e) => e.stage === s);
            const active = s === nearestStage;
            const cx = x(s);
            return (
              <g key={s}>
                {ev && (
                  <text x={cx} y={plotBottom + 18} textAnchor="middle" fontSize={active ? 17 : 14} opacity={active ? 1 : 0.6}>
                    {ev.icon}
                  </text>
                )}
                <text
                  x={labelX(cx, yr.length, 10.5)}
                  y={plotBottom + 33}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight={700}
                  fill={active ? '#4f46e5' : '#64748b'}
                >
                  {yr}
                </text>
                {ev && (
                  <text
                    x={labelX(cx, ev.label.length, 8)}
                    y={plotBottom + 45}
                    textAnchor="middle"
                    fontSize={8}
                    fill={active ? '#6366f1' : '#94a3b8'}
                  >
                    {ev.label}
                  </text>
                )}
              </g>
            );
          })}
        {isHist && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={plotBottom + 50}
            y2={plotBottom + 50}
            stroke="#e2e8f0"
            strokeWidth={1}
            markerEnd="url(#histArrow)"
          />
        )}
        {isHist && (
          <defs>
            <marker id="histArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#cbd5e1" />
            </marker>
          </defs>
        )}

        {highlightStage != null && (
          <>
            <line
              x1={x(highlightStage)}
              x2={x(highlightStage)}
              y1={y(ratesAtStage(highlightStage).birth)}
              y2={y(ratesAtStage(highlightStage).death)}
              stroke="#4f46e5"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
            <circle cx={x(highlightStage)} cy={y(ratesAtStage(highlightStage).birth)} r={4.5} fill="#2563eb" />
            <circle cx={x(highlightStage)} cy={y(ratesAtStage(highlightStage).death)} r={4.5} fill="#dc2626" />
          </>
        )}

        {/* current-stage emphasis + handle (hidden in overview/reference mode) */}
        {!overview && (
          <>
            <line x1={hx} x2={hx} y1={y(birth)} y2={y(death)} stroke="#4f46e5" strokeWidth={2} strokeDasharray="3 3" />
            <circle cx={hx} cy={y(birth)} r={4.5} fill="#2563eb" />
            <circle cx={hx} cy={y(death)} r={4.5} fill="#dc2626" />

            {/* magnetic / discrete snap stops along the handle track */}
            {snapMode === 'stable' &&
              stableTargets?.map((s) => (
                <circle
                  key={s}
                  cx={x(s)}
                  cy={plotBottom}
                  r={4}
                  fill={Math.abs(stage - s) < MAGNETIC_THRESHOLD ? '#4f46e5' : '#cbd5e1'}
                />
              ))}
            {snapMode === true &&
              [1, 2, 3, 4, 5].map((s) => (
                <circle
                  key={s}
                  cx={x(s)}
                  cy={plotBottom}
                  r={4}
                  fill={Math.round(stage) === s ? '#4f46e5' : '#cbd5e1'}
                />
              ))}

            {/* draggable handle */}
            <g style={{ cursor: disabled ? 'default' : 'ew-resize' }}>
              <line x1={hx} x2={hx} y1={plotTop} y2={plotBottom} stroke="#4f46e5" strokeWidth={1} opacity={0.4} />
              <circle cx={hx} cy={plotBottom} r={dragging ? 11 : 9} fill="#4f46e5" stroke="#fff" strokeWidth={2} />
              <circle cx={hx} cy={plotBottom} r={3} fill="#fff" />
            </g>
          </>
        )}

        {/* historical: moving "you are here" era marker that tracks the handle.
            It carries the era's emoji + year so it reads clearly even when the
            learner's finger covers the timeline icons below. */}
        {isHist && nearestYear && (
          <g transform={`translate(${pillX}, ${plotTop - 24})`}>
            <rect x={-PILL_W / 2} y={-15} width={PILL_W} height={28} rx={14} fill="#4f46e5" />
            <text x={0} y={4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
              {pillText}
            </text>
            <path d="M-5,13 L5,13 L0,19 Z" fill="#4f46e5" />
          </g>
        )}
      </svg>

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
        {showGapBand && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-4 rounded-sm" style={{ background: '#c7d2fe' }} />
            NIR gap (shaded)
          </span>
        )}
        {showNirCurve && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded border border-dashed border-amber-400" style={{ background: '#eab308' }} />
            NIR curve
          </span>
        )}
      </div>

      {config.showNirCurveToggle && !overview && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setNirCurveVisible((v) => !v)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300"
          >
            {nirCurveVisible ? 'Hide NIR curve' : 'Show NIR curve'}
          </button>
        </div>
      )}
      </div>

      {/* readout block (right column on desktop): stats + population/NIR bar */}
      <div className={twoCol ? 'lg:min-w-0' : ''}>
      {/* stat panel */}
      {showStats && !overview && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Crude birth rate" sub="CBR" value={birth.toFixed(0)} color="#2563eb" />
          <Stat label="Crude death rate" sub="CDR" value={death.toFixed(0)} color="#dc2626" />
          {isHist ? (
            <Stat label="Era" value={nearestYear} color="#4f46e5" />
          ) : config.showPopulationBar !== false ? (
            // Explore: name the stage. Hidden on graded "find the stage" steps so
            // names like "Low Stationary" / "Declining" don't reveal the answer.
            <Stat label={`Stage ${Math.round(stage)}`} value={stageName(stage)} color="#4f46e5" small />
          ) : (
            <Stat label="Stage" value={String(Math.round(stage))} color="#4f46e5" />
          )}
        </div>
      )}

      {!overview && config.showPopulationBar !== false && (
        <div className="mt-3">
          <NirPanel gap={gap} showVerdict={config.showVerdict !== false} />
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  small,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  small?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex flex-col justify-center rounded-xl bg-slate-50 py-2">
      <div className={`${small ? 'text-xs' : 'text-lg'} font-bold leading-tight`} style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      {sub && <div className="text-[10px] font-bold text-slate-400">{sub}</div>}
    </div>
  );
}

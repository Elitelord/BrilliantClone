import { useEffect, useRef, useState } from 'react';
import { clientToSvg, clamp } from '../../lib/svg';
import { foodAt, malthusCrossover, populationAt } from '../../lib/dtm';
import type { GrowthPlotterConfig } from '../../types/content';
import type { GrowthPlotterState } from '../../types/interaction';

interface Props {
  config: GrowthPlotterConfig;
  onChange: (s: GrowthPlotterState) => void;
  disabled?: boolean;
}

const W = 360;
const H = 248;
const PLOT_LEFT = 30;
const PLOT_RIGHT = 344;
const PLOT_TOP = 18;
const PLOT_BOTTOM = 208;

const POP_COLOR = '#dc2626';
const FOOD_COLOR = '#16a34a';
const HANDLE_W = 16;
const HANDLE_H = 16;

function niceCeil(value: number): number {
  const step = value > 400 ? 50 : 25;
  return Math.ceil(value / step) * step;
}

// Lever-mode controls: positive & preventive checks slow population growth;
// food levers raise (or lower) the food line. Deltas are in the same units as
// growthRate (% per year) and foodSlope (capacity added per year).
type LeverGroup = 'positive' | 'preventive' | 'food';
interface GrowthLever {
  id: string;
  group: LeverGroup;
  icon: string;
  label: string;
  dGrowth: number;
  dFood: number;
}

const GROWTH_LEVERS: GrowthLever[] = [
  { id: 'famine', group: 'positive', icon: '🌾', label: 'Famine', dGrowth: -0.8, dFood: 0 },
  { id: 'war', group: 'positive', icon: '⚔️', label: 'War', dGrowth: -0.6, dFood: 0 },
  { id: 'disease', group: 'positive', icon: '🦠', label: 'Epidemic disease', dGrowth: -0.8, dFood: 0 },
  { id: 'latemarriage', group: 'preventive', icon: '💍', label: 'Later marriage', dGrowth: -0.6, dFood: 0 },
  { id: 'contraception', group: 'preventive', icon: '🩺', label: 'Contraception', dGrowth: -0.9, dFood: 0 },
  { id: 'smallfamilies', group: 'preventive', icon: '👨\u200d👩\u200d👧', label: 'Smaller families', dGrowth: -0.7, dFood: 0 },
  { id: 'greenrev', group: 'food', icon: '🚜', label: 'Green Revolution', dGrowth: 0, dFood: 3 },
  { id: 'irrigation', group: 'food', icon: '💧', label: 'Irrigation & fertilizer', dGrowth: 0, dFood: 2.5 },
  { id: 'degradation', group: 'food', icon: '🏜️', label: 'Soil degradation', dGrowth: 0, dFood: -2 },
];

const LEVER_GROUPS: { group: LeverGroup; title: string; sub: string; color: string }[] = [
  { group: 'positive', title: 'Positive checks', sub: 'raise the death rate', color: POP_COLOR },
  { group: 'preventive', title: 'Preventive checks', sub: 'lower the birth rate', color: '#7c3aed' },
  { group: 'food', title: 'Food supply', sub: 'raise / lower the food line', color: FOOD_COLOR },
];

export default function GrowthPlotter({ config, onChange, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const horizon = config.horizonYears ?? 50;
  const pop0 = config.initialPop ?? 100;
  const food0 = config.initialFood ?? 130;
  const [growthMin, growthMax] = config.growthRateRange ?? [0, 4];
  const [slopeMin, slopeMax] = config.foodSlopeRange ?? [0, 8];
  const isLevers = config.controls === 'levers';
  const showChart = config.showChart ?? true;
  const maxLevers = config.maxLevers;

  const baseGrowth = config.initialGrowthRate ?? 2.4;
  const baseFood = config.initialFoodSlope ?? 1.5;

  // Drag mode keeps growth/food in local state; lever mode derives them from the
  // active check/food levers.
  const [dragGrowth, setDragGrowth] = useState(baseGrowth);
  const [dragFood, setDragFood] = useState(baseFood);
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [drag, setDrag] = useState<'growth' | 'food' | null>(null);

  let growthRate = dragGrowth;
  let foodSlope = dragFood;
  if (isLevers) {
    let g = baseGrowth;
    let f = baseFood;
    for (const lever of GROWTH_LEVERS) {
      if (!active.has(lever.id)) continue;
      g += lever.dGrowth;
      f += lever.dFood;
    }
    growthRate = clamp(g, growthMin, growthMax);
    foodSlope = clamp(f, slopeMin, slopeMax);
  }
  const setGrowthRate = setDragGrowth;
  const setFoodSlope = setDragFood;

  const toggleLever = (id: string) => {
    if (disabled) return;
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (maxLevers != null && next.size >= maxLevers) return prev; // cap reached
        next.add(id);
      }
      return next;
    });
  };

  // Fixed y-axis so the curves don't jump while dragging — sized to the extremes
  // the handles can reach.
  const yMax = niceCeil(
    Math.max(
      populationAt(pop0, growthMax, horizon),
      foodAt(food0, slopeMax, horizon),
      food0 * 1.25,
    ),
  );

  const xFor = (t: number) => PLOT_LEFT + (t / horizon) * (PLOT_RIGHT - PLOT_LEFT);
  const yFor = (v: number) =>
    PLOT_BOTTOM - clamp(v / yMax, 0, 1) * (PLOT_BOTTOM - PLOT_TOP);
  const valueForY = (y: number) =>
    ((PLOT_BOTTOM - y) / (PLOT_BOTTOM - PLOT_TOP)) * yMax;

  const crossover = malthusCrossover({ pop0, food0, growthRate, foodSlope, horizon });

  const emit = (rate: number, slope: number) => {
    const cross = malthusCrossover({ pop0, food0, growthRate: rate, foodSlope: slope, horizon });
    onChangeRef.current({
      growthRate: rate,
      foodSlope: slope,
      crosses: cross.crosses,
      crossYear: cross.crossYear,
    });
  };

  useEffect(() => {
    emit(growthRate, foodSlope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growthRate, foodSlope]);

  const onDown = (which: 'growth' | 'food') => (e: React.PointerEvent) => {
    if (disabled) return;
    if (which === 'growth' && config.lockGrowth) return;
    if (which === 'food' && config.lockFood) return;
    setDrag(which);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag || disabled || !svgRef.current) return;
    const { y } = clientToSvg(svgRef.current, 0, e.clientY);
    const target = valueForY(y);

    if (drag === 'growth') {
      const minEnd = populationAt(pop0, growthMin, horizon);
      const maxEnd = populationAt(pop0, growthMax, horizon);
      const popEnd = clamp(target, minEnd, maxEnd);
      const rate = clamp((Math.pow(popEnd / pop0, 1 / horizon) - 1) * 100, growthMin, growthMax);
      setGrowthRate(rate);
    } else {
      const minEnd = food0 + slopeMin * horizon;
      const maxEnd = food0 + slopeMax * horizon;
      const foodEnd = clamp(target, minEnd, maxEnd);
      const slope = clamp((foodEnd - food0) / horizon, slopeMin, slopeMax);
      setFoodSlope(slope);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    setDrag(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  // Population curve sampled across the horizon.
  const popPoints: string[] = [];
  for (let t = 0; t <= horizon; t++) {
    popPoints.push(`${xFor(t).toFixed(1)},${yFor(populationAt(pop0, growthRate, t)).toFixed(1)}`);
  }
  const popPath = `M ${popPoints.join(' L ')}`;

  const foodEndY = yFor(foodAt(food0, foodSlope, horizon));
  const foodStartY = yFor(food0);
  const popEndY = yFor(populationAt(pop0, growthRate, horizon));

  const crisisX = crossover.crossYear != null ? xFor(crossover.crossYear) : null;
  const crisisY = crossover.crossYear != null ? yFor(populationAt(pop0, growthRate, crossover.crossYear)) : null;

  const verdictColor = crossover.crosses ? POP_COLOR : FOOD_COLOR;

  return (
    <div className="w-full select-none">
      <div className="mx-auto flex w-full max-w-[380px] flex-col gap-3">
        {showChart && (
          <div className="flex flex-wrap justify-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: POP_COLOR, color: POP_COLOR }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: POP_COLOR }} />
              Population growth {growthRate.toFixed(1)}% / yr
            </div>
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: FOOD_COLOR, color: FOOD_COLOR }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: FOOD_COLOR }} />
              Food supply +{foodSlope.toFixed(1)} / yr
            </div>
          </div>
        )}

        {showChart && (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          style={{ maxHeight: 'min(360px, 52vh)' }}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          role="img"
          aria-label="Population versus food supply over time"
        >
          {/* axes */}
          <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOTTOM} stroke="#cbd5e1" strokeWidth={1} />
          <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke="#cbd5e1" strokeWidth={1} />
          <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#94a3b8">
            Time →  ({horizon} years)
          </text>
          <text
            x={10}
            y={(PLOT_TOP + PLOT_BOTTOM) / 2}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
            transform={`rotate(-90 10 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
          >
            People
          </text>

          {/* food (linear) */}
          <line
            x1={PLOT_LEFT}
            y1={foodStartY}
            x2={PLOT_RIGHT}
            y2={foodEndY}
            stroke={FOOD_COLOR}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* population (exponential) */}
          <path d={popPath} fill="none" stroke={POP_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* crisis marker */}
          {crossover.crosses && crisisX != null && crisisY != null && (
            <>
              <line
                x1={crisisX}
                y1={PLOT_TOP}
                x2={crisisX}
                y2={PLOT_BOTTOM}
                stroke={POP_COLOR}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.6}
              />
              <circle cx={crisisX} cy={crisisY} r={4.5} fill={POP_COLOR} />
              <text x={clamp(crisisX, PLOT_LEFT + 24, PLOT_RIGHT - 24)} y={PLOT_TOP + 10} textAnchor="middle" fontSize={10} fill={POP_COLOR} fontWeight={700}>
                Crisis · yr {crossover.crossYear}
              </text>
            </>
          )}

          {/* drag handles at the right edge (drag mode only) */}
          {!disabled && !isLevers && !config.lockGrowth && (
            <g style={{ cursor: 'ns-resize' }} onPointerDown={onDown('growth')}>
              <rect
                x={PLOT_RIGHT - HANDLE_W / 2}
                y={popEndY - HANDLE_H / 2}
                width={HANDLE_W}
                height={HANDLE_H}
                rx={4}
                fill="#fff"
                stroke={POP_COLOR}
                strokeWidth={2}
              />
              <line x1={PLOT_RIGHT - 4} x2={PLOT_RIGHT + 4} y1={popEndY} y2={popEndY} stroke={POP_COLOR} strokeWidth={1.5} strokeLinecap="round" />
            </g>
          )}
          {!disabled && !isLevers && !config.lockFood && (
            <g style={{ cursor: 'ns-resize' }} onPointerDown={onDown('food')}>
              <rect
                x={PLOT_RIGHT - HANDLE_W / 2}
                y={foodEndY - HANDLE_H / 2}
                width={HANDLE_W}
                height={HANDLE_H}
                rx={4}
                fill="#fff"
                stroke={FOOD_COLOR}
                strokeWidth={2}
              />
              <line x1={PLOT_RIGHT - 4} x2={PLOT_RIGHT + 4} y1={foodEndY} y2={foodEndY} stroke={FOOD_COLOR} strokeWidth={1.5} strokeLinecap="round" />
            </g>
          )}
        </svg>
        )}

        {!disabled && !isLevers && (
          <p className="text-center text-xs text-slate-400">
            Drag the red handle to change how fast population grows, and the green handle to change how fast food supply rises.
          </p>
        )}

        {isLevers && (
          <div className="flex flex-col gap-3">
            {LEVER_GROUPS.map((grp) => (
              <div key={grp.group}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white"
                    style={{ background: grp.color }}
                  >
                    {grp.title}
                  </span>
                  <span className="text-xs text-slate-500">{grp.sub}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GROWTH_LEVERS.filter((l) => l.group === grp.group).map((l) => {
                    const on = active.has(l.id);
                    const lockedOut = maxLevers != null && !on && active.size >= maxLevers;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        disabled={disabled || lockedOut}
                        onClick={() => toggleLever(l.id)}
                        aria-pressed={on}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                          on ? 'text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        } ${disabled ? 'cursor-default' : lockedOut ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                        style={on ? { background: grp.color, borderColor: grp.color } : undefined}
                      >
                        <span className="text-lg leading-none">{l.icon}</span>
                        <span className="text-[11px] font-semibold leading-tight">{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-slate-400">
              {maxLevers != null
                ? `Choose up to ${maxLevers}: ${active.size}/${maxLevers} selected. Checks slow the population curve; food levers shift the food line.`
                : 'Checks slow the red population curve; food levers raise or lower the green food line.'}
            </p>
          </div>
        )}

        {showChart && (
          <div
            className="rounded-2xl border-2 px-5 py-3 text-center"
            style={{ borderColor: verdictColor, background: `${verdictColor}10` }}
          >
            {crossover.crosses ? (
              <>
                <div className="text-lg font-bold" style={{ color: verdictColor }}>
                  Catastrophe in year {crossover.crossYear}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  Population catches the food supply — Malthus's crisis point.
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold" style={{ color: verdictColor }}>
                  No crisis — food keeps up
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  The curves never cross within {horizon} years. The catastrophe is averted.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

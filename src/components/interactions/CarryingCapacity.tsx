import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../lib/svg';
import type { CarryingCapacityConfig } from '../../types/content';
import type { CarryingCapacityState } from '../../types/interaction';

interface Props {
  config: CarryingCapacityConfig;
  onChange: (s: CarryingCapacityState) => void;
  disabled?: boolean;
}

const CAP_COLOR = '#16a34a';
const POP_COLOR = '#dc2626';
const FOOD_COLOR = '#ca8a04';
const WATER_COLOR = '#0ea5e9';

function fmt(n: number): string {
  if (n >= 1000) return Math.round(n).toLocaleString();
  if (n >= 100) return Math.round(n).toString();
  return n.toFixed(0);
}

export default function CarryingCapacity({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [landMin, landMax] = config.landRange ?? [0, 400];
  const [yieldMin, yieldMax] = config.yieldRange ?? [1, 12];
  const [waterMin, waterMax] = config.waterRange ?? [0, 2000];
  const showCapacity = config.showCapacity ?? config.mode !== 'solve';
  const capUnit = config.capacityUnit ?? 'M people';
  const landLabel = config.landLabel ?? 'Farmland';
  const yieldLabel = config.yieldLabel ?? 'Yield per unit (technology)';
  const waterLabel = config.waterLabel ?? 'Water supply';
  const landUnit = config.landUnit ?? 'M hectares';
  const yieldUnit = config.yieldUnit ?? 'people / hectare';
  const waterUnit = config.waterUnit ?? 'M people';

  const [land, setLand] = useState(config.initialLand ?? Math.round((landMin + landMax) / 2));
  const [yieldLevel, setYieldLevel] = useState(config.initialYield ?? Math.round((yieldMin + yieldMax) / 2));
  const [waterSupply, setWaterSupply] = useState(config.initialWater ?? Math.round((waterMin + waterMax) / 2));

  const foodCeiling = land * yieldLevel;
  const waterCeiling = waterSupply;
  const capacity = Math.min(foodCeiling, waterCeiling);
  const binding: 'food' | 'water' = foodCeiling <= waterCeiling ? 'food' : 'water';
  const maxScale = Math.max(landMax * yieldMax, waterMax);

  const emit = (l: number, y: number, w: number) => {
    const food = l * y;
    const cap = Math.min(food, w);
    onChangeRef.current({
      land: l,
      yieldLevel: y,
      waterSupply: w,
      foodCeiling: food,
      waterCeiling: w,
      capacity: cap,
      binding: food <= w ? 'food' : 'water',
    });
  };

  useEffect(() => {
    emit(land, yieldLevel, waterSupply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLandVal = (v: number) => {
    if (disabled) return;
    const next = clamp(Math.round(v), landMin, landMax);
    setLand(next);
    emit(next, yieldLevel, waterSupply);
  };
  const setYieldVal = (v: number) => {
    if (disabled) return;
    const next = clamp(Math.round(v), yieldMin, yieldMax);
    setYieldLevel(next);
    emit(land, next, waterSupply);
  };
  const setWaterVal = (v: number) => {
    if (disabled) return;
    const next = clamp(Math.round(v), waterMin, waterMax);
    setWaterSupply(next);
    emit(land, yieldLevel, next);
  };

  const pct = (v: number) => clamp((v / maxScale) * 100, 0, 100);
  const capPct = pct(capacity);
  const foodPct = pct(foodCeiling);
  const waterPct = pct(waterCeiling);
  const population = config.population;
  const popPct = population != null ? pct(population) : null;
  const target = config.targetCapacity;
  const targetPct = target != null ? pct(target) : null;

  const overCapacity = population != null && capacity < population;
  const bindingLabel = binding === 'food' ? 'Food' : 'Water';
  const bindingColor = binding === 'food' ? FOOD_COLOR : WATER_COLOR;

  const sliders: {
    label: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    set: (v: number) => void;
    color: string;
  }[] = [
    { label: landLabel, unit: landUnit, value: land, min: landMin, max: landMax, set: setLandVal, color: FOOD_COLOR },
    { label: yieldLabel, unit: yieldUnit, value: yieldLevel, min: yieldMin, max: yieldMax, set: setYieldVal, color: FOOD_COLOR },
    { label: waterLabel, unit: waterUnit, value: waterSupply, min: waterMin, max: waterMax, set: setWaterVal, color: WATER_COLOR },
  ];

  return (
    <div className="w-full select-none">
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4">
        {/* The ceiling readout / gauge */}
        <div className="rounded-2xl border-2 px-4 py-4" style={{ borderColor: `${CAP_COLOR}40`, background: `${CAP_COLOR}0d` }}>
          {showCapacity ? (
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Carrying capacity</div>
              <div className="mt-0.5 text-4xl font-extrabold tabular-nums" style={{ color: CAP_COLOR }}>
                {fmt(capacity)}
                <span className="ml-1 text-base font-bold text-slate-400">{capUnit}</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                the lower of food ({fmt(foodCeiling)}) and water ({fmt(waterCeiling)})
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resource ceiling</div>
              <div className="mt-0.5 text-sm text-slate-600">
                Capacity is the <span className="font-bold text-slate-800">lower</span> of food and water. Raise the
                limiting one until the bar reaches the <span className="font-bold text-slate-800">target</span>.
              </div>
            </div>
          )}

          {/* Gauge track */}
          <div className="relative mt-4 h-12">
            {/* target notch (solve) */}
            {targetPct != null && (
              <div className="absolute -top-1 z-20 flex -translate-x-1/2 flex-col items-center" style={{ left: `${targetPct}%` }}>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">Target {fmt(target!)}</span>
                <span className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent" style={{ borderTopColor: '#1e293b' }} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-6 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-[width] duration-150" style={{ width: `${capPct}%`, background: CAP_COLOR }} />
            </div>
            {/* food & water ceiling ticks (explore only — they reveal the two limits) */}
            {showCapacity && (
              <>
                <div className="absolute bottom-0 z-10 -translate-x-1/2" style={{ left: `${foodPct}%` }}>
                  <div className="h-6 w-0.5" style={{ background: FOOD_COLOR }} />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold" style={{ color: FOOD_COLOR }}>
                    🌾 {fmt(foodCeiling)}
                  </div>
                </div>
                <div className="absolute bottom-0 z-10 -translate-x-1/2" style={{ left: `${waterPct}%` }}>
                  <div className="h-6 w-0.5" style={{ background: WATER_COLOR }} />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold" style={{ color: WATER_COLOR }}>
                    💧 {fmt(waterCeiling)}
                  </div>
                </div>
              </>
            )}
            {/* current population marker (explore) */}
            {popPct != null && (
              <div className="absolute bottom-0 z-10 -translate-x-1/2" style={{ left: `${popPct}%` }}>
                <div className="h-6 w-0.5" style={{ background: POP_COLOR }} />
                <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold" style={{ color: POP_COLOR }}>
                  Pop {fmt(population!)}
                </div>
              </div>
            )}
          </div>

          {/* binding-constraint verdict */}
          {showCapacity && (
            <div className="mt-12 text-center text-sm font-semibold" style={{ color: bindingColor }}>
              {bindingLabel} is the limiting resource
              {population != null && (
                <span className="ml-1" style={{ color: overCapacity ? POP_COLOR : CAP_COLOR }}>
                  · {overCapacity ? '⚠️ over capacity (shortages)' : '✓ supports the population'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Levers */}
        <div className="flex flex-col gap-3">
          {sliders.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {s.value.toLocaleString()} <span className="text-xs font-medium text-slate-400">{s.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={1}
                value={s.value}
                disabled={disabled}
                onChange={(e) => s.set(Number(e.target.value))}
                className="mt-2 w-full disabled:opacity-60"
                style={{ accentColor: s.color }}
                aria-label={s.label}
              />
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400">
          Food ceiling = farmland × yield. Water sets its own ceiling. Carrying capacity is whichever is smaller — the
          binding constraint.
        </p>
      </div>
    </div>
  );
}

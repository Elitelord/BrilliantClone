import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../lib/svg';
import { computeDensities } from '../../lib/dtm';
import type { DensityCalcConfig, DensityPreset } from '../../types/content';
import type { DensityCalcState } from '../../types/interaction';

interface Props {
  config: DensityCalcConfig;
  onChange: (s: DensityCalcState) => void;
  disabled?: boolean;
}

// Inputs are entered in friendly units (millions of people, thousand km² of land,
// millions of farmers); densities are reported as people / km² (× 1000 converts
// "millions per thousand km²" into "people per km²").
const UNIT_SCALE = 1000;

const DEFAULTS = {
  population: 80,
  totalLand: 500,
  arableLand: 120,
  farmers: 20,
};

interface Field {
  key: 'population' | 'totalLand' | 'arableLand' | 'farmers';
  label: string;
  unit: string;
  max: number;
  step: number;
}

function fmtDensity(n: number): string {
  if (n >= 1000) return Math.round(n).toLocaleString();
  if (n >= 100) return Math.round(n).toString();
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

export default function DensityCalc({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const presets = config.presets ?? [];
  const initial = config.initial ?? DEFAULTS;

  const [population, setPopulation] = useState(initial.population);
  const [totalLand, setTotalLand] = useState(initial.totalLand);
  const [arableLand, setArableLand] = useState(initial.arableLand);
  const [farmers, setFarmers] = useState(initial.farmers);
  const [presetId, setPresetId] = useState<string | undefined>(config.initialPresetId);

  const fields: Field[] = [
    { key: 'population', label: 'Population', unit: 'million', max: config.maxPopulation ?? 250, step: 1 },
    { key: 'totalLand', label: 'Total land', unit: "k km\u00b2", max: config.maxLand ?? 12000, step: 10 },
    { key: 'arableLand', label: 'Arable (farmable) land', unit: "k km\u00b2", max: config.maxArable ?? 1500, step: 5 },
    { key: 'farmers', label: 'Farmers', unit: 'million', max: config.maxFarmers ?? 120, step: 1 },
  ];

  const values = { population, totalLand, arableLand, farmers };

  const raw = computeDensities({ population, totalLand, arableLand, farmers });
  const densities = {
    arithmetic: raw.arithmetic * UNIT_SCALE,
    physiological: raw.physiological * UNIT_SCALE,
    agricultural: raw.agricultural * UNIT_SCALE,
  };

  const emit = (
    next: { population: number; totalLand: number; arableLand: number; farmers: number },
    pid?: string,
  ) => {
    const d = computeDensities(next);
    onChangeRef.current({
      ...next,
      arithmetic: d.arithmetic * UNIT_SCALE,
      physiological: d.physiological * UNIT_SCALE,
      agricultural: d.agricultural * UNIT_SCALE,
      presetId: pid,
    });
  };

  useEffect(() => {
    emit(values, presetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: Field['key'], value: number, max: number) => {
    if (disabled) return;
    const v = clamp(Math.round(value), 0, max);
    const next = {
      population: key === 'population' ? v : population,
      totalLand: key === 'totalLand' ? v : totalLand,
      arableLand: key === 'arableLand' ? v : arableLand,
      farmers: key === 'farmers' ? v : farmers,
    };
    setPopulation(next.population);
    setTotalLand(next.totalLand);
    setArableLand(next.arableLand);
    setFarmers(next.farmers);
    setPresetId(undefined);
    emit(next, undefined);
  };

  const applyPreset = (p: DensityPreset) => {
    if (disabled) return;
    setPopulation(p.population);
    setTotalLand(p.totalLand);
    setArableLand(p.arableLand);
    setFarmers(p.farmers);
    setPresetId(p.id);
    emit(
      { population: p.population, totalLand: p.totalLand, arableLand: p.arableLand, farmers: p.farmers },
      p.id,
    );
  };

  const densityCards: { key: keyof typeof densities; label: string; sub: string; color: string }[] = [
    { key: 'arithmetic', label: 'Arithmetic', sub: 'people \u00f7 total land', color: '#2563eb' },
    { key: 'physiological', label: 'Physiological', sub: 'people \u00f7 arable land', color: '#9333ea' },
    { key: 'agricultural', label: 'Agricultural', sub: 'farmers \u00f7 arable land', color: '#ca8a04' },
  ];

  return (
    <div className="w-full select-none">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <div className="flex flex-col gap-3">
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => {
                const picked = p.id === presetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => applyPreset(p)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                      picked
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {p.flag ? `${p.flag} ` : ''}
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}

          {fields.map((f) => (
            <div key={f.key} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-700">{f.label}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {values[f.key].toLocaleString()}{' '}
                  <span className="text-xs font-medium text-slate-400">{f.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={f.max}
                step={f.step}
                value={values[f.key]}
                disabled={disabled}
                onChange={(e) => setField(f.key, Number(e.target.value), f.max)}
                className="mt-2 w-full accent-brand-600 disabled:opacity-60"
                aria-label={f.label}
              />
            </div>
          ))}
        </div>

        {/* Live densities */}
        <div className="flex flex-col gap-3">
          {densityCards.map((c) => (
            <div
              key={c.key}
              className="rounded-2xl border-2 px-4 py-3"
              style={{ borderColor: `${c.color}40`, background: `${c.color}0d` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{c.label} density</div>
                  <div className="text-xs text-slate-500">{c.sub}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold tabular-nums" style={{ color: c.color }}>
                    {fmtDensity(densities[c.key])}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {c.key === 'agricultural' ? 'farmers / km\u00b2' : 'people / km\u00b2'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-slate-400">
            Arithmetic counts everyone on all the land. Physiological squeezes them onto the farmland.
            Agricultural counts only the farmers working it.
          </p>
        </div>
      </div>
    </div>
  );
}

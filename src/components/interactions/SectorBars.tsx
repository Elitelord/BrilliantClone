import { useEffect, useRef, useState } from 'react';
import {
  dominantSector,
  impliedStageFromSectors,
  sectorStageConfident,
  SECTOR_LABEL,
  STAGE_CHIP_STYLE,
  STAGE_SECTOR_PROFILES,
} from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import type { SectorConfig } from '../../types/content';
import type { SectorState } from '../../types/interaction';

interface Props {
  config: SectorConfig;
  onChange: (s: SectorState) => void;
  disabled?: boolean;
}

const W = 320;
const H = 236;
const PAD = { top: 18, bottom: 46 };
const BASELINE = H - PAD.bottom;
const MAXH = BASELINE - PAD.top;
const COLS = [W * 0.22, W * 0.5, W * 0.78];
const BARW = 56;
const COLORS = ['#16a34a', '#f59e0b', '#2563eb']; // primary, secondary, tertiary
const KEYS: Array<'primary' | 'secondary' | 'tertiary'> = ['primary', 'secondary', 'tertiary'];
const SHORT = ['Farming', 'Industry', 'Services'];

export default function SectorBars({ config, onChange, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isClassify = config.mode === 'classify';
  const start = isClassify
    ? config.preset ?? { primary: 33, secondary: 33, tertiary: 34 }
    : config.initial ?? { primary: 50, secondary: 30, tertiary: 20 };

  const [vals, setVals] = useState<[number, number, number]>([start.primary, start.secondary, start.tertiary]);
  const [selectedStage, setSelectedStage] = useState<number | undefined>(undefined);
  const [drag, setDrag] = useState<number | null>(null);

  const emit = (v: [number, number, number], sel?: number) => {
    onChangeRef.current({
      primary: Math.round(v[0]),
      secondary: Math.round(v[1]),
      tertiary: Math.round(v[2]),
      dominant: dominantSector(v[0], v[1], v[2]),
      impliedStage: impliedStageFromSectors(v[0], v[1], v[2]),
      selectedStage: sel,
    });
  };

  useEffect(() => {
    emit(vals, selectedStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSector = (idx: number, newVal: number) => {
    const v = clamp(newVal, 0, 100);
    const others = [0, 1, 2].filter((i) => i !== idx);
    const remaining = 100 - v;
    const sumOthers = vals[others[0]] + vals[others[1]];
    let o0: number;
    let o1: number;
    if (sumOthers <= 0.001) {
      o0 = remaining / 2;
      o1 = remaining / 2;
    } else {
      o0 = remaining * (vals[others[0]] / sumOthers);
      o1 = remaining - o0;
    }
    const next: [number, number, number] = [0, 0, 0];
    next[idx] = v;
    next[others[0]] = o0;
    next[others[1]] = o1;
    setVals(next);
    emit(next);
  };

  const valFromPointer = (clientY: number): number => {
    if (!svgRef.current) return 0;
    const { y } = clientToSvg(svgRef.current, 0, clientY);
    return clamp(((BASELINE - y) / MAXH) * 100, 0, 100);
  };

  const onDown = (idx: number) => (e: React.PointerEvent) => {
    if (disabled || isClassify) return;
    setDrag(idx);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setSector(idx, valFromPointer(e.clientY));
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag === null || disabled) return;
    setSector(drag, valFromPointer(e.clientY));
  };
  const onUp = (e: React.PointerEvent) => {
    setDrag(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const applyPreset = (stage: number) => {
    if (disabled) return;
    const p = STAGE_SECTOR_PROFILES[stage];
    const next: [number, number, number] = [p.primary, p.secondary, p.tertiary];
    setVals(next);
    emit(next, selectedStage);
  };

  const implied = impliedStageFromSectors(vals[0], vals[1], vals[2]);
  const confident = sectorStageConfident(vals[0], vals[1], vals[2]);

  const PRESET_STAGES: Array<{ stage: number; label: string }> = [
    { stage: 2, label: 'Stage 2 · agrarian' },
    { stage: 3, label: 'Stage 3 · industrial' },
    { stage: 4, label: 'Stage 4 · services' },
  ];

  // The explore variant splits into two columns on wide screens: bars on the
  // left, the implied-stage chip + stage presets on the right.
  const twoCol = !isClassify && (config.showImpliedStage === true || config.showStagePresets === true);

  return (
    <div className="w-full select-none">
      <div className={twoCol ? 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-5' : ''}>
      {/* left column: bars + leading sector */}
      <div className={twoCol ? 'lg:min-w-0' : ''}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="max-h-chart w-full touch-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        role="img"
        aria-label="Employment by sector"
      >
        <line x1={20} x2={W - 20} y1={BASELINE} y2={BASELINE} stroke="#cbd5e1" strokeWidth={1.5} />
        {COLS.map((cx, i) => {
          const h = (vals[i] / 100) * MAXH;
          const barTop = BASELINE - h;
          return (
            <g key={i} style={{ cursor: disabled || isClassify ? 'default' : 'ns-resize' }} onPointerDown={onDown(i)}>
              <rect x={cx - BARW / 2} y={PAD.top} width={BARW} height={MAXH} fill="#f1f5f9" rx={6} />
              <rect x={cx - BARW / 2} y={barTop} width={BARW} height={h} fill={COLORS[i]} rx={6} />
              <text x={cx} y={barTop - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS[i]}>
                {Math.round(vals[i])}%
              </text>
              {!isClassify && !disabled && (
                <circle cx={cx} cy={barTop} r={drag === i ? 10 : 8} fill="#fff" stroke={COLORS[i]} strokeWidth={3} />
              )}
              <text x={cx} y={BASELINE + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill="#475569">
                {SHORT[i]}
              </text>
              <text x={cx} y={BASELINE + 28} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {KEYS[i]}
              </text>
            </g>
          );
        })}
        {config.preset?.label && (
          <text x={W / 2} y={12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
            {config.preset.label}
          </text>
        )}
      </svg>

      {!isClassify && (
        <div className="mt-1 text-center text-sm font-medium text-slate-500">
          Leading sector: <span className="font-bold text-slate-700">{SECTOR_LABEL[dominantSector(vals[0], vals[1], vals[2])]}</span>
        </div>
      )}
      </div>

      {/* right column: implied stage + snap-to-a-stage presets */}
      <div className={twoCol ? 'lg:min-w-0' : ''}>
      {!isClassify && config.showImpliedStage && (
        <div className="mt-2 flex justify-center">
          {confident ? (
            <span
              className="rounded-full border px-3 py-1 text-sm font-bold"
              style={{
                background: STAGE_CHIP_STYLE[implied].bg,
                color: STAGE_CHIP_STYLE[implied].text,
                borderColor: STAGE_CHIP_STYLE[implied].border,
              }}
            >
              Implied stage {implied}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-400">
              No single sector clearly leads yet — keep dragging.
            </span>
          )}
        </div>
      )}

      {!isClassify && config.showStagePresets && (
        <div className="mt-3">
          <div className="mb-2 text-center text-sm font-medium text-slate-500">Snap to a stage</div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_STAGES.map(({ stage, label }) => (
              <button
                key={stage}
                type="button"
                disabled={disabled}
                onClick={() => applyPreset(stage)}
                className="h-11 rounded-xl border-2 px-3 text-sm font-bold transition disabled:opacity-60"
                style={{
                  background: STAGE_CHIP_STYLE[stage].bg,
                  color: STAGE_CHIP_STYLE[stage].text,
                  borderColor: STAGE_CHIP_STYLE[stage].border,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
      </div>

      {isClassify && (
        <div className="mt-3">
          <div className="mb-2 text-center text-sm font-medium text-slate-500">Which DTM stage?</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedStage(s);
                  emit(vals, s);
                }}
                className={`h-11 w-11 rounded-xl border-2 text-base font-bold transition ${
                  selectedStage === s
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                } disabled:opacity-60`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

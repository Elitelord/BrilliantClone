import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, area, curveMonotoneX } from 'd3-shape';
import { STAGE_DATA, STAGE_MIN, STAGE_MAX, RATE_MAX, ratesAtStage } from '../../lib/dtm';
import { clamp } from '../../lib/svg';
import type { StageSelectConfig, ValidationResult } from '../../types/content';
import type { StageSelectState } from '../../types/interaction';

interface Props {
  config: StageSelectConfig;
  onChange: (s: StageSelectState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
}

const W = 360;
const PLOT_H = 196;
const PAD = { top: 16, right: 16, bottom: 30, left: 40 };
const H = PAD.top + PLOT_H + PAD.bottom;
const plotTop = PAD.top;
const plotBottom = PAD.top + PLOT_H;
const STAGES = [1, 2, 3, 4, 5];

export default function StageSelect({ config, onChange, disabled, result }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [selected, setSelected] = useState<number | null>(null);

  const { x, y } = useMemo(
    () => ({
      x: scaleLinear().domain([STAGE_MIN, STAGE_MAX]).range([PAD.left, W - PAD.right]),
      y: scaleLinear().domain([0, RATE_MAX]).range([plotBottom, plotTop]),
    }),
    [],
  );

  const { birthPath, deathPath, areaPath } = useMemo(() => {
    const birthLine = line<{ stage: number; birth: number }>().x((d) => x(d.stage)).y((d) => y(d.birth)).curve(curveMonotoneX);
    const deathLine = line<{ stage: number; death: number }>().x((d) => x(d.stage)).y((d) => y(d.death)).curve(curveMonotoneX);
    const gapArea = area<{ stage: number; birth: number; death: number }>()
      .x((d) => x(d.stage))
      .y0((d) => y(d.death))
      .y1((d) => y(d.birth))
      .curve(curveMonotoneX);
    return {
      birthPath: birthLine(STAGE_DATA) ?? '',
      deathPath: deathLine(STAGE_DATA) ?? '',
      areaPath: gapArea(STAGE_DATA) ?? '',
    };
  }, [x, y]);

  useEffect(() => {
    onChangeRef.current({ selectedStage: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (s: number) => {
    if (disabled) return;
    setSelected(s);
    onChangeRef.current({ selectedStage: s });
  };

  const bandLeft = (s: number) => clamp(x(s - 0.5), PAD.left, W - PAD.right);
  const bandRight = (s: number) => clamp(x(s + 0.5), PAD.left, W - PAD.right);

  const showStatus = !!result;
  const showRates = config.showRates !== false;
  const sel = selected != null ? ratesAtStage(selected) : null;

  // Colour for the chosen band: brand while choosing, then green/amber once checked.
  const selFill =
    selected == null
      ? 'transparent'
      : showStatus
        ? result?.correct
          ? 'rgba(22,163,74,0.14)'
          : 'rgba(245,158,11,0.16)'
        : 'rgba(79,70,229,0.12)';
  const selStroke =
    selected == null ? '#c7d2fe' : showStatus ? (result?.correct ? '#16a34a' : '#f59e0b') : '#4f46e5';

  return (
    <div className="w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ maxHeight: 280 }}
        role="img"
        aria-label="Tap the demographic stage that matches the scenario"
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

        {/* selected band highlight (behind the curves) */}
        {selected != null && (
          <rect
            x={bandLeft(selected)}
            y={plotTop}
            width={bandRight(selected) - bandLeft(selected)}
            height={plotBottom - plotTop}
            fill={selFill}
            stroke={selStroke}
            strokeWidth={1.5}
            rx={6}
          />
        )}

        {/* natural-increase gap + curves */}
        <path d={areaPath} fill="#c7d2fe" opacity={0.45} />
        <path d={deathPath} fill="none" stroke="#dc2626" strokeWidth={2.5} />
        <path d={birthPath} fill="none" stroke="#2563eb" strokeWidth={2.5} />

        {/* readout dots at the selected stage */}
        {sel && (
          <>
            <line x1={x(selected!)} x2={x(selected!)} y1={y(sel.birth)} y2={y(sel.death)} stroke={selStroke} strokeWidth={2} strokeDasharray="3 3" />
            <circle cx={x(selected!)} cy={y(sel.birth)} r={4.5} fill="#2563eb" />
            <circle cx={x(selected!)} cy={y(sel.death)} r={4.5} fill="#dc2626" />
          </>
        )}

        {/* tappable stage bands + numbered axis */}
        {STAGES.map((s) => (
          <g key={s}>
            <rect
              x={bandLeft(s)}
              y={plotTop}
              width={bandRight(s) - bandLeft(s)}
              height={plotBottom - plotTop + PAD.bottom}
              fill="transparent"
              style={{ cursor: disabled ? 'default' : 'pointer' }}
              onPointerDown={() => pick(s)}
            />
            <text
              x={x(s)}
              y={plotBottom + 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={selected === s ? 800 : 600}
              fill={selected === s ? selStroke : '#64748b'}
            >
              {s}
            </text>
          </g>
        ))}
        <text x={(PAD.left + W - PAD.right) / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">
          Tap a stage
        </text>
      </svg>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: '#2563eb' }} />
          Birth rate (CBR)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded" style={{ background: '#dc2626' }} />
          Death rate (CDR)
        </span>
      </div>

      {/* readout for the tapped stage (values only — not the stage name) */}
      {showRates && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <Stat label="CBR / 1,000" value={sel ? sel.birth.toFixed(0) : '—'} color="#2563eb" />
          <Stat label="CDR / 1,000" value={sel ? sel.death.toFixed(0) : '—'} color="#dc2626" />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col justify-center rounded-xl bg-slate-50 py-2">
      <div className="text-lg font-bold leading-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
    </div>
  );
}

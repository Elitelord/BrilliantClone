import { useEffect, useRef, useState } from 'react';
import { gapToPopColor, TREND_LABEL, trendFromGap } from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import type { MigrationFlowConfig, MigrationFlowPreset } from '../../types/content';
import type { MigrationFlowState } from '../../types/interaction';

interface Props {
  config: MigrationFlowConfig;
  onChange: (s: MigrationFlowState) => void;
  disabled?: boolean;
}

const W = 360;
const H = 130;
const POOL_CX = 180;
const POOL_CY = 58;
const POOL_W = 148;
const POOL_H = 76;
const POOL_LEFT = POOL_CX - POOL_W / 2;
const POOL_RIGHT = POOL_CX + POOL_W / 2;
const POOL_TOP = POOL_CY - POOL_H / 2;
const MIN_ARROW = 24;
const MAX_ARROW = 92;
const ARROW_Y = POOL_CY;
const STREAM_STROKE = 2.5;
const STREAM_SPACING = 12;
const ARROW_HEAD_W = 5;
const ARROW_HEAD_H = 3.5;
const HANDLE_W = 14;
const HANDLE_H = 26;

function flowFromLen(len: number, maxFlow: number): number {
  const t = (len - MIN_ARROW) / (MAX_ARROW - MIN_ARROW);
  return clamp(t * maxFlow, 0, maxFlow);
}

function lenFromFlow(flow: number, maxFlow: number): number {
  return MIN_ARROW + (clamp(flow, 0, maxFlow) / maxFlow) * (MAX_ARROW - MIN_ARROW);
}

/** Arrow count scales with flow; zero flow = no arrow lines (handle still shown). */
function streamCount(flow: number, maxFlow: number): number {
  if (flow <= 0) return 0;
  return Math.max(1, Math.min(5, Math.ceil((flow / maxFlow) * 4)));
}

function streamOffsets(count: number): number[] {
  if (count <= 1) return [0];
  const total = (count - 1) * STREAM_SPACING;
  return Array.from({ length: count }, (_, i) => -total / 2 + i * STREAM_SPACING);
}

function defaultPreset(config: MigrationFlowConfig): MigrationFlowPreset | null {
  if (!config.countryPresets?.length) return null;
  const id = config.initialPresetId ?? config.countryPresets[0].id;
  return config.countryPresets.find((p) => p.id === id) ?? config.countryPresets[0];
}

function formatSigned(n: number, decimals = 1): string {
  const rounded = n.toFixed(decimals);
  return n >= 0 ? `+${rounded}` : rounded;
}

function StreamArrowHead({
  tipX,
  y,
  direction,
  color,
}: {
  tipX: number;
  y: number;
  direction: 'right' | 'left';
  color: string;
}) {
  if (direction === 'right') {
    return (
      <polygon
        points={`${tipX},${y} ${tipX - ARROW_HEAD_W},${y - ARROW_HEAD_H} ${tipX - ARROW_HEAD_W},${y + ARROW_HEAD_H}`}
        fill={color}
      />
    );
  }
  return (
    <polygon
      points={`${tipX},${y} ${tipX + ARROW_HEAD_W},${y - ARROW_HEAD_H} ${tipX + ARROW_HEAD_W},${y + ARROW_HEAD_H}`}
      fill={color}
    />
  );
}

function FlowConnector({ color = '#94a3b8' }: { color?: string }) {
  return (
    <div
      className="flex justify-center"
      style={{ height: 36 }}
      aria-hidden="true"
    >
      <div className="flex h-full w-6 flex-col items-center">
        <div
          className="w-[2.5px] flex-1 rounded-full"
          style={{ backgroundColor: color, minHeight: 20 }}
        />
        <svg width="14" height="10" viewBox="0 0 14 10" className="shrink-0">
          <path
            d="M1 1 L7 9 L13 1"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

interface DragHandleProps {
  side: 'in' | 'out';
  outerX: number;
  active: boolean;
  color: string;
  onDown: (e: React.PointerEvent) => void;
}

function DragHandle({ side, outerX, active, color, onDown }: DragHandleProps) {
  const x = side === 'in' ? outerX : outerX - HANDLE_W;
  return (
    <g style={{ cursor: 'ew-resize' }} onPointerDown={onDown}>
      <rect
        x={x}
        y={ARROW_Y - HANDLE_H / 2}
        width={HANDLE_W}
        height={HANDLE_H}
        rx={4}
        fill="#fff"
        stroke={color}
        strokeWidth={2}
      />
      <line
        x1={x + 4}
        x2={x + 4}
        y1={ARROW_Y - 6}
        y2={ARROW_Y + 6}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <line
        x1={x + 7}
        x2={x + 7}
        y1={ARROW_Y - 6}
        y2={ARROW_Y + 6}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <line
        x1={x + 10}
        x2={x + 10}
        y1={ARROW_Y - 6}
        y2={ARROW_Y + 6}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      {active && (
        <rect
          x={x - 1}
          y={ARROW_Y - HANDLE_H / 2 - 1}
          width={HANDLE_W + 2}
          height={HANDLE_H + 2}
          rx={5}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.35}
        />
      )}
    </g>
  );
}

export default function MigrationFlow({ config, onChange, disabled }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const maxFlow = config.maxFlow ?? 20;
  const presets = config.countryPresets;
  const hasPresets = presets && presets.length > 0;

  const [presetId, setPresetId] = useState(
    () => defaultPreset(config)?.id ?? 'default',
  );
  const activePreset = hasPresets
    ? presets!.find((p) => p.id === presetId) ?? presets![0]
    : null;

  const birthRate = activePreset?.birthRate ?? config.birthRate;
  const deathRate = activePreset?.deathRate ?? config.deathRate;
  const naturalChange = activePreset
    ? activePreset.birthRate - activePreset.deathRate
    : config.naturalChange;
  const poolLabel = activePreset?.label ?? config.countryLabel ?? 'Population';
  const nirColor = naturalChange >= 0 ? '#15803d' : '#b91c1c';

  const [inMigration, setInMigration] = useState(config.initialIn ?? 4);
  const [outMigration, setOutMigration] = useState(config.initialOut ?? 4);
  const [drag, setDrag] = useState<'in' | 'out' | null>(null);

  const netMigration = inMigration - outMigration;
  const totalChange = naturalChange + netMigration;
  const trend = trendFromGap(totalChange);

  const emit = (inVal: number, outVal: number, pid?: string) => {
    const preset =
      pid && presets ? presets.find((p) => p.id === pid) : activePreset;
    const nir = preset ? preset.birthRate - preset.deathRate : config.naturalChange;
    const net = inVal - outVal;
    const total = nir + net;
    onChangeRef.current({
      inMigration: inVal,
      outMigration: outVal,
      netMigration: net,
      totalChange: total,
      trend: trendFromGap(total),
      presetId: pid ?? presetId,
    });
  };

  useEffect(() => {
    emit(inMigration, outMigration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickPreset = (id: string) => {
    if (disabled || config.lockCountry) return;
    setPresetId(id);
    emit(inMigration, outMigration, id);
  };

  const inLen = lenFromFlow(inMigration, maxFlow);
  const outLen = lenFromFlow(outMigration, maxFlow);
  const inOuterX = POOL_LEFT - inLen;
  const outOuterX = POOL_RIGHT + outLen;
  const inStreams = streamCount(inMigration, maxFlow);
  const outStreams = streamCount(outMigration, maxFlow);

  const onDown = (which: 'in' | 'out') => (e: React.PointerEvent) => {
    if (disabled) return;
    setDrag(which);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag || disabled || !svgRef.current) return;
    const { x } = clientToSvg(svgRef.current, e.clientX, 0);

    if (drag === 'in') {
      const len = clamp(POOL_LEFT - x, MIN_ARROW, MAX_ARROW);
      const nextIn = flowFromLen(len, maxFlow);
      setInMigration(nextIn);
      emit(nextIn, outMigration);
    } else {
      const len = clamp(x - POOL_RIGHT, MIN_ARROW, MAX_ARROW);
      const nextOut = flowFromLen(len, maxFlow);
      setOutMigration(nextOut);
      emit(inMigration, nextOut);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    setDrag(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const showTrendLabel = config.showVerdict !== false;
  const verdictColor = gapToPopColor(totalChange);

  const renderStreams = (side: 'in' | 'out', outerX: number, count: number) => {
    if (count === 0) return null;
    const offsets = streamOffsets(count);

    return offsets.map((dy, i) => {
      const y = ARROW_Y + dy;

      if (side === 'in') {
        const lineStart = outerX + HANDLE_W + 2;
        const tipX = POOL_LEFT - 2;
        const lineEndX = tipX - ARROW_HEAD_W;
        return (
          <g key={`in-${i}`}>
            <line
              x1={lineStart}
              x2={lineEndX}
              y1={y}
              y2={y}
              stroke="#16a34a"
              strokeWidth={STREAM_STROKE}
              strokeLinecap="round"
            />
            <StreamArrowHead tipX={tipX} y={y} direction="right" color="#16a34a" />
          </g>
        );
      }

      const tipX = outerX - HANDLE_W - 2;
      const lineEndX = tipX - ARROW_HEAD_W;
      return (
        <g key={`out-${i}`}>
          <line
            x1={POOL_RIGHT + 3}
            x2={lineEndX}
            y1={y}
            y2={y}
            stroke="#dc2626"
            strokeWidth={STREAM_STROKE}
            strokeLinecap="round"
          />
          <StreamArrowHead tipX={tipX} y={y} direction="right" color="#dc2626" />
        </g>
      );
    });
  };

  return (
    <div className="w-full select-none">
      {hasPresets && !config.lockCountry && (
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {presets!.map((p) => {
            const picked = p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => pickPreset(p.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  picked
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                }`}
              >
                {p.flag ? `${p.flag} ` : ''}{p.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[360px] flex-col gap-0">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800/70">
          Natural increase (NIR)
        </div>
        {birthRate != null && deathRate != null && (
          <div className="mt-1 text-sm text-slate-600">
            Births <span className="font-semibold text-slate-800">{birthRate}</span>
            {' − '}
            Deaths <span className="font-semibold text-slate-800">{deathRate}</span>
            <span className="text-slate-400"> per 1,000</span>
          </div>
        )}
        <div
          className="mt-2 text-4xl font-bold tabular-nums tracking-tight"
          style={{ color: nirColor }}
        >
          {formatSigned(naturalChange)}
        </div>
      </div>

      <FlowConnector color={nirColor} />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ maxHeight: 'min(180px, 32vh)' }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        role="img"
        aria-label="Migration flow diagram"
      >
        {renderStreams('in', inOuterX, inStreams)}
        {renderStreams('out', outOuterX, outStreams)}

        <rect
          x={POOL_LEFT}
          y={POOL_TOP}
          width={POOL_W}
          height={POOL_H}
          rx={14}
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth={2}
        />
        <text x={POOL_CX} y={POOL_CY - 2} textAnchor="middle" fontSize={14} fill="#334155" fontWeight={700}>
          {poolLabel}
        </text>
        <text x={POOL_CX} y={POOL_CY + 16} textAnchor="middle" fontSize={10} fill="#94a3b8">
          migration streams
        </text>

        {!disabled && (
          <>
            <DragHandle
              side="in"
              outerX={inOuterX}
              active={drag === 'in'}
              color="#16a34a"
              onDown={onDown('in')}
            />
            <DragHandle
              side="out"
              outerX={outOuterX}
              active={drag === 'out'}
              color="#dc2626"
              onDown={onDown('out')}
            />
          </>
        )}

        <text x={inOuterX + HANDLE_W / 2} y={ARROW_Y - 38} textAnchor="middle" fontSize={9} fill="#15803d" fontWeight={600}>
          In-migration
        </text>
        <text x={inOuterX + HANDLE_W / 2} y={ARROW_Y + 42} textAnchor="middle" fontSize={11} fill="#15803d" fontWeight={700}>
          {formatSigned(inMigration)}
        </text>

        <text x={outOuterX - HANDLE_W / 2} y={ARROW_Y - 38} textAnchor="middle" fontSize={9} fill="#b91c1c" fontWeight={600}>
          Out-migration
        </text>
        <text x={outOuterX - HANDLE_W / 2} y={ARROW_Y + 42} textAnchor="middle" fontSize={11} fill="#b91c1c" fontWeight={700}>
          −{outMigration.toFixed(1)}
        </text>
      </svg>

      <FlowConnector color={verdictColor} />

      <div
        className="rounded-2xl border-2 px-5 py-4 text-center"
        style={{ borderColor: verdictColor, background: `${verdictColor}10` }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Total population change
        </div>
        <div
          className="mt-1 text-4xl font-bold tabular-nums tracking-tight"
          style={{ color: verdictColor }}
        >
          {formatSigned(totalChange)}
        </div>
        {showTrendLabel && (
          <div className="mt-1 text-lg font-bold" style={{ color: verdictColor }}>
            {TREND_LABEL[trend]}
          </div>
        )}
        <div className="mt-2 text-sm text-slate-600">
          Natural increase ({formatSigned(naturalChange)})
          {' + '}
          net migration ({formatSigned(netMigration)})
        </div>
      </div>
      </div>
    </div>
  );
}

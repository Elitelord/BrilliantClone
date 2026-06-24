import { useEffect, useRef, useState } from 'react';
import { classifyPyramidControls, formatPyramidStageGuess, impliedStageFromControls, STAGE_CHIP_STYLE, STAGE_EXAMPLE_COUNTRY, STAGE_PYRAMID_PROFILES } from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import { pyramidControlOk } from '../../lib/validators';
import type { PyramidAnswer, PyramidConfig, ValidationResult } from '../../types/content';
import type { PyramidState } from '../../types/interaction';

interface Props {
  config: PyramidConfig;
  onChange: (s: PyramidState) => void;
  disabled?: boolean;
  answer?: PyramidAnswer;
  result?: ValidationResult | null;
}

const W = 320;
const H = 320;
const PAD = { top: 20, bottom: 32 };
const ILLUST_OFFSET = 36;
const CX = W / 2;
const N = 9;
const GAP = 3;
const MAX_HALF = CX - 26;
const CENTER_GAP = 10;

const CONTROL_COHORTS = [0, 3, 6, 8] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function controlsFromConfig(config: PyramidConfig): [number, number, number, number] {
  if (config.initialWidths) return config.initialWidths;
  const base = config.initialBaseWidth ?? 0.5;
  const top = config.initialTopWidth ?? 0.4;
  return [base, lerp(base, top, 0.33), lerp(base, top, 0.66), top];
}

function widthsFromControls(controls: number[]): number[] {
  const widths: number[] = [];
  for (let cohort = 0; cohort < N; cohort++) {
    let seg = 0;
    while (seg < CONTROL_COHORTS.length - 1 && cohort > CONTROL_COHORTS[seg + 1]) seg++;
    const c0 = CONTROL_COHORTS[seg];
    const c1 = CONTROL_COHORTS[seg + 1];
    const t = c1 === c0 ? 0 : (cohort - c0) / (c1 - c0);
    widths.push(lerp(controls[seg], controls[seg + 1], t));
  }
  return widths;
}

export default function PopulationPyramid({ config, onChange, disabled, answer, result }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isClassify = config.mode === 'classify';
  const isIllustrate = config.illustrate === true;
  const presetBase = config.preset?.baseWidth ?? 0.6;
  const presetTop = config.preset?.topWidth ?? 0.3;

  const [controls, setControls] = useState<[number, number, number, number]>(() =>
    isClassify ? [presetBase, presetBase, presetTop, presetTop] : controlsFromConfig(config),
  );
  const [selectedStage, setSelectedStage] = useState<number | undefined>(undefined);
  const [drag, setDrag] = useState<number | null>(null);

  const emit = (ctrl: [number, number, number, number], sel?: number) => {
    const guessed = impliedStageFromControls(ctrl);
    onChangeRef.current({
      baseWidth: ctrl[0],
      topWidth: ctrl[3],
      controlWidths: ctrl,
      impliedStage: guessed ?? 0,
      selectedStage: sel,
    });
  };

  useEffect(() => {
    if (isClassify) emit([presetBase, presetBase, presetTop, presetTop], selectedStage);
    else emit(controls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const halfFromPointer = (clientX: number): number => {
    if (!svgRef.current) return 0;
    const { x } = clientToSvg(svgRef.current, clientX, 0);
    const localX = isIllustrate ? x - ILLUST_OFFSET : x;
    return clamp((CX - localX) / MAX_HALF, 0.08, 1);
  };

  const onDown = (idx: number) => (e: React.PointerEvent) => {
    if (disabled || isClassify || isIllustrate) return;
    setDrag(idx);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag == null || disabled) return;
    const v = halfFromPointer(e.clientX);
    const next = [...controls] as [number, number, number, number];
    next[drag] = v;
    setControls(next);
    emit(next, isClassify ? selectedStage : undefined);
  };
  const onUp = (e: React.PointerEvent) => {
    setDrag(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const rowH = (H - PAD.top - PAD.bottom - GAP * (N - 1)) / N;
  const plotBottom = H - PAD.bottom;
  const plotTop = PAD.top;

  const cohortWidths = isClassify
    ? Array.from({ length: N }, (_, i) => lerp(presetBase, presetTop, i / (N - 1)) * MAX_HALF)
    : widthsFromControls(controls).map((w) => w * MAX_HALF);

  const cohortToY = (cohort: number) => {
    const rowIdx = N - 1 - cohort;
    return plotTop + rowIdx * (rowH + GAP) + rowH / 2;
  };

  const showHandles = !isClassify && !disabled && !isIllustrate;
  const showExploreChip = config.showStagePicker && !isClassify && !isIllustrate;
  const showStagePresets = config.showStagePresets && !isClassify && !isIllustrate;
  const twoCol = showStagePresets;
  const stageGuess = classifyPyramidControls(controls);
  const chipLabel = formatPyramidStageGuess(stageGuess);
  const chipStage = stageGuess.kind === 'one' ? stageGuess.stage : null;
  const chipStyle = chipStage ? STAGE_CHIP_STYLE[chipStage] : null;
  const exampleCountry =
    stageGuess.kind === 'one' ? STAGE_EXAMPLE_COUNTRY[stageGuess.stage] : null;

  const applyStagePreset = (stage: number) => {
    const profile = STAGE_PYRAMID_PROFILES[stage];
    if (!profile || disabled) return;
    const next = [...profile] as [number, number, number, number];
    setControls(next);
    emit(next);
  };
  const showStatus = !!result;
  const isWrong = showStatus && !result?.correct;

  const controlOk = (idx: number): boolean | null => {
    if (!showStatus || !answer?.targetWidths) return null;
    if (result?.correct) return true;
    return pyramidControlOk(controls, answer, idx);
  };

  const svgW = isIllustrate ? W + ILLUST_OFFSET : W;
  const midY = (plotTop + plotBottom) / 2;
  // Keep the pyramid hugging its rendered size so it can sit centered in the card.
  // Slightly larger than the shared max-h-chart token since this card has room.
  const pyramidMaxH = 'clamp(210px, 50vh, 460px)';
  const pyramidMaxW = `calc(${pyramidMaxH} * ${svgW / H})`;

  return (
    <div className="w-full select-none">
      <div className={twoCol ? 'lg:flex lg:items-center lg:gap-4' : ''}>
      {showExploreChip ? (
        <div className={twoCol ? 'mb-3 lg:mb-0 lg:flex-1' : 'mb-3'}>
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Your shape reads as</span>
              <span
                className="rounded-full border px-3 py-1 text-sm font-bold shadow-sm"
                style={
                  chipStyle
                    ? { background: chipStyle.bg, color: chipStyle.text, borderColor: chipStyle.border }
                    : { background: '#e2e8f0', color: '#475569', borderColor: '#cbd5e1' }
                }
              >
                {chipLabel}
              </span>
            </div>
            {exampleCountry && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Most similar country</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                  {exampleCountry}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        twoCol && <div className="hidden lg:block lg:flex-1" aria-hidden="true" />
      )}
      <div className="mx-auto w-full" style={twoCol ? { maxWidth: pyramidMaxW } : undefined}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${H}`}
        className="max-h-chart w-full touch-none"
        style={twoCol ? { maxHeight: pyramidMaxH } : undefined}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        role="img"
        aria-label="Population pyramid"
      >
        <defs>
          <marker id="pyramid-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#64748b" />
          </marker>
        </defs>

        {isIllustrate && (
          <g>
            {/* Age axis — young at bottom, old at top */}
            <line
              x1={14}
              x2={14}
              y1={plotBottom}
              y2={plotTop + 8}
              stroke="#64748b"
              strokeWidth={1.5}
              markerEnd="url(#pyramid-arrow)"
            />
            <text x={14} y={plotBottom + 14} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight={600}>
              Young
            </text>
            <text x={14} y={plotTop - 2} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight={600}>
              Old
            </text>
            <text
              x={8}
              y={midY}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
              fontWeight={600}
              transform={`rotate(-90, 8, ${midY})`}
            >
              Age
            </text>
          </g>
        )}

        <g transform={isIllustrate ? `translate(${ILLUST_OFFSET}, 0)` : undefined}>
          {Array.from({ length: N }).map((_, idx) => {
            const cohort = N - 1 - idx;
            const yTop = plotTop + idx * (rowH + GAP);
            const half = cohortWidths[cohort];
            return (
              <g key={cohort}>
                <rect
                  x={CX - CENTER_GAP - half}
                  y={yTop}
                  width={half}
                  height={rowH}
                  rx={2}
                  fill="#3b82f6"
                  opacity={0.85}
                />
                <rect
                  x={CX + CENTER_GAP}
                  y={yTop}
                  width={half}
                  height={rowH}
                  rx={2}
                  fill="#ec4899"
                  opacity={0.85}
                />
              </g>
            );
          })}

          <line x1={CX} x2={CX} y1={plotTop} y2={plotBottom} stroke="#cbd5e1" strokeWidth={1} />

          <text
            x={CX - CENTER_GAP - 2}
            y={plotBottom + 16}
            textAnchor="end"
            fontSize={9}
            fill="#3b82f6"
            fontWeight={600}
          >
            Male
          </text>
          <text
            x={CX + CENTER_GAP + 2}
            y={plotBottom + 16}
            textAnchor="start"
            fontSize={9}
            fill="#ec4899"
            fontWeight={600}
          >
            Female
          </text>

          {!isIllustrate && (
            <>
              <text x={6} y={plotTop + 6} fontSize={8} fill="#94a3b8">Old</text>
              <text x={6} y={plotBottom - 2} fontSize={8} fill="#94a3b8">Young</text>
            </>
          )}

          {showHandles &&
            CONTROL_COHORTS.map((cohort, idx) => {
              const half = cohortWidths[cohort];
              const ok = controlOk(idx);
              return (
                <Handle
                  key={cohort}
                  cx={CX - CENTER_GAP - half}
                  cy={cohortToY(cohort)}
                  active={drag === idx}
                  ok={ok}
                  onDown={onDown(idx)}
                />
              );
            })}

          {config.preset?.label && (
            <text x={CX} y={H - 4} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={700}>
              {config.preset.label}
            </text>
          )}
        </g>
      </svg>

      {isIllustrate && config.caption && (
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{config.caption}</p>
      )}
      </div>
      <div className={twoCol ? 'mt-3 lg:mt-0 lg:flex-1 lg:flex lg:justify-end' : ''}>
      {showStagePresets && (
        <div>
          <div className="mb-2 text-center text-xs font-medium text-slate-500">
            Tap a stage to see its typical pyramid shape
          </div>
          <div className="flex justify-center gap-2 lg:flex-col lg:items-center">
            {[1, 2, 3, 4, 5].map((s) => {
              const style = STAGE_CHIP_STYLE[s];
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyStagePreset(s)}
                  className="h-10 min-w-[2.5rem] rounded-xl border-2 px-2 text-sm font-bold transition disabled:opacity-50"
                  style={{
                    background: style.bg,
                    color: style.text,
                    borderColor: style.border,
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
      </div>

      {isClassify && (
        <div className="mt-3">
          <div className="mb-2 text-center text-sm font-medium text-slate-500">Which DTM stage?</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => {
              const picked = selectedStage === s;
              let btnClass = 'border-slate-200 bg-white text-slate-600 hover:border-brand-300';
              if (picked && !showStatus) btnClass = 'border-brand-600 bg-brand-600 text-white';
              if (picked && showStatus && result?.correct) btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800';
              if (picked && isWrong) btnClass = 'border-amber-400 bg-amber-50 text-amber-800';
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedStage(s);
                    emit([presetBase, presetBase, presetTop, presetTop], s);
                  }}
                  className={`h-11 w-11 rounded-xl border-2 text-base font-bold transition disabled:opacity-60 ${btnClass}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Handle({
  cx,
  cy,
  active,
  ok,
  onDown,
}: {
  cx: number;
  cy: number;
  active: boolean;
  ok: boolean | null;
  onDown: (e: React.PointerEvent) => void;
}) {
  const ring = ok === null ? '#4f46e5' : ok ? '#16a34a' : '#f59e0b';
  return (
    <g style={{ cursor: 'ew-resize' }} onPointerDown={onDown}>
      <circle cx={cx} cy={cy} r={active ? 18 : 16} fill="#fff" stroke={ring} strokeWidth={3} opacity={0.98} />
      {ok !== null && (
        <circle cx={cx} cy={cy} r={3.6} fill={ok ? '#16a34a' : '#f59e0b'} pointerEvents="none" />
      )}
      {ok === null && (
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize={9} fill="#4f46e5" fontWeight={700} pointerEvents="none">
          ↔
        </text>
      )}
    </g>
  );
}

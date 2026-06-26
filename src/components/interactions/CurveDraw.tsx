import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line, area, curveMonotoneX } from 'd3-shape';
import { STAGE_MIN, STAGE_MAX, RATE_MAX } from '../../lib/dtm';
import { clientToSvg, clamp } from '../../lib/svg';
import { curveDrawPointOk } from '../../lib/validators';
import type { CurveDrawConfig, CurveDrawAnswer, ValidationResult } from '../../types/content';
import type { CurveDrawState } from '../../types/interaction';

interface Props {
  config: CurveDrawConfig;
  onChange: (s: CurveDrawState) => void;
  disabled?: boolean;
  answer?: CurveDrawAnswer;
  result?: ValidationResult | null;
}

const W = 360;
const H = 250;
const PAD = { top: 16, right: 26, bottom: 34, left: 38 };

const STAGES = [1, 2, 3, 4, 5];
const x = scaleLinear().domain([STAGE_MIN, STAGE_MAX]).range([PAD.left, W - PAD.right]);
const y = scaleLinear().domain([0, RATE_MAX]).range([H - PAD.bottom, PAD.top]);

type Curve = 'birth' | 'death';
const COLOR: Record<Curve, string> = { birth: '#2563eb', death: '#dc2626' };

const defaultStart = () => [28, 28, 28, 28, 28];

export default function CurveDraw({ config, onChange, disabled, answer, result }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const enabled = config.curves;
  const [birth, setBirth] = useState<number[]>(config.initial?.birth ?? defaultStart());
  const [death, setDeath] = useState<number[]>(config.initial?.death ?? defaultStart());
  const active = useRef<{ curve: Curve; index: number } | null>(null);

  const stateRef = useRef({ birth, death });
  stateRef.current = { birth, death };

  useEffect(() => {
    onChangeRef.current({ birth: stateRef.current.birth, death: stateRef.current.death });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathFor = useMemo(() => {
    const gen = line<{ s: number; v: number }>()
      .x((d) => x(d.s))
      .y((d) => y(d.v))
      .curve(curveMonotoneX);
    const areaGen = area<{ s: number; b: number; d: number }>()
      .x((d) => x(d.s))
      .y0((d) => y(d.d))
      .y1((d) => y(d.b))
      .curve(curveMonotoneX);
    return { gen, areaGen };
  }, []);

  const valueFromPointer = (clientY: number): number => {
    if (!svgRef.current) return 0;
    const { y: localY } = clientToSvg(svgRef.current, 0, clientY);
    return Math.round(clamp(y.invert(localY), 0, RATE_MAX));
  };

  const emit = (b: number[], d: number[]) => onChangeRef.current({ birth: b, death: d });

  const handleDown = (curve: Curve, index: number) => (e: React.PointerEvent) => {
    if (disabled) return;
    active.current = { curve, index };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!active.current || disabled) return;
    const v = valueFromPointer(e.clientY);
    const { curve, index } = active.current;
    const cur = stateRef.current;
    if (curve === 'birth') {
      const next = [...cur.birth];
      next[index] = v;
      setBirth(next);
      emit(next, cur.death);
    } else {
      const next = [...cur.death];
      next[index] = v;
      setDeath(next);
      emit(cur.birth, next);
    }
  };
  const handleUp = (e: React.PointerEvent) => {
    active.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const showBoth = enabled.includes('birth') && enabled.includes('death');

  // After a check, mark each point: green = within tolerance (leave it),
  // amber = still off (adjust it). Cleared as soon as the learner drags again.
  const showStatus = !!result;
  const pointOk = (curve: Curve, i: number): boolean | null => {
    if (!showStatus || !answer) return null;
    if (curve === 'birth' && !answer.birth) return null;
    if (curve === 'death' && !answer.death) return null;
    return curveDrawPointOk(curve, death, birth, answer, i);
  };

  return (
    <div className="w-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="max-h-chart w-full touch-none"
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        role="img"
        aria-label={`Draw the rate curves across the five points along the ${config.xLabel ?? 'DTM Stage'} axis`}
      >
        {/* y grid */}
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#eef2f7" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">
              {v}
            </text>
          </g>
        ))}

        {/* stage (or custom time) separators + labels */}
        {STAGES.map((s, i) => (
          <g key={s}>
            <line x1={x(s)} x2={x(s)} y1={PAD.top} y2={H - PAD.bottom} stroke="#f1f5f9" strokeWidth={1} />
            <text x={x(s)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={600}>
              {config.xTicks?.[i] ?? s}
            </text>
          </g>
        ))}
        <text x={(PAD.left + W - PAD.right) / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">
          {config.xLabel ?? 'DTM Stage'}
        </text>

        {/* faint reference curves (already-built or given for context) */}
        {(['birth', 'death'] as Curve[]).map((curve) => {
          const ref = config.referenceCurves?.[curve];
          if (!ref) return null;
          return (
            <path
              key={`ref-${curve}`}
              d={pathFor.gen(STAGES.map((s, i) => ({ s, v: ref[i] }))) ?? ''}
              fill="none"
              stroke={COLOR[curve]}
              strokeWidth={2}
              strokeDasharray="4 4"
              opacity={0.4}
            />
          );
        })}

        {/* shaded gap when both curves are present */}
        {showBoth && (
          <path
            d={pathFor.areaGen(STAGES.map((s, i) => ({ s, b: birth[i], d: death[i] }))) ?? ''}
            fill="#c7d2fe"
            opacity={0.4}
          />
        )}

        {/* curves + draggable points */}
        {enabled.map((curve) => {
          const vals = curve === 'birth' ? birth : death;
          return (
            <g key={curve}>
              <path
                d={pathFor.gen(STAGES.map((s, i) => ({ s, v: vals[i] }))) ?? ''}
                fill="none"
                stroke={COLOR[curve]}
                strokeWidth={2.5}
              />
              {STAGES.map((s, i) => {
                const ok = pointOk(curve, i);
                const ring = ok === null ? COLOR[curve] : ok ? '#16a34a' : '#f59e0b';
                return (
                  <g key={s}>
                    <circle
                      cx={x(s)}
                      cy={y(vals[i])}
                      r={16}
                      fill="#fff"
                      stroke={ring}
                      strokeWidth={3}
                      pointerEvents="none"
                    />
                    {ok !== null && (
                      <circle cx={x(s)} cy={y(vals[i])} r={5} fill={ok ? '#16a34a' : '#f59e0b'} pointerEvents="none" />
                    )}
                    {/* invisible enlarged hit area for easier touch dragging */}
                    <circle
                      cx={x(s)}
                      cy={y(vals[i])}
                      r={22}
                      fill="transparent"
                      style={{ cursor: disabled ? 'default' : 'ns-resize' }}
                      pointerEvents={disabled ? 'none' : 'all'}
                      onPointerDown={handleDown(curve, i)}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        {enabled.includes('birth') && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: COLOR.birth }} />
            Birth rate (CBR)
          </span>
        )}
        {enabled.includes('death') && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: COLOR.death }} />
            Death rate (CDR)
          </span>
        )}
      </div>
      <p className="mt-1 text-center text-xs text-slate-400">
        {showStatus && !result?.correct
          ? 'Green points are right — nudge the amber ones into place.'
          : 'Drag each point up or down to shape the curves.'}
      </p>
    </div>
  );
}

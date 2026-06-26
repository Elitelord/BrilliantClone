import { useEffect, useRef, useState } from 'react';
import { clientToSvg, clamp } from '../../lib/svg';
import type { AnomalyPyramidAnswer, AnomalyPyramidConfig, ValidationResult } from '../../types/content';
import type { AnomalyPyramidState } from '../../types/interaction';

interface Props {
  config: AnomalyPyramidConfig;
  onChange: (s: AnomalyPyramidState) => void;
  disabled?: boolean;
  answer?: AnomalyPyramidAnswer;
  result?: ValidationResult | null;
}

const W = 320;
const H = 320;
const PAD = { top: 20, bottom: 32 };
const CX = W / 2;
const N = 9;
const GAP = 3;
const MAX_HALF = CX - 26;
const CENTER_GAP = 10;

type CohortTuple = [number, number, number, number, number, number, number, number, number];

function cohortsFromShape(shape: AnomalyPyramidConfig['shapes'][0]): {
  male: CohortTuple;
  female: CohortTuple;
} {
  const male = shape.maleCohorts ?? shape.cohorts;
  const female = shape.femaleCohorts ?? shape.cohorts;
  return { male: [...male] as CohortTuple, female: [...female] as CohortTuple };
}

export default function AnomalyPyramid({
  config,
  onChange,
  disabled,
  answer,
  result,
}: Props) {
  const shapes = config.shapes;
  const defaultId = config.initialShapeId ?? shapes[0]?.id ?? '';
  const isAdjust = config.mode === 'adjust';
  const showCaption = config.showCaption !== false && !isAdjust;

  const [selectedId, setSelectedId] = useState(defaultId);
  const [dragCohort, setDragCohort] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const active = shapes.find((s) => s.id === selectedId) ?? shapes[0];
  const activeCohorts = cohortsFromShape(
    active ?? {
      id: '',
      label: '',
      cohorts: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
      caption: '',
    },
  );

  const [maleCohorts, setMaleCohorts] = useState<CohortTuple>(() => activeCohorts.male);
  const [femaleCohorts, setFemaleCohorts] = useState<CohortTuple>(() => activeCohorts.female);

  const femaleRatio = activeCohorts.male.map((m, i) => (m > 0 ? activeCohorts.female[i] / m : 1));

  const displayMale = isAdjust ? maleCohorts : activeCohorts.male;
  const displayFemale = isAdjust ? femaleCohorts : activeCohorts.female;

  const emit = (male: CohortTuple, female: CohortTuple, id?: string) => {
    onChangeRef.current({
      selectedId: id ?? selectedId,
      seen: true,
      maleCohorts: male,
      femaleCohorts: female,
    });
  };

  useEffect(() => {
    if (isAdjust) emit(maleCohorts, femaleCohorts, active?.id);
    else onChangeRef.current({ selectedId: active?.id, seen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowH = (H - PAD.top - PAD.bottom - GAP * (N - 1)) / N;
  const plotBottom = H - PAD.bottom;
  const plotTop = PAD.top;

  const maleWidths = displayMale.map((w) => w * MAX_HALF);
  const femaleWidths = displayFemale.map((w) => w * MAX_HALF);

  const pyramidMaxH = 'clamp(210px, 50vh, 460px)';
  const pyramidMaxW = `calc(${pyramidMaxH} * ${W / H})`;

  const pickShape = (id: string) => {
    if (disabled || isAdjust) return;
    setSelectedId(id);
    onChange({ selectedId: id, seen: true });
  };

  const cohortToY = (cohort: number) => {
    const rowIdx = N - 1 - cohort;
    return plotTop + rowIdx * (rowH + GAP) + rowH / 2;
  };

  const halfFromPointer = (clientX: number): number => {
    if (!svgRef.current) return 0;
    const { x } = clientToSvg(svgRef.current, clientX, 0);
    return clamp((CX - CENTER_GAP - x) / MAX_HALF, 0.08, 1);
  };

  const setCohortWidth = (cohort: number, maleW: number) => {
    const nextMale = [...maleCohorts] as CohortTuple;
    const nextFemale = [...femaleCohorts] as CohortTuple;
    nextMale[cohort] = maleW;
    nextFemale[cohort] = clamp(maleW * femaleRatio[cohort], 0.08, 1);
    setMaleCohorts(nextMale);
    setFemaleCohorts(nextFemale);
    emit(nextMale, nextFemale);
  };

  const onDown = (cohort: number) => (e: React.PointerEvent) => {
    if (disabled || !isAdjust) return;
    setDragCohort(cohort);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (dragCohort == null || disabled) return;
    setCohortWidth(dragCohort, halfFromPointer(e.clientX));
  };

  const onUp = (e: React.PointerEvent) => {
    setDragCohort(null);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const showStatus = !!result && isAdjust;
  const cohortOk = (cohort: number): boolean | null => {
    if (!showStatus || !answer) return null;
    if (result?.correct) return true;
    const tol = answer.tolerance ?? 0.14;
    const mOk = Math.abs(maleCohorts[cohort] - answer.maleCohorts[cohort]) <= tol;
    const fOk = Math.abs(femaleCohorts[cohort] - answer.femaleCohorts[cohort]) <= tol;
    return mOk && fOk;
  };

  return (
    <div className="w-full select-none">
      {config.selectable && shapes.length > 1 && !isAdjust && (
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {shapes.map((shape) => {
            const picked = shape.id === selectedId;
            return (
              <button
                key={shape.id}
                type="button"
                disabled={disabled}
                onClick={() => pickShape(shape.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  picked
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                }`}
              >
                {shape.label}
              </button>
            );
          })}
        </div>
      )}

      {showCaption && active?.caption && (
        <p className="mb-3 text-center text-sm leading-snug text-slate-600">{active.caption}</p>
      )}

      {isAdjust && (
        <p className="mb-2 text-center text-xs font-medium text-slate-500">
          Drag each row’s handle — nine age cohorts, young at bottom
        </p>
      )}

      <div className="mx-auto w-full" style={{ maxWidth: pyramidMaxW }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="max-h-chart w-full touch-none"
          style={{ maxHeight: pyramidMaxH }}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          role="img"
          aria-label={active?.label ?? 'Population pyramid anomaly'}
        >
          {Array.from({ length: N }).map((_, idx) => {
            const cohort = N - 1 - idx;
            const yTop = plotTop + idx * (rowH + GAP);
            const maleHalf = maleWidths[cohort];
            const femaleHalf = femaleWidths[cohort];
            const ok = cohortOk(cohort);
            const ring = ok === null ? '#4f46e5' : ok ? '#16a34a' : '#f59e0b';
            return (
              <g key={cohort}>
                <rect
                  x={CX - CENTER_GAP - maleHalf}
                  y={yTop}
                  width={maleHalf}
                  height={rowH}
                  rx={2}
                  fill="#3b82f6"
                  opacity={0.85}
                />
                <rect
                  x={CX + CENTER_GAP}
                  y={yTop}
                  width={femaleHalf}
                  height={rowH}
                  rx={2}
                  fill="#ec4899"
                  opacity={0.85}
                />
                {isAdjust && !disabled && (
                  <g style={{ cursor: 'ew-resize' }} onPointerDown={onDown(cohort)}>
                    <circle
                      cx={CX - CENTER_GAP - maleHalf}
                      cy={cohortToY(cohort)}
                      r={dragCohort === cohort ? 14 : 12}
                      fill="#fff"
                      stroke={ring}
                      strokeWidth={2.5}
                    />
                  </g>
                )}
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
          <text x={6} y={plotTop + 6} fontSize={8} fill="#94a3b8">Old</text>
          <text x={6} y={plotBottom - 2} fontSize={8} fill="#94a3b8">Young</text>

          {active?.label && !isAdjust && (
            <text x={CX} y={H - 4} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={700}>
              {active.label}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}

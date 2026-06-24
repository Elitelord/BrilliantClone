const N = 9;
const GAP = 2;
const CONTROL_COHORTS = [0, 3, 6, 8] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function widthsFromControls(controls: [number, number, number, number]): number[] {
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

interface Props {
  baseWidth?: number;
  topWidth?: number;
  widths?: [number, number, number, number];
  width?: number;
  height?: number;
}

/** Small read-only pyramid thumbnail for multiple-choice options. */
export default function PyramidMini({
  baseWidth,
  topWidth,
  widths,
  width = 100,
  height = 80,
}: Props) {
  const pad = { top: 4, bottom: 10, left: 4, right: 4 };
  const cx = width / 2;
  const maxHalf = cx - 14;
  const centerGap = 5;
  const rowH = (height - pad.top - pad.bottom - GAP * (N - 1)) / N;

  const normWidths = widths
    ? widthsFromControls(widths)
    : Array.from({ length: N }, (_, i) =>
        lerp(baseWidth ?? 0.5, topWidth ?? 0.4, i / (N - 1)),
      );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      {Array.from({ length: N }).map((_, idx) => {
        const cohort = N - 1 - idx;
        const yTop = pad.top + idx * (rowH + GAP);
        const half = normWidths[cohort] * maxHalf;
        return (
          <g key={cohort}>
            <rect
              x={cx - centerGap - half}
              y={yTop}
              width={half}
              height={rowH}
              rx={1}
              fill="#3b82f6"
              opacity={0.9}
            />
            <rect
              x={cx + centerGap}
              y={yTop}
              width={half}
              height={rowH}
              rx={1}
              fill="#ec4899"
              opacity={0.9}
            />
          </g>
        );
      })}
      <line x1={cx} x2={cx} y1={pad.top} y2={height - pad.bottom} stroke="#e2e8f0" strokeWidth={0.75} />
    </svg>
  );
}

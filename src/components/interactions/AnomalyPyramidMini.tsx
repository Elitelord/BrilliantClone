import type { AnomalyPyramidShape } from '../../types/content';
import { ANOMALY_PYRAMIDS_BY_ID } from '../../lib/dtm';

const N = 9;
const GAP = 2;

interface Props {
  shapeId?: string;
  shape?: AnomalyPyramidShape;
  width?: number;
  height?: number;
}

export default function AnomalyPyramidMini({ shapeId, shape, width = 88, height = 72 }: Props) {
  const resolved = shape ?? (shapeId ? ANOMALY_PYRAMIDS_BY_ID[shapeId] : undefined);
  if (!resolved) return null;

  const pad = { top: 4, bottom: 8, left: 4, right: 4 };
  const cx = width / 2;
  const maxHalf = cx - 12;
  const centerGap = 4;
  const rowH = (height - pad.top - pad.bottom - GAP * (N - 1)) / N;

  const male = resolved.maleCohorts ?? resolved.cohorts;
  const female = resolved.femaleCohorts ?? resolved.cohorts;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      {Array.from({ length: N }).map((_, idx) => {
        const cohort = N - 1 - idx;
        const yTop = pad.top + idx * (rowH + GAP);
        const maleHalf = male[cohort] * maxHalf;
        const femaleHalf = female[cohort] * maxHalf;
        return (
          <g key={cohort}>
            <rect
              x={cx - centerGap - maleHalf}
              y={yTop}
              width={maleHalf}
              height={rowH}
              rx={1}
              fill="#3b82f6"
              opacity={0.9}
            />
            <rect
              x={cx + centerGap}
              y={yTop}
              width={femaleHalf}
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

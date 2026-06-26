import { useEffect, useRef } from 'react';
import RateGraph from './RateGraph';
import type { ThreeLensConfig, PyramidPreset } from '../../types/content';
import type { ThreeLensState } from '../../types/interaction';

interface Props {
  config: ThreeLensConfig;
  onChange: (s: ThreeLensState) => void;
  disabled?: boolean;
}

const SECTOR_COLORS = ['#16a34a', '#f59e0b', '#2563eb'];
const SECTOR_SHORT = ['Farming', 'Industry', 'Services'];

function controlWidths(p: PyramidPreset): [number, number, number, number] {
  if (p.widths) return p.widths;
  const base = p.baseWidth ?? 0.5;
  const top = p.topWidth ?? 0.5;
  return [base, base + (top - base) * 0.33, base + (top - base) * 0.66, top];
}

// Piecewise-linear interpolation across the 4 control widths (young → old).
function widthAt(t: number, controls: [number, number, number, number]): number {
  const seg = t * 3;
  const i = Math.min(2, Math.floor(seg));
  const f = seg - i;
  return controls[i] + (controls[i + 1] - controls[i]) * f;
}

function Card({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">{caption}</div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function MiniPyramid({ pyramid }: { pyramid: PyramidPreset }) {
  const controls = controlWidths(pyramid);
  const W = 140;
  const H = 120;
  const cx = W / 2;
  const rows = 9;
  const gap = 2;
  const barH = (H - (rows - 1) * gap) / rows;
  const maxHalf = W / 2 - 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[150px]" role="img" aria-label="Age structure">
      {Array.from({ length: rows }).map((_, r) => {
        // r=0 is the oldest cohort (top), r=rows-1 is the youngest (bottom).
        const youngT = (rows - 1 - r) / (rows - 1);
        const half = widthAt(youngT, controls) * maxHalf;
        const y = r * (barH + gap);
        return (
          <rect
            key={r}
            x={cx - half}
            y={y}
            width={half * 2}
            height={barH}
            rx={2}
            fill="#6366f1"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

function MiniSectors({ sectors }: { sectors: ThreeLensConfig['sectors'] }) {
  const vals = [sectors.primary, sectors.secondary, sectors.tertiary];
  const W = 150;
  const H = 120;
  const pad = { top: 16, bottom: 26 };
  const baseline = H - pad.bottom;
  const maxH = baseline - pad.top;
  const cols = [W * 0.22, W * 0.5, W * 0.78];
  const barW = 30;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[160px]" role="img" aria-label="Jobs by sector">
      <line x1={10} x2={W - 10} y1={baseline} y2={baseline} stroke="#cbd5e1" strokeWidth={1.5} />
      {cols.map((c, i) => {
        const h = (vals[i] / 100) * maxH;
        const top = baseline - h;
        return (
          <g key={i}>
            <rect x={c - barW / 2} y={top} width={barW} height={h} rx={4} fill={SECTOR_COLORS[i]} />
            <text x={c} y={top - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={SECTOR_COLORS[i]}>
              {Math.round(vals[i])}%
            </text>
            <text x={c} y={baseline + 14} textAnchor="middle" fontSize={9} fontWeight={600} fill="#475569">
              {SECTOR_SHORT[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ThreeLensPanel({ config, onChange, disabled: _disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showRates = config.showRates !== false;

  return (
    <div className="w-full select-none">
      <div className={`grid gap-3 lg:gap-3 ${showRates ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {showRates && (
          <Card caption="Birth & death rates">
            <div className="w-full">
              <RateGraph config={{ overview: true, highlightStage: config.stage }} onChange={() => {}} disabled />
            </div>
            {config.rateLabel && (
              <div className="mt-1 text-center text-xs font-medium text-slate-500">{config.rateLabel}</div>
            )}
          </Card>
        )}
        <Card caption="Age structure">
          <MiniPyramid pyramid={config.pyramid} />
        </Card>
        <Card caption="Jobs (sectors)">
          <MiniSectors sectors={config.sectors} />
        </Card>
      </div>
    </div>
  );
}

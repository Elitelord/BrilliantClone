import { useRef, useState } from 'react';
import { clamp } from '../../lib/svg';
import { doublingTime, nirPercent, trendFromGap, TREND_LABEL } from '../../lib/dtm';

const TREND_COLOR: Record<string, string> = {
  shrinking: '#dc2626',
  stable: '#64748b',
  growing: '#16a34a',
  'rapid-growth': '#15803d',
};

function gapFromBarX(clientX: number, barEl: HTMLElement, minGap: number, maxGap: number): number {
  const rect = barEl.getBoundingClientRect();
  const t = clamp((clientX - rect.left) / rect.width, 0, 1);
  const raw = minGap + t * (maxGap - minGap);
  return Math.round(raw * 2) / 2;
}

function barMetrics(gap: number, minGap: number, maxGap: number) {
  const span = maxGap - minGap;
  const zeroPct = span > 0 ? ((0 - minGap) / span) * 100 : 50;
  const valuePct = span > 0 ? ((gap - minGap) / span) * 100 : zeroPct;

  let fillLeft = zeroPct;
  let fillWidth = 0;
  if (gap < 0) {
    fillLeft = valuePct;
    fillWidth = zeroPct - valuePct;
  } else if (gap > 0) {
    fillLeft = zeroPct;
    fillWidth = valuePct - zeroPct;
  }

  return { zeroPct, fillLeft, fillWidth };
}

interface Props {
  gap: number;
  disabled?: boolean;
  interactive?: boolean;
  minGap?: number;
  maxGap?: number;
  onGapChange?: (gap: number) => void;
  showVerdict?: boolean;
}

export default function NirPanel({
  gap,
  disabled,
  interactive,
  minGap = -8,
  maxGap = 28,
  onGapChange,
  showVerdict = true,
}: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const trend = trendFromGap(gap);
  const { zeroPct, fillLeft, fillWidth } = barMetrics(gap, minGap, maxGap);

  const moveTo = (clientX: number) => {
    if (!barRef.current || !onGapChange) return;
    onGapChange(gapFromBarX(clientX, barRef.current, minGap, maxGap));
  };

  const onDown = (e: React.PointerEvent) => {
    if (!interactive || disabled) return;
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    moveTo(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || disabled) return;
    moveTo(e.clientX);
  };
  const onUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const fillRadius =
    gap < 0 ? 'rounded-l-full rounded-r-sm' : gap > 0 ? 'rounded-r-full rounded-l-sm' : 'rounded-full';

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">Natural increase</span>
        <span className="font-bold" style={{ color: TREND_COLOR[trend] }}>
          {gap >= 0 ? '+' : ''}
          {gap.toFixed(1)} / 1,000
        </span>
      </div>

      <div
        ref={barRef}
        className={`relative mt-2 flex items-center ${
          interactive && !disabled ? 'min-h-[44px] cursor-ew-resize touch-none' : 'py-1'
        }`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <div className="relative h-3 w-full rounded-full bg-slate-200">
          {fillWidth > 0 && (
            <div
              className={`absolute top-0 h-full ${fillRadius}`}
              style={{
                left: `${fillLeft}%`,
                width: `${fillWidth}%`,
                background: TREND_COLOR[trend],
                transition: dragging ? 'none' : 'left 0.15s ease, width 0.15s ease',
              }}
            />
          )}
          <div
            className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded bg-slate-500"
            style={{ left: `${zeroPct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-1 flex justify-between text-[10px] font-medium text-slate-400">
        <span>{minGap}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${zeroPct}%` }}>0</span>
        <span>{maxGap}</span>
      </div>

      {interactive && !disabled && (
        <p className="mt-2 text-center text-xs text-slate-500">Drag the bar left or right to set NIR</p>
      )}

      <div className="mt-2 flex justify-center gap-4 text-xs text-slate-500">
        <span>
          NIR ={' '}
          <span className="font-semibold text-slate-700">
            {nirPercent(gap) >= 0 ? '+' : ''}
            {nirPercent(gap).toFixed(1)}%
          </span>
        </span>
        <span>
          Doubling time:{' '}
          <span className="font-semibold text-slate-700">
            {doublingTime(nirPercent(gap)) ? `~${Math.round(doublingTime(nirPercent(gap))!)} yrs` : '—'}
          </span>
        </span>
      </div>
      {showVerdict && (
        <div className="mt-2 text-center text-sm font-semibold" style={{ color: TREND_COLOR[trend] }}>
          Population: {TREND_LABEL[trend]}
        </div>
      )}
    </div>
  );
}

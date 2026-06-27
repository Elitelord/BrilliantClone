import { useEffect, useMemo, useRef, useState } from 'react';
import { gapToPopColor, TREND_LABEL, trendFromGap } from '../../lib/dtm';
import type { PolicyLabConfig } from '../../types/content';
import type { PolicyLabState } from '../../types/interaction';

interface Props {
  config: PolicyLabConfig;
  onChange: (s: PolicyLabState) => void;
  disabled?: boolean;
}

const DEFAULT_BASELINE = 14; // growth per 1,000 — the country grows too fast
const DEFAULT_POPULATION = 50; // millions
const DEFAULT_DECADES = 5; // 50 years

// Policy levers are deliberate forces on the birth curve (plus immigration, which
// adds people directly). Anti-natalist levers pull growth down; pro-natalist levers
// push it up. Deltas are per 1,000. A coherent anti-natalist package (~3 strong
// levers) is enough to flip a +14 boom into decline.
type Side = 'anti' | 'pro';

interface Lever {
  id: string;
  side: Side;
  icon: string;
  label: string;
  detail: string;
  delta: number; // change to growth per 1,000
}

const LEVERS: Lever[] = [
  // Anti-natalist (lower births)
  {
    id: 'birthcaps',
    side: 'anti',
    icon: '🚫',
    label: 'Birth caps (one-child policy)',
    detail: 'A legal limit on births per family — China cut its birth rate this way.',
    delta: -9,
  },
  {
    id: 'contraception',
    side: 'anti',
    icon: '🩺',
    label: 'Free contraception',
    detail: 'Lets families reliably plan and limit how many children they have.',
    delta: -5,
  },
  {
    id: 'femaleed',
    side: 'anti',
    icon: '🎓',
    label: 'Female-education drive',
    detail: 'Girls who stay in school marry later and choose smaller families.',
    delta: -5,
  },
  {
    id: 'latemarriage',
    side: 'anti',
    icon: '⏳',
    label: '"Marry later" campaigns',
    detail: 'Encourages couples to delay marriage and childbearing.',
    delta: -4,
  },
  // Pro-natalist (raise births)
  {
    id: 'babybonus',
    side: 'pro',
    icon: '💰',
    label: 'Baby bonus',
    detail: 'Cash for each new child — used by France and Hungary.',
    delta: 5,
  },
  {
    id: 'parentalleave',
    side: 'pro',
    icon: '👶',
    label: 'Paid parental leave',
    detail: 'Time off so working parents can raise children (Sweden).',
    delta: 4,
  },
  {
    id: 'childcare',
    side: 'pro',
    icon: '🏫',
    label: 'Cheaper childcare',
    detail: 'Lowers the cost of raising children, nudging families larger.',
    delta: 3,
  },
  {
    id: 'immigration',
    side: 'pro',
    icon: '✈️',
    label: 'Open immigration',
    detail: 'Adds people directly — growth without raising the birth rate.',
    delta: 4,
  },
];

const ANTI = LEVERS.filter((l) => l.side === 'anti');
const PRO = LEVERS.filter((l) => l.side === 'pro');

function projectPopulation(start: number, growthRate: number, decades: number): number[] {
  const series = [start];
  let pop = start;
  for (let d = 0; d < decades; d++) {
    pop *= Math.pow(1 + growthRate / 1000, 10);
    series.push(pop);
  }
  return series;
}

function fmtPop(n: number): string {
  return n >= 100 ? n.toFixed(0) : n.toFixed(1);
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const W = 260;
  const H = 64;
  const PAD = 6;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = PAD + (i / (series.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((v - min) / span) * (H - 2 * PAD);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L${pts[0][0].toFixed(1)},${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Projected population trend">
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.4} fill={color} />
      ))}
    </svg>
  );
}

export default function PolicyLab({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const baseline = config.baselineGrowth ?? DEFAULT_BASELINE;
  const startPop = config.initialPopulation ?? DEFAULT_POPULATION;
  const decades = config.decades ?? DEFAULT_DECADES;
  const mode = config.mode ?? 'toggle';
  const isGuess = mode === 'guess';
  const showCount = !isGuess && (config.showCount ?? false);

  const preset = useMemo(() => new Set(config.preset ?? []), [config.preset]);
  const [active, setActive] = useState<Set<string>>(() => new Set(config.preset ?? []));
  // In guess mode the policy package is fixed; in toggle mode the learner builds it.
  const selected = isGuess ? preset : active;

  let growthRate = baseline;
  let activeAnti = 0;
  let activePro = 0;
  for (const lever of LEVERS) {
    if (!selected.has(lever.id)) continue;
    growthRate += lever.delta;
    if (lever.side === 'anti') activeAnti++;
    else activePro++;
  }
  const trend = trendFromGap(growthRate);
  const series = projectPopulation(startPop, growthRate, decades);
  const finalPop = series[series.length - 1];
  const hasProNatalist = activePro > 0;

  const guessMin = config.guessMin ?? Math.max(0, Math.round(startPop * 0.5));
  const guessMax = config.guessMax ?? Math.round(startPop * 2.5);
  const [guess, setGuess] = useState<number>(() => startPop);

  useEffect(() => {
    onChangeRef.current({
      growthRate,
      trend,
      population: finalPop,
      hasProNatalist,
      activeAnti,
      activePro,
      ...(isGuess ? { guess } : {}),
    });
  }, [growthRate, trend, finalPop, hasProNatalist, activeAnti, activePro, isGuess, guess]);

  const toggle = (id: string) => {
    if (disabled || isGuess) return;
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const verdictColor = gapToPopColor(growthRate);
  const popDelta = finalPop - startPop;

  const renderLever = (l: Lever) => {
    const on = selected.has(l.id);
    const onClasses =
      l.side === 'anti'
        ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
        : 'border-rose-400 bg-rose-50 ring-1 ring-rose-300';
    const hintClass = l.side === 'anti' ? 'text-blue-600' : 'text-rose-600';
    const locked = disabled || isGuess;
    return (
      <button
        key={l.id}
        type="button"
        disabled={locked}
        onClick={() => toggle(l.id)}
        aria-pressed={on}
        className={`flex flex-col rounded-xl border p-3 text-left transition ${
          on ? onClasses : 'border-slate-200 bg-white hover:border-slate-300'
        } ${locked ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{l.icon}</span>
          <span className="text-sm font-semibold text-slate-800">{l.label}</span>
        </div>
        {on && (
          <>
            <p className="mt-2 text-xs leading-snug text-slate-600">{l.detail}</p>
            <p className={`mt-1 text-xs font-semibold ${hintClass}`}>
              {l.side === 'anti' ? '▼ pushes births down' : '▲ pushes births up'}
            </p>
          </>
        )}
      </button>
    );
  };

  const anti = isGuess ? ANTI.filter((l) => preset.has(l.id)) : ANTI;
  const pro = isGuess ? PRO.filter((l) => preset.has(l.id)) : PRO;

  return (
    <div className="w-full select-none">
      {showCount ? (
        <div
          className="mb-4 flex flex-col items-center rounded-2xl border-2 px-5 py-4 text-center"
          style={{ borderColor: verdictColor, background: `${verdictColor}10` }}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Population in {decades * 10} years
          </div>
          <div
            className="mt-1 text-4xl font-bold tabular-nums tracking-tight"
            style={{ color: verdictColor }}
          >
            {fmtPop(finalPop)}M
          </div>
          <div className="mt-1 text-sm font-bold" style={{ color: verdictColor }}>
            {TREND_LABEL[trend]}
            <span className="ml-2 font-medium text-slate-500">
              ({popDelta >= 0 ? '+' : ''}{fmtPop(popDelta)}M from {fmtPop(startPop)}M)
            </span>
          </div>
          <div className="mt-2 w-full max-w-[280px]">
            <Sparkline series={series} color={verdictColor} />
          </div>
        </div>
      ) : isGuess ? (
        <div className="mb-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Population today
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-slate-700">{fmtPop(startPop)}M</div>
          <p className="mt-1 text-sm text-slate-500">
            This fast-growing country locks in the policies below. The future counter is hidden — your job is to <span className="font-semibold text-slate-700">estimate</span> where its population lands in {decades * 10} years.
          </p>
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Starting population
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums text-slate-700">{fmtPop(startPop)}M</div>
          <p className="mt-1 text-sm text-slate-500">
            This country is growing fast. The population counter is hidden — choose a policy package, then check whether it would bring the total down.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Anti-natalist
            </span>
            <span className="text-xs text-slate-500">lower births</span>
          </div>
          <div className="grid gap-2">{anti.map(renderLever)}</div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Pro-natalist
            </span>
            <span className="text-xs text-slate-500">raise births</span>
          </div>
          <div className="grid gap-2">{pro.map(renderLever)}</div>
        </div>
      </div>

      {isGuess ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your estimate in {decades * 10} years
            </span>
            <span className="text-2xl font-bold tabular-nums text-emerald-600">{guess}M</span>
          </div>
          <input
            type="range"
            min={guessMin}
            max={guessMax}
            step={1}
            value={guess}
            disabled={disabled}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600"
            aria-label="Estimated population in millions"
          />
          <div className="mt-1 flex justify-between text-[11px] font-medium tabular-nums text-slate-400">
            <span>{guessMin}M</span>
            <span>{guessMax}M</span>
          </div>
          <p className="mt-3 text-center text-sm text-slate-500">
            Weigh the anti-natalist policies (slow growth) against the pro-natalist ones (speed it up), then slide to your best estimate and press Check.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-slate-500">
          {showCount
            ? 'Toggle levers and watch the running total respond — anti-natalist policies bend it down, pro-natalist policies push it up.'
            : 'Pick a coherent package, then press Check to see whether it turns the growth around.'}
        </p>
      )}
    </div>
  );
}

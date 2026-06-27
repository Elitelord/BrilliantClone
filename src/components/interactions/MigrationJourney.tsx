import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MigrationJourneyConfig, MigrationJourneyFactor } from '../../types/content';
import type { MigrationJourneyState } from '../../types/interaction';

interface Props {
  config: MigrationJourneyConfig;
  onChange: (s: MigrationJourneyState) => void;
  disabled?: boolean;
}

type Result = 'arrived' | 'blocked' | 'diverted';

const ANIM = { duration: 1.1, ease: 'easeInOut' as const };

export default function MigrationJourney({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [pushIds, setPushIds] = useState<string[]>([]);
  const [pullIds, setPullIds] = useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined);
  const [departed, setDeparted] = useState(false);

  const motivated = pushIds.length > 0 || pullIds.length > 0;
  const activeEvent = config.events.find((e) => e.id === activeEventId);

  // Motive of the move, read off the selected factors.
  const selectedPush = config.pushFactors.filter((f) => pushIds.includes(f.id));
  const selectedPull = config.pullFactors.filter((f) => pullIds.includes(f.id));
  const isForced = selectedPush.some((f) => f.choice === 'forced');
  const isEconomic = [...selectedPush, ...selectedPull].some((f) => f.category === 'economic');
  const seeksSafety = isForced || selectedPull.some((f) => f.category === 'political');

  // An intervening opportunity only tempts a move whose motive matches it.
  const opportunityApplies = (() => {
    if (!activeEvent || activeEvent.kind !== 'opportunity') return false;
    const m = activeEvent.matchesMotive ?? 'any';
    if (m === 'economic') return isEconomic && !isForced;
    if (m === 'safety') return seeksSafety;
    return true;
  })();

  // 'passed' = an opportunity that didn't match the motive, so the family pressed on.
  const stop: 'blocked' | 'diverted' | 'passed' | undefined =
    departed && activeEvent
      ? activeEvent.kind === 'obstacle'
        ? 'blocked'
        : opportunityApplies
        ? 'diverted'
        : 'passed'
      : undefined;

  // How far along the route the family travels (0 = origin, 1 = destination).
  const target = !departed ? 0 : activeEvent && stop !== 'passed' ? activeEvent.position : 1;
  const result: Result | undefined = !departed
    ? undefined
    : stop === 'blocked'
    ? 'blocked'
    : stop === 'diverted'
    ? 'diverted'
    : 'arrived';

  useEffect(() => {
    onChangeRef.current({
      pushIds,
      pullIds,
      activeEventId,
      motivated,
      departed,
      result,
      seen: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushIds, pullIds, activeEventId, departed, motivated, result]);

  const togglePush = (id: string) => {
    if (disabled) return;
    setDeparted(false);
    setPushIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const togglePull = (id: string) => {
    if (disabled) return;
    setDeparted(false);
    setPullIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleEvent = (id: string) => {
    if (disabled) return;
    setDeparted(false);
    setActiveEventId((prev) => (prev === id ? undefined : id));
  };

  const factorChip = (f: MigrationJourneyFactor, side: 'push' | 'pull') => {
    const on = side === 'push' ? pushIds.includes(f.id) : pullIds.includes(f.id);
    const toggle = side === 'push' ? togglePush : togglePull;
    const onClasses =
      side === 'push'
        ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300 text-rose-900'
        : 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300 text-emerald-900';
    return (
      <button
        key={f.id}
        type="button"
        disabled={disabled}
        onClick={() => toggle(f.id)}
        aria-pressed={on}
        className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-semibold transition ${
          on ? onClasses : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
        } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className="text-base leading-none">{f.icon}</span>
        <span className="flex flex-col leading-snug">
          <span>{f.label}</span>
          {(f.category || f.choice) && (
            <span className="text-[9px] font-bold uppercase tracking-wide opacity-60">
              {[f.category, f.choice].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
      </button>
    );
  };

  const captionColor =
    result === 'blocked'
      ? '#e11d48'
      : result === 'diverted'
      ? '#d97706'
      : result === 'arrived'
      ? '#15803d'
      : '#64748b';

  const captionText = (() => {
    if (!departed) {
      return motivated
        ? 'Press "Set out" to follow the family along the route.'
        : 'Pick at least one reason to move — a push at home or a pull at the destination.';
    }
    if (activeEvent) {
      if (stop === 'passed') {
        return (
          activeEvent.passOutcome ??
          'That did not match the family\u2019s reason for moving, so they pressed on to the destination.'
        );
      }
      return activeEvent.outcome;
    }
    return config.arriveCaption ?? 'The family reached the destination.';
  })();

  return (
    <div className="w-full select-none">
      {/* Route diagram */}
      <div className="mx-auto mb-4 max-w-[460px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex w-20 flex-col items-center rounded-xl border border-rose-200 bg-rose-50 px-1.5 py-2 text-center">
            <span className="text-2xl leading-none">{config.origin.flag ?? '🏠'}</span>
            <span className="mt-1 text-[11px] font-semibold leading-tight text-rose-800">
              {config.origin.label}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-rose-500/80">Origin</span>
          </div>

          <div className="relative h-24 flex-1">
            {/* base route */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-slate-200" />
            {/* traveled portion */}
            <motion.div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-400"
              initial={false}
              animate={{ width: `${target * 100}%` }}
              transition={ANIM}
            />
            {/* intervening events */}
            {config.events.map((e) => {
              const on = e.id === activeEventId;
              const tone =
                e.kind === 'obstacle'
                  ? 'border-rose-400 bg-rose-100'
                  : 'border-amber-400 bg-amber-100';
              return (
                <div
                  key={e.id}
                  className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${e.position * 100}%` }}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-base transition ${
                      on ? tone : 'border-slate-200 bg-white opacity-40'
                    }`}
                  >
                    {e.icon}
                  </span>
                </div>
              );
            })}
            {/* the family */}
            <motion.div
              className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-[150%]"
              initial={false}
              animate={{ left: `${target * 100}%` }}
              transition={ANIM}
            >
              <span className="text-2xl leading-none">👨‍👩‍👧</span>
            </motion.div>
          </div>

          <div className="flex w-20 flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-1.5 py-2 text-center">
            <span className="text-2xl leading-none">{config.destination.flag ?? '🏙️'}</span>
            <span className="mt-1 text-[11px] font-semibold leading-tight text-emerald-800">
              {config.destination.label}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-500/80">
              Destination
            </span>
          </div>
        </div>
      </div>

      {/* Push / pull factor toggles */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-rose-700">
            Push (at home)
          </p>
          <div className="flex flex-col gap-1.5">
            {config.pushFactors.map((f) => factorChip(f, 'push'))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
            Pull (at destination)
          </p>
          <div className="flex flex-col gap-1.5">
            {config.pullFactors.map((f) => factorChip(f, 'pull'))}
          </div>
        </div>
      </div>

      {/* Intervening obstacles / opportunities */}
      {config.events.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            What's in the way?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {config.events.map((e) => {
              const on = e.id === activeEventId;
              const onClasses =
                e.kind === 'obstacle'
                  ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-300 text-rose-900'
                  : 'border-amber-400 bg-amber-50 ring-1 ring-amber-300 text-amber-900';
              return (
                <button
                  key={e.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleEvent(e.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    on ? onClasses : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="text-sm leading-none">{e.icon}</span>
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Set out + caption */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={disabled || !motivated || departed}
          onClick={() => setDeparted(true)}
          className="rounded-full bg-brand-600 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {departed ? 'On the move…' : 'Set out →'}
        </button>
        <div
          className="w-full rounded-2xl border-2 px-4 py-3 text-center text-sm font-medium"
          style={{ borderColor: `${captionColor}55`, background: `${captionColor}0f`, color: captionColor }}
        >
          {captionText}
        </div>
      </div>
    </div>
  );
}

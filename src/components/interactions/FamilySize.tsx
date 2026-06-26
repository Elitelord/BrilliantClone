import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../lib/svg';
import PersonIcon from './PersonIcon';
import type { FamilySizeConfig } from '../../types/content';
import type { FamilySizeState } from '../../types/interaction';

interface Props {
  config: FamilySizeConfig;
  onChange: (s: FamilySizeState) => void;
  disabled?: boolean;
}

const DEFAULT_MAX_CHILDREN = 8;
const CHILD_COLOR = '#0d9488';
const CHILD_HEIGHT = 26;

// Births explore: a pre-transition society starts with large families. Each
// change a learner toggles pulls the average down. The factors are multiplicative
// so effects stack realistically and never go negative — switching them all on
// takes a society from ~6.5 children per family down to ~2.
const BASELINE_CHILDREN = 6.5;
const CBR_PER_CHILD = 6; // crude birth rate per 1,000 ≈ children per family × 6

interface Driver {
  id: string;
  icon: string;
  label: string;
  tag: string;
  factor: number;
  detail: string;
}

const DRIVERS: Driver[] = [
  {
    id: 'infant',
    icon: '🩹',
    label: 'Lower infant mortality',
    tag: 'Health',
    factor: 0.8,
    detail: 'When most babies survive, parents stop having "extra" children as insurance.',
  },
  {
    id: 'cities',
    icon: '🏙️',
    label: 'Urban jobs',
    tag: 'Economic',
    factor: 0.78,
    detail: 'In a city children cost money for school and housing instead of working the farm.',
  },
  {
    id: 'girlsed',
    icon: '🎓',
    label: "Girls' education",
    tag: 'Social',
    factor: 0.75,
    detail: 'Girls who stay in school marry later and choose smaller families.',
  },
  {
    id: 'contraception',
    icon: '🩺',
    label: 'Contraception access',
    tag: 'Policy',
    factor: 0.82,
    detail: 'Families can reliably plan and limit how many children they have.',
  },
  {
    id: 'pensions',
    icon: '👵',
    label: 'Pensions & savings',
    tag: 'Policy',
    factor: 0.85,
    detail: 'With retirement income, parents no longer need many children to support them in old age.',
  },
];

function childrenFromActive(active: Set<string>): number {
  return DRIVERS.reduce((acc, d) => (active.has(d.id) ? acc * d.factor : acc), BASELINE_CHILDREN);
}

function fmtChildren(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

function ChildFigures({ count }: { count: number }) {
  const n = Math.max(0, Math.round(count));
  return (
    <div className="flex min-h-[40px] flex-wrap items-end justify-center gap-1">
      {n === 0 ? (
        <span className="text-xs text-slate-400">No children</span>
      ) : (
        Array.from({ length: n }).map((_, i) => <PersonIcon key={i} color={CHILD_COLOR} height={CHILD_HEIGHT} />)
      )}
    </div>
  );
}

export default function FamilySize({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isAdjust = config.mode === 'adjust';
  const maxChildren = config.maxChildren ?? DEFAULT_MAX_CHILDREN;

  const [children, setChildren] = useState<number>(config.initialChildren ?? 4);
  const [active, setActive] = useState<Set<string>>(() => new Set());

  const childrenFromDrivers = childrenFromActive(active);

  useEffect(() => {
    if (isAdjust) {
      onChangeRef.current({ children });
    } else {
      onChangeRef.current({ children: childrenFromDrivers });
    }
  }, [isAdjust, children, childrenFromDrivers]);

  const setChildrenValue = (n: number) => {
    const next = clamp(Math.round(n), 0, maxChildren);
    setChildren(next);
    onChangeRef.current({ children: next });
  };

  const toggleDriver = (id: string) => {
    if (disabled) return;
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isAdjust) {
    return (
      <div className="w-full select-none">
        <p className="mb-3 text-center text-sm text-slate-500">
          Tap the right side of the card to add a child, the left side to remove one.
        </p>
        <div className="relative mx-auto max-w-[340px]">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-14 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Children per family</div>
            <div className="my-2 text-4xl font-extrabold tabular-nums text-teal-600">{children}</div>
            <ChildFigures count={children} />
          </div>
          {!disabled && (
            <>
              <button
                type="button"
                onClick={() => setChildrenValue(children - 1)}
                disabled={children <= 0}
                aria-label="Remove a child"
                className="group absolute inset-y-0 left-0 flex w-1/2 items-center justify-start rounded-l-2xl px-3 disabled:cursor-not-allowed"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold leading-none text-slate-600 transition group-hover:bg-slate-200 group-disabled:opacity-30">
                  −
                </span>
              </button>
              <button
                type="button"
                onClick={() => setChildrenValue(children + 1)}
                disabled={children >= maxChildren}
                aria-label="Add a child"
                className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-end rounded-r-2xl px-3 disabled:cursor-not-allowed"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold leading-none text-teal-700 transition group-hover:bg-teal-200 group-disabled:opacity-30">
                  +
                </span>
              </button>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-sm text-slate-500">
          A developed country has small families — most parents raise only a couple of children.
        </p>
      </div>
    );
  }

  const cbr = Math.round(childrenFromDrivers * CBR_PER_CHILD);
  const activeCount = active.size;

  return (
    <div className="w-full select-none">
      <div className="mb-4 flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average birth rate</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tabular-nums text-blue-600 transition-all">{cbr}</span>
          <span className="text-sm font-medium text-slate-500">births / 1,000</span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">
          ≈ {fmtChildren(childrenFromDrivers)} children per family
        </p>
        <div className="mt-2">
          <ChildFigures count={childrenFromDrivers} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {DRIVERS.map((d) => {
          const on = active.has(d.id);
          return (
            <button
              key={d.id}
              type="button"
              disabled={disabled}
              onClick={() => toggleDriver(d.id)}
              aria-pressed={on}
              className={`flex flex-col rounded-xl border p-3 text-left transition ${
                on
                  ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">{d.icon}</span>
                <span className="font-semibold text-slate-800">{d.label}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.tag}
                </span>
              </div>
              {on && (
                <>
                  <p className="mt-2 text-xs leading-snug text-slate-600">{d.detail}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-600">▼ lowers births</p>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm text-slate-500">
        {activeCount === 0
          ? 'Tap each change to see how it pulls the birth rate down — they stack on top of each other.'
          : activeCount >= DRIVERS.length
          ? 'Together these take a society from about 6 children per family down to roughly 2 — but none happen quickly, which is why births fall slowly, long after deaths.'
          : 'Each change nudges births a little lower. None happen overnight — that slow stacking is why births lag deaths.'}
      </p>
    </div>
  );
}

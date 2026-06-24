import { useEffect, useRef } from 'react';
import type { InfoConfig, InfoRateTerm } from '../../types/content';
import type { InfoState } from '../../types/interaction';

interface Props {
  config: InfoConfig;
  onChange: (s: InfoState) => void;
}

const TERM_STYLES: Record<InfoRateTerm['curve'], { card: string; dot: string; abbrev: string }> = {
  birth: {
    card: 'border-blue-200 bg-blue-50/80',
    dot: 'bg-blue-600',
    abbrev: 'text-blue-700',
  },
  death: {
    card: 'border-red-200 bg-red-50/80',
    dot: 'bg-red-600',
    abbrev: 'text-red-700',
  },
};

export default function InfoCard({ config, onChange }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current({ seen: true });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {config.icon && <div className="text-4xl">{config.icon}</div>}

      {config.terms && config.terms.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {config.terms.map((term) => {
            const style = TERM_STYLES[term.curve];
            return (
              <div
                key={term.abbrev}
                className={`rounded-2xl border px-3.5 py-3 ${style.card}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <span className="text-sm font-semibold leading-snug text-slate-800">{term.name}</span>
                </div>
                <p className={`mt-1 text-lg font-extrabold tracking-tight ${style.abbrev}`}>{term.abbrev}</p>
                <p className="mt-0.5 text-xs text-slate-500">per 1,000 people</p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[15px] leading-relaxed text-slate-700">{config.body}</p>
      {config.formula && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-center">
          <span className="text-lg font-extrabold tracking-tight text-brand-700">{config.formula}</span>
        </div>
      )}

      {config.points && config.points.length > 0 && (
        <ul className="flex flex-col gap-2">
          {config.points.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

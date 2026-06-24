import { useEffect, useRef, useState } from 'react';
import type { McConfig } from '../../types/content';
import type { McState } from '../../types/interaction';
import type { ValidationResult } from '../../types/content';
import PyramidMini from './PyramidMini';

interface Props {
  config: McConfig;
  onChange: (s: McState) => void;
  disabled?: boolean;
  result?: ValidationResult | null;
}

export default function MultipleChoice({ config, onChange, disabled, result }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const hasPyramids = config.options.some((o) => o.pyramid);

  useEffect(() => {
    onChangeRef.current({ selectedId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealed = !!result;
  const isWrong = revealed && !result?.correct;

  const styleFor = (id: string): string => {
    if (revealed && result?.correct && selected === id) return 'border-emerald-500 bg-emerald-50';
    if (isWrong && selected === id) return 'border-amber-400 bg-amber-50';
    if (selected === id) return 'border-brand-600 bg-brand-50';
    return 'border-slate-200 bg-white hover:border-brand-300';
  };

  if (hasPyramids) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {config.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelected(opt.id);
              onChangeRef.current({ selectedId: opt.id });
            }}
            className={`flex flex-col items-center rounded-2xl border-2 p-3 transition disabled:opacity-90 ${styleFor(opt.id)}`}
          >
            {opt.pyramid && (
              <PyramidMini
                baseWidth={opt.pyramid.baseWidth}
                topWidth={opt.pyramid.topWidth}
                widths={opt.pyramid.widths}
                width={110}
                height={88}
              />
            )}
            <span className="mt-2 text-sm font-semibold text-slate-700">{opt.label}</span>
            {revealed && result?.correct && selected === opt.id && <span className="mt-1 text-emerald-600" aria-hidden>✓</span>}
            {isWrong && selected === opt.id && <span className="mt-1 text-amber-600" aria-hidden>✕</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      {config.options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => {
            setSelected(opt.id);
            onChangeRef.current({ selectedId: opt.id });
          }}
          className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-medium transition disabled:opacity-90 ${styleFor(opt.id)} ${
            selected === opt.id ? 'text-brand-800' : 'text-slate-700'
          }`}
        >
          <span>{opt.label}</span>
          {revealed && result?.correct && selected === opt.id && <span aria-hidden>✓</span>}
          {isWrong && selected === opt.id && <span aria-hidden>✕</span>}
        </button>
      ))}
    </div>
  );
}

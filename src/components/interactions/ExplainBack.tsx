import { useEffect, useRef, useState } from 'react';
import type { ExplainBackConfig } from '../../types/content';
import type { ExplainBackState } from '../../types/interaction';

interface Props {
  config: ExplainBackConfig;
  onChange: (s: ExplainBackState) => void;
  disabled?: boolean;
  showSample?: boolean;
}

export default function ExplainBack({ config, onChange, disabled, showSample }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [text, setText] = useState('');

  useEffect(() => {
    onChangeRef.current({ text: '' });
  }, []);

  const minChars = config.minChars ?? 15;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-700">{config.question}</p>
      <textarea
        value={text}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value);
          onChangeRef.current({ text: e.target.value });
        }}
        placeholder={config.placeholder ?? 'Write 1–2 sentences in your own words…'}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-70"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{text.trim().length} characters</span>
        <span>
          {showSample
            ? 'Model answer shown below'
            : text.trim().length >= minChars
              ? 'Ready to check'
              : `At least ${minChars} characters`}
        </span>
      </div>
      {showSample && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3.5 text-sm leading-relaxed text-slate-700">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            Model answer
          </div>
          {config.sampleAnswer}
        </div>
      )}
    </div>
  );
}

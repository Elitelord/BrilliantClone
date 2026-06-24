import { useState, useRef, useEffect } from 'react';

export default function ConceptHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-sm font-bold text-brand-600 hover:bg-brand-100"
        aria-label="Why this matters"
        aria-expanded={open}
      >
        ?
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-sm leading-relaxed text-slate-600 shadow-lg"
        >
          {text}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { MigrationEffect, MigrationEffectsConfig } from '../../types/content';
import type { MigrationEffectsState } from '../../types/interaction';

interface Props {
  config: MigrationEffectsConfig;
  onChange: (s: MigrationEffectsState) => void;
  disabled?: boolean;
}

const TONE: Record<MigrationEffect['tone'], { bar: string; text: string }> = {
  positive: { bar: '#16a34a', text: '#15803d' },
  negative: { bar: '#e11d48', text: '#be123c' },
  neutral: { bar: '#6366f1', text: '#4f46e5' },
};

export default function MigrationEffects({ config, onChange, disabled }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [flow, setFlow] = useState(0);

  useEffect(() => {
    onChangeRef.current({ flow, seen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow]);

  // Number of migrant figures travelling the arrow (0–6).
  const dots = Math.round((flow / 100) * 6);

  const effectRow = (e: MigrationEffect) => {
    const tone = TONE[e.tone];
    return (
      <div key={e.id} className="flex items-center gap-2">
        <span className="w-5 text-center text-sm leading-none">{e.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[11px] font-semibold text-slate-600">{e.label}</span>
          </div>
          <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: tone.bar }}
              initial={false}
              animate={{ width: `${flow}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const sideCard = (
    side: { label: string; flag?: string },
    role: 'origin' | 'destination',
    effects: MigrationEffect[],
  ) => (
    <div
      className={`flex-1 rounded-2xl border px-3 py-3 ${
        role === 'origin' ? 'border-rose-200 bg-rose-50/50' : 'border-emerald-200 bg-emerald-50/50'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl leading-none">{side.flag ?? (role === 'origin' ? '📤' : '📥')}</span>
        <div className="leading-tight">
          <div className="text-xs font-bold text-slate-700">{side.label}</div>
          <div
            className={`text-[9px] font-bold uppercase tracking-wide ${
              role === 'origin' ? 'text-rose-500/80' : 'text-emerald-600/80'
            }`}
          >
            {role === 'origin' ? 'Origin · place left' : 'Destination · place joined'}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">{effects.map(effectRow)}</div>
    </div>
  );

  return (
    <div className="w-full select-none">
      {/* Origin → flow → destination */}
      <div className="flex items-stretch gap-2">
        {sideCard(config.origin, 'origin', config.originEffects)}

        <div className="flex w-14 flex-col items-center justify-center">
          <div className="relative h-8 w-full">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-slate-200" />
            {Array.from({ length: dots }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 -translate-y-1/2 text-xs leading-none"
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.8, ease: 'linear', repeat: Infinity, delay: i * 0.3 }}
              >
                🧑
              </motion.span>
            ))}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400">→</span>
          </div>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">flow</span>
        </div>

        {sideCard(config.destination, 'destination', config.destinationEffects)}
      </div>

      {/* Flow control */}
      <div className="mx-auto mt-4 max-w-[420px]">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>How many migrate?</span>
          <span className="tabular-nums text-slate-700">{flow}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={flow}
          disabled={disabled}
          onChange={(e) => setFlow(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
      </div>

      {/* Caption */}
      <div className="mt-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
        {flow === 0
          ? 'No one is moving — both places stay as they are. Drag the slider up and watch the same flow create opposite effects on each end.'
          : config.caption ??
            'One flow of migrants, two ledgers: the origin gains money but loses people, while the destination gains workers and diversity.'}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export type FeedbackTone = 'correct' | 'wrong' | 'info';

interface Props {
  tone: FeedbackTone;
  message: string;
  concept?: string;
  onDismiss?: () => void;
}

const TONE = {
  correct: {
    bg: 'bg-emerald-50/70 backdrop-blur-sm',
    border: 'border-emerald-200/80',
    text: 'text-emerald-900',
    icon: '✓',
    iconBg: 'bg-emerald-500',
  },
  wrong: {
    bg: 'bg-amber-50/70 backdrop-blur-sm',
    border: 'border-amber-200/80',
    text: 'text-amber-900',
    icon: '!',
    iconBg: 'bg-amber-500',
  },
  info: {
    bg: 'bg-sky-50/70 backdrop-blur-sm',
    border: 'border-sky-200/80',
    text: 'text-sky-900',
    icon: 'i',
    iconBg: 'bg-sky-500',
  },
};

export default function FeedbackBar({ tone, message, concept, onDismiss }: Props) {
  const t = TONE[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${t.border} ${t.bg} p-3.5`}
    >
      <div className="flex gap-3">
        <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${t.iconBg} text-sm font-bold text-white`}>
          {t.icon}
        </span>
        <div className={`min-w-0 flex-1 text-sm leading-relaxed ${t.text}`}>
          <p className="font-medium">{message}</p>
          {concept && <p className="mt-2 text-[13px] opacity-90">{concept}</p>}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-bold transition hover:bg-black/5 ${t.text}`}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}

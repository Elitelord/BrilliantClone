import { motion, useReducedMotion } from 'framer-motion';

// Shared mastery/retention ring. Replaces two byte-identical copies (they differed only in
// stroke color). The arc fills in with a spring on mount; reduced-motion renders it static.
export default function ProgressRing({
  percent,
  stroke,
}: {
  percent: number;
  stroke: string;
}) {
  const reduce = useReducedMotion();
  const r = 30;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative flex-none">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <motion.circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none text-slate-800">{percent}%</span>
      </div>
    </div>
  );
}

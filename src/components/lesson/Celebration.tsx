import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#16a34a', '#f59e0b', '#ec4899', '#2563eb'];

// A lightweight confetti burst (no dependency) used on lesson completion.
export default function Celebration() {
  const pieces = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const duration = 1.1 + Math.random() * 0.8;
        const color = COLORS[i % COLORS.length];
        const size = 6 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            initial={{ top: '-5%', opacity: 1, rotate: 0 }}
            animate={{ top: '105%', opacity: [1, 1, 0], rotate: 360 }}
            transition={{ duration, delay, ease: 'easeIn' }}
            style={{ position: 'absolute', left: `${left}%`, width: size, height: size, background: color, borderRadius: 2 }}
          />
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lock, Star, Check } from 'lucide-react';

import type { Lesson } from '../../types/content';

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'complete';

interface Props {
  lesson: Lesson;
  index: number;
  status: NodeStatus;
  score: number;
  mastered: boolean;
  finishedOnce: boolean;
  reviewing: boolean;
  recommended: boolean;
  /** Center x of the node within the canvas (px). */
  x: number;
  /** Center y of the node within the canvas (px). */
  y: number;
  /** Total canvas width (px) — used to clamp the hover popover on screen. */
  canvasWidth: number;
  onSelect: () => void;
}

export const NODE = 92;
const WRAP_W = 168;
const POP_MAX_W = 320;

const SQUARE: Record<NodeStatus, string> = {
  locked: 'bg-slate-100 text-slate-400 border-slate-200',
  available: 'bg-white text-brand-600 border-brand-200',
  in_progress: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white border-brand-700',
  complete: 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-emerald-600',
};

function statusLabel(status: NodeStatus, mastered: boolean): string {
  switch (status) {
    case 'complete':
      return mastered ? '★ Mastered' : '✓ Completed';
    case 'in_progress':
      return 'In progress';
    case 'locked':
      return 'Locked';
    default:
      return 'Ready to start';
  }
}

export default function LessonNode({
  lesson,
  index,
  status,
  score,
  mastered,
  finishedOnce,
  reviewing,
  recommended,
  x,
  y,
  canvasWidth,
  onSelect,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const locked = status === 'locked';

  const glyph = locked ? (
    <Lock className="h-5 w-5" strokeWidth={2.5} />
  ) : status === 'complete' ? (
    mastered ? <Star className="h-6 w-6 fill-current" strokeWidth={1.5} /> : <Check className="h-7 w-7" strokeWidth={3} />
  ) : (
    index + 1
  );

  // Responsive popover placement. The card width scales with the canvas. We prefer
  // a card to the SIDE of the square (aligned to its height), but when neither side
  // has room — e.g. center nodes on a narrow/mobile screen — we center the card over
  // the node so it spans both left and right of it, placed above (or below near top).
  const MARGIN = 10;
  const GAP = 12;
  const HALF = NODE / 2;
  const popW = Math.min(POP_MAX_W, Math.max(0, canvasWidth - MARGIN * 2));
  const squareTop = y - HALF;

  const rightLeft = x + HALF + GAP;
  const leftLeft = x - HALF - GAP - popW;
  const rightFits = rightLeft + popW <= canvasWidth - MARGIN;
  const leftFits = leftLeft >= MARGIN;
  const preferRight = x < canvasWidth / 2;

  let popLeftCanvas: number;
  let popTopCanvas: number;
  let enter: { x?: number; y?: number };

  if ((preferRight && rightFits) || (!leftFits && rightFits)) {
    // to the right of the square (same height → align tops)
    popLeftCanvas = rightLeft;
    popTopCanvas = squareTop;
    enter = { x: -8 };
  } else if (leftFits) {
    // to the left of the square
    popLeftCanvas = leftLeft;
    popTopCanvas = squareTop;
    enter = { x: 8 };
  } else {
    // no room either side: center over the node, above (or below near the top)
    popLeftCanvas = Math.min(Math.max(x - popW / 2, MARGIN), canvasWidth - popW - MARGIN);
    const above = squareTop - GAP - NODE;
    if (above >= MARGIN) {
      popTopCanvas = above;
      enter = { y: 8 };
    } else {
      popTopCanvas = y + HALF + GAP;
      enter = { y: -8 };
    }
  }

  const popLeftRel = popLeftCanvas - (x - WRAP_W / 2);
  const popTopRel = popTopCanvas - squareTop;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y - NODE / 2,
        width: WRAP_W,
        transform: 'translateX(-50%)',
        zIndex: hovered ? 40 : recommended ? 20 : 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* "Start here" pointer for the recommended lesson */}
      <AnimatePresence>
        {recommended && !hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0 }}
            transition={
              reduceMotion
                ? { opacity: { duration: 0.2 } }
                : { y: { repeat: Infinity, duration: 1.4 }, opacity: { duration: 0.2 } }
            }
            className="absolute -top-9 z-30 whitespace-nowrap rounded-full bg-brand-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-brand-600/30"
          >
            Start here
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-brand-600" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onSelect}
        disabled={locked}
        aria-label={lesson.title}
        className={`relative flex items-center justify-center rounded-3xl border-2 border-b-[6px] text-2xl font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 ${SQUARE[status]} ${
          locked ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{ width: NODE, height: NODE }}
      >
        {/* pulse ring for the recommended lesson */}
        {recommended && !reduceMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-3xl ring-4 ring-brand-400"
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.18, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        )}
        <motion.span whileHover={locked ? undefined : { scale: 1.12 }} className="relative">
          {glyph}
        </motion.span>
      </button>

      <div className="mt-2 line-clamp-2 px-1 text-center text-xs font-bold leading-tight text-slate-700">
        {lesson.title}
      </div>

      {/* hover detail popover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, ...enter }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.14 }}
            className="absolute z-50 flex flex-col justify-center overflow-hidden rounded-3xl border border-slate-100 bg-white px-4 py-2.5 text-left shadow-xl shadow-slate-900/10"
            style={{
              width: popW,
              height: NODE,
              left: popLeftRel,
              top: popTopRel,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="flex-none rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  L{index + 1}
                </span>
                <span
                  className={`truncate text-[10px] font-bold ${
                    status === 'complete'
                      ? 'text-emerald-600'
                      : status === 'locked'
                        ? 'text-slate-400'
                        : 'text-brand-600'
                  }`}
                >
                  {statusLabel(status, mastered)}
                </span>
                <span className="flex-none text-[10px] font-semibold text-slate-400">
                  · {lesson.steps.length} steps
                </span>
                {reviewing && (
                  <span className="flex-none text-[10px] font-semibold text-brand-500">· Reviewing</span>
                )}
              </div>
              {finishedOnce && (
                <span className="flex-none rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {score}%
                </span>
              )}
            </div>

            <h3 className="mt-0.5 truncate font-extrabold leading-tight text-slate-800">
              {lesson.title}
            </h3>
            <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">
              {locked ? 'Finish the previous lesson to unlock.' : lesson.concept}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

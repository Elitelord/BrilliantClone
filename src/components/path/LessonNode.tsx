import { motion } from 'framer-motion';

import type { Lesson } from '../../types/content';



interface Props {

  lesson: Lesson;

  index: number;

  status: 'locked' | 'available' | 'in_progress' | 'complete';

  score: number;

  mastered: boolean;

  finishedOnce: boolean;

  reviewing: boolean;

  recommended: boolean;

  onClick: () => void;

}



const STATUS_RING: Record<string, string> = {

  locked: 'bg-slate-100 text-slate-400',

  available: 'bg-brand-100 text-brand-700',

  in_progress: 'bg-brand-500 text-white',

  complete: 'bg-emerald-500 text-white',

};



export default function LessonNode({

  lesson,

  index,

  status,

  score,

  mastered,

  finishedOnce,

  reviewing,

  recommended,

  onClick,

}: Props) {

  const locked = status === 'locked';

  return (

    <button

      type="button"

      onClick={onClick}

      disabled={locked}

      className={`relative flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${

        recommended ? 'border-brand-300 bg-brand-50/50 shadow-md' : 'border-slate-100 bg-white'

      } ${locked ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.99] hover:border-brand-200'}`}

    >

      <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-lg font-extrabold ${STATUS_RING[status]}`}>

        {finishedOnce ? '✓' : locked ? '🔒' : index + 1}

      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <h3 className="truncate font-bold text-slate-800">{lesson.title}</h3>

          {recommended && (

            <span className="flex-none rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">

              Next

            </span>

          )}

        </div>

        {lesson.subtitle && <p className="truncate text-sm text-slate-500">{lesson.subtitle}</p>}

        {finishedOnce && (

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium">

            <span className={mastered ? 'text-emerald-600' : 'text-amber-600'}>

              {mastered ? '★ Mastered' : 'Completed'}

            </span>

            <span className="text-slate-400">Score: {score}%</span>

            {reviewing && <span className="text-brand-600">· Reviewing</span>}

          </div>

        )}

        {!finishedOnce && status === 'in_progress' && (

          <div className="mt-1.5 text-xs font-medium text-brand-600">In progress — tap to resume</div>

        )}

      </div>

      {recommended && (

        <motion.div

          aria-hidden

          animate={{ x: [0, 4, 0] }}

          transition={{ repeat: Infinity, duration: 1.2 }}

          className="flex-none text-brand-500"

        >

          →

        </motion.div>

      )}

    </button>

  );

}


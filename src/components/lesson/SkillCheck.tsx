import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '../../types/content';
import type { McState } from '../../types/interaction';
import { generateSkillCheck } from '../../lib/ai/features/skillCheck';
import { updateMasteryForConcepts } from '../../lib/mastery';
import { persistMastery } from '../../lib/persistence';
import { useProgressStore } from '../../store/progressStore';
import MultipleChoice from '../interactions/MultipleChoice';
import FeedbackBar from './FeedbackBar';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { useEnterKey } from '../../lib/hooks/useEnterKey';
import type { VerifiedSkillCheckQuestion } from '../../lib/ai/verify';

interface Props {
  lesson: Lesson;
  onComplete: (score: { correct: number; total: number }) => void;
}

export default function SkillCheck({ lesson, onComplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [genFailed, setGenFailed] = useState(false);
  const [questions, setQuestions] = useState<VerifiedSkillCheckQuestion[] | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [mcState, setMcState] = useState<McState | null>(null);
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const [locked, setLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Enter advances the skill check (action refreshed per render path; see useEnterKey).
  const enterRef = useRef<() => void>(() => {});
  useEnterKey(() => enterRef.current());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setGenFailed(false);
      setQuestions(null);

      const data = useProgressStore.getState().data;
      if (!data) {
        onCompleteRef.current({ correct: 0, total: 0 });
        return;
      }

      const progress = data.progress[lesson.id];
      const qs = await generateSkillCheck(lesson, data.mastery, progress);
      if (cancelled) return;

      if (!qs?.length) {
        setGenFailed(true);
        setLoading(false);
        return;
      }

      setQuestions(qs);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <Spinner />
        <p className="text-sm text-slate-500">Preparing your skill check…</p>
      </div>
    );
  }

  if (genFailed) {
    enterRef.current = () => onCompleteRef.current({ correct: 0, total: 0 });
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-slate-800">Skill check unavailable</p>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          We couldn&apos;t generate verified questions this time. Your lesson progress is saved — you can
          continue.
        </p>
        <Button onClick={() => onCompleteRef.current({ correct: 0, total: 0 })} className="mt-6 max-w-sm">
          Continue
        </Button>
      </div>
    );
  }

  if (!questions) return null;

  if (done) {
    enterRef.current = () => onComplete({ correct: correctCount, total: questions.length });
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl font-extrabold text-brand-600">
          {correctCount} / {questions.length}
        </div>
        <p className="mt-2 text-slate-600">Skill check complete — nice work!</p>
        <Button onClick={() => onComplete({ correct: correctCount, total: questions.length })} className="mt-6 max-w-sm">
          Continue
        </Button>
      </div>
    );
  }

  const q = questions[qIndex];
  const mcConfig = { options: q.options };
  const correctOptionLabel = q.options.find((o) => o.id === q.correctId)?.label ?? '';
  const userData = useProgressStore.getState().data;

  const handleCheck = () => {
    if (!mcState?.selectedId) return;
    const correct = mcState.selectedId === q.correctId;
    setResult({ correct });
    setLocked(true);
    if (correct) {
      setCorrectCount((c) => c + 1);
      const concepts = [...new Set(lesson.steps.flatMap((s) => s.concepts ?? []))];
      if (userData && concepts.length) {
        const mastery = updateMasteryForConcepts(userData.mastery, concepts, true);
        const nextData = { ...userData, mastery };
        useProgressStore.setState({ data: nextData });
        void persistMastery(
          userData.profile,
          concepts.map((c) => mastery[c]),
        );
      }
    }
  };

  const goNext = () => {
    if (qIndex >= questions.length - 1) {
      setDone(true);
      return;
    }
    setQIndex((i) => i + 1);
    setMcState(null);
    setResult(null);
    setLocked(false);
  };

  enterRef.current = locked ? goNext : mcState?.selectedId ? handleCheck : () => {};

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-none px-4 pb-2 pt-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Skill check</div>
        <p className="mt-1 text-xs text-slate-500">
          Question {qIndex + 1} of {questions.length} · AP-style
        </p>
        <h2 className="mt-2 text-lg font-bold leading-snug text-slate-800">{q.prompt}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <MultipleChoice
            config={mcConfig}
            onChange={setMcState}
            disabled={locked}
            result={result}
          />
        </div>
      </div>
      <div className="relative flex-none border-t border-slate-100 bg-white px-4 pb-safe pt-3">
        {result && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full px-4 pb-3 pt-6">
            <div className="pointer-events-auto">
              <FeedbackBar
                tone={result.correct ? 'correct' : 'wrong'}
                message={
                  result.correct
                    ? 'Correct!'
                    : `Not quite — the correct answer was ${correctOptionLabel}.`
                }
                concept={q.explanation}
              />
            </div>
          </div>
        )}
        {locked ? (
          <Button onClick={goNext}>
            {qIndex >= questions.length - 1 ? 'See results' : 'Next question'}
          </Button>
        ) : (
          <Button onClick={handleCheck} disabled={!mcState?.selectedId}>
            Check
          </Button>
        )}
      </div>
    </div>
  );
}

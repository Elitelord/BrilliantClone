import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { getCourse, getOrderedLessons } from '../content';
import { recommendNext } from '../lib/mastery';
import { weakestDueFocus } from '../lib/review/studyPlan';
import { dueConcepts } from '../lib/scheduler';
import { reviewedToday } from '../lib/review/dailyReview';
import { goalMetToday } from '../lib/streak';
import CoursePath from '../components/path/CoursePath';
import CourseStats from '../components/home/CourseStats';
import RetentionPanel from '../components/home/RetentionPanel';
import StreakBadge from '../components/habit/StreakBadge';
import Avatar from '../components/common/Avatar';
import AppShell from '../components/layout/AppShell';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAuthStore((s) => s.profile);
  const data = useProgressStore((s) => s.data);
  const course = getCourse();

  // Banner shown when a learner tried to open a locked lesson (LessonPage redirects here
  // with the title in router state). Cleared from history so it doesn't survive refresh/back.
  const lockedLesson = (location.state as { lockedLesson?: string } | null)?.lockedLesson;
  const [lockedNotice, setLockedNotice] = useState<string | null>(lockedLesson ?? null);
  useEffect(() => {
    if (lockedLesson) navigate('.', { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streak = data?.streak;
  const now = Date.now();
  const rec = data ? recommendNext(getOrderedLessons(), data.progress, data.mastery, now) : null;
  // Concept-level guidance the generic review card doesn't give: which weakest/foundation
  // concept to focus on, and why. Shown whenever something is due.
  const focus = data ? weakestDueFocus(data.mastery, now) : null;
  const dueCount = data ? dueConcepts(data.mastery, now).length : 0;
  const hasMastery = !!data && Object.keys(data.mastery).length > 0;
  const didReviewToday = !!profile && reviewedToday(profile.uid);

  return (
    <AppShell maxWidth="max-w-2xl lg:max-w-4xl" className="pb-28">
      {/* header */}
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="active:scale-95"
            aria-label="Account"
          >
            <Avatar avatar={profile?.avatar} size="h-11 w-11" text="text-2xl" />
          </button>
          <div>
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h1 className="text-xl font-extrabold text-slate-800">{profile?.displayName ?? 'Learner'}</h1>
          </div>
        </div>
        {streak && <StreakBadge count={streak.count} goalMet={goalMetToday(streak)} />}
      </header>

      {/* locked-lesson notice (from a redirected deep-link) */}
      {lockedNotice && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Lock aria-hidden className="mt-0.5 h-4 w-4 flex-none text-amber-500" />
          <p className="flex-1 text-sm text-amber-800">
            Finish the previous lesson to unlock{' '}
            <span className="font-semibold">{lockedNotice}</span>.
          </p>
          <button
            type="button"
            onClick={() => setLockedNotice(null)}
            aria-label="Dismiss"
            className="flex-none rounded-full p-1 text-amber-500 hover:text-amber-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* primary actions — stacked on phones, up to 3-up on wide screens */}
      <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rec && rec.kind !== 'mixed-review' && (
          <button
            type="button"
            onClick={() => rec.lessonId && navigate(`/lesson/${rec.lessonId}`)}
            className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-left text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99]"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-100">
              {rec.kind === 'done' ? 'Course complete' : rec.kind === 'review' ? 'Recommended review' : 'Continue learning'}
            </div>
            <div className="mt-1 text-lg font-bold">{rec.reason}</div>
            {rec.kind !== 'done' && (
              <span className="mt-auto pt-3">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">Start →</span>
              </span>
            )}
          </button>
        )}

        {/* spaced review — surfaces whenever concepts are due */}
        {dueCount > 0 && (
          <button
            type="button"
            onClick={() => navigate('/review')}
            className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-teal-600 to-teal-500 p-5 text-left text-white shadow-lg shadow-teal-600/20 transition active:scale-[0.99]"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-teal-100">
              {didReviewToday ? 'Daily review · done today ✓' : 'Daily review'}
            </div>
            <div className="mt-1 text-lg font-bold">
              {didReviewToday
                ? `Reviewed today — ${dueCount} still due. A little each day beats cramming.`
                : `${dueCount} concept${dueCount === 1 ? '' : 's'} due — keep them from fading`}
            </div>
            <span className="mt-auto pt-3">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                {didReviewToday ? 'Review more →' : 'Review →'}
              </span>
            </span>
          </button>
        )}

        {/* FRQ exam practice */}
        <button
          type="button"
          onClick={() => navigate('/frq')}
          className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-5 text-left text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.99]"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-100">Exam practice</div>
          <div className="mt-1 text-lg font-bold">Practice an AP-style free-response question</div>
          <span className="mt-auto pt-3">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">Start FRQ →</span>
          </span>
        </button>
      </div>

      {/* suggested focus — the single most useful concept to review next, with the reason */}
      {focus && (
        <button
          type="button"
          onClick={() => navigate('/review')}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition active:scale-[0.99]"
        >
          <span aria-hidden className="text-lg leading-none">💡</span>
          <span className="flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-600">
              Suggested focus
            </span>
            <span className="block text-sm font-semibold text-amber-900">{focus.reason}</span>
          </span>
          <span aria-hidden className="text-amber-500">→</span>
        </button>
      )}

      {/* progress stats — side by side on large screens */}
      {hasMastery ? (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
          <CourseStats />
          <RetentionPanel />
        </div>
      ) : (
        <CourseStats />
      )}

      {/* course */}
      <div className="mb-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">{course.subject}</div>
        <h2 className="text-lg font-bold text-slate-800">{course.title}</h2>
        <p className="text-sm text-slate-500">{course.description}</p>
      </div>

      <CoursePath />

      <p className="mt-8 text-center text-xs text-slate-300">
        Learn by doing - no videos, no AI. Just you and the ideas.
      </p>
    </AppShell>
  );
}

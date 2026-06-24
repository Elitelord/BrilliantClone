import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { getCourse, getOrderedLessons } from '../content';
import { recommendNext } from '../lib/mastery';
import { goalMetToday } from '../lib/streak';
import CoursePath from '../components/path/CoursePath';
import StreakBadge from '../components/habit/StreakBadge';

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const data = useProgressStore((s) => s.data);
  const course = getCourse();

  const streak = data?.streak;
  const rec = data ? recommendNext(getOrderedLessons(), data.progress) : null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-12">
      {/* header */}
      <header className="flex items-center justify-between py-5">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="text-xl font-extrabold text-slate-800">{profile?.displayName ?? 'Learner'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {streak && <StreakBadge count={streak.count} goalMet={goalMetToday(streak)} />}
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* recommended next */}
      {rec && (
        <button
          type="button"
          onClick={() => rec.lessonId && navigate(`/lesson/${rec.lessonId}`)}
          className="mb-6 w-full rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-5 text-left text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-100">
            {rec.kind === 'done' ? 'Course complete' : rec.kind === 'review' ? 'Recommended review' : 'Continue learning'}
          </div>
          <div className="mt-1 text-lg font-bold">{rec.reason}</div>
          {rec.kind !== 'done' && <div className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">Start →</div>}
        </button>
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
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { getCourse, getOrderedLessons } from '../content';
import { recommendNext } from '../lib/mastery';
import { goalMetToday } from '../lib/streak';
import CoursePath from '../components/path/CoursePath';
import CourseStats from '../components/home/CourseStats';
import StreakBadge from '../components/habit/StreakBadge';
import Avatar from '../components/common/Avatar';
import AppShell from '../components/layout/AppShell';

export default function HomePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const data = useProgressStore((s) => s.data);
  const course = getCourse();

  const streak = data?.streak;
  const rec = data ? recommendNext(getOrderedLessons(), data.progress) : null;

  return (
    <AppShell className="pb-28">
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

      {/* progress stats */}
      <CourseStats />

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

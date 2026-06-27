import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { fetchLeaderboard } from '../lib/persistence';
import { buildLeaderboard } from '../lib/leaderboard';
import { normalizeAvatar } from '../lib/avatars';
import type { LeaderboardEntry } from '../types/progress';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const data = useProgressStore((s) => s.data);
  const [real, setReal] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLeaderboard()
      .then((entries) => {
        if (active) setReal(entries);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const you: LeaderboardEntry | undefined = useMemo(() => {
    if (!profile) return undefined;
    return {
      uid: profile.uid,
      displayName: profile.displayName || 'You',
      avatar: normalizeAvatar(profile.avatar),
      streak: data?.streak.count ?? 0,
      longest: data?.streak.longest ?? 0,
      isYou: true,
    };
  }, [profile, data?.streak.count, data?.streak.longest]);

  const ranked = useMemo(() => buildLeaderboard(real, you), [real, you]);
  const yourRank = ranked.findIndex((e) => e.isYou) + 1;

  return (
    <AppShell className="pb-28">
      <header className="py-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Compete</div>
        <h1 className="text-2xl font-extrabold text-slate-800">Streak Leaderboard</h1>
        <p className="text-sm text-slate-500">Keep your daily streak alive to climb the ranks.</p>
      </header>

      {you && (
        <div className="mb-5 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-4 text-white shadow-lg shadow-brand-600/20">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white/20 text-lg font-extrabold">
            {yourRank > 0 ? `#${yourRank}` : '–'}
          </div>
          <Avatar avatar={you.avatar} size="h-10 w-10" text="text-xl" className="bg-white/20" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{you.displayName}</div>
            <div className="text-xs text-brand-100">Your position</div>
          </div>
          <div className="flex-none text-right">
            <div className="text-lg font-extrabold">🔥 {you.streak}</div>
            <div className="text-[11px] text-brand-100">best {you.longest}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranked.map((e, i) => {
            const rank = i + 1;
            return (
              <li
                key={e.uid}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  e.isYou ? 'border-brand-300 bg-brand-50' : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex h-8 w-8 flex-none items-center justify-center text-base font-extrabold text-slate-400">
                  {rank <= 3 ? <span className="text-xl">{MEDALS[rank - 1]}</span> : rank}
                </div>
                <Avatar avatar={e.avatar} size="h-9 w-9" text="text-lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold text-slate-800">{e.displayName}</span>
                    {e.isYou && (
                      <span className="flex-none rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Longest streak {e.longest}</div>
                </div>
                <div className="flex-none text-right font-extrabold text-slate-700">🔥 {e.streak}</div>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-6 text-center text-xs text-slate-300">
        Only names, icons, and streaks are shown here — nothing else.
      </p>
    </AppShell>
  );
}

import { NavLink } from 'react-router-dom';
import { Map, Trophy, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../common/Avatar';

const items: { to: string; label: string; Icon: LucideIcon | null; end: boolean }[] = [
  { to: '/', label: 'Learn', Icon: Map, end: true },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy, end: false },
  { to: '/account', label: 'Account', Icon: null, end: false },
];

export default function NavBar() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 lg:max-w-3xl">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {it.Icon === null ? (
                  <Avatar
                    avatar={profile?.avatar}
                    size="h-7 w-7"
                    text="text-base"
                    className={isActive ? 'ring-2 ring-brand-400' : ''}
                  />
                ) : (
                  <it.Icon className={`h-6 w-6 transition ${isActive ? 'scale-110' : ''}`} strokeWidth={2.25} />
                )}
                <span>{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../common/Avatar';

const items = [
  { to: '/', label: 'Learn', icon: '🗺️', end: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆', end: false },
  { to: '/account', label: 'Account', icon: '', end: false },
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
                {it.to === '/account' ? (
                  <Avatar
                    avatar={profile?.avatar}
                    size="h-7 w-7"
                    text="text-base"
                    className={isActive ? 'ring-2 ring-brand-400' : ''}
                  />
                ) : (
                  <span className={`text-2xl leading-7 transition ${isActive ? 'scale-110' : ''}`}>
                    {it.icon}
                  </span>
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

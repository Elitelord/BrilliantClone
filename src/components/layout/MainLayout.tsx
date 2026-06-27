import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

/** Shell for the tabbed pages (Learn / Leaderboard / Account) with a bottom nav. */
export default function MainLayout() {
  return (
    <div className="min-h-[100dvh]">
      <Outlet />
      <NavBar />
    </div>
  );
}

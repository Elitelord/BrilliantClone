import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProgressStore } from '../../store/progressStore';
import FullSpinner from '../common/Spinner';

export default function AuthGate() {
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.loading);
  const load = useProgressStore((s) => s.load);
  const loaded = useProgressStore((s) => s.loaded);
  const data = useProgressStore((s) => s.data);

  const dataMatches = loaded && data?.profile.uid === profile?.uid;

  useEffect(() => {
    if (profile && !dataMatches) {
      void load(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid]);

  if (authLoading) return <FullSpinner />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!dataMatches) return <FullSpinner label="Loading your progress..." />;
  return <Outlet />;
}

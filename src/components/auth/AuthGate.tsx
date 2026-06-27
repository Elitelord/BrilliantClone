import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProgressStore } from '../../store/progressStore';
import { FullSpinner } from '../common/Spinner';

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

  // Sync persisted name/avatar (loaded from storage) into the auth profile so the
  // header/nav reflect them after a refresh.
  useEffect(() => {
    if (!profile || !data || data.profile.uid !== profile.uid) return;
    const dp = data.profile;
    const avatar = dp.avatar ?? profile.avatar;
    const displayName = dp.displayName || profile.displayName;
    if (avatar !== profile.avatar || displayName !== profile.displayName) {
      useAuthStore.setState({ profile: { ...profile, avatar, displayName } });
    }
  }, [data, profile]);

  if (authLoading) return <FullSpinner />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!dataMatches) return <FullSpinner label="Loading your progress..." />;
  return <Outlet />;
}

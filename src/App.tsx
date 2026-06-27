import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthGate from './components/auth/AuthGate';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './routes/LoginPage';
import HomePage from './routes/HomePage';
import LeaderboardPage from './routes/LeaderboardPage';
import AccountPage from './routes/AccountPage';
import LessonPage from './routes/LessonPage';
import ReviewPage from './routes/ReviewPage';

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGate />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

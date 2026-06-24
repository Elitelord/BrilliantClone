import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const { profile, configured, error, signInEmail, signUpEmail, signInGoogle, continueAsGuest, clearError } =
    useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (profile) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') await signUpEmail(name.trim(), email.trim(), password);
      else await signInEmail(email.trim(), password);
    } catch {
      /* error surfaced via store */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-6 py-10 md:max-w-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl">
          🌍
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">Population Path</h1>
        <p className="mt-1 text-slate-500">Learn the Demographic Transition Model by doing.</p>
      </div>

      {configured ? (
        <>
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
              placeholder="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
              placeholder="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99] disabled:opacity-60"
            >
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => signInGoogle().catch(() => {})}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-base font-semibold text-slate-700 active:scale-[0.99]"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              clearError();
              setMode(mode === 'signup' ? 'signin' : 'signup');
            }}
            className="mt-5 text-center text-sm font-medium text-brand-600"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => continueAsGuest(name.trim() || 'Guest')}
              className="text-sm text-slate-400 underline"
            >
              or try it as a guest
            </button>
          </div>
        </>
      ) : (
        <GuestOnly onStart={(n) => continueAsGuest(n)} />
      )}
    </div>
  );
}

function GuestOnly({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
        Running in local mode (no Firebase config). Your progress saves to this device. Add a{' '}
        <code className="font-mono">.env</code> to enable accounts and cross-device sync.
      </div>
      <input
        className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        onClick={() => onStart(name.trim() || 'Guest')}
        className="w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 active:scale-[0.99]"
      >
        Start learning
      </button>
    </div>
  );
}

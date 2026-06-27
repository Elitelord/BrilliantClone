import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AVATARS, normalizeAvatar } from '../lib/avatars';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/common/Avatar';

export default function AccountPage() {
  const profile = useAuthStore((s) => s.profile);
  const updateAccount = useAuthStore((s) => s.updateAccount);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const logout = useAuthStore((s) => s.logout);
  const error = useAuthStore((s) => s.error);

  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState(normalizeAvatar(profile?.avatar));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = name.trim() !== (profile?.displayName ?? '') || avatar !== normalizeAvatar(profile?.avatar);

  const save = async () => {
    if (!dirty || !name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateAccount({ displayName: name.trim(), avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      /* error surfaced via store */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell className="pb-28">
      <header className="py-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-500">Profile</div>
        <h1 className="text-2xl font-extrabold text-slate-800">Account</h1>
      </header>

      {/* identity preview */}
      <div className="mb-6 flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <Avatar avatar={avatar} size="h-16 w-16" text="text-3xl" />
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold text-slate-800">{name.trim() || 'Your name'}</div>
          {profile?.email ? (
            <div className="truncate text-sm text-slate-400">{profile.email}</div>
          ) : (
            <div className="text-sm text-slate-400">Guest account (this device)</div>
          )}
        </div>
      </div>

      {/* name */}
      <label className="mb-1.5 block text-sm font-bold text-slate-700">Display name</label>
      <input
        className="mb-6 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400"
        placeholder="Your name"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
      />

      {/* avatar picker */}
      <div className="mb-1.5 text-sm font-bold text-slate-700">Choose your icon</div>
      <div className="mb-6 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvatar(a)}
            className={`flex aspect-square items-center justify-center rounded-2xl text-2xl transition ${
              avatar === a
                ? 'bg-brand-100 ring-2 ring-brand-500'
                : 'bg-slate-50 hover:bg-slate-100'
            }`}
            aria-label={`Avatar ${a}`}
            aria-pressed={avatar === a}
          >
            {a}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={!dirty || !name.trim() || saving}
        className="mb-8 w-full rounded-2xl bg-brand-600 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/20 transition active:scale-[0.99] disabled:opacity-40"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </button>

      {/* account actions */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span>Sign out</span>
          <span className="text-slate-300">→</span>
        </button>

        <div className="border-t border-slate-100" />

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-rose-600 hover:bg-rose-50"
          >
            <span>Delete account</span>
            <span className="text-rose-300">🗑</span>
          </button>
        ) : (
          <div className="bg-rose-50/60 px-5 py-4">
            <p className="text-sm font-semibold text-rose-700">
              Delete your account and all progress? This can’t be undone.
            </p>
            {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white active:scale-[0.99] disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-white py-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200 active:scale-[0.99]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

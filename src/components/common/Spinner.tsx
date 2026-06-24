export default function FullSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

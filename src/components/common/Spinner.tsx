export default function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-slate-200 border-t-brand-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 text-slate-400">
      <Spinner />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

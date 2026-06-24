interface Props {
  current: number; // 0-based index
  total: number;
}

export default function StepProgress({ current, total }: Props) {
  return (
    <div className="flex w-full gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < current ? 'bg-brand-600' : i === current ? 'bg-amber-400' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

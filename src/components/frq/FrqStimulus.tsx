import type { FrqStimulus } from '../../types/frq';
import InteractionRenderer from '../interactions/InteractionRenderer';

// Renders one FRQ stimulus read-only: a data table, or any lesson interaction (frozen).
export default function FrqStimulusView({ stimulus }: { stimulus: FrqStimulus }) {
  if ('kind' in stimulus) {
    return (
      <div className="min-w-0 flex-1 overflow-x-auto rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        {stimulus.caption && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {stimulus.caption}
          </div>
        )}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {stimulus.columns.map((c, i) => (
                <th key={i} className="border-b border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-600">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stimulus.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-slate-100 px-2 py-1.5 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="min-w-0 flex-1 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <InteractionRenderer interaction={stimulus} onChange={() => {}} disabled />
    </div>
  );
}

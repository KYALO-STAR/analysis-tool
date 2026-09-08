import React from 'react';
import { ContractType } from '../types';

interface AnalysisTypeSelectorProps {
  selectedType: ContractType;
  threshold: number;
  target: number;
  onSelectType: (t: ContractType) => void;
  onThresholdChange: (n: number) => void;
  onTargetChange: (n: number) => void;
}

const TYPES: { type: ContractType; label: string; short: string }[] = [
  { type: 'UNDER 8', label: 'Under 8', short: 'U8' },
  { type: 'OVER 1', label: 'Over 1', short: 'O1' },
  { type: 'EVEN', label: 'Even', short: 'EV' },
  { type: 'ODD', label: 'Odd', short: 'OD' },
  { type: 'OVER X', label: 'Over X', short: '>X' },
  { type: 'UNDER X', label: 'Under X', short: '<X' },
  { type: 'MATCHES X', label: 'Matches X', short: '=X' },
  { type: 'DIFFERS X', label: 'Differs X', short: '≠X' },
  { type: 'RISE', label: 'Rise', short: 'R' },
  { type: 'FALL', label: 'Fall', short: 'F' },
];

export const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
  selectedType,
  threshold,
  target,
  onSelectType,
  onThresholdChange,
  onTargetChange,
}) => {
  const needsThreshold = selectedType === 'OVER X' || selectedType === 'UNDER X';
  const needsTarget = selectedType === 'MATCHES X' || selectedType === 'DIFFERS X';

  return (
    <section className="bg-[#111622] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Analysis Type
          </h2>
          <p className="text-xs text-zinc-400">
            Choose the statistical outcome to analyze. All metrics are observational only.
          </p>
        </div>

        {(needsThreshold || needsTarget) && (
          <div className="flex items-center gap-2 flex-wrap">
            {needsThreshold && (
              <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                <span className="text-zinc-400">Threshold digit</span>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={threshold}
                  onChange={(e) =>
                    onThresholdChange(Math.max(0, Math.min(9, Number(e.target.value) || 0)))
                  }
                  className="w-14 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white font-mono text-center"
                />
              </label>
            )}
            {needsTarget && (
              <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                <span className="text-zinc-400">Target digit</span>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={target}
                  onChange={(e) =>
                    onTargetChange(Math.max(0, Math.min(9, Number(e.target.value) || 0)))
                  }
                  className="w-14 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white font-mono text-center"
                />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map(({ type, label, short }) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
                active
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

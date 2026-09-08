import React, { useMemo, useState } from 'react';
import { Tick } from '../types';
import { calculateDigitStats } from '../utils/digitMath';
import { BarChart3 } from 'lucide-react';

interface ProbabilityModesProps {
  ticks: Tick[];
}

type Mode = 'evenodd' | 'overunder' | 'matchdiff' | 'risefall';

const MODES: { id: Mode; label: string }[] = [
  { id: 'evenodd', label: 'Even / Odd' },
  { id: 'overunder', label: 'Over / Under' },
  { id: 'matchdiff', label: 'Matches / Differs' },
  { id: 'risefall', label: 'Rise / Fall' },
];

const pct = (count: number, total: number): number => (total ? (count / total) * 100 : 0);

export const ProbabilityModes: React.FC<ProbabilityModesProps> = ({ ticks }) => {
  const [mode, setMode] = useState<Mode>('overunder');
  const [threshold, setThreshold] = useState(5);
  const [target, setTarget] = useState(5);

  const digits = useMemo(() => ticks.map((t) => t.digit), [ticks]);
  const total = digits.length;
  const stats = useMemo(() => calculateDigitStats(digits), [digits]);

  const lastDigit = digits.length > 0 ? digits[digits.length - 1] : null;
  const mostFrequent = stats.length ? stats.reduce((a, b) => (b.count > a.count ? b : a)).digit : null;
  const leastFrequent = stats.length ? stats.reduce((a, b) => (b.count < a.count ? b : a)).digit : null;

  const evenOdd = useMemo(() => {
    const even = digits.filter((d) => d % 2 === 0).length;
    return { even: pct(even, digits.length), odd: pct(digits.length - even, digits.length) };
  }, [digits]);

  const overUnder = useMemo(() => {
    const over = digits.filter((d) => d > threshold).length;
    return { over: pct(over, digits.length), under: pct(digits.length - over, digits.length) };
  }, [digits, threshold]);

  const matchDiff = useMemo(() => {
    const match = digits.filter((d) => d === target).length;
    return { match: pct(match, digits.length), differ: pct(digits.length - match, digits.length) };
  }, [digits, target]);

  const riseFall = useMemo(() => {
    let rise = 0;
    let fall = 0;
    let flat = 0;
    for (let i = 1; i < ticks.length; i++) {
      const q = Number(ticks[i].quote);
      const p = Number(ticks[i - 1].quote);
      if (q > p) rise += 1;
      else if (q < p) fall += 1;
      else flat += 1;
    }
    const n = ticks.length > 0 ? ticks.length - 1 : 0;
    return { rise: pct(rise, n), fall: pct(fall, n), flat: pct(flat, n) };
  }, [ticks]);

  return (
    <section className="bg-[#111622] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Digit &amp; Quote Probability</h2>
            <p className="text-xs text-zinc-400">
              Observed frequency of each digit and each outcome mode across the current tick history. Statistics only.
            </p>
          </div>
        </div>
        <span className="text-xs text-zinc-400 font-mono self-start md:self-auto">
          {total.toLocaleString()} ticks analyzed
        </span>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
              mode === m.id
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode params */}
      {(mode === 'overunder' || mode === 'matchdiff') && (
        <div className="flex items-center gap-2 flex-wrap">
          {mode === 'overunder' && (
            <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
              <span className="text-zinc-400">Threshold digit</span>
              <input
                type="number"
                min={0}
                max={9}
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, Math.min(9, Number(e.target.value) || 0)))}
                className="w-14 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white font-mono text-center"
              />
            </label>
          )}
          {mode === 'matchdiff' && (
            <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
              <span className="text-zinc-400">Target digit</span>
              <input
                type="number"
                min={0}
                max={9}
                value={target}
                onChange={(e) => setTarget(Math.max(0, Math.min(9, Number(e.target.value) || 0)))}
                className="w-14 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-white font-mono text-center"
              />
            </label>
          )}
        </div>
      )}

      {/* Summary stats for the selected mode */}
      <div className="flex flex-wrap gap-3">
        {mode === 'evenodd' && (
          <>
            <Stat label="Even" value={`${evenOdd.even.toFixed(1)}%`} tone="up" />
            <Stat label="Odd" value={`${evenOdd.odd.toFixed(1)}%`} tone="down" />
          </>
        )}
        {mode === 'overunder' && (
          <>
            <Stat label={`Over ${threshold}`} value={`${overUnder.over.toFixed(1)}%`} tone="up" />
            <Stat label={`Under/Equal ${threshold}`} value={`${overUnder.under.toFixed(1)}%`} tone="down" />
          </>
        )}
        {mode === 'matchdiff' && (
          <>
            <Stat label={`Matches ${target}`} value={`${matchDiff.match.toFixed(1)}%`} tone="up" />
            <Stat label="Differs" value={`${matchDiff.differ.toFixed(1)}%`} tone="down" />
          </>
        )}
        {mode === 'risefall' && (
          <>
            <Stat label="Rise" value={`${riseFall.rise.toFixed(1)}%`} tone="up" />
            <Stat label="Fall" value={`${riseFall.fall.toFixed(1)}%`} tone="down" />
            <Stat label="Flat" value={`${riseFall.flat.toFixed(1)}%`} tone="neutral" />
          </>
        )}
        <div className="px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
          Most: <strong className="text-emerald-400">{mostFrequent ?? '-'}</strong> · Least:{' '}
          <strong className="text-rose-400">{leastFrequent ?? '-'}</strong>
        </div>
      </div>

      {/* Per-digit probability grid */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Per-Digit Probability (0–9)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: 10 }, (_, d) => {
            const count = stats[d].count;
            const pctValue = total ? (count / total) * 100 : 0;
            const isMost = total > 0 && d === mostFrequent;
            const isLeast = total > 0 && d === leastFrequent;
            const isCurrent = lastDigit === d;
            return (
              <div
                key={d}
                className={`rounded-xl border p-3 flex flex-col items-center ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-400/50'
                    : isMost
                    ? 'bg-emerald-950/40 border-emerald-800/60'
                    : isLeast
                    ? 'bg-rose-950/40 border-rose-800/60'
                    : 'bg-zinc-900/80 border-zinc-800'
                }`}
              >
                <span className="text-xl font-bold font-mono text-zinc-100">{d}</span>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-emerald-500/70'}`}
                    style={{ width: `${Math.min(100, pctValue)}%` }}
                  />
                </div>
                <span className="mt-1.5 text-xs font-mono font-bold text-zinc-200">{pctValue.toFixed(1)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {isCurrent ? 'current' : isMost ? 'most' : isLeast ? 'least' : `${count} ticks`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string; tone: 'up' | 'down' | 'neutral' }> = ({
  label,
  value,
  tone,
}) => (
  <div className="px-3.5 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
    <span className="text-zinc-400 block">{label}</span>
    <span
      className={`text-lg font-bold font-mono ${
        tone === 'up' ? 'text-emerald-400' : tone === 'down' ? 'text-rose-400' : 'text-zinc-300'
      }`}
    >
      {value}
    </span>
  </div>
);

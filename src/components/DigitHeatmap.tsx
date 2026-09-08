import React from 'react';
import { DigitStat, Digit } from '../types';
import { TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';

interface DigitHeatmapProps {
  stats: DigitStat[];
  totalDigits: number;
}

export const DigitHeatmap: React.FC<DigitHeatmapProps> = ({ stats, totalDigits }) => {
  // Find highest percentage for relative heat scaling
  const maxPercentage = Math.max(...stats.map((s) => s.percentage), 15);

  const getHeatIntensity = (percentage: number) => {
    if (totalDigits === 0) return { bg: 'bg-zinc-800/40', border: 'border-zinc-800', bar: 'bg-zinc-700' };
    const diff = percentage - 10; // deviation from expected 10.0%

    if (diff >= 5) {
      // Very Hot (>= 15%)
      return {
        bg: 'bg-emerald-950/50',
        border: 'border-emerald-600/70',
        bar: 'bg-emerald-400',
        label: 'HOT',
        labelColor: 'text-emerald-300 bg-emerald-900/60 border border-emerald-700/50',
      };
    } else if (diff >= 1.5) {
      // Slightly Hot (11.5% - 14.9%)
      return {
        bg: 'bg-emerald-950/30',
        border: 'border-emerald-700/40',
        bar: 'bg-emerald-500',
        label: 'ABOVE AVG',
        labelColor: 'text-emerald-400 bg-emerald-900/30',
      };
    } else if (diff <= -4) {
      // Very Cold (<= 6%)
      return {
        bg: 'bg-sky-950/40',
        border: 'border-sky-800/50',
        bar: 'bg-sky-400',
        label: 'COLD',
        labelColor: 'text-sky-300 bg-sky-900/60 border border-sky-700/50',
      };
    } else if (diff <= -1.5) {
      // Slightly Cold (6.1% - 8.5%)
      return {
        bg: 'bg-zinc-900',
        border: 'border-zinc-800',
        bar: 'bg-zinc-500',
        label: 'BELOW AVG',
        labelColor: 'text-zinc-400 bg-zinc-800/60',
      };
    }

    // Normal / Balanced
    return {
      bg: 'bg-zinc-900/70',
      border: 'border-zinc-800',
      bar: 'bg-emerald-600/80',
      label: 'NORMAL',
      labelColor: 'text-zinc-300 bg-zinc-800/40',
    };
  };

  return (
    <section className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              Digit Frequency Heatmap (0–9)
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              Theoretical Baseline: 10.0% each
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time occurrence distribution, deviation from expected 10%, gaps, and trends.
          </p>
        </div>

        {/* Heatmap color guide */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-sky-500" />
            <span>Cold (&lt;7%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-600" />
            <span>Balanced (~10%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
            <span>Hot (&gt;13%)</span>
          </span>
        </div>
      </div>

      {/* Grid of 10 Digits */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {stats.map((item) => {
          const heat = getHeatIntensity(item.percentage);
          const roles = null;
          const deviation = item.percentage - 10;
          const relativeWidth = maxPercentage > 0 ? (item.percentage / maxPercentage) * 100 : 0;

          return (
            <div
              key={item.digit}
              className={`p-3 rounded-lg border transition-all ${heat.bg} ${heat.border} flex flex-col justify-between`}
            >
              {/* Digit number & status pill */}
              <div className="flex items-start justify-between">
                <span className="text-2xl font-bold font-mono text-zinc-100">
                  {item.digit}
                </span>

                {item.trend === 'rising' ? (
                  <span
                    className="p-1 rounded bg-emerald-500/10 text-emerald-400"
                    title="Trending up in last 10 ticks"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                ) : item.trend === 'falling' ? (
                  <span
                    className="p-1 rounded bg-rose-500/10 text-rose-400"
                    title="Trending down in last 10 ticks"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1 text-zinc-600">
                    <Minus className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Percentage & Count */}
              <div className="my-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold font-mono text-zinc-100">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {item.count}x
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${heat.bar}`}
                    style={{ width: `${Math.min(100, Math.max(4, relativeWidth))}%` }}
                  />
                </div>

                {/* Deviation */}
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
                  <span>dev:</span>
                  <span
                    className={
                      deviation > 0.5
                        ? 'text-emerald-400'
                        : deviation < -0.5
                        ? 'text-sky-400'
                        : 'text-zinc-400'
                    }
                  >
                    {deviation > 0 ? `+${deviation.toFixed(1)}%` : `${deviation.toFixed(1)}%`}
                  </span>
                </div>
              </div>

              {/* Gap & Streak Metrics */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> Gap:
                  </span>
                  <span className={item.gap === 0 ? 'text-emerald-400 font-bold' : item.gap >= 15 ? 'text-amber-400' : 'text-zinc-300'}>
                    {totalDigits === 0 ? '-' : item.gap === 0 ? 'Current' : `${item.gap}t`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" /> Max:
                  </span>
                  <span className="text-zinc-300">
                    {item.maxStreak} streak
                  </span>
                </div>
              </div>

              {/* Frequency note */}
              <div className="mt-2.5 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between gap-1 text-[9px] font-medium text-zinc-500">
                <span>{item.percentage.toFixed(1)}% of all ticks</span>
                <span className="text-zinc-400">{item.count} occurrences</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

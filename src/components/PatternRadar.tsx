import React from 'react';
import { PatternRadarData } from '../types';
import { Flame, Snowflake, Repeat, Hourglass, AlertCircle } from 'lucide-react';

interface PatternRadarProps {
  data: PatternRadarData;
  totalDigits: number;
}

export const PatternRadar: React.FC<PatternRadarProps> = ({ data, totalDigits }) => {
  return (
    <section className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
            Pattern Radar
          </h2>
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          Anomaly & Streak Scanner
        </span>
      </div>

      {totalDigits < 5 ? (
        <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-600" />
          <span>Pattern radar activates when at least 5 digits are registered.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quadrant 1: Hot Digits */}
          <div className="bg-zinc-950/80 border border-amber-500/20 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>HOT DIGITS</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Highest Freq</span>
            </div>

            <div className="space-y-2 mt-1">
              {data.hotDigits.length > 0 ? (
                data.hotDigits.map((item, idx) => (
                  <div
                    key={item.digit}
                    className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Rank #{idx + 1}
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-amber-400 font-semibold">{item.percentage.toFixed(1)}%</span>
                      <span className="text-[10px] text-zinc-500 ml-1.5">({item.count}x)</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-500">None detected</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Appearing significantly above expected 10% rate.</p>
          </div>

          {/* Quadrant 2: Cold Digits */}
          <div className="bg-zinc-950/80 border border-sky-500/20 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <Snowflake className="w-4 h-4 text-sky-400" />
                <span>COLD DIGITS</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Lowest Freq</span>
            </div>

            <div className="space-y-2 mt-1">
              {data.coldDigits.length > 0 ? (
                data.coldDigits.map((item, idx) => (
                  <div
                    key={item.digit}
                    className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono font-bold text-xs flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Rank #{idx + 1}
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-sky-400 font-semibold">{item.percentage.toFixed(1)}%</span>
                      <span className="text-[10px] text-zinc-500 ml-1.5">({item.count}x)</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-500">None detected</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Suppressed frequency across current sample.</p>
          </div>

          {/* Quadrant 3: Repeated Digits */}
          <div className="bg-zinc-950/80 border border-purple-500/20 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                <Repeat className="w-4 h-4 text-purple-400" />
                <span>REPEATED DIGITS</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Consecutive Runs</span>
            </div>

            <div className="space-y-2 mt-1">
              {data.repeatedDigits.length > 0 ? (
                data.repeatedDigits.map((item) => (
                  <div
                    key={item.digit}
                    className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {item.digit}-{item.digit} Run
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-purple-300 font-semibold">{item.streak}x in a row</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800/60 text-center text-xs text-zinc-500">
                  No consecutive repeats recorded
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Consecutive duplicate tick occurrences.</p>
          </div>

          {/* Quadrant 4: Overdue Digits */}
          <div className="bg-zinc-950/80 border border-rose-500/20 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <Hourglass className="w-4 h-4 text-rose-400" />
                <span>OVERDUE DIGITS</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Max Gap</span>
            </div>

            <div className="space-y-2 mt-1">
              {data.overdueDigits.length > 0 ? (
                data.overdueDigits.map((item) => (
                  <div
                    key={item.digit}
                    className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1.5 rounded border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs flex items-center justify-center">
                        {item.digit}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Absent since
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-rose-400 font-semibold">{item.gap} ticks</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-500">None detected</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Digits with largest gap since last arrival.</p>
          </div>
        </div>
      )}
    </section>
  );
};

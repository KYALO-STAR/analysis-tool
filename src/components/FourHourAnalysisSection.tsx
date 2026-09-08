import React, { useState } from 'react';
import {
  Clock,
  Target,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Eye,
  BarChart3,
  Info,
} from 'lucide-react';
import { Digit, FourHourAnalysis, ContractConfig, Outcome } from '../types';
import { getContractMeta } from '../utils/digitMath';

interface FourHourAnalysisSectionProps {
  analysis: FourHourAnalysis;
  latestDigit: Digit | null;
  config: ContractConfig;
}

const outcomeColor = (o: Outcome): string => {
  if (o === 'win') return 'bg-zinc-800 text-emerald-400 border border-emerald-500/20';
  if (o === 'loss') return 'bg-rose-950/70 text-rose-400 border border-rose-500/40';
  return 'bg-zinc-900 text-zinc-500 border border-zinc-700/40';
};

export const FourHourAnalysisSection: React.FC<FourHourAnalysisSectionProps> = ({
  analysis,
  latestDigit,
  config,
}) => {
  const [selectedSampleTab, setSelectedSampleTab] = useState<string>('recent-live');
  const meta = getContractMeta(config);

  const {
    totalTicks,
    timeframeLabel,
    overallWinRate,
    overallLossRate,
    recommendedDigit,
    runnerUpDigit,
    avoidDigits,
    isLiveTriggerActive,
    transitionStats,
    hourlyBreakdowns,
    sampleSequences,
    summaryRecommendation,
  } = analysis;

  const topStat = transitionStats.find((s) => s.digit === recommendedDigit) || transitionStats[0];
  const runnerUpStat = transitionStats.find((s) => s.digit === runnerUpDigit);
  const activeSample = sampleSequences.find((s) => s.id === selectedSampleTab) || sampleSequences[0];
  const theoretical = meta.theoreticalWinRate;
  return (
    <section
      id="four-hour-analysis-section"
      className="bg-[#111622] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6"
    >
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Historical Sequence Audit
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  {totalTicks.toLocaleString()} TICKS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Transition analysis for <span className="text-emerald-400 font-semibold">{config.type}</span> —
                which digit shows the highest observed probability of a win on the next tick. Statistics only.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Observed Win Rate</span>
            <span className="text-emerald-400 font-bold text-sm">{overallWinRate}%</span>
          </div>
          <div className="w-px h-6 bg-zinc-800" />
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Loss Rate</span>
            <span className="text-rose-400 font-bold text-sm">{overallLossRate}%</span>
          </div>
          <div className="w-px h-6 bg-zinc-800" />
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Current Tick</span>
            <span className="text-white font-bold text-sm">{latestDigit !== null ? latestDigit : '-'}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero: highest observed next-tick win-rate digit */}
      <div
        id="recommended-entry-hero"
        className={`relative overflow-hidden rounded-xl border p-5 sm:p-6 transition-all ${
          isLiveTriggerActive
            ? 'bg-gradient-to-br from-emerald-950/70 via-zinc-900/90 to-zinc-950 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/50'
            : 'bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950 border-zinc-700/80'
        }`}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                High-Frequency Digit
              </span>
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-4xl sm:text-5xl shadow-2xl transition-all ${
                  isLiveTriggerActive
                    ? 'bg-emerald-500 text-black shadow-emerald-500/50 animate-bounce'
                    : 'bg-zinc-800 text-emerald-400 border-2 border-emerald-500/50 shadow-emerald-950/50'
                }`}
              >
                {recommendedDigit}
              </div>
              <span className="mt-1 text-[10px] font-mono text-emerald-400/90 font-bold uppercase tracking-wide">
                Highest next-tick win rate
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  {config.type} ANALYSIS
                </span>

                {isLiveTriggerActive ? (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider bg-emerald-500 text-black animate-pulse flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CURRENT DIGIT MATCHES HIGH-FREQUENCY DIGIT
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    Watching live stream for Digit {recommendedDigit}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Digit <span className="text-emerald-400">{recommendedDigit}</span> — highest observed next-tick win rate
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Over the analyzed window ({totalTicks.toLocaleString()} ticks), whenever{' '}
                <strong className="text-white">Digit {recommendedDigit}</strong> printed, the next tick was a win (
                {meta.winDescription}) in <strong className="text-emerald-400">{topStat?.nextTickWinRate}%</strong> of
                observed cases ({topStat?.nextTickWinCount} of {topStat?.totalOccurrences} triggers), relative to the{' '}
                {theoretical}% theoretical baseline. Observational statistics only.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto self-stretch lg:self-auto">
            <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Next-Tick Win Rate</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">{topStat?.nextTickWinRate}%</span>
              <span className="text-[10px] font-mono text-emerald-500/80 block mt-0.5">
                {topStat && topStat.edgeVsBaseline > 0 ? `+${topStat.edgeVsBaseline}%` : `${topStat?.edgeVsBaseline ?? 0}%`} vs baseline
              </span>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Loss Rate</span>
              <span className="text-2xl font-mono font-bold text-rose-400">{topStat?.nextTickLossRate}%</span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">next-tick losses</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-center">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Sample Size</span>
              <span className="text-2xl font-mono font-bold text-zinc-100">{topStat?.totalOccurrences}</span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">occurrences</span>
            </div>
          </div>
        </div>

        {/* Observation note instead of execution guide */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">1</span>
            <div>
              <strong className="text-zinc-200 block">Observation</strong>
              <span className="text-zinc-400">Digit {recommendedDigit} has shown the highest observed next-tick win rate for {config.type}.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">2</span>
            <div>
              <strong className="text-zinc-200 block">Next-tick outcome</strong>
              <span className="text-zinc-400">A win means {meta.winDescription} on the following tick.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">3</span>
            <div>
              <strong className="text-zinc-200 block">Secondary</strong>
              <span className="text-zinc-400">Digit {runnerUpDigit} is the next-highest at {runnerUpStat?.nextTickWinRate}%.</span>
            </div>
          </div>
        </div>

        {avoidDigits.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Digits with the lowest observed next-tick win rate:</strong> {avoidDigits.join(' & ')} (
              {transitionStats.find((s) => s.digit === avoidDigits[0])?.nextTickLossRate}% loss rate).
            </span>
          </div>
        )}
      </div>

      {/* 3. Sequence samples */}
      {sampleSequences.length > 0 && activeSample && (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Representative Sequence Samples
            </h3>
            <p className="text-xs text-zinc-400">
              Real sequence slices showing wins, losses, and Digit {recommendedDigit} follow-through.
            </p>
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1">
            {sampleSequences.map((sample) => (
              <button
                key={sample.id}
                onClick={() => setSelectedSampleTab(sample.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedSampleTab === sample.id
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {sample.tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-zinc-200 block">{activeSample.title}</span>
              <span className="text-xs text-zinc-400">{activeSample.subtitle}</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                Win Rate: {activeSample.winRate}%
              </span>
              <span className="text-zinc-400">
                Losses: <strong className="text-rose-400">{activeSample.lossesCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {activeSample.ticks.map((d, idx) => {
              const outcome = activeSample.outcomes ? activeSample.outcomes[idx] : undefined;
              const isWin = outcome === 'win';
              const isTargetTrigger = d === recommendedDigit;
              const isNextAfterTrigger = idx > 0 && activeSample.ticks[idx - 1] === recommendedDigit;

              return (
                <div key={`${selectedSampleTab}-${idx}`} className="flex flex-col items-center">
                  {isTargetTrigger && (
                    <span className="text-[9px] font-mono font-bold text-amber-400 leading-none mb-0.5 uppercase tracking-tight">
                      HIGH-FREQ
                    </span>
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all ${
                      isTargetTrigger
                        ? 'bg-amber-500 text-black ring-2 ring-amber-300 shadow-md shadow-amber-500/30'
                        : isNextAfterTrigger
                        ? isWin
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                          : 'bg-rose-600 text-white ring-2 ring-rose-400'
                        : outcomeColor(outcome ?? 'flat')
                    }`}
                    title={`Index ${idx}: Digit ${d}${outcome ? ` - ${outcome.toUpperCase()}` : ''}${
                      isTargetTrigger ? ' - High-frequency digit' : ''
                    }`}
                  >
                    {d}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 mt-0.5">#{idx + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
              <span>High-frequency digit ({recommendedDigit})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-zinc-800 border border-emerald-500/30 inline-block" />
              <span>Win</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-950/80 border border-rose-500/50 inline-block" />
              <span>Loss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-zinc-900 border border-zinc-700 inline-block" />
              <span>Flat (Rise/Fall)</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 4. Transition table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Transition Probability Table (All 10 Digits)
            </h3>
            <p className="text-xs text-zinc-400">
              For each digit appearing as the prior tick, the outcome of the immediate next tick.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Trigger Digit</th>
                <th className="py-2.5 px-3 font-semibold">Frequency</th>
                <th className="py-2.5 px-3 font-semibold">Next-Tick Win Rate</th>
                <th className="py-2.5 px-3 font-semibold">Loss Rate</th>
                <th className="py-2.5 px-3 font-semibold">Edge vs {theoretical}%</th>
                <th className="py-2.5 px-3 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
              {transitionStats.map((stat) => {
                const isSelected = stat.digit === recommendedDigit;
                const isRunnerUp = stat.digit === runnerUpDigit;

                return (
                  <tr
                    key={stat.digit}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/30 hover:bg-emerald-950/50 font-bold'
                        : isRunnerUp
                        ? 'bg-blue-950/20 hover:bg-blue-950/40'
                        : 'hover:bg-zinc-900/60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                          stat.rank === 1
                            ? 'bg-emerald-500 text-black'
                            : stat.rank === 2
                            ? 'bg-blue-500 text-white'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        #{stat.rank}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-emerald-500 text-black'
                              : stat.status === 'AVOID'
                              ? 'bg-rose-950/70 text-rose-400 border border-rose-500/40'
                              : 'bg-zinc-800 text-zinc-100'
                          }`}
                        >
                          {stat.digit}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-emerald-400 uppercase font-bold">TOP</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-zinc-300">{stat.totalOccurrences.toLocaleString()} times</td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stat.nextTickWinRate >= theoretical + 2
                                ? 'bg-emerald-400'
                                : stat.nextTickWinRate >= theoretical
                                ? 'bg-emerald-500/80'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, stat.nextTickWinRate)}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            stat.nextTickWinRate >= theoretical + 2
                              ? 'text-emerald-400'
                              : stat.nextTickWinRate >= theoretical
                              ? 'text-zinc-200'
                              : 'text-amber-400'
                          }`}
                        >
                          {stat.nextTickWinRate}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-rose-400">{stat.nextTickLossRate}%</td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          stat.edgeVsBaseline > 0 ? 'text-emerald-400' : stat.edgeVsBaseline === 0 ? 'text-zinc-400' : 'text-rose-400'
                        }`}
                      >
                        {stat.edgeVsBaseline > 0 ? `+${stat.edgeVsBaseline}%` : `${stat.edgeVsBaseline}%`}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      {stat.status === 'TOP' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px]">TOP</span>
                      ) : stat.status === 'RUNNER_UP' ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px]">RUNNER UP</span>
                      ) : stat.status === 'FAVORABLE' ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold text-[10px]">FAVORABLE</span>
                      ) : stat.status === 'AVOID' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/40 font-bold text-[10px]">AVOID</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">NEUTRAL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Hourly breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Hourly Stability Breakdown Across 4 Hours
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hourlyBreakdowns.map((hb) => (
            <div key={hb.label} className="bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">{hb.label}</span>
                <span className="text-[10px] font-mono text-zinc-500">{hb.tickCount} ticks</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Win Rate</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{hb.winRate}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Losses</span>
                  <span className="text-lg font-bold font-mono text-rose-400">{hb.lossRate}%</span>
                </div>
              </div>

              <div className="pt-1 border-t border-zinc-800/70 text-[11px] font-mono flex items-center justify-between text-zinc-400">
                <span>Top Digit:</span>
                <span className="text-emerald-300 font-bold">
                  Digit {hb.bestTriggerDigit} ({hb.bestTriggerRate}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Summary</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">{summaryRecommendation.whyThisDigit}</p>
        {summaryRecommendation.riskRule && (
          <p className="text-xs text-amber-300/90 leading-relaxed mt-1.5">
            <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
            {summaryRecommendation.riskRule}
          </p>
        )}
      </div>
    </section>
  );
};

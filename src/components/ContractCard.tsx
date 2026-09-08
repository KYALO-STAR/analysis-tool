import React from 'react';
import { ContractAnalysis, WindowMetric } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Clock,
} from 'lucide-react';

interface ContractCardProps {
  analysis: ContractAnalysis;
  totalDigits: number;
}

export const ContractCard: React.FC<ContractCardProps> = ({ analysis, totalDigits }) => {
  const isQuoteType = analysis.riskDigits.length === 0;
  const theoretical = analysis.theoreticalWinRate;

  const getWatchBadge = (status: ContractAnalysis['watchStatus']) => {
    switch (status) {
      case 'SIGNAL':
        return {
          bg: 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />,
          title: 'FAVORABLE',
          sub: 'Observed statistics favorable',
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-500/15 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          icon: <Eye className="w-5 h-5 text-amber-400" />,
          title: 'OBSERVE',
          sub: 'Conditions forming / Near threshold',
        };
      case 'WAIT':
      default:
        return {
          bg: 'bg-zinc-800/90 border-zinc-700 text-zinc-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          title: 'WAIT',
          sub: 'Insufficient data or elevated risk',
        };
    }
  };

  const getStrengthBadge = (strength: ContractAnalysis['signalStrength']) => {
    switch (strength) {
      case 'Strong':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Weak':
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const watchStyle = getWatchBadge(analysis.watchStatus);

  const renderWindowMetric = (w: WindowMetric, label: string) => {
    return (
      <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-lg p-2.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-zinc-400 font-medium">{label}</span>
          <span className="font-mono text-[11px] text-zinc-500">
            {w.isSufficient ? `${w.winCount}/${w.windowSize}` : `${w.availableTicks}/${w.windowSize}t`}
          </span>
        </div>

        {w.availableTicks === 0 ? (
          <div className="text-xs text-zinc-600 font-mono py-1">No data</div>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-base font-bold font-mono ${
                  w.winRate >= theoretical ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {w.winRate.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {w.winRate >= theoretical ? `+${(w.winRate - theoretical).toFixed(0)}%` : `${(w.winRate - theoretical).toFixed(0)}%`}
              </span>
            </div>

            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full ${w.winRate >= theoretical ? 'bg-emerald-400' : 'bg-rose-400'}`}
                style={{ width: `${Math.min(100, Math.max(0, w.winRate))}%` }}
              />
            </div>
          </>
        )}

        {!w.isSufficient && w.availableTicks > 0 && (
          <span className="text-[9px] text-amber-400/80 mt-1 font-mono">
            Accumulating ({w.availableTicks}/{w.windowSize})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black tracking-wide text-zinc-100 uppercase">
              {analysis.contractName} ANALYSIS
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${getStrengthBadge(
                analysis.signalStrength
              )}`}
            >
              {analysis.signalStrength} Alignment
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Win if: <span className="text-emerald-400 font-mono font-semibold">{analysis.winDescription}</span>{' '}
            ({theoretical}% theoretical baseline)
          </p>
        </div>

        {!isQuoteType && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase block leading-none">Wins</span>
              <span className="text-emerald-400 font-bold">[{analysis.targetDigits.join(',')}]</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 text-[10px] uppercase block leading-none">Risk (Loss)</span>
              <span className="text-rose-400 font-bold">[{analysis.riskDigits.join(',')}]</span>
            </div>
          </div>
        )}
      </div>

      {/* Hero: Observation Status + Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className={`md:col-span-7 rounded-xl border p-4 flex flex-col justify-between transition-all ${watchStyle.bg}`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Observation Status</div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {watchStyle.icon}
                <span className="font-extrabold text-sm tracking-wide">{watchStyle.title}</span>
              </div>
            </div>

            <div className="mt-2 text-sm font-semibold text-zinc-100">{watchStyle.sub}</div>

            <p className="text-xs text-zinc-300/90 mt-1 leading-relaxed">{analysis.watchReason}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-700/40 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Observed Win Rate:</span>
            <span className="font-bold text-zinc-200">
              {totalDigits > 0 ? `${analysis.overallWinRate.toFixed(1)}% (${analysis.totalWins}/${analysis.totalWins + analysis.totalLosses})` : '0%'}
            </span>
          </div>
        </div>

        <div className="md:col-span-5 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confidence Score</span>
            <span className="text-[10px] text-zinc-500 font-mono">0–100 Scale</span>
          </div>

          <div className="my-2 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                  analysis.confidenceScore >= 75
                    ? 'text-emerald-400'
                    : analysis.confidenceScore >= 55
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {analysis.confidenceScore}
                <span className="text-lg font-normal text-zinc-500">/100</span>
              </div>
              <div className="text-[11px] font-medium text-zinc-400 mt-1">
                {analysis.confidenceScore >= 75
                  ? 'Strong Statistical Alignment'
                  : analysis.confidenceScore >= 55
                  ? 'Moderate Alignment'
                  : 'Low Historical Support'}
              </div>
            </div>
          </div>

          <div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  analysis.confidenceScore >= 75
                    ? 'bg-emerald-400'
                    : analysis.confidenceScore >= 55
                    ? 'bg-amber-400'
                    : 'bg-zinc-500'
                }`}
                style={{ width: `${analysis.confidenceScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
              <span>0 (Weak)</span>
              <span>50 (Neutral)</span>
              <span>100 (Strong)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rolling Windows */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rolling Windows Analysis</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Expected: {theoretical}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {renderWindowMetric(analysis.rollingWindows.w10, 'Last 10 Ticks')}
          {renderWindowMetric(analysis.rollingWindows.w25, 'Last 25 Ticks')}
          {renderWindowMetric(analysis.rollingWindows.w50, 'Last 50 Ticks')}
          {renderWindowMetric(analysis.rollingWindows.w100, 'Last 100 Ticks')}
        </div>
      </div>

      {/* Risk digits monitor (digit-based types only) */}
      {!isQuoteType && analysis.riskDigits.length > 0 && (
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Risk Digits Monitor ({analysis.riskDigits.join(', ')})</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Combined Expected: {(100 - theoretical).toFixed(0)}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {analysis.riskDigitStats.map((risk) => {
              const isWarning = risk.status === 'warning';
              const isDormant = risk.status === 'dormant';

              return (
                <div
                  key={risk.digit}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    isWarning
                      ? 'bg-rose-950/40 border-rose-700/60'
                      : isDormant
                      ? 'bg-emerald-950/30 border-emerald-800/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 font-mono font-bold text-sm text-zinc-200 flex items-center justify-center">
                      {risk.digit}
                    </span>
                    <div>
                      <span className="text-xs font-semibold block text-zinc-200">Digit {risk.digit}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{risk.countInLast25} in last 25t</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-zinc-200">
                      {risk.gap === 0 ? <span className="text-rose-400">Just Hit!</span> : `${risk.gap}t ago`}
                    </div>
                    <span
                      className={`text-[9px] uppercase font-semibold ${
                        isWarning ? 'text-rose-400' : isDormant ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {isWarning ? 'Immediate Risk' : isDormant ? 'Dormant' : 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistical Factors */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
          <Info className="w-3.5 h-3.5 text-zinc-400" />
          <span>Transparent Statistical Factors</span>
        </div>

        <div className="space-y-1.5">
          {analysis.statisticalFactors.map((factor, idx) => (
            <div
              key={idx}
              className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    factor.impact === 'positive'
                      ? 'bg-emerald-400'
                      : factor.impact === 'negative'
                      ? 'bg-rose-400'
                      : 'bg-zinc-500'
                  }`}
                />
                <span className="font-medium text-zinc-300">{factor.name}:</span>
                <span className="text-zinc-400">{factor.detail}</span>
              </div>
              <span
                className={`font-mono text-right font-semibold text-[11px] ${
                  factor.impact === 'positive'
                    ? 'text-emerald-400'
                    : factor.impact === 'negative'
                    ? 'text-rose-400'
                    : 'text-zinc-400'
                }`}
              >
                {factor.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Why this status?</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">{analysis.explanation}</p>
      </div>
    </div>
  );
};

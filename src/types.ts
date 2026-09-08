export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SignalStrength = 'Strong' | 'Moderate' | 'Weak' | 'None';

export type WatchStatus = 'WAIT' | 'WATCH' | 'SIGNAL';

/**
 * The binary analysis types supported by the tool.
 * All are 2-state (definitive) outcomes. Digit-based types evaluate the last
 * digit of each quote; RISE/FALL evaluate the direction of consecutive quotes.
 */
export type ContractType =
  | 'UNDER 8'
  | 'OVER 1'
  | 'EVEN'
  | 'ODD'
  | 'OVER X'
  | 'UNDER X'
  | 'MATCHES X'
  | 'DIFFERS X'
  | 'RISE'
  | 'FALL';

/** Configuration for a selected analysis type. */
export interface ContractConfig {
  type: ContractType;
  /** Threshold digit for OVER X / UNDER X (win if digit > / <= threshold). */
  threshold?: number;
  /** Target digit for MATCHES X / DIFFERS X. */
  target?: number;
}

/** A single tick: the last digit of the quote plus the raw quote (for direction). */
export interface Tick {
  digit: Digit;
  quote: number;
  epoch?: number;
  pipSize?: number;
}

export type Outcome = 'win' | 'loss' | 'flat';

export interface DigitStat {
  digit: Digit;
  count: number;
  percentage: number;
  gap: number; // Ticks since this digit last appeared (0 if current tick is this digit)
  currentStreak: number; // If sequence ends with this digit repeatedly
  maxStreak: number; // Maximum consecutive appearances in history
  trend: 'rising' | 'falling' | 'neutral'; // Comparison of last 10 vs overall
  recentCount10: number; // Count in last 10 digits
}

export interface WindowMetric {
  windowSize: number;
  availableTicks: number;
  winCount: number;
  lossCount: number;
  winRate: number; // Percentage 0-100 (of wins+losses; flats excluded)
  lossRate: number; // Percentage 0-100
  isSufficient: boolean; // True if availableTicks >= windowSize
}

export interface ContractAnalysis {
  contractName: ContractType;
  config: ContractConfig;
  winDescription: string; // human-readable "wins if..." description
  targetDigits: Digit[]; // digits that win (digit-based types only)
  riskDigits: Digit[]; // digits that lose (digit-based types only)
  theoreticalWinRate: number; // expected baseline (80, 50, etc.)
  overallWinRate: number;
  totalWins: number;
  totalLosses: number;
  rollingWindows: {
    w10: WindowMetric;
    w25: WindowMetric;
    w50: WindowMetric;
    w100: WindowMetric;
  };
  confidenceScore: number; // 0-100
  signalStrength: SignalStrength;
  watchStatus: WatchStatus;
  watchReason: string;
  statisticalFactors: {
    name: string;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
    detail: string;
  }[];
  explanation: string;
  riskDigitStats: {
    digit: Digit;
    countInLast25: number;
    gap: number;
    status: 'dormant' | 'active' | 'warning';
  }[];
}

export interface PatternRadarData {
  hotDigits: { digit: Digit; percentage: number; count: number }[];
  coldDigits: { digit: Digit; percentage: number; count: number }[];
  repeatedDigits: { digit: Digit; streak: number }[];
  overdueDigits: { digit: Digit; gap: number }[];
}

export interface FeedStatus {
  mode: 'manual' | 'simulated' | 'deriv_live';
  isConnected: boolean;
  activeSymbol: string;
  tickIntervalMs: number;
  lastTickTime: number | null;
}

export interface DigitTransitionStat {
  digit: Digit;
  totalOccurrences: number;
  nextTickWinCount: number;
  nextTickWinRate: number; // 0 - 100%
  nextTickLossCount: number;
  nextTickLossRate: number; // 0 - 100%
  rank: number; // 1 = highest observed next-tick win rate
  status: 'TOP' | 'RUNNER_UP' | 'FAVORABLE' | 'NEUTRAL' | 'AVOID';
  edgeVsBaseline: number; // e.g. +5.4%
  streakSafety: number; // max consecutive loss count when triggered
  lastSeenAgoTicks: number; // ticks since this trigger digit occurred
}

export interface HourlyBreakdown {
  hourIndex: number; // 1 to 4
  label: string; // "Hour 1 (0-60m ago)", etc.
  tickCount: number;
  winRate: number;
  lossRate: number;
  bestTriggerDigit: Digit;
  bestTriggerRate: number;
}

export interface CuratedSequenceSample {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  ticks: Digit[];
  outcomes?: Outcome[];
  winRate: number;
  lossesCount: number;
  highlightTriggerDigit?: Digit;
}

export interface FourHourAnalysis {
  totalTicks: number;
  timeframeLabel: string;
  overallWinRate: number;
  overallLossRate: number;
  recommendedDigit: Digit;
  runnerUpDigit: Digit;
  avoidDigits: Digit[];
  isLiveTriggerActive: boolean;
  latestDigit: Digit | null;
  transitionStats: DigitTransitionStat[];
  hourlyBreakdowns: HourlyBreakdown[];
  sampleSequences: CuratedSequenceSample[];
  summaryRecommendation: {
    digit: Digit;
    successRate: number;
    sampleSize: number;
    whyThisDigit: string;
    riskRule: string;
  };
}

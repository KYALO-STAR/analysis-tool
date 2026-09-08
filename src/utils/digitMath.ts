import {
  Digit,
  DigitStat,
  WindowMetric,
  ContractAnalysis,
  ContractConfig,
  ContractType,
  PatternRadarData,
  SignalStrength,
  WatchStatus,
  Tick,
  Outcome,
} from '../types';

/**
 * Parse any raw input string (commas, spaces, or raw digits) into a valid array of Digits (0-9)
 */
export function parseDigitSequence(input: string): Digit[] {
  if (!input) return [];
  const matches = input.match(/\d/g);
  if (!matches) return [];
  return matches
    .map((char) => parseInt(char, 10))
    .filter((n): n is Digit => !isNaN(n) && n >= 0 && n <= 9);
}

/** Human-readable "wins if..." description for a contract type + config. */
export function describeWinCondition(config: ContractConfig): string {
  switch (config.type) {
    case 'UNDER 8':
      return 'Digit is 0–7';
    case 'OVER 1':
      return 'Digit is 2–9';
    case 'EVEN':
      return 'Digit is even (0,2,4,6,8)';
    case 'ODD':
      return 'Digit is odd (1,3,5,7,9)';
    case 'OVER X':
      return `Digit is over ${config.threshold ?? 5}`;
    case 'UNDER X':
      return `Digit is under or equal to ${config.threshold ?? 5}`;
    case 'MATCHES X':
      return `Digit equals ${config.target ?? 5}`;
    case 'DIFFERS X':
      return `Digit differs from ${config.target ?? 5}`;
    case 'RISE':
      return 'Quote rose vs previous tick';
    case 'FALL':
      return 'Quote fell vs previous tick';
  }
}

/** Winning/losing digit sets + theoretical baseline for a contract type + config. */
export function getContractMeta(config: ContractConfig): {
  targetDigits: Digit[];
  riskDigits: Digit[];
  theoreticalWinRate: number;
  isQuoteType: boolean;
  winDescription: string;
} {
  const digits = (n: number): Digit[] => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, n) as Digit[];
  const from = (n: number): Digit[] => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].slice(n) as Digit[];

  switch (config.type) {
    case 'UNDER 8':
      return {
        targetDigits: digits(8),
        riskDigits: [8, 9],
        theoreticalWinRate: 80,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    case 'OVER 1':
      return {
        targetDigits: from(2),
        riskDigits: [0, 1],
        theoreticalWinRate: 80,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    case 'EVEN':
      return {
        targetDigits: [0, 2, 4, 6, 8],
        riskDigits: [1, 3, 5, 7, 9],
        theoreticalWinRate: 50,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    case 'ODD':
      return {
        targetDigits: [1, 3, 5, 7, 9],
        riskDigits: [0, 2, 4, 6, 8],
        theoreticalWinRate: 50,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    case 'OVER X': {
      const t = config.threshold ?? 5;
      return {
        targetDigits: from(t + 1),
        riskDigits: digits(t + 1),
        theoreticalWinRate: ((9 - t) / 10) * 100,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    }
    case 'UNDER X': {
      const t = config.threshold ?? 5;
      return {
        targetDigits: digits(t + 1),
        riskDigits: from(t + 1),
        theoreticalWinRate: ((t + 1) / 10) * 100,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    }
    case 'MATCHES X': {
      const t = config.target ?? 5;
      return {
        targetDigits: [t as Digit],
        riskDigits: digits(10).filter((d) => d !== t) as Digit[],
        theoreticalWinRate: 10,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    }
    case 'DIFFERS X': {
      const t = config.target ?? 5;
      return {
        targetDigits: digits(10).filter((d) => d !== t) as Digit[],
        riskDigits: [t as Digit],
        theoreticalWinRate: 90,
        isQuoteType: false,
        winDescription: describeWinCondition(config),
      };
    }
    case 'RISE':
      return {
        targetDigits: [],
        riskDigits: [],
        theoreticalWinRate: 50,
        isQuoteType: true,
        winDescription: describeWinCondition(config),
      };
    case 'FALL':
      return {
        targetDigits: [],
        riskDigits: [],
        theoreticalWinRate: 50,
        isQuoteType: true,
        winDescription: describeWinCondition(config),
      };
  }
}

/**
 * Evaluate the outcome (win/loss/flat) of the tick at `index`.
 * For digit types every tick is win or loss. For RISE/FALL the first tick is
 * 'flat' (no previous quote to compare) and equal quotes are 'flat'.
 */
export function getOutcomeAt(ticks: Tick[], index: number, config: ContractConfig): Outcome {
  const meta = getContractMeta(config);
  if (meta.isQuoteType) {
    if (index <= 0) return 'flat';
    const prev = ticks[index - 1].quote;
    const curr = ticks[index].quote;
    if (curr > prev) return config.type === 'RISE' ? 'win' : 'loss';
    if (curr < prev) return config.type === 'FALL' ? 'win' : 'loss';
    return 'flat';
  }
  const targetSet = new Set<Digit>(meta.targetDigits);
  return targetSet.has(ticks[index].digit) ? 'win' : 'loss';
}

/** Outcome array aligned with `ticks`. */
export function evaluateOutcomes(ticks: Tick[], config: ContractConfig): Outcome[] {
  const out: Outcome[] = [];
  for (let i = 0; i < ticks.length; i++) out.push(getOutcomeAt(ticks, i, config));
  return out;
}

/**
 * Calculate per-digit frequencies, percentages, gaps, streaks, and short-term trends
 */
export function calculateDigitStats(digits: Digit[]): DigitStat[] {
  const total = digits.length;
  const recent10 = digits.slice(-10);
  const recentTotal = recent10.length;

  const stats: DigitStat[] = [];

  for (let d = 0; d <= 9; d++) {
    const digit = d as Digit;

    let count = 0;
    for (let i = 0; i < total; i++) {
      if (digits[i] === digit) count++;
    }

    const percentage = total > 0 ? (count / total) * 100 : 0;

    let gap = total;
    for (let i = total - 1; i >= 0; i--) {
      if (digits[i] === digit) {
        gap = total - 1 - i;
        break;
      }
    }

    let currentStreak = 0;
    for (let i = total - 1; i >= 0; i--) {
      if (digits[i] === digit) {
        currentStreak++;
      } else {
        break;
      }
    }

    let maxStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < total; i++) {
      if (digits[i] === digit) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    let recentCount10 = 0;
    for (let i = 0; i < recentTotal; i++) {
      if (recent10[i] === digit) recentCount10++;
    }

    let trend: 'rising' | 'falling' | 'neutral' = 'neutral';
    if (total >= 10 && recentTotal > 0) {
      const recentRatio = recentCount10 / recentTotal;
      const overallRatio = count / total;
      const diff = recentRatio - overallRatio;
      if (diff >= 0.05) {
        trend = 'rising';
      } else if (diff <= -0.05) {
        trend = 'falling';
      }
    }

    stats.push({
      digit,
      count,
      percentage,
      gap,
      currentStreak,
      maxStreak,
      trend,
      recentCount10,
    });
  }

  return stats;
}

/** Rolling window metric from an outcome array. Flats are excluded from the rate. */
export function calculateWindowMetricFromOutcomes(
  outcomes: Outcome[],
  windowSize: number
): WindowMetric {
  const slice = outcomes.slice(-windowSize);
  const availableTicks = slice.length;
  let winCount = 0;
  let lossCount = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === 'win') winCount++;
    else if (slice[i] === 'loss') lossCount++;
  }
  const decided = winCount + lossCount;
  const winRate = decided > 0 ? (winCount / decided) * 100 : 0;
  const lossRate = decided > 0 ? (lossCount / decided) * 100 : 0;

  return {
    windowSize,
    availableTicks,
    winCount,
    lossCount,
    winRate,
    lossRate,
    isSufficient: outcomes.length >= windowSize,
  };
}

/**
 * Compute comprehensive contract analysis for any supported binary type.
 */
export function calculateContractAnalysis(
  ticks: Tick[],
  config: ContractConfig
): ContractAnalysis {
  const meta = getContractMeta(config);
  const outcomes = evaluateOutcomes(ticks, config);

  const total = ticks.length;
  let totalWins = 0;
  let totalLosses = 0;
  for (let i = 0; i < total; i++) {
    if (outcomes[i] === 'win') totalWins++;
    else if (outcomes[i] === 'loss') totalLosses++;
  }
  const decided = totalWins + totalLosses;
  const overallWinRate = decided > 0 ? (totalWins / decided) * 100 : 0;

  const w10 = calculateWindowMetricFromOutcomes(outcomes, 10);
  const w25 = calculateWindowMetricFromOutcomes(outcomes, 25);
  const w50 = calculateWindowMetricFromOutcomes(outcomes, 50);
  const w100 = calculateWindowMetricFromOutcomes(outcomes, 100);

  // Risk digit stats (digit-based types only)
  const digits = ticks.map((t) => t.digit);
  const last25 = digits.slice(-25);
  const riskDigitStats = meta.riskDigits.map((d) => {
    let countInLast25 = 0;
    for (let i = 0; i < last25.length; i++) {
      if (last25[i] === d) countInLast25++;
    }

    let gap = total;
    for (let i = total - 1; i >= 0; i--) {
      if (digits[i] === d) {
        gap = total - 1 - i;
        break;
      }
    }

    let status: 'dormant' | 'active' | 'warning' = 'active';
    if (gap >= 12) {
      status = 'dormant';
    } else if (gap <= 2) {
      status = 'warning';
    }

    return {
      digit: d,
      countInLast25,
      gap,
      status,
    };
  });

  const theoreticalWinRate = meta.theoreticalWinRate;
  const theoreticalLossRate = 100 - theoreticalWinRate;

  // Confidence Score Calculation (0-100)
  let confidenceScore = 0;
  let signalStrength: SignalStrength = 'None';
  let watchStatus: WatchStatus = 'WAIT';
  let watchReason = '';
  const statisticalFactors: ContractAnalysis['statisticalFactors'] = [];

  if (total < 10) {
    confidenceScore = Math.round((total / 10) * 35);
    signalStrength = 'Weak';
    watchStatus = 'WAIT';
    watchReason = `Data accumulating: ${total}/10 ticks minimum required for statistical baseline.`;
    statisticalFactors.push({
      name: 'Sample Accumulation',
      value: `${total}/10 ticks`,
      impact: 'neutral',
      detail: 'A minimum sequence of 10 ticks is needed to establish initial variance bounds.',
    });
  } else {
    let score = 50;

    // Factor 1: Rolling 25 Win Rate vs theoretical baseline
    const activeWindow = w25.availableTicks >= 15 ? w25 : w10;
    const winRateDelta = activeWindow.winRate - theoreticalWinRate;
    const winRateImpact = Math.round(winRateDelta * 1.5);
    score += winRateImpact;

    statisticalFactors.push({
      name: `Win Rate (${activeWindow.availableTicks} ticks)`,
      value: `${activeWindow.winRate.toFixed(1)}% (vs ${theoreticalWinRate}% exp)`,
      impact: winRateDelta >= 2 ? 'positive' : winRateDelta <= -2 ? 'negative' : 'neutral',
      detail: `${winRateDelta >= 0 ? '+' : ''}${winRateDelta.toFixed(1)}% variance from theoretical ${theoreticalWinRate}% expected rate.`,
    });

    // Factor 2: Risk behavior in recent ticks (digit types)
    if (!meta.isQuoteType && riskDigitStats.length > 0) {
      const riskCount25 = riskDigitStats.reduce((acc, r) => acc + r.countInLast25, 0);
      const riskRate25 = activeWindow.availableTicks > 0
        ? (riskCount25 / activeWindow.availableTicks) * 100
        : theoreticalLossRate;
      const riskDelta = theoreticalLossRate - riskRate25;
      const riskImpact = Math.round(riskDelta * 0.8);
      score += riskImpact;

      statisticalFactors.push({
        name: `Combined Risk Digits [${meta.riskDigits.join(', ')}]`,
        value: `${riskRate25.toFixed(1)}% frequency`,
        impact: riskDelta > 3 ? 'positive' : riskDelta < -3 ? 'negative' : 'neutral',
        detail: `Risk digits [${meta.riskDigits.join(', ')}] appeared ${riskCount25} times in the last ${activeWindow.availableTicks} ticks (${riskDelta > 0 ? 'suppressed' : 'elevated'}).`,
      });
    }

    // Factor 3: Immediate risk proximity (digit types)
    if (!meta.isQuoteType && riskDigitStats.length > 0) {
      const riskSet = new Set<Digit>(meta.riskDigits);
      const minRiskGap = Math.min(...riskDigitStats.map((r) => r.gap));
      const lastDigitIsRisk = total > 0 && riskSet.has(digits[total - 1]);
      const penultimateIsRisk = total > 1 && riskSet.has(digits[total - 2]);

      if (lastDigitIsRisk) {
        score -= 16;
        statisticalFactors.push({
          name: 'Immediate Risk Contact',
          value: `Digit ${digits[total - 1]} just hit`,
          impact: 'negative',
          detail: 'The most recent tick was a losing digit.',
        });
      } else if (penultimateIsRisk) {
        score -= 8;
        statisticalFactors.push({
          name: 'Recent Risk Contact',
          value: `Loss 2 ticks ago`,
          impact: 'negative',
          detail: 'A risk digit occurred 2 ticks ago.',
        });
      } else if (minRiskGap >= 6) {
        const gapBonus = Math.min(14, Math.round((minRiskGap - 4) * 2));
        score += gapBonus;
        statisticalFactors.push({
          name: 'Risk Digit Dormancy',
          value: `Dormant for ${minRiskGap} ticks`,
          impact: 'positive',
          detail: `Both losing digits [${meta.riskDigits.join(', ')}] have been absent for ${minRiskGap} consecutive ticks.`,
        });
      }
    }

    // Factor 4: 10-tick momentum confirmation
    if (w10.isSufficient) {
      if (w10.winRate >= 90) {
        score += 8;
        statisticalFactors.push({
          name: '10-Tick Momentum',
          value: `${w10.winCount}/${w10.winCount + w10.lossCount} wins (${w10.winRate.toFixed(0)}%)`,
          impact: 'positive',
          detail: 'High short-term momentum across the immediate 10-tick window.',
        });
      } else if (w10.winRate <= 60) {
        score -= 12;
        statisticalFactors.push({
          name: '10-Tick Momentum',
          value: `${w10.winCount}/${w10.winCount + w10.lossCount} wins (${w10.winRate.toFixed(0)}%)`,
          impact: 'negative',
          detail: 'Severe short-term loss clustering in the last 10 ticks.',
        });
      }
    }

    // Factor 5: Sample reliability adjustment
    if (total >= 50) {
      score += 4;
      statisticalFactors.push({
        name: 'Data Reliability',
        value: `${total} ticks loaded`,
        impact: 'positive',
        detail: 'Sufficient sample size to minimize small-sample variance distortion.',
      });
    } else if (total < 20) {
      score -= 6;
      statisticalFactors.push({
        name: 'Data Reliability',
        value: `Sparse sample (${total} ticks)`,
        impact: 'neutral',
        detail: 'Short sample sizes have higher statistical noise.',
      });
    }

    confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

    if (confidenceScore >= 75) {
      signalStrength = 'Strong';
    } else if (confidenceScore >= 55) {
      signalStrength = 'Moderate';
    } else {
      signalStrength = 'Weak';
    }

    if (!meta.isQuoteType && total > 0 && riskDigitStats.length > 0) {
      const riskSet = new Set<Digit>(meta.riskDigits);
      const lastDigitIsRisk = riskSet.has(digits[total - 1]);
      const minRiskGap = Math.min(...riskDigitStats.map((r) => r.gap));
      if (lastDigitIsRisk) {
        watchStatus = 'WAIT';
        watchReason = `Losing digit (${digits[total - 1]}) just appeared.`;
      } else if (confidenceScore >= 75 && signalStrength === 'Strong' && minRiskGap >= 3) {
        watchStatus = 'SIGNAL';
        watchReason = `Favorable alignment: ${activeWindow.winRate.toFixed(0)}% rolling rate with risk digits [${meta.riskDigits.join(', ')}] dormant for ${minRiskGap} ticks.`;
      } else if (confidenceScore >= 55) {
        watchStatus = 'WATCH';
        watchReason = `Constructive metrics (${confidenceScore}/100 confidence).`;
      } else {
        watchStatus = 'WAIT';
        watchReason = `Sub-optimal metrics (${confidenceScore}/100). Risk elevated or rolling rate below baseline.`;
      }
    } else if (confidenceScore >= 75 && signalStrength === 'Strong') {
      watchStatus = 'SIGNAL';
      watchReason = `Favorable alignment: ${activeWindow.winRate.toFixed(0)}% rolling rate (confidence ${confidenceScore}/100).`;
    } else if (confidenceScore >= 55) {
      watchStatus = 'WATCH';
      watchReason = `Constructive metrics (${confidenceScore}/100 confidence).`;
    } else {
      watchStatus = 'WAIT';
      watchReason = `Sub-optimal metrics (${confidenceScore}/100).`;
    }
  }

  const explanation = generateExplanation(
    config,
    ticks.length,
    overallWinRate,
    w10,
    w25,
    riskDigitStats,
    confidenceScore,
    signalStrength,
    watchStatus
  );

  return {
    contractName: config.type,
    config,
    winDescription: meta.winDescription,
    targetDigits: meta.targetDigits,
    riskDigits: meta.riskDigits,
    theoreticalWinRate,
    overallWinRate,
    totalWins,
    totalLosses,
    rollingWindows: {
      w10,
      w25,
      w50,
      w100,
    },
    confidenceScore,
    signalStrength,
    watchStatus,
    watchReason,
    statisticalFactors,
    explanation,
    riskDigitStats,
  };
}

/**
 * Generate transparent human-readable statistical breakdown.
 */
function generateExplanation(
  config: ContractConfig,
  total: number,
  overallWinRate: number,
  w10: WindowMetric,
  w25: WindowMetric,
  riskStats: { digit: Digit; countInLast25: number; gap: number }[],
  confidence: number,
  strength: SignalStrength,
  watch: WatchStatus
): string {
  if (total === 0) {
    return 'No tick data supplied yet. Input digits or load live data to generate statistical metrics.';
  }

  if (total < 10) {
    return `Only ${total} tick${total === 1 ? '' : 's'} recorded. At least 10 ticks are needed to calculate meaningful rolling probabilities. Confidence is temporarily capped at ${confidence}/100.`;
  }

  const meta = getContractMeta(config);
  const recent = w25.availableTicks >= 10 ? w25.winRate : w10.winRate;

  let statusPhrase = '';
  if (watch === 'SIGNAL') {
    statusPhrase = `Observed rate (${recent.toFixed(1)}%) sits above the ${meta.theoreticalWinRate}% theoretical baseline (Confidence ${confidence}/100, Strength ${strength}).`;
  } else if (watch === 'WATCH') {
    statusPhrase = `Metrics are moderately positive (Confidence ${confidence}/100, Strength ${strength}). The rolling rate hovers near the expected ${meta.theoreticalWinRate}% mark.`;
  } else {
    statusPhrase = `Caution (Confidence ${confidence}/100, Status WAIT). Elevated risk frequency or recent loss clustering.`;
  }

  const riskLine =
    riskStats.length > 0
      ? ` Risk digits are positioned at: ${riskStats.map((r) => `digit ${r.digit} last seen ${r.gap} tick${r.gap === 1 ? '' : 's'} ago`).join(', ')}.`
      : '';

  return `${statusPhrase} Winning condition (${meta.winDescription}) occurred ${overallWinRate.toFixed(1)}% of decided ticks (${total} total ticks). Over the last 10 ticks, ${w10.winCount} of ${w10.winCount + w10.lossCount} were wins (${w10.winRate.toFixed(0)}%).${riskLine}`;
}

/**
 * Compute Pattern Radar data: hot, cold, repeated, overdue digits
 */
export function calculatePatternRadar(digits: Digit[], stats: DigitStat[]): PatternRadarData {
  const total = digits.length;

  if (total === 0) {
    return {
      hotDigits: [],
      coldDigits: [],
      repeatedDigits: [],
      overdueDigits: [],
    };
  }

  const sortedByCount = [...stats].sort((a, b) => b.count - a.count);
  const hotDigits = sortedByCount.slice(0, 3).map((s) => ({
    digit: s.digit,
    percentage: s.percentage,
    count: s.count,
  }));

  const coldDigits = [...stats].sort((a, b) => a.count - b.count).slice(0, 3).map((s) => ({
    digit: s.digit,
    percentage: s.percentage,
    count: s.count,
  }));

  const overdueDigits = [...stats]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((s) => ({
      digit: s.digit,
      gap: s.gap,
    }));

  const repeatedDigits: { digit: Digit; streak: number }[] = [];
  if (total >= 2 && digits[total - 1] === digits[total - 2]) {
    const currentDigit = digits[total - 1];
    let streak = 0;
    for (let i = total - 1; i >= 0; i--) {
      if (digits[i] === currentDigit) streak++;
      else break;
    }
    repeatedDigits.push({ digit: currentDigit, streak });
  }

  stats.forEach((s) => {
    if (s.maxStreak >= 2 && !repeatedDigits.some((r) => r.digit === s.digit)) {
      repeatedDigits.push({ digit: s.digit, streak: s.maxStreak });
    }
  });

  return {
    hotDigits,
    coldDigits,
    repeatedDigits: repeatedDigits.slice(0, 3),
    overdueDigits,
  };
}

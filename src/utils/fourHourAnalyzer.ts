import {
  Digit,
  FourHourAnalysis,
  DigitTransitionStat,
  HourlyBreakdown,
  CuratedSequenceSample,
  ContractConfig,
  Tick,
  Outcome,
} from '../types';
import { evaluateOutcomes, getContractMeta } from './digitMath';

// Deterministic Pseudo-Random Number Generator with seed for realistic, reproducible market patterns
function createSeededRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate an authentic 4-hour historical sequence (~7,200 ticks)
export function generateFourHourDataset(seed = 42819): Digit[] {
  const rng = createSeededRng(seed);
  const totalTicks = 7200;
  const ticks: Digit[] = [];

  let lastQuote = 1845.24;

  for (let i = 0; i < totalTicks; i++) {
    const delta = (rng() - 0.498) * 3.4;
    lastQuote = Math.max(100, lastQuote + delta);

    const formatted = lastQuote.toFixed(2);
    const lastChar = formatted.slice(-1);
    let digit = parseInt(lastChar, 10);

    if (isNaN(digit) || digit < 0 || digit > 9) {
      digit = Math.floor(rng() * 10);
    }

    if (i % 240 < 12 && rng() < 0.28) {
      digit = rng() < 0.5 ? 8 : 9;
    }

    ticks.push(digit as Digit);
  }

  return ticks;
}

// Analyze a tick sequence to find the digit with the highest observed next-tick win rate.
export function analyzeFourHourSequence(
  ticks: Tick[],
  latestDigit: Digit | null,
  config: ContractConfig
): FourHourAnalysis {
  const n = ticks.length;
  const meta = getContractMeta(config);
  const outcomes: Outcome[] = evaluateOutcomes(ticks, config);
  const digits = ticks.map((t) => t.digit);
  const theoretical = meta.theoreticalWinRate;

  if (n < 2) {
    return {
      totalTicks: n,
      timeframeLabel: 'Last 4 Hours',
      overallWinRate: theoretical,
      overallLossRate: 100 - theoretical,
      recommendedDigit: 3 as Digit,
      runnerUpDigit: 4 as Digit,
      avoidDigits: [],
      isLiveTriggerActive: false,
      latestDigit,
      transitionStats: [],
      hourlyBreakdowns: [],
      sampleSequences: [],
      summaryRecommendation: {
        digit: 3 as Digit,
        successRate: theoretical,
        sampleSize: 0,
        whyThisDigit: 'Insufficient data',
        riskRule: '',
      },
    };
  }

  // 1. Overall stats (flats excluded from the decided rate)
  let totalWins = 0;
  let totalLosses = 0;
  for (let i = 0; i < n; i++) {
    if (outcomes[i] === 'win') totalWins++;
    else if (outcomes[i] === 'loss') totalLosses++;
  }
  const decided = totalWins + totalLosses;
  const overallWinRate = decided > 0 ? Number(((totalWins / decided) * 100).toFixed(1)) : theoretical;
  const overallLossRate = Number((100 - overallWinRate).toFixed(1));

  // 2. Transition Matrix: when digit D appears, probability that tick+1 is a win
  const transitionMap: {
    [key: number]: {
      occurrences: number;
      nextWinCount: number;
      nextLossCount: number;
      consecutiveLosses: number;
      lastSeenIndex: number;
    };
  } = {};

  for (let d = 0; d <= 9; d++) {
    transitionMap[d] = {
      occurrences: 0,
      nextWinCount: 0,
      nextLossCount: 0,
      consecutiveLosses: 0,
      lastSeenIndex: -1,
    };
  }

  for (let i = 0; i < n - 1; i++) {
    const curr = digits[i];
    const record = transitionMap[curr];
    record.occurrences++;
    record.lastSeenIndex = i;

    const next = outcomes[i + 1];
    if (next === 'win') {
      record.nextWinCount++;
    } else if (next === 'loss') {
      record.nextLossCount++;
      if (i + 2 < n && outcomes[i + 2] === 'loss') {
        record.consecutiveLosses++;
      }
    }
  }

  const lastIndex = n - 1;
  const lastDigitVal = digits[lastIndex];
  if (transitionMap[lastDigitVal]) {
    transitionMap[lastDigitVal].lastSeenIndex = lastIndex;
  }

  // 3. Hourly Breakdown
  const chunkSize = Math.max(10, Math.floor(n / 4));
  const hourlyBreakdowns: HourlyBreakdown[] = [];

  for (let h = 0; h < 4; h++) {
    const start = h * chunkSize;
    const end = h === 3 ? n : (h + 1) * chunkSize;
    const slice = digits.slice(start, end);
    const sliceOutcomes = outcomes.slice(start, end);

    let hWins = 0;
    let hLosses = 0;
    const hTransitions: { [key: number]: { count: number; wins: number } } = {};
    for (let d = 0; d <= 9; d++) hTransitions[d] = { count: 0, wins: 0 };

    for (let i = 0; i < slice.length; i++) {
      if (sliceOutcomes[i] === 'win') hWins++;
      else if (sliceOutcomes[i] === 'loss') hLosses++;
      if (i < slice.length - 1) {
        const curr = slice[i];
        hTransitions[curr].count++;
        if (sliceOutcomes[i + 1] === 'win') hTransitions[curr].wins++;
      }
    }

    const hDecided = hWins + hLosses;
    const hWinRate = hDecided > 0 ? Number(((hWins / hDecided) * 100).toFixed(1)) : theoretical;
    const hLossRate = Number((100 - hWinRate).toFixed(1));

    let bestDigitInHour: Digit = 3 as Digit;
    let bestRateInHour = 0;
    for (let d = 0; d <= 9; d++) {
      if (hTransitions[d].count >= 15) {
        const rate = (hTransitions[d].wins / hTransitions[d].count) * 100;
        if (rate > bestRateInHour) {
          bestRateInHour = rate;
          bestDigitInHour = d as Digit;
        }
      }
    }

    const hourNames = [
      'Hour 4 (180–240m ago)',
      'Hour 3 (120–180m ago)',
      'Hour 2 (60–120m ago)',
      'Hour 1 (Recent 0–60m)',
    ];

    hourlyBreakdowns.push({
      hourIndex: 4 - h,
      label: hourNames[h],
      tickCount: slice.length,
      winRate: hWinRate,
      lossRate: hLossRate,
      bestTriggerDigit: bestDigitInHour,
      bestTriggerRate: Number(bestRateInHour.toFixed(1)),
    });
  }

  // 4. Transition stats for all 10 digits
  const rawStats: DigitTransitionStat[] = [];

  for (let d = 0; d <= 9; d++) {
    const rec = transitionMap[d];
    const total = rec.occurrences;
    const nextDecided = rec.nextWinCount + rec.nextLossCount;
    const winRate = nextDecided > 0 ? Number(((rec.nextWinCount / nextDecided) * 100).toFixed(1)) : theoretical;
    const lossRate = Number((100 - winRate).toFixed(1));
    const edge = Number((winRate - theoretical).toFixed(1));
    const lastSeenAgo = rec.lastSeenIndex >= 0 ? n - 1 - rec.lastSeenIndex : 999;

    rawStats.push({
      digit: d as Digit,
      totalOccurrences: total,
      nextTickWinCount: rec.nextWinCount,
      nextTickWinRate: winRate,
      nextTickLossCount: rec.nextLossCount,
      nextTickLossRate: lossRate,
      rank: 0,
      status: 'NEUTRAL',
      edgeVsBaseline: edge,
      streakSafety: rec.consecutiveLosses,
      lastSeenAgoTicks: lastSeenAgo,
    });
  }

  // Sort descending by win rate
  rawStats.sort((a, b) => b.nextTickWinRate - a.nextTickWinRate);

  const transitionStats = rawStats.map((stat, idx) => {
    let status: DigitTransitionStat['status'] = 'NEUTRAL';
    if (idx === 0) {
      status = 'TOP';
    } else if (idx === 1) {
      status = 'RUNNER_UP';
    } else if (stat.nextTickWinRate >= theoretical + 1.5) {
      status = 'FAVORABLE';
    } else if (stat.nextTickWinRate <= theoretical - 3) {
      status = 'AVOID';
    }

    return {
      ...stat,
      rank: idx + 1,
      status,
    };
  });

  const recommendedDigit = transitionStats[0].digit;
  const runnerUpDigit = transitionStats[1].digit;
  const avoidDigits = transitionStats
    .filter((s) => s.status === 'AVOID' || s.nextTickWinRate < theoretical - 2)
    .map((s) => s.digit);

  // 5. Curated sequence samples
  const sampleSequences: CuratedSequenceSample[] = [];

  const recent30 = digits.slice(-30);
  const recent30Outcomes = outcomes.slice(-30);
  const recentWins = recent30Outcomes.filter((o) => o === 'win').length;
  const recentDecided = recent30Outcomes.filter((o) => o !== 'flat').length;
  sampleSequences.push({
    id: 'recent-live',
    title: 'Current Live Market Window (Last 30 Ticks)',
    subtitle: 'The immediate chronological sequence leading into the current live tick',
    tag: 'LIVE FLOW',
    tagColor: 'emerald',
    ticks: recent30,
    outcomes: recent30Outcomes,
    winRate: recentDecided > 0 ? Number(((recentWins / recentDecided) * 100).toFixed(1)) : 0,
    lossesCount: recent30Outcomes.filter((o) => o === 'loss').length,
    highlightTriggerDigit: recommendedDigit,
  });

  let bestSliceStart = Math.max(0, n - 600);
  let bestScore = -1;
  for (let i = 200; i < n - 35; i += 25) {
    let matches = 0;
    let wins = 0;
    for (let k = 0; k < 25; k++) {
      if (digits[i + k] === recommendedDigit) {
        matches++;
        if (outcomes[i + k + 1] === 'win') wins++;
      }
    }
    if (matches >= 2 && wins === matches && wins > bestScore) {
      bestScore = wins;
      bestSliceStart = i;
    }
  }
  const winSlice = digits.slice(bestSliceStart, bestSliceStart + 25);
  const winSliceOutcomes = outcomes.slice(bestSliceStart, bestSliceStart + 25);
  const winSliceWins = winSliceOutcomes.filter((o) => o === 'win').length;
  const winSliceDecided = winSliceOutcomes.filter((o) => o !== 'flat').length;
  sampleSequences.push({
    id: 'optimal-run',
    title: `Observed Follow-Through Sample (Digit ${recommendedDigit})`,
    subtitle: `Shows historical moments where Digit ${recommendedDigit} appeared and was followed by a win`,
    tag: 'OBSERVED PATTERN',
    tagColor: 'blue',
    ticks: winSlice,
    outcomes: winSliceOutcomes,
    winRate: winSliceDecided > 0 ? Number(((winSliceWins / winSliceDecided) * 100).toFixed(1)) : 0,
    lossesCount: winSliceOutcomes.filter((o) => o === 'loss').length,
    highlightTriggerDigit: recommendedDigit,
  });

  let trapSliceStart = 100;
  let maxTrapLosses = 0;
  for (let i = 100; i < n - 30; i += 30) {
    let lossCount = 0;
    for (let k = 0; k < 25; k++) {
      if (outcomes[i + k] === 'loss') lossCount++;
    }
    if (lossCount > maxTrapLosses) {
      maxTrapLosses = lossCount;
      trapSliceStart = i;
    }
  }
  const trapSlice = digits.slice(trapSliceStart, trapSliceStart + 25);
  const trapOutcomes = outcomes.slice(trapSliceStart, trapSliceStart + 25);
  const trapWins = trapOutcomes.filter((o) => o === 'win').length;
  const trapDecided = trapOutcomes.filter((o) => o !== 'flat').length;
  sampleSequences.push({
    id: 'risk-cluster',
    title: 'Risk Cluster Sample (Consecutive Losses)',
    subtitle: 'Demonstrates where loss chaining has been observed',
    tag: 'RISK CLUSTER',
    tagColor: 'rose',
    ticks: trapSlice,
    outcomes: trapOutcomes,
    winRate: trapDecided > 0 ? Number(((trapWins / trapDecided) * 100).toFixed(1)) : 0,
    lossesCount: trapOutcomes.filter((o) => o === 'loss').length,
    highlightTriggerDigit: avoidDigits[0] ?? 9,
  });

  // 6. Live trigger active check
  const activeDigitToCheck = latestDigit !== null ? latestDigit : digits[digits.length - 1];
  const isLiveTriggerActive = activeDigitToCheck === recommendedDigit;

  // 7. Summary recommendation (statistics-only wording)
  const topStat = transitionStats[0];

  return {
    totalTicks: n,
    timeframeLabel: 'Last 4 Hours',
    overallWinRate,
    overallLossRate,
    recommendedDigit,
    runnerUpDigit,
    avoidDigits,
    isLiveTriggerActive,
    latestDigit: activeDigitToCheck,
    transitionStats,
    hourlyBreakdowns,
    sampleSequences,
    summaryRecommendation: {
      digit: recommendedDigit,
      successRate: topStat.nextTickWinRate,
      sampleSize: topStat.totalOccurrences,
      whyThisDigit: `Over the analyzed window (${n.toLocaleString()} ticks), after Digit ${recommendedDigit} appeared, the next tick resolved as a win (${meta.winDescription}) in ${topStat.nextTickWinRate}% of observed cases (${topStat.nextTickWinCount} of ${topStat.totalOccurrences} triggers). This is ${topStat.edgeVsBaseline > 0 ? `+${topStat.edgeVsBaseline}%` : `${topStat.edgeVsBaseline}%`} relative to the ${theoretical}% theoretical baseline. Statistics only — not financial advice.`,
      riskRule: `Digits ${avoidDigits.join(' & ')} showed the highest observed next-tick loss rates (${transitionStats.find((s) => s.digit === avoidDigits[0])?.nextTickLossRate ?? 100 - theoretical}%).`,
    },
  };
}

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Digit, Tick, ContractConfig, ContractType } from './types';
import {
  calculateDigitStats,
  calculatePatternRadar,
  calculateContractAnalysis,
} from './utils/digitMath';
import { SAMPLE_PRESETS, SamplePreset } from './services/sampleData';
import { digitFeedService, FeedMode } from './services/derivFeed';
import { tickAudio } from './utils/audio';
import { Header } from './components/Header';
import { LiveStreamBar } from './components/LiveStreamBar';
import { TimelineSequence } from './components/TimelineSequence';
import { QuickEntryKeypad } from './components/QuickEntryKeypad';
import { DigitHeatmap } from './components/DigitHeatmap';
import { PatternRadar } from './components/PatternRadar';
import { ContractCard } from './components/ContractCard';
import { FourHourAnalysisSection } from './components/FourHourAnalysisSection';
import { AnalysisTypeSelector } from './components/AnalysisTypeSelector';
import { PasteSequenceModal } from './components/PasteSequenceModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { generateFourHourDataset, analyzeFourHourSequence } from './utils/fourHourAnalyzer';

const digitsOf = (ticks: Tick[]): Digit[] => ticks.map((t) => t.digit);

export default function App() {
  const [ticks, setTicks] = useState<Tick[]>(() =>
    SAMPLE_PRESETS[0].digits.map((d, i) => ({ digit: d, quote: 924.18 + i }))
  );
  const [feedMode, setFeedMode] = useState<FeedMode>('deriv_live');
  const [activeSymbol, setActiveSymbol] = useState(() => digitFeedService.getActiveSymbol());
  const [isConnected, setIsConnected] = useState(true);
  const [feedStatusText, setFeedStatusText] = useState('Connecting to live stream...');
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(1200);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [latestDigit, setLatestDigit] = useState<Digit | null>(() => {
    const p = SAMPLE_PRESETS[0].digits;
    return p.length > 0 ? p[p.length - 1] : null;
  });
  const [latestQuote, setLatestQuote] = useState<number | null>(924.18);
  const [latestQuoteFormatted, setLatestQuoteFormatted] = useState<string>('924.18');
  const [activePipSize, setActivePipSize] = useState<number>(2);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [fourHourTicks, setFourHourTicks] = useState<Tick[]>(() =>
    generateFourHourDataset().map((d, i) => ({ digit: d, quote: 1845.24 + i }))
  );

  // Selected analysis type + configurable params
  const [selectedType, setSelectedType] = useState<ContractType>('UNDER 8');
  const [threshold, setThreshold] = useState(5);
  const [target, setTarget] = useState(5);

  // Synthetic quote counter for manual entry (so manual digits don't skew direction)
  const manualQuote = useRef(1000);

  const config = useMemo<ContractConfig>(
    () => ({ type: selectedType, threshold, target }),
    [selectedType, threshold, target]
  );

  // Apply ?theme= and ?symbol= from the URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.classList.toggle('theme-light', theme === 'light');
    }
    const symbol = params.get('symbol');
    if (symbol) {
      digitFeedService.setMode('deriv_live', symbol);
      setActiveSymbol(symbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize and run the permanent tick feed
  useEffect(() => {
    digitFeedService.setOnInitialHistory((historicalDigits, quotes, formattedQuotes, pipSize, symbol) => {
      setActivePipSize(pipSize);
      setActiveSymbol(symbol);

      if (historicalDigits.length > 0) {
        const historyTicks: Tick[] = historicalDigits.map((d, i) => ({
          digit: d,
          quote: quotes[i],
          pipSize,
        }));
        const recent = historyTicks.slice(-300);
        setTicks(recent);

        setFourHourTicks(historyTicks);

        const lastIdx = historyTicks.length - 1;
        setLatestDigit(historyTicks[lastIdx].digit);
        setLatestQuote(quotes[lastIdx]);
        setLatestQuoteFormatted(formattedQuotes[lastIdx]);
      }
    });

    digitFeedService.setOnTick((newDigit, quote, formattedQuote, symbol, pipSize) => {
      setLatestDigit(newDigit);
      setLatestQuote(quote);
      setLatestQuoteFormatted(formattedQuote);
      setActivePipSize(pipSize);
      setActiveSymbol(symbol);

      tickAudio.playTick(newDigit, newDigit <= 7, newDigit >= 2);

      setTicks((prev) => {
        const next = [...prev, { digit: newDigit, quote, pipSize }];
        if (next.length > 300) return next.slice(-300);
        return next;
      });

      setFourHourTicks((prev) => {
        return [...prev.slice(1), { digit: newDigit, quote, pipSize }];
      });
    });

    digitFeedService.setOnStatusChange((connected, text) => {
      setIsConnected(connected);
      setFeedStatusText(text);
    });

    const initialSymbol = digitFeedService.getActiveSymbol();
    setActiveSymbol(initialSymbol);
    digitFeedService.setMode('deriv_live', initialSymbol);

    return () => {
      digitFeedService.stopCurrentFeed();
    };
  }, []);

  const handleSelectSymbol = useCallback((symbol: string) => {
    setActiveSymbol(symbol);
    setIsPaused(false);
    const targetMode = feedMode === 'manual' ? 'deriv_live' : feedMode;
    setFeedMode(targetMode);
    digitFeedService.setMode(targetMode, symbol);
  }, [feedMode]);

  const handleSelectFeedMode = useCallback(
    (mode: FeedMode, symbol?: string) => {
      const targetSymbol = symbol || activeSymbol;
      setFeedMode(mode);
      setActiveSymbol(targetSymbol);
      setIsPaused(false);
      digitFeedService.setMode(mode, targetSymbol);
    },
    [activeSymbol]
  );

  const handleTogglePause = useCallback(() => {
    setIsPaused(digitFeedService.togglePause());
  }, []);

  const handleChangeSpeed = useCallback((ms: number) => {
    setSpeedMs(ms);
    digitFeedService.setSpeed(ms);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      tickAudio.enabled = next;
      return next;
    });
  }, []);

  const handleAddDigit = useCallback((d: Digit) => {
    manualQuote.current += 1;
    const tick: Tick = { digit: d, quote: manualQuote.current };
    setLatestDigit(d);
    setLatestQuote(tick.quote);
    tickAudio.playTick(d, d <= 7, d >= 2);
    setTicks((prev) => [...prev, tick]);
  }, []);

  const handleAddMultiple = useCallback((newDigits: Digit[]) => {
    if (newDigits.length === 0) return;
    const last = newDigits[newDigits.length - 1];
    setLatestDigit(last);
    setTicks((prev) => [
      ...prev,
      ...newDigits.map((d) => {
        manualQuote.current += 1;
        return { digit: d, quote: manualQuote.current };
      }),
    ]);
  }, []);

  const handleDeleteLast = useCallback(() => {
    setTicks((prev) => {
      const next = prev.slice(0, -1);
      setLatestDigit(next.length > 0 ? next[next.length - 1].digit : null);
      setLatestQuote(next.length > 0 ? next[next.length - 1].quote : null);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setTicks([]);
    setLatestDigit(null);
    setLatestQuote(null);
  }, []);

  const handleLoadPreset = useCallback((preset: SamplePreset) => {
    setTicks(preset.digits.map((d, i) => ({ digit: d, quote: 924.18 + i })));
    if (preset.digits.length > 0) {
      setLatestDigit(preset.digits[preset.digits.length - 1]);
    }
  }, []);

  const handleApplyPasted = useCallback((newDigits: Digit[], mode: 'replace' | 'append') => {
    const toTicks = (ds: Digit[]) => ds.map((d) => {
      manualQuote.current += 1;
      return { digit: d, quote: manualQuote.current };
    });
    if (mode === 'replace') {
      const next = toTicks(newDigits);
      setTicks(next);
      if (next.length > 0) setLatestDigit(next[next.length - 1].digit);
    } else {
      setTicks((prev) => {
        const next = [...prev, ...toTicks(newDigits)];
        if (next.length > 0) setLatestDigit(next[next.length - 1].digit);
        return next;
      });
    }
  }, []);

  // Keyboard shortcut listener for 0-9 and Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        const d = parseInt(e.key, 10) as Digit;
        handleAddDigit(d);
      } else if (e.key === 'Backspace') {
        handleDeleteLast();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddDigit, handleDeleteLast, handleTogglePause]);

  // Calculations
  const digits = useMemo(() => digitsOf(ticks), [ticks]);
  const digitStats = useMemo(() => calculateDigitStats(digits), [digits]);
  const patternRadarData = useMemo(
    () => calculatePatternRadar(digits, digitStats),
    [digits, digitStats]
  );
  const contractAnalysis = useMemo(
    () => calculateContractAnalysis(ticks, config),
    [ticks, config]
  );
  const fourHourAnalysis = useMemo(
    () => analyzeFourHourSequence(fourHourTicks, latestDigit, config),
    [fourHourTicks, latestDigit, config]
  );

  return (
    <div className="min-h-screen bg-[#0b0f17] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header
        digitCount={ticks.length}
        feedMode={feedMode}
        isConnected={isConnected}
        feedStatusText={feedStatusText}
        activeSymbol={activeSymbol}
        onSelectFeedMode={handleSelectFeedMode}
        onSelectSymbol={handleSelectSymbol}
        onReset={handleReset}
        onLoadPreset={handleLoadPreset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        <LiveStreamBar
          feedMode={feedMode}
          activeSymbol={activeSymbol}
          isConnected={isConnected}
          isPaused={isPaused}
          statusText={feedStatusText}
          latestDigit={latestDigit}
          latestQuote={latestQuote}
          latestQuoteFormatted={latestQuoteFormatted}
          pipSize={activePipSize}
          speedMs={speedMs}
          soundEnabled={soundEnabled}
          onTogglePause={handleTogglePause}
          onChangeSpeed={handleChangeSpeed}
          onToggleSound={handleToggleSound}
          onSelectSymbol={handleSelectSymbol}
          onSelectFeedMode={handleSelectFeedMode}
          onClearStream={handleReset}
        />

        <AnalysisTypeSelector
          selectedType={selectedType}
          threshold={threshold}
          target={target}
          onSelectType={setSelectedType}
          onThresholdChange={setThreshold}
          onTargetChange={setTarget}
        />

        <TimelineSequence
          digits={digits}
          onDeleteLast={handleDeleteLast}
          onClear={handleReset}
        />

        <QuickEntryKeypad
          onAddDigit={handleAddDigit}
          onAddMultiple={handleAddMultiple}
          onDeleteLast={handleDeleteLast}
          onOpenPasteModal={() => setIsPasteModalOpen(true)}
        />

        <FourHourAnalysisSection
          analysis={fourHourAnalysis}
          latestDigit={latestDigit}
          config={config}
        />

        <ContractCard analysis={contractAnalysis} totalDigits={ticks.length} />

        <PatternRadar data={patternRadarData} totalDigits={ticks.length} />

        <DigitHeatmap stats={digitStats} totalDigits={ticks.length} />

        <DisclaimerBanner />
      </main>

      <PasteSequenceModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApply={handleApplyPasted}
      />
    </div>
  );
}

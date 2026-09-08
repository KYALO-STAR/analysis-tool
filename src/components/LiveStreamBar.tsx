import React from 'react';
import {
  Play,
  Pause,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  Server,
  HelpCircle,
} from 'lucide-react';
import { Digit } from '../types';
import { DERIV_POPULAR_SYMBOLS, FeedMode } from '../services/derivFeed';

interface LiveStreamBarProps {
  feedMode: FeedMode;
  activeSymbol: string;
  isConnected: boolean;
  isPaused: boolean;
  statusText: string;
  latestDigit: Digit | null;
  latestQuote: number | null;
  latestQuoteFormatted?: string;
  pipSize?: number;
  speedMs: number;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onChangeSpeed: (ms: number) => void;
  onToggleSound: () => void;
  onSelectSymbol: (symbol: string) => void;
  onSelectFeedMode: (mode: FeedMode) => void;
  onClearStream: () => void;
}

export const LiveStreamBar: React.FC<LiveStreamBarProps> = ({
  feedMode,
  activeSymbol,
  isConnected,
  isPaused,
  statusText,
  latestDigit,
  latestQuote,
  latestQuoteFormatted,
  pipSize,
  speedMs,
  soundEnabled,
  onTogglePause,
  onChangeSpeed,
  onToggleSound,
  onSelectSymbol,
  onSelectFeedMode,
}) => {
  const currentSymbolObj = DERIV_POPULAR_SYMBOLS.find((s) => s.id === activeSymbol) || DERIV_POPULAR_SYMBOLS[4];
  const effectivePipSize = pipSize ?? currentSymbolObj.pipSize;

  // Format quote with exact pip precision without losing trailing zeros
  const displayFormattedQuote = latestQuoteFormatted
    ? latestQuoteFormatted
    : latestQuote !== null
    ? latestQuote.toFixed(effectivePipSize)
    : null;

  // Split into prefix and last digit for high-contrast highlighting
  const quotePrefix = displayFormattedQuote ? displayFormattedQuote.slice(0, -1) : null;
  const quoteLastDigit = displayFormattedQuote ? displayFormattedQuote.slice(-1) : null;

  // Group symbols by category
  const oneSecondSymbols = DERIV_POPULAR_SYMBOLS.filter((s) => s.category === '1s_vol');
  const standardSymbols = DERIV_POPULAR_SYMBOLS.filter((s) => s.category === 'std_vol');
  const crashBoomSymbols = DERIV_POPULAR_SYMBOLS.filter((s) => s.category === 'crash_boom');
  const stepJumpSymbols = DERIV_POPULAR_SYMBOLS.filter((s) => s.category === 'step_jump');

  return (
    <div
      id="live-stream-bar"
      className="bg-[#111622]/95 border border-emerald-500/30 rounded-xl p-3.5 shadow-xl shadow-emerald-950/20 backdrop-blur-md transition-all"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Live Status + Symbol Selector + Pip info */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Live Indicator Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold tracking-wide transition-all ${
              feedMode === 'manual'
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                : isPaused
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {!isPaused && feedMode !== 'manual' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  feedMode === 'manual'
                    ? 'bg-zinc-500'
                    : isPaused
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              ></span>
            </span>
            <span>
              {feedMode === 'manual'
                ? 'MANUAL KEYPAD'
                : isPaused
                ? 'FEED PAUSED'
                : 'DERIV LIVE SYNC'}
            </span>
          </div>

          {/* Categorized Symbol Select Dropdown with ALL 24 Deriv Volatilities */}
          <div className="relative inline-flex items-center">
            <select
              id="symbol-select"
              value={activeSymbol}
              onChange={(e) => onSelectSymbol(e.target.value)}
              className="appearance-none bg-zinc-900 border border-emerald-500/40 text-zinc-100 text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <optgroup label="⚡ Continuous 1-Second Indices (1s)">
                {oneSecondSymbols.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>

              <optgroup label="📊 Standard Volatility Indices (2s)">
                {standardSymbols.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>

              <optgroup label="🚀 Crash & Boom Indices">
                {crashBoomSymbols.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>

              <optgroup label="📈 Step & Jump Indices">
                {stepJumpSymbols.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Precision Spec Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>Pip: <span className="text-zinc-200 font-bold">{currentSymbolObj.pipSize} dec</span></span>
            <span className="text-zinc-600">|</span>
            <span>{currentSymbolObj.tickIntervalSec}s</span>
          </div>

          {/* Status descriptive pill */}
          <span className="text-xs text-zinc-400 hidden md:inline-block max-w-[200px] truncate font-mono" title={statusText}>
            {statusText}
          </span>
        </div>

        {/* Center: Real-time Latest Digit & Exact Deriv Decimal Quote */}
        {latestDigit !== null && (
          <div className="flex items-center gap-3 bg-zinc-900/95 border border-zinc-800 px-3.5 py-1.5 rounded-lg shadow-inner">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Deriv Last Digit:
            </span>

            {/* Glowing Digit Box */}
            <div
              key={displayFormattedQuote ? `${displayFormattedQuote}-${latestDigit}` : latestDigit}
              className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-black text-sm text-white shadow-md animate-[pulse_0.4s_ease-out] bg-emerald-600 shadow-emerald-500/40 ring-1 ring-emerald-400`}
            >
              {latestDigit}
            </div>

            {/* Quote display with exact Deriv pip precision and highlighted last digit */}
            {quotePrefix !== null && quoteLastDigit !== null && (
              <div className="flex items-baseline font-mono text-xs text-zinc-300" title={`Exact quote with ${effectivePipSize} decimals: ${displayFormattedQuote}`}>
                <span className="text-zinc-400">{quotePrefix}</span>
                <span className="text-emerald-400 font-black text-sm underline decoration-emerald-500 underline-offset-2 ml-0.5">
                  {quoteLastDigit}
                </span>
              </div>
            )}

            {/* Current digit note */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-1.5 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                LAST DIGIT
              </span>
            </div>
          </div>
        )}

        {/* Right: Controls (Play/Pause, Speeds, Sound, Keypad Mode) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stream Play/Pause Toggle */}
          {feedMode !== 'manual' ? (
            <button
              id="toggle-stream-play"
              onClick={onTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-amber-600/90 hover:bg-amber-500 text-white shadow-amber-600/30'
              }`}
              title={isPaused ? 'Resume live tick stream' : 'Pause live tick stream'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="start-live-stream-btn"
              onClick={() => onSelectFeedMode('deriv_live')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-600/30"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Start Deriv Live</span>
            </button>
          )}

          {/* Speed Selectors (for stream pacing) */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              id="speed-turbo"
              onClick={() => onChangeSpeed(600)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs <= 700 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Turbo: 0.6s per tick"
            >
              0.6s
            </button>
            <button
              id="speed-standard"
              onClick={() => onChangeSpeed(1000)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs > 700 && speedMs <= 1500 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Standard 1.0s Deriv tick interval"
            >
              1.0s
            </button>
            <button
              id="speed-slow"
              onClick={() => onChangeSpeed(2000)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs > 1500 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Standard 2.0s tick interval"
            >
              2.0s
            </button>
          </div>

          {/* Audio Chime Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={soundEnabled ? 'Tick audio enabled' : 'Tick audio muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Mode Switch (Manual vs Auto) */}
          <button
            id="switch-mode-btn"
            onClick={() => onSelectFeedMode(feedMode === 'manual' ? 'deriv_live' : 'manual')}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            {feedMode === 'manual' ? 'Live Stream' : 'Manual Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

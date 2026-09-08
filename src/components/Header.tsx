import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  Sliders,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { FeedMode, DERIV_POPULAR_SYMBOLS } from '../services/derivFeed';
import { SAMPLE_PRESETS, SamplePreset } from '../services/sampleData';
import { Digit } from '../types';

interface HeaderProps {
  digitCount: number;
  feedMode: FeedMode;
  isConnected: boolean;
  feedStatusText: string;
  activeSymbol: string;
  onSelectFeedMode: (mode: FeedMode, symbol?: string) => void;
  onSelectSymbol?: (symbol: string) => void;
  onReset: () => void;
  onLoadPreset: (preset: SamplePreset) => void;
}

export const Header: React.FC<HeaderProps> = ({
  digitCount,
  feedMode,
  isConnected,
  feedStatusText,
  activeSymbol,
  onSelectFeedMode,
  onSelectSymbol,
  onReset,
  onLoadPreset,
}) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSymbolMenu, setShowSymbolMenu] = useState(false);

  return (
    <header className="bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Focus */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
                  DERIV DIGIT ANALYZER
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-emerald-400 border border-emerald-500/20">
                  Statistics Only
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Digit &amp; Quote Statistical Analysis</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300 font-mono font-medium">
                  {digitCount} {digitCount === 1 ? 'Tick' : 'Ticks'} Analyzed
                </span>
              </p>
            </div>
          </div>

          {/* Mobile indicator */}
          <div className="md:hidden flex items-center gap-1.5">
            {feedMode !== 'manual' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Live Feed Mode Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Feed Mode Selector */}
          <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              id="feed-mode-manual-btn"
              onClick={() => onSelectFeedMode('manual')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                feedMode === 'manual'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Manual Keypad
            </button>
            <button
              id="feed-mode-sim-btn"
              onClick={() => onSelectFeedMode('simulated')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                feedMode === 'simulated'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  feedMode === 'simulated' ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'
                }`}
              />
              Simulator
            </button>
            <button
              id="feed-mode-ws-btn"
              onClick={() => onSelectFeedMode('deriv_live')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                feedMode === 'deriv_live'
                  ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Public WebSocket connection to Deriv synthetic tick feeds"
            >
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
              )}
              Deriv Live WS
            </button>
          </div>

          {/* Symbol Selector (for simulated or Deriv live) */}
          {(feedMode === 'simulated' || feedMode === 'deriv_live') && (
            <div className="relative">
              <button
                id="symbol-select-btn"
                onClick={() => setShowSymbolMenu(!showSymbolMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs rounded-lg text-zinc-200 font-mono"
              >
                <span>{activeSymbol}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showSymbolMenu && (
                <div className="absolute right-0 mt-1 w-64 max-h-80 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-40 divide-y divide-zinc-800">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-zinc-950/80 sticky top-0">
                    Deriv All Volatilities (24 Markets)
                  </div>
                  <div className="py-1">
                    {DERIV_POPULAR_SYMBOLS.map((sym) => (
                      <button
                        key={sym.id}
                        onClick={() => {
                          if (onSelectSymbol) {
                            onSelectSymbol(sym.id);
                          } else {
                            onSelectFeedMode(feedMode, sym.id);
                          }
                          setShowSymbolMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                          activeSymbol === sym.id ? 'text-emerald-400 font-bold bg-zinc-800/60' : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono">{sym.id}</span>
                          <span className="text-[10px] text-zinc-500">({sym.pipSize} dec)</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate max-w-[110px]">{sym.name.replace(' Index', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Presets Button */}
          <div className="relative">
            <button
              id="sample-data-btn"
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample Data</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showPresetMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1.5 z-40">
                <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-800">
                  Load Realistic Presets
                </div>
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onLoadPreset(preset);
                      setShowPresetMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="text-xs font-medium text-zinc-200 group-hover:text-emerald-400">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1">{preset.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            id="reset-ticks-btn"
            onClick={onReset}
            disabled={digitCount === 0}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              digitCount > 0
                ? 'bg-zinc-800 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-400 border-zinc-700 hover:border-rose-800/60'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
            }`}
            title="Clear all recorded digits"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Feed Status Sub-bar if Live/Simulated */}
      {feedMode !== 'manual' && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{feedStatusText}</span>
          </div>
          <span className="text-zinc-500 text-[11px]">Auto-feeding last digit of tick quote</span>
        </div>
      )}
    </header>
  );
};

import React, { useRef, useEffect, useState } from 'react';
import { Digit } from '../types';
import { Delete, Copy, Check, Eye } from 'lucide-react';

interface TimelineSequenceProps {
  digits: Digit[];
  onDeleteLast: () => void;
  onClear: () => void;
}

export const TimelineSequence: React.FC<TimelineSequenceProps> = ({
  digits,
  onDeleteLast,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to the end (latest digit) whenever new digit arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [digits.length]);

  const handleCopy = () => {
    if (digits.length === 0) return;
    navigator.clipboard.writeText(digits.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const latestIndex = digits.length - 1;
  const recentSlice = digits.slice(-50); // display last 50 tiles for optimal rendering performance
  const startIndex = Math.max(0, digits.length - 50);

  return (
    <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg relative">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Digit Stream Timeline
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {digits.length} {digits.length === 1 ? 'digit' : 'digits'}
          </span>
          {digits.length > 50 && (
            <span className="text-[11px] text-zinc-500 hidden sm:inline">(Showing last 50)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={digits.length === 0}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg text-zinc-300 border border-zinc-700 text-xs transition-colors flex items-center gap-1"
            title="Copy digits as comma-separated list"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onDeleteLast}
            disabled={digits.length === 0}
            className="flex items-center gap-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg text-zinc-300 border border-zinc-700 text-xs transition-colors"
            title="Delete the most recent digit"
          >
            <Delete className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Delete Last</span>
          </button>
        </div>
      </div>

      {digits.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-sm">
          <div className="flex justify-center mb-2">
            <span className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center font-mono text-zinc-400">
              0–9
            </span>
          </div>
          <p className="text-zinc-300 font-medium">No digits entered yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Use the keypad below to tap digits, paste a sequence, or start the live feed to stream ticks automatically.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-700"
          >
            {recentSlice.map((digit, index) => {
              const actualIndex = startIndex + index;
              const isLatest = actualIndex === latestIndex;

              return (
                <div
                  key={`${actualIndex}-${digit}`}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all ${
                    isLatest
                      ? 'bg-zinc-700 border-zinc-500 shadow-[0_0_10px_rgba(255,255,255,0.2)] scale-105 ring-2 ring-emerald-400/40'
                      : 'bg-zinc-800/70 border-zinc-700'
                  }`}
                >
                  <span className="text-[9px] font-mono text-zinc-500 leading-none mb-0.5">
                    #{actualIndex + 1}
                  </span>
                  <span className={`text-xl font-mono ${isLatest ? 'text-white font-black' : 'text-zinc-100'}`}>
                    {digit}
                  </span>
                  {isLatest && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 leading-none mt-0.5">
                      Latest
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/50 mt-1">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>Raw digit stream — latest tick highlighted</span>
            </div>
            <div className="text-zinc-500 font-mono">Oldest &rarr; Newest</div>
          </div>
        </div>
      )}
    </section>
  );
};

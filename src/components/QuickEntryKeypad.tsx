import React, { useState } from 'react';
import { Digit } from '../types';
import { Plus, Clipboard, Delete, ArrowRight } from 'lucide-react';

interface QuickEntryKeypadProps {
  onAddDigit: (digit: Digit) => void;
  onAddMultiple: (digits: Digit[]) => void;
  onDeleteLast: () => void;
  onOpenPasteModal: () => void;
}

export const QuickEntryKeypad: React.FC<QuickEntryKeypadProps> = ({
  onAddDigit,
  onAddMultiple,
  onDeleteLast,
  onOpenPasteModal,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const matches = quickInput.match(/\d/g);
    if (matches && matches.length > 0) {
      const parsed = matches.map((m) => parseInt(m, 10) as Digit);
      onAddMultiple(parsed);
      setQuickInput('');
    }
  };

  const digits: Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Digit Input Keypad
          </h2>
          <p className="text-xs text-zinc-400">
            Click to append digits or paste stream
          </p>
        </div>

        {/* Input bar + Actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleQuickSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="e.g. 78204"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-28 sm:w-36 px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>Add</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          <button
            onClick={onOpenPasteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors"
            title="Paste bulk sequence or comma list"
          >
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste Sequence</span>
          </button>
        </div>
      </div>

      {/* 0-9 Tactile buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {digits.map((digit) => {
          return (
            <button
              key={digit}
              id={`keypad-digit-${digit}`}
              onClick={() => onAddDigit(digit)}
              className="group relative flex flex-col items-center justify-center h-14 bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <span className="text-xl font-bold font-mono text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {digit}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend for keypad */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Left dot: Under 8 win / Right dot: Over 1 win</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Red dot: Losing / Risk digit</span>
          </span>
        </div>
        <span className="hidden sm:inline text-zinc-600">
          Keyboard shortcuts: type 0–9
        </span>
      </div>
    </div>
  );
};

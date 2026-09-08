import React, { useState, useMemo } from 'react';
import { Digit } from '../types';
import { parseDigitSequence } from '../utils/digitMath';
import { X, ClipboardCheck, ArrowDownCircle, RefreshCw } from 'lucide-react';

interface PasteSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (digits: Digit[], mode: 'replace' | 'append') => void;
}

export const PasteSequenceModal: React.FC<PasteSequenceModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [text, setText] = useState('');

  const parsedDigits = useMemo(() => {
    return parseDigitSequence(text);
  }, [text]);

  if (!isOpen) return null;

  const handleReplace = () => {
    if (parsedDigits.length > 0) {
      onApply(parsedDigits, 'replace');
      setText('');
      onClose();
    }
  };

  const handleAppend = () => {
    if (parsedDigits.length > 0) {
      onApply(parsedDigits, 'append');
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-lg w-full p-5 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Paste Digit Sequence</h3>
              <p className="text-xs text-zinc-400">Supports raw digits, comma-separated, or spaced lists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your sequence here... e.g.: 7, 2, 8, 9, 3, 1, 4, 0, 5, 6, 2, 8 or raw digits 728931405628"
            rows={5}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Parsed Preview */}
        <div className="mt-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 font-medium">Parsed Digits Detected:</span>
            <span
              className={`font-mono font-bold ${
                parsedDigits.length > 0 ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {parsedDigits.length} {parsedDigits.length === 1 ? 'digit' : 'digits'}
            </span>
          </div>

          {parsedDigits.length > 0 ? (
            <div className="font-mono text-xs text-zinc-300 truncate bg-zinc-900/80 p-2 rounded border border-zinc-800">
              {parsedDigits.slice(0, 30).join(' ')}
              {parsedDigits.length > 30 ? ' ...' : ''}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500 italic">No valid digits 0–9 detected yet.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleAppend}
            disabled={parsedDigits.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Append to Current</span>
          </button>

          <button
            onClick={handleReplace}
            disabled={parsedDigits.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replace All ({parsedDigits.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

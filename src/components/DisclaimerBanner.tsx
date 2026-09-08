import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <footer className="mt-8 mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-400 text-xs">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
              Statistical Model & Risk Disclosure
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
              Random Walk Reality
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            In authentic random number generators and synthetic financial indices, each digit tick is an independent mathematical event with an unchanging 10% theoretical probability per digit (and 80% for 8-digit ranges like Under 8 and Over 1).
            Historical frequency clustering and variance deviations provide descriptive retrospective insights, but <strong className="text-zinc-200 font-semibold">never guarantee or predict future tick outcomes</strong>.
          </p>
          <p className="text-zinc-500 text-[10px] leading-relaxed">
            Strict policy: No Martingale, recovery staking, or certainty claims. This tool is for informational and
            educational purposes only and is not financial advice. It is designed solely for quantitative digit
            observation, risk tracking, and empirical probability study.
          </p>
        </div>
      </div>
    </footer>
  );
};

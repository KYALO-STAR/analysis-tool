import { Digit } from '../types';

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  digits: Digit[];
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'under8_strong',
    name: 'Under 8 Favorable Run (50 Ticks)',
    description: 'Strong dominance of digits 0–7 (92% win rate), losing digits 8 & 9 are suppressed.',
    // Sequence with very few 8s and 9s, high gap on risk digits
    digits: [
      3, 4, 1, 0, 7, 2, 5, 6, 3, 2, 1, 4, 7, 0, 6, 5, 8, 2, 3, 4,
      1, 7, 6, 0, 3, 5, 2, 4, 1, 6, 7, 3, 2, 0, 5, 4, 1, 6, 3, 7,
      2, 5, 4, 0, 1, 6, 3, 2, 7, 4,
    ],
  },
  {
    id: 'over1_strong',
    name: 'Over 1 Favorable Run (50 Ticks)',
    description: 'Strong dominance of digits 2–9 (90% win rate), losing digits 0 & 1 are suppressed.',
    // Sequence with very few 0s and 1s, high gap on risk digits
    digits: [
      7, 8, 4, 3, 9, 6, 5, 2, 8, 7, 3, 4, 9, 6, 5, 2, 0, 8, 7, 4,
      3, 9, 6, 5, 8, 2, 7, 4, 3, 9, 6, 8, 5, 2, 7, 4, 3, 9, 6, 8,
      5, 2, 7, 4, 3, 9, 8, 6, 5, 7,
    ],
  },
  {
    id: 'balanced_100',
    name: 'Realistic Balanced Market (100 Ticks)',
    description: 'True random distribution across all 10 digits representing standard market variance.',
    digits: [
      4, 9, 1, 6, 0, 7, 2, 5, 8, 3, 1, 4, 8, 2, 9, 0, 6, 3, 7, 5,
      2, 8, 0, 4, 6, 1, 9, 5, 3, 7, 4, 0, 8, 2, 6, 9, 1, 5, 7, 3,
      8, 2, 4, 0, 9, 6, 1, 7, 3, 5, 6, 1, 9, 4, 8, 2, 0, 7, 5, 3,
      2, 7, 0, 8, 4, 9, 1, 6, 3, 5, 9, 1, 4, 6, 8, 0, 2, 7, 5, 3,
      0, 8, 2, 4, 6, 9, 1, 7, 3, 5, 4, 9, 1, 6, 0, 8, 2, 7, 3, 5,
    ],
  },
  {
    id: 'risk_cluster',
    name: 'Risk Cluster / Choppy (40 Ticks)',
    description: 'Frequent bursts of 8, 9, 0, and 1 triggering loss clustering and WAIT status.',
    digits: [
      8, 9, 2, 0, 1, 8, 3, 9, 0, 4, 1, 9, 8, 5, 0, 1, 8, 9, 6, 0,
      1, 8, 9, 7, 0, 1, 8, 9, 2, 0, 1, 8, 9, 3, 0, 1, 8, 9, 0, 1,
    ],
  },
  {
    id: 'short_sample',
    name: 'Short Sequence (12 Ticks)',
    description: 'Near-threshold sequence to test rolling 10 window and preliminary metrics.',
    digits: [3, 6, 2, 7, 4, 5, 1, 0, 3, 6, 2, 5],
  },
];

import type { DrillQuestion } from './types';

const MACRONS: Record<string, string> = {
  ā: 'a', ē: 'e', ī: 'i', ō: 'o', ū: 'u', ȳ: 'y',
};

/**
 * Canonical form used for grading. Must stay identical to the SQL
 * function latin_normalize() (see tests/fixtures/normalize.json).
 */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[āēīōūȳ]/g, ch => MACRONS[ch])
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrect(q: DrillQuestion, given: string): boolean {
  const g = normalize(given);
  if (q.type === 'mc') return g === normalize(q.correct);
  return q.answers.some(a => normalize(a) === g);
}

export function correctDisplay(q: DrillQuestion): string {
  return q.type === 'mc' ? q.correct : q.answers[0];
}

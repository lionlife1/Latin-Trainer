import type { LexiconRow } from '../build-seed';
import { lemmaKey } from './compose';

/** Rank of a Whitaker frequency letter: A is the most common, anything unknown is last. */
export const freqRank = (f: string): number => {
  const i = 'ABCDEF'.indexOf(f);
  return i < 0 ? 6 : i;
};

/**
 * The genitive a lexicon headword gives as its 2nd comma part, as a lemma key without the leading dash
 * ("pater, -tris, m." -> "tris", "diēs, -ēi or diē, m." -> "ei"), or null when it gives none ("vīs, f.").
 */
export function headwordGenitive(headword: string): string | null {
  const second = headword.split(',')[1]?.trim();
  if (!second || /^(m|f|n|c)\./.test(second)) return null;
  const key = lemmaKey(second.split(' or ')[0]).replace(/^-/, '');
  return key || null;
}

/** The genders a headword states ("m." -> ['m'], "m. and f." -> ['m', 'f']), from the parts after the first. */
export function headwordGenders(headword: string): string[] {
  const tail = headword.split(',').slice(1).join(',');
  return [...new Set([...tail.matchAll(/(?<![a-z])([mfnc])\./g)].map(m => m[1]))];
}

/**
 * The best Whitaker candidate for a core lexicon row: same lemma key, and when the headword gives a
 * genitive, one of the candidate's own genitives ends with it. Best frequency wins, then the earlier line.
 */
export function matchHeadword<T extends { freq: string; line: number }>(
  row: LexiconRow,
  candidates: T[],
  nominative: (c: T) => string,
  genitives: (c: T) => string[],
): T | undefined {
  const gen = headwordGenitive(row.headword);
  const key = lemmaKey(row.lemma);
  return candidates
    .filter(c => lemmaKey(nominative(c)) === key)
    .filter(c => !gen || genitives(c).some(g => lemmaKey(g).endsWith(gen)))
    .sort((a, b) => freqRank(a.freq) - freqRank(b.freq) || a.line - b.line)[0];
}

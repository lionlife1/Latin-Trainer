import { correctDisplay, normalize } from './grading';
import { seededRng, shuffle } from './shuffle';
import type { DrillQuestion } from './types';
import type { PoolItem } from './vocab';

export const VERSION_LABELS = ['A', 'B', 'C'] as const;
const LETTERS = 'ABCDEFGH';

export interface PrintQuestion {
  number: number;
  /** Points this item is worth (1 when the pool row has none). */
  points: number;
  /** MC choices are in this version's printed order. */
  question: DrillQuestion;
  /** MC only: position of the correct choice in `question.choices`, and its letter. */
  keyIndex?: number;
  keyLetter?: string;
  /** MC only: the correct choice, as HTML (choices are HTML, like prompts). */
  keyHtml?: string;
  /** Type-in only: every accepted answer, plain text. */
  keyText?: string;
}

export interface PrintVersion {
  label: string;
  questions: PrintQuestion[];
}

function toPrint(q: DrillQuestion, number: number, rng: () => number, points = 1): PrintQuestion {
  // Grid and parse items pass through unchanged: no shuffling inside a grid.
  if (q.type === 'typein') return { number, points, question: q, keyText: q.answers.join(' / ') };
  if (q.type !== 'mc') return { number, points, question: q, keyText: correctDisplay(q) };
  const choices = shuffle(q.choices, rng);
  const keyIndex = choices.findIndex(c => normalize(c) === normalize(q.correct));
  return { number, points, question: { ...q, choices }, keyIndex, keyLetter: LETTERS[keyIndex], keyHtml: choices[keyIndex] };
}

/**
 * Printed versions of an assignment. The same `count` questions are drawn once from the pool (as
 * start_attempt draws min(question_count, pool size)); each version then gets its own order of
 * questions and of MC choices. With `redraw` and a pool larger than `count`, each version instead draws
 * its own `count` items with its own seeded rng. Same seed and pool -> same printout, whatever order the rows arrive in.
 */
export function buildPrintVersions(
  pool: PoolItem[],
  count: number,
  versions: number,
  seed: number,
  redraw = false,
): PrintVersion[] {
  const sorted = [...pool].sort((a, b) => (a.item_key < b.item_key ? -1 : a.item_key > b.item_key ? 1 : 0));
  const n = Math.max(0, Math.min(count, pool.length));
  const picked = shuffle(sorted, seededRng(seed)).slice(0, n);
  const own = redraw && pool.length > count;
  return VERSION_LABELS.slice(0, versions).map((label, v) => {
    const rng = seededRng(seed + 7919 * (v + 1));
    const items = own ? shuffle(sorted, rng).slice(0, n) : picked;
    return { label, questions: shuffle(items, rng).map((p, i) => toPrint(p.question, i + 1, rng, p.points ?? 1)) };
  });
}

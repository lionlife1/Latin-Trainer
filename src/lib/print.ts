import { correctDisplay, normalize } from './grading';
import { seededRng, shuffle } from './shuffle';
import type { DrillQuestion } from './types';
import type { PoolItem } from './vocab';

export const VERSION_LABELS = ['A', 'B', 'C'] as const;
const LETTERS = 'ABCDEFGH';

export interface PrintQuestion {
  number: number;
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

function toPrint(q: DrillQuestion, number: number, rng: () => number): PrintQuestion {
  if (q.type === 'typein') return { number, question: q, keyText: q.answers.join(' / ') };
  if (q.type !== 'mc') return { number, question: q, keyText: correctDisplay(q) };
  const choices = shuffle(q.choices, rng);
  const keyIndex = choices.findIndex(c => normalize(c) === normalize(q.correct));
  return { number, question: { ...q, choices }, keyIndex, keyLetter: LETTERS[keyIndex], keyHtml: choices[keyIndex] };
}

/**
 * Printed versions of an assignment. The same `count` questions are drawn once from the pool (as
 * start_attempt draws min(question_count, pool size)); each version then gets its own order of
 * questions and of MC choices. Same seed and pool -> same printout, whatever order the rows arrive in.
 */
export function buildPrintVersions(pool: PoolItem[], count: number, versions: number, seed: number): PrintVersion[] {
  const sorted = [...pool].sort((a, b) => (a.item_key < b.item_key ? -1 : a.item_key > b.item_key ? 1 : 0));
  const picked = shuffle(sorted, seededRng(seed)).slice(0, Math.max(0, Math.min(count, pool.length)));
  return VERSION_LABELS.slice(0, versions).map((label, v) => {
    const rng = seededRng(seed + 7919 * (v + 1));
    return { label, questions: shuffle(picked, rng).map((p, i) => toPrint(p.question, i + 1, rng)) };
  });
}

import { toCsv } from './csv';
import { shuffle } from './shuffle';
import { pickDistractors, type VocabItem } from './vocab';

/*
 * Vocab list exports for the review games teachers already use (plan.md, Delivery -> Export).
 *
 * VERIFY BEFORE RELYING ON THESE: the Gimkit and Blooket layouts below are written from memory of
 * each platform's spreadsheet import template (a title row, then a header row, then one question
 * per row); their templates could not be downloaded while building this. Check the column order,
 * the header text and whether the title row is expected against a fresh template download from
 * each site, and update the constants and tests if they differ. Quizlet's paste import (term TAB
 * definition, one per line) is stable and documented. Kahoot needs .xlsx and is not done.
 * toCsv prefixes text starting with = + - @ with an apostrophe (formula safety), except a dash
 * followed only by letters, so "-que" exports as is.
 */

/** Tabs and line breaks would split a Quizlet card. */
const flat = (s: string) => s.replace(/[\t\r\n]+/g, ' ').trim();

/** Quizlet "Import" box: term<TAB>definition, one card per line. */
export function quizletText(items: VocabItem[]): string {
  return items.map(i => `${flat(i.headword)}\t${flat(i.definition)}\n`).join('');
}

export const GIMKIT_TITLE = 'Gimkit Spreadsheet Import Template';
export const GIMKIT_HEADER = [
  'Question', 'Correct Answer', 'Incorrect Answer 1', 'Incorrect Answer 2 (Optional)', 'Incorrect Answer 3 (Optional)',
] as const;

/** Gimkit spreadsheet import: Latin headword as the question, the meaning and 3 wrong meanings. */
export function gimkitCsv(items: VocabItem[], fallback: VocabItem[], rng: () => number = Math.random): string {
  const rows = items.map(i => {
    const wrong = pickDistractors(i, items, fallback, rng);
    return [flat(i.headword), flat(i.definition), ...[0, 1, 2].map(k => (wrong[k] ? flat(wrong[k]) : null))];
  });
  return toCsv([[GIMKIT_TITLE, null, null, null, null], [...GIMKIT_HEADER], ...rows]);
}

export const BLOOKET_TITLE = 'Blooket Import Template';
export const BLOOKET_HEADER = [
  'Question #', 'Question Text', 'Answer 1', 'Answer 2', 'Answer 3 (Optional)', 'Answer 4 (Optional)',
  'Time Limit (sec) (Max: 300 seconds)', 'Correct Answer(s) (Only include Answer #)',
] as const;
export const BLOOKET_DEFAULT_TIME = 20;

/** Blooket spreadsheet import: answers shuffled, the correct one given by its number (1-4). */
export function blooketCsv(
  items: VocabItem[],
  fallback: VocabItem[],
  rng: () => number = Math.random,
  timeLimitSec = BLOOKET_DEFAULT_TIME,
): string {
  const rows = items.map((i, n) => {
    const correct = flat(i.definition);
    const answers = shuffle([correct, ...pickDistractors(i, items, fallback, rng).map(flat)], rng);
    return [
      n + 1, flat(i.headword), ...[0, 1, 2, 3].map(k => answers[k] ?? null), timeLimitSec, answers.indexOf(correct) + 1,
    ];
  });
  return toCsv([[BLOOKET_TITLE, null, null, null, null, null, null, null], [...BLOOKET_HEADER], ...rows]);
}

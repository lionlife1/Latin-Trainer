import { normalize } from './grading';
import { escapeHtml } from './html';
import { shuffle } from './shuffle';
import type { DrillQuestion } from './types';

export interface VocabItem {
  itemId: string;
  headword: string;
  lemma: string;
  /** Effective definition (teacher override already applied). */
  definition: string;
  pos: string;
}
export type VocabDirection = 'l2e' | 'e2l';
export interface PoolItem {
  item_key: string;
  question: DrillQuestion;
}

const DISTRACTORS = 3;

/** Up to 3 wrong meanings: same part of speech first, list words before fallback words, no repeats. */
export function pickDistractors(target: VocabItem, list: VocabItem[], fallback: VocabItem[], rng: () => number): string[] {
  const others = list.filter(i => i.itemId !== target.itemId);
  const samePos = (xs: VocabItem[]) => shuffle(xs.filter(i => i.pos === target.pos), rng);
  const otherPos = (xs: VocabItem[]) => shuffle(xs.filter(i => i.pos !== target.pos), rng);
  const ordered = [...samePos(others), ...samePos(fallback), ...otherPos(others), ...otherPos(fallback)];

  const seen = new Set([normalize(target.definition)]);
  const out: string[] = [];
  for (const c of ordered) {
    const key = normalize(c.definition);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c.definition);
    if (out.length === DISTRACTORS) break;
  }
  return out;
}

/**
 * Turns a vocab list into assignment pool items.
 * l2e: Latin headword -> pick the English meaning (MC).
 * e2l: English meaning -> type the Latin lemma; every lemma in the list with the same meaning is accepted.
 */
export function buildVocabQuestions(
  items: VocabItem[],
  directions: VocabDirection[],
  fallback: VocabItem[],
  rng: () => number = Math.random,
): PoolItem[] {
  const pool: PoolItem[] = [];
  for (const it of items) {
    const explanation = `${it.headword}: ${it.definition}`;
    for (const dir of directions) {
      const item_key = `vocab:${it.itemId}:${dir}`;
      if (dir === 'l2e') {
        const correct = escapeHtml(it.definition);
        const choices = shuffle([correct, ...pickDistractors(it, items, fallback, rng).map(escapeHtml)], rng);
        pool.push({
          item_key,
          question: {
            id: item_key,
            type: 'mc',
            badge: 'VOCAB · MEANING',
            prompt: `What does <span class='latin-word'>${escapeHtml(it.headword)}</span> mean?`,
            choices,
            correct,
            explanation,
          },
        });
      } else {
        const def = normalize(it.definition);
        const answers = [it.lemma, ...items.filter(o => o.itemId !== it.itemId && normalize(o.definition) === def).map(o => o.lemma)];
        pool.push({
          item_key,
          question: {
            id: item_key,
            type: 'typein',
            badge: 'VOCAB · LATIN',
            prompt: `Give the Latin word for: <strong>${escapeHtml(it.definition)}</strong>`,
            hint: it.pos ? `Part of speech: ${escapeHtml(it.pos)}` : undefined,
            answers: [...new Set(answers)],
            explanation,
          },
        });
      }
    }
  }
  return pool;
}

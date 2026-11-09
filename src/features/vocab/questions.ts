// Turns study items into ordinary DrillQuestions (Review, Learn) or flashcard fronts/backs.
import { normalize } from '../../lib/grading';
import { escapeHtml } from '../../lib/html';
import { lemmaOf } from '../../lib/lexicon';
import { shuffle } from '../../lib/shuffle';
import type { MCQuestion, TypeInQuestion } from '../../lib/types';
import { pickDistractors, type VocabItem } from '../../lib/vocab';
import { guessPos } from '../../lib/vocabImport';
import { setItems, type StudyItem } from './scheduler';
import type { SrsRecord, StudySet } from './storage';

export const LEARN_MAX = 20;

const dedupe = (xs: string[]) => {
  const seen = new Set<string>();
  return xs.map(x => x.trim()).filter(x => x && !seen.has(normalize(x)) && seen.add(normalize(x)));
};

/** The whole English first, then each gloss, each without parentheticals and without a leading to/a/an/the. */
export function englishAnswers(english: string): string[] {
  const full = english.trim();
  const out: string[] = [];
  for (const c of [full, ...full.split(/[;,/]/)]) {
    for (const v of [c, c.replace(/\([^)]*\)/g, '')]) {
      out.push(v.trim(), v.trim().replace(/^(to|a|an|the)\s+/i, ''));
    }
  }
  return dedupe(out);
}

export function latinAnswers(latin: string): string[] {
  const full = latin.trim();
  return dedupe([full, lemmaOf(full)]);
}

const sameLatin = (set: StudySet, latin: string) => set.cards.filter(c => normalize(c.latin) === normalize(latin));
const sameEnglish = (set: StudySet, english: string) => set.cards.filter(c => normalize(c.english) === normalize(english));
const explanation = (latin: string, english: string) => `${latin}: ${english}`;
const latinSpan = (latin: string) => `<span class='latin-word'>${escapeHtml(latin)}</span>`;

export function reviewQuestion(item: StudyItem, set: StudySet): TypeInQuestion {
  const { latin, english } = item.card;
  if (item.dir === 'l2e') {
    return {
      id: item.key,
      type: 'typein',
      badge: 'VOCAB · MEANING',
      prompt: `What does ${latinSpan(latin)} mean?`,
      answers: dedupe([...englishAnswers(english), ...sameLatin(set, latin).flatMap(c => englishAnswers(c.english))]),
      explanation: explanation(latin, english),
    };
  }
  return {
    id: item.key,
    type: 'typein',
    badge: 'VOCAB · LATIN',
    prompt: `Give the Latin for: <strong>${escapeHtml(english)}</strong>`,
    hint: `Starts with <strong>${escapeHtml(latin.trim().charAt(0))}</strong>`,
    answers: dedupe([...latinAnswers(latin), ...sameEnglish(set, english).flatMap(c => latinAnswers(c.latin))]),
    explanation: explanation(latin, english),
  };
}

export function flashcardQuestion(item: StudyItem): TypeInQuestion {
  const { latin, english } = item.card;
  const l2e = item.dir === 'l2e';
  return {
    id: item.key,
    type: 'typein',
    badge: l2e ? 'LATIN' : 'ENGLISH',
    prompt: l2e ? latinSpan(latin) : escapeHtml(english),
    answers: [l2e ? english : latin],
  };
}

export function learnQuestion(item: StudyItem, set: StudySet, rng: () => number = Math.random): MCQuestion {
  const { latin, english } = item.card;
  const l2e = item.dir === 'l2e';
  const toItem = (c: { id: string; latin: string; english: string }): VocabItem => ({
    itemId: c.id,
    headword: c.latin,
    lemma: lemmaOf(c.latin),
    definition: l2e ? c.english : c.latin,
    pos: guessPos(c.latin),
  });
  const target = toItem(item.card);
  const correct = escapeHtml(target.definition);
  const wrong = pickDistractors(target, set.cards.map(toItem), [], rng).map(escapeHtml);
  return {
    id: item.key,
    type: 'mc',
    badge: l2e ? 'VOCAB · MEANING' : 'VOCAB · LATIN',
    prompt: l2e ? `What does ${latinSpan(latin)} mean?` : `Which Latin word means <strong>${escapeHtml(english)}</strong>?`,
    choices: shuffle([correct, ...wrong], rng),
    correct,
    explanation: explanation(latin, english),
  };
}

export function learnSession(set: StudySet, srs: Record<string, SrsRecord>, rng: () => number = Math.random, max = LEARN_MAX): MCQuestion[] {
  if (set.cards.length < 2) return [];
  const items = setItems(set);
  const ordered = [...shuffle(items.filter(i => !srs[i.key]), rng), ...shuffle(items.filter(i => srs[i.key]), rng)];
  return ordered.slice(0, max).map(i => learnQuestion(i, set, rng));
}

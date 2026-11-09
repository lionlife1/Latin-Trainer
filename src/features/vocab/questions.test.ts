import { describe, expect, it } from 'vitest';
import { correctDisplay, isCorrect, normalize } from '../../lib/grading';
import { seededRng } from '../../lib/shuffle';
import { flashcardQuestion, englishAnswers, latinAnswers, learnQuestion, learnSession, reviewQuestion } from './questions';
import { setItems } from './scheduler';
import { itemKey, type SrsRecord, type StudySet } from './storage';

const mkSet = (pairs: [string, string][], directions: StudySet['directions'] = ['l2e']): StudySet => ({
  id: 's1',
  name: 'T',
  cards: pairs.map(([latin, english], i) => ({ id: `c${i}`, latin, english })),
  directions,
  newPerDay: 10,
  createdAt: '',
  updatedAt: '',
});
const item = (set: StudySet, i: number, dir: 'l2e' | 'e2l' = 'l2e') => ({ key: itemKey(set.id, set.cards[i].id, dir), card: set.cards[i], dir });
const rec = {} as SrsRecord;

describe('answers', () => {
  it('englishAnswers splits glosses', () => {
    const a = englishAnswers('to love, like');
    expect(a[0]).toBe('to love, like');
    expect(a).toEqual(expect.arrayContaining(['to love', 'love', 'like']));
    expect(new Set(a.map(normalize)).size).toBe(a.length);
    expect(englishAnswers('(of a ship) to sail')).toEqual(expect.arrayContaining(['to sail', 'sail']));
    expect(englishAnswers('girl')).toEqual(['girl']);
    expect(englishAnswers('the road; way')).toEqual(expect.arrayContaining(['road', 'way']));
  });
  it('latinAnswers accepts the lemma', () => {
    expect(latinAnswers('amo, amare, amavi, amatum')).toEqual(['amo, amare, amavi, amatum', 'amo']);
    expect(latinAnswers('puella')).toEqual(['puella']);
  });
});

describe('reviewQuestion', () => {
  it('l2e grades with grading.ts', () => {
    const set = mkSet([['amo, amare', 'to love, like']]);
    const q = reviewQuestion(item(set, 0), set);
    expect(q.badge).toBe('VOCAB · MEANING');
    expect(isCorrect(q, 'Love')).toBe(true);
    expect(isCorrect(q, 'like')).toBe(true);
    expect(isCorrect(q, 'hate')).toBe(false);
    expect(correctDisplay(q)).toBe('to love, like');
  });
  it('e2l accepts every Latin word with the same meaning', () => {
    const set = mkSet([['fero', 'to carry'], ['porto', 'to carry']], ['e2l']);
    const q = reviewQuestion(item(set, 0, 'e2l'), set);
    expect(isCorrect(q, 'porto')).toBe(true);
    expect(isCorrect(q, 'fero')).toBe(true);
    expect(q.hint).toBe('Starts with <strong>f</strong>');
  });
  it('l2e accepts every meaning of a repeated Latin word', () => {
    const set = mkSet([['malum', 'apple'], ['malum', 'evil']]);
    expect(isCorrect(reviewQuestion(item(set, 0), set), 'evil')).toBe(true);
  });
  it('escapes card text', () => {
    const set = mkSet([['x', '<b>x</b>']], ['e2l']);
    expect(reviewQuestion(item(set, 0, 'e2l'), set).prompt).toContain('&lt;b&gt;');
  });
});

describe('flashcardQuestion', () => {
  it('shows the front and answers with the back', () => {
    const set = mkSet([['puella', 'girl']], ['l2e', 'e2l']);
    const f = flashcardQuestion(item(set, 0));
    expect(f.badge).toBe('LATIN');
    expect(f.answers).toEqual(['girl']);
    expect(flashcardQuestion(item(set, 0, 'e2l')).answers).toEqual(['puella']);
  });
});

describe('learn', () => {
  it('choices come from the set with no duplicates', () => {
    const set = mkSet([['a', 'one'], ['b', 'two'], ['c', 'two'], ['d', 'three'], ['e', 'four']]);
    for (let i = 0; i < 5; i++) {
      const q = learnQuestion(item(set, i), set, seededRng(i));
      expect(new Set(q.choices.map(normalize)).size).toBe(q.choices.length);
      expect(q.choices).toContain(q.correct);
      expect(q.choices).toHaveLength(4);
    }
    const dup = mkSet([['a', 'one'], ['b', 'two'], ['c', 'two']]);
    expect(learnQuestion(item(dup, 0), dup, seededRng(1)).choices).toHaveLength(2);
  });
  it('works with two cards', () => {
    const set = mkSet([['a', 'one'], ['b', 'two']]);
    for (const dir of ['l2e', 'e2l'] as const) {
      expect(learnQuestion(item(set, 0, dir), set, seededRng(1)).choices).toHaveLength(2);
    }
  });
  it('puts unseen items first and stops at the max', () => {
    const set = mkSet(Array.from({ length: 30 }, (_, i) => [`w${i}`, `m${i}`] as [string, string]));
    const srs: Record<string, SrsRecord> = {};
    for (let i = 0; i < 25; i++) srs[itemKey('s1', `c${i}`, 'l2e')] = rec;
    const qs = learnSession(set, srs, seededRng(1));
    expect(qs).toHaveLength(20);
    const first5 = qs.slice(0, 5).map(q => q.id).sort();
    expect(first5).toEqual([25, 26, 27, 28, 29].map(i => itemKey('s1', `c${i}`, 'l2e')).sort());
    expect(setItems(set)).toHaveLength(30);
  });
  it('needs two cards', () => {
    expect(learnSession(mkSet([['a', 'one']]), {})).toEqual([]);
  });
});

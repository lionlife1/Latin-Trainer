import { buildPrintVersions, VERSION_LABELS } from './print';
import { seededRng } from './shuffle';
import type { DrillQuestion } from './types';
import type { PoolItem } from './vocab';

const mc = (id: string, correct: string, others: string[]): PoolItem => ({
  item_key: id,
  question: { id, type: 'mc', badge: 'B', prompt: `<em>${id}</em>?`, choices: [correct, ...others], correct },
});
const typein = (id: string, answers: string[]): PoolItem => ({
  item_key: id,
  question: { id, type: 'typein', badge: 'B', prompt: `${id}?`, answers },
});
const pool: PoolItem[] = [
  mc('q1', 'to see', ['to lead', 'to send', 'to hear']),
  mc('q2', 'girl', ['king', 'war', 'road']),
  typein('q3', ['capiō', 'rapiō']),
  mc('q4', 'amāret', ['amet', 'amāvisset', 'amārētur']),
  typein('q5', ['puella']),
  mc('q6', 'cum', ['ut', 'nē', 'quīn']),
];
const ids = (qs: { question: DrillQuestion }[]) => qs.map(q => q.question.id);

describe('seededRng', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const a = seededRng(42), b = seededRng(42), c = seededRng(43);
    const xs = Array.from({ length: 50 }, () => a());
    expect(Array.from({ length: 50 }, () => b())).toEqual(xs);
    expect(Array.from({ length: 50 }, () => c())).not.toEqual(xs);
    expect(xs.every(x => x >= 0 && x < 1)).toBe(true);
  });
});

describe('buildPrintVersions', () => {
  it('labels versions A, B, C', () => {
    expect(buildPrintVersions(pool, 4, 3, 1).map(v => v.label)).toEqual(['A', 'B', 'C']);
    expect(VERSION_LABELS).toEqual(['A', 'B', 'C']);
  });

  it('draws question count items, the same set in every version', () => {
    const vs = buildPrintVersions(pool, 4, 3, 7);
    const sets = vs.map(v => ids(v.questions).sort());
    expect(sets[0]).toHaveLength(4);
    expect(sets[1]).toEqual(sets[0]);
    expect(sets[2]).toEqual(sets[0]);
  });

  it('caps the count at the pool size', () => {
    expect(buildPrintVersions(pool, 50, 1, 1)[0].questions).toHaveLength(pool.length);
  });

  it('is deterministic for a seed and independent of pool row order', () => {
    const a = buildPrintVersions(pool, 5, 2, 99);
    const b = buildPrintVersions([...pool].reverse(), 5, 2, 99);
    expect(b).toEqual(a);
    expect(buildPrintVersions(pool, 5, 2, 100)).not.toEqual(a);
  });

  it('gives versions different question orders', () => {
    const [a, b, c] = buildPrintVersions(pool, 6, 3, 5);
    const orders = new Set([ids(a.questions).join(), ids(b.questions).join(), ids(c.questions).join()]);
    expect(orders.size).toBeGreaterThan(1);
  });

  it('shuffles MC choices but keeps all of them, and the key points at the correct one', () => {
    for (const v of buildPrintVersions(pool, 6, 3, 11)) {
      for (const pq of v.questions) {
        const original = pool.find(p => p.item_key === pq.question.id)!.question;
        if (pq.question.type === 'mc' && original.type === 'mc') {
          expect([...pq.question.choices].sort()).toEqual([...original.choices].sort());
          expect(pq.question.choices[pq.keyIndex!]).toBe(original.correct);
          expect(pq.keyLetter).toBe('ABCD'[pq.keyIndex!]);
          expect(pq.keyHtml).toBe(original.correct);
        } else if (original.type === 'typein') {
          expect(pq.keyIndex).toBeUndefined();
          expect(pq.keyLetter).toBeUndefined();
          expect(pq.keyText).toBe(original.answers.join(' / '));
        }
      }
    }
  });

  it('matches the correct choice ignoring macrons and case, as grading does', () => {
    const odd = mc('x', 'Amō', ['amās', 'amat', 'amant']);
    (odd.question as { correct: string }).correct = 'amo';
    const [v] = buildPrintVersions([odd], 1, 1, 3);
    const q = v.questions[0];
    expect(q.question.type === 'mc' && q.question.choices[q.keyIndex!]).toBe('Amō');
  });

  it('does not mutate the pool', () => {
    const copy = JSON.parse(JSON.stringify(pool));
    buildPrintVersions(pool, 6, 3, 2);
    expect(pool).toEqual(copy);
  });

  it('numbers questions from 1', () => {
    expect(buildPrintVersions(pool, 3, 1, 1)[0].questions.map(q => q.number)).toEqual([1, 2, 3]);
  });
});

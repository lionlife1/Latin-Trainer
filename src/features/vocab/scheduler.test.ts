import { describe, expect, it } from 'vitest';
import { isDue, localDay, endOfLocalDay, rate, reviewQueue, setCounts, setItems, type Rate } from './scheduler';
import { itemKey, type SrsRecord, type StudySet } from './storage';

const now = new Date(2026, 10, 6, 12);
const mkSet = (n: number, over: Partial<StudySet> = {}): StudySet => ({
  id: 's',
  name: 'S',
  cards: Array.from({ length: n }, (_, i) => ({ id: `c${i}`, latin: `l${i}`, english: `e${i}` })),
  directions: ['l2e'],
  newPerDay: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});
const at = (days: number, h = 12) => new Date(2026, 10, 6 + days, h);
const rec = (due: Date, introduced: string): SrsRecord => ({
  due: due.toISOString(), stability: 5, difficulty: 5, elapsed_days: 0, scheduled_days: 5,
  learning_steps: 0, reps: 1, lapses: 0, state: 2, introduced,
});
const keys = (items: { key: string }[]) => items.map(i => i.key);

describe('local day helpers', () => {
  it('use local time', () => {
    expect(localDay(new Date(2026, 10, 6, 23, 30))).toBe('2026-11-06');
    expect(endOfLocalDay(now).getTime()).toBe(new Date(2026, 10, 6, 23, 59, 59, 999).getTime());
  });
});

describe('rate', () => {
  it('first rating gives a serializable record that is not due again today', () => {
    for (const x of ['again', 'hard', 'good', 'easy'] as Rate[]) {
      const r = rate(undefined, x, now);
      expect(typeof r.due).toBe('string');
      expect(r.reps).toBe(1);
      expect(r.introduced).toBe('2026-11-06');
      expect(isDue(r, now)).toBe(false);
      expect(JSON.parse(JSON.stringify(r))).toEqual(r);
    }
  });

  it('easier ratings give longer first intervals', () => {
    const d = (x: Rate) => rate(undefined, x, now).scheduled_days;
    expect(d('again')).toBeGreaterThanOrEqual(1);
    expect(d('again')).toBeLessThanOrEqual(d('hard'));
    expect(d('hard')).toBeLessThanOrEqual(d('good'));
    expect(d('good')).toBeLessThan(d('easy'));
  });

  it('a stored record can be rated again', () => {
    const r1 = rate(undefined, 'good', now);
    const r2 = rate(JSON.parse(JSON.stringify(r1)), 'good', new Date(r1.due));
    expect(r2.reps).toBe(2);
    expect(r2.scheduled_days).toBeGreaterThan(r1.scheduled_days);
    expect(r2.introduced).toBe(r1.introduced);
    expect(rate(r2, 'again', new Date(r2.due)).lapses).toBe(1);
  });

  it('is deterministic', () => {
    expect(rate(undefined, 'good', now)).toEqual(rate(undefined, 'good', now));
  });
});

describe('isDue', () => {
  it('counts the rest of the local day', () => {
    expect(isDue(rec(new Date(2026, 10, 6, 23), '2026-11-01'), new Date(2026, 10, 6, 9))).toBe(true);
    expect(isDue(rec(new Date(2026, 10, 7, 0, 30), '2026-11-01'), new Date(2026, 10, 6, 23, 30))).toBe(false);
  });
});

describe('setItems and review queue', () => {
  it('orders by card then l2e before e2l', () => {
    const s = mkSet(2, { directions: ['l2e', 'e2l'] });
    expect(keys(setItems(s))).toEqual([
      itemKey('s', 'c0', 'l2e'), itemKey('s', 'c0', 'e2l'), itemKey('s', 'c1', 'l2e'), itemKey('s', 'c1', 'e2l'),
    ]);
  });

  it('due first, oldest first, then new up to the daily limit', () => {
    const s = mkSet(5, { newPerDay: 2 });
    const srs = {
      [itemKey('s', 'c3', 'l2e')]: rec(at(-3), '2026-10-01'),
      [itemKey('s', 'c4', 'l2e')]: rec(at(-1), '2026-10-01'),
      [itemKey('s', 'c0', 'l2e')]: rec(at(7), '2026-11-06'),
    };
    expect(keys(reviewQueue(s, srs, now))).toEqual([itemKey('s', 'c3', 'l2e'), itemKey('s', 'c4', 'l2e'), itemKey('s', 'c1', 'l2e')]);
  });

  it('caps at max', () => {
    const s = mkSet(60, { newPerDay: 100 });
    expect(reviewQueue(s, {}, now)).toHaveLength(50);
    expect(reviewQueue(s, {}, now, 5)).toHaveLength(5);
  });

  it('e2l waits until l2e was introduced on an earlier day', () => {
    const s = mkSet(1, { directions: ['l2e', 'e2l'] });
    const l2e = itemKey('s', 'c0', 'l2e');
    expect(keys(reviewQueue(s, {}, now))).toEqual([l2e]);
    expect(reviewQueue(s, { [l2e]: rec(at(1), '2026-11-06') }, now)).toEqual([]);
    expect(keys(reviewQueue(s, { [l2e]: rec(at(7), '2026-11-05') }, now))).toEqual([itemKey('s', 'c0', 'e2l')]);
  });

  it('the new-card allowance resets at local midnight', () => {
    const s = mkSet(3, { newPerDay: 1 });
    const srs = { [itemKey('s', 'c0', 'l2e')]: rec(at(5), '2026-11-06') };
    expect(reviewQueue(s, srs, new Date(2026, 10, 6, 23, 30))).toEqual([]);
    expect(reviewQueue(s, srs, new Date(2026, 10, 7, 0, 30))).toHaveLength(1);
  });
});

describe('setCounts', () => {
  it('counts new, due and learned', () => {
    const s = mkSet(3);
    const srs = {
      [itemKey('s', 'c0', 'l2e')]: rec(at(-1), '2026-11-01'),
      [itemKey('s', 'c1', 'l2e')]: rec(at(7), '2026-11-01'),
    };
    const c = setCounts(s, srs, now);
    expect(c).toEqual({ new: 1, due: 1, learned: 1, newToday: 1 });
    const newInQueue = reviewQueue(s, srs, now, Infinity).filter(i => !srs[i.key]).length;
    expect(c.newToday).toBe(newInQueue);
  });
});

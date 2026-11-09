import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SETS_KEY, SRS_KEY, addCards, createSet, deleteSet, getSet, itemKey, loadSets, loadSrs, removeCard,
  saveSets, saveSrsRecord, updateCard, updateSet, type SrsRecord,
} from './storage';

const rec = (over: Partial<SrsRecord> = {}): SrsRecord => ({
  due: '2026-01-02T00:00:00.000Z', stability: 1, difficulty: 5, elapsed_days: 0, scheduled_days: 1,
  learning_steps: 0, reps: 1, lapses: 0, state: 2, last_review: '2026-01-01T00:00:00.000Z', introduced: '2026-01-01', ...over,
});
const set = (id: string, over: Record<string, unknown> = {}) => ({
  id, name: id, cards: [], directions: ['l2e'], newPerDay: 10, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...over,
});

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('study set storage', () => {
  it('creates a set with defaults', () => {
    const s = createSet('  Ch 1 ')!;
    expect(s.name).toBe('Ch 1');
    expect(s.directions).toEqual(['l2e']);
    expect(s.newPerDay).toBe(10);
    expect(s.cards).toEqual([]);
    expect(Number.isNaN(Date.parse(s.createdAt))).toBe(false);
    expect(loadSets()).toHaveLength(1);
    const raw = JSON.parse(localStorage.getItem(SETS_KEY)!);
    expect(raw.v).toBe(1);
    expect(raw.sets).toHaveLength(1);
  });

  it('blank name becomes Untitled set and long names are cut', () => {
    expect(createSet('')!.name).toBe('Untitled set');
    expect(createSet('x'.repeat(100))!.name.length).toBe(80);
  });

  it('adds cards, trimming and skipping blanks, over-long text and duplicates', () => {
    const s = createSet('A')!;
    const r = addCards(s.id, [
      { latin: ' puella ', english: 'girl' },
      { latin: 'Puella', english: 'GIRL' },
      { latin: '', english: 'x' },
      { latin: 'a'.repeat(121), english: 'x' },
      { latin: 'aqua', english: 'water' },
    ]);
    expect(r).toEqual({ added: 2, duplicates: 1, invalid: 2, overflow: 0, ok: true });
    expect(getSet(s.id)!.cards[0].latin).toBe('puella');
  });

  it('stops at 1000 cards', () => {
    const cards = Array.from({ length: 999 }, (_, i) => ({ id: `c${i}`, latin: `l${i}`, english: `e${i}` }));
    localStorage.setItem(SETS_KEY, JSON.stringify({ v: 1, sets: [set('s', { cards })] }));
    const r = addCards('s', [{ latin: 'a', english: 'b' }, { latin: 'c', english: 'd' }, { latin: 'e', english: 'f' }]);
    expect(r.added).toBe(1);
    expect(r.overflow).toBe(2);
  });

  it('updateCard keeps the schedule and rejects duplicates', () => {
    const s = createSet('A', [{ latin: 'puella', english: 'girl' }, { latin: 'aqua', english: 'water' }])!;
    const [c1, c2] = s.cards;
    saveSrsRecord(itemKey(s.id, c1.id, 'l2e'), rec());
    expect(updateCard(s.id, c1.id, { latin: 'puela', english: 'girl' })).toBe('ok');
    expect(loadSrs()[itemKey(s.id, c1.id, 'l2e')]).toBeDefined();
    expect(getSet(s.id)!.cards[0].latin).toBe('puela');
    expect(updateCard(s.id, c2.id, { latin: 'puela', english: 'girl' })).toBe('duplicate');
    expect(updateCard(s.id, c2.id, { latin: 'aqua', english: '' })).toBe('invalid');
  });

  it('removeCard and deleteSet delete review history', () => {
    const s = createSet('A', [{ latin: 'puella', english: 'girl' }, { latin: 'aqua', english: 'water' }])!;
    const [c1, c2] = s.cards;
    saveSrsRecord(itemKey(s.id, c1.id, 'l2e'), rec());
    saveSrsRecord(itemKey(s.id, c1.id, 'e2l'), rec());
    saveSrsRecord(itemKey(s.id, c2.id, 'l2e'), rec());
    expect(removeCard(s.id, c1.id)).toBe(true);
    expect(Object.keys(loadSrs())).toEqual([itemKey(s.id, c2.id, 'l2e')]);
    expect(deleteSet(s.id)).toBe(true);
    expect(loadSrs()).toEqual({});
    expect(getSet(s.id)).toBeUndefined();
  });

  it('updateSet sanitizes directions and new per day', () => {
    const s = createSet('A')!;
    updateSet(s.id, { directions: ['e2l', 'l2e', 'e2l'] });
    expect(getSet(s.id)!.directions).toEqual(['l2e', 'e2l']);
    updateSet(s.id, { directions: [] });
    expect(getSet(s.id)!.directions).toEqual(['l2e']);
    updateSet(s.id, { newPerDay: 0 });
    expect(getSet(s.id)!.newPerDay).toBe(1);
    updateSet(s.id, { newPerDay: 500 });
    expect(getSet(s.id)!.newPerDay).toBe(100);
    updateSet(s.id, { newPerDay: 7.6 });
    expect(getSet(s.id)!.newPerDay).toBe(8);
    expect(updateSet(s.id, { name: '  ' })).toBe(false);
    expect(getSet(s.id)!.name).toBe('A');
  });

  it('treats corrupt storage as empty', () => {
    for (const raw of ['not json', '[]', '{"v":1,"sets":"x"}', '{"v":1,"items":"x"}', 'null']) {
      localStorage.setItem(SETS_KEY, raw);
      localStorage.setItem(SRS_KEY, raw);
      expect(loadSets()).toEqual([]);
      expect(loadSrs()).toEqual({});
    }
  });

  it('drops only the broken entries', () => {
    const good = { id: 'c1', latin: 'a', english: 'b' };
    localStorage.setItem(SETS_KEY, JSON.stringify({
      v: 1,
      sets: [set('one', { cards: [good] }), { id: 5 }, set('two', { cards: [good, { id: 'c', latin: 3 }], directions: ['bogus'], newPerDay: 'x' })],
    }));
    const sets = loadSets();
    expect(sets).toHaveLength(2);
    expect(sets[1].cards).toHaveLength(1);
    expect(sets[1].directions).toEqual(['l2e']);
    expect(sets[1].newPerDay).toBe(10);
    localStorage.setItem(SRS_KEY, JSON.stringify({
      v: 1,
      items: { k1: rec(), k2: { ...rec(), stability: 'NaN' }, k3: { ...rec(), due: 'yesterday' } },
    }));
    expect(Object.keys(loadSrs())).toEqual(['k1']);
  });

  it('never overwrites data from a newer version', () => {
    const raw = JSON.stringify({ v: 2, sets: [set('x')] });
    localStorage.setItem(SETS_KEY, raw);
    expect(loadSets()).toEqual([]);
    expect(createSet('x')).toBeNull();
    expect(localStorage.getItem(SETS_KEY)).toBe(raw);
  });

  it('returns false when storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(saveSets([])).toBe(false);
    expect(createSet('x')).toBeNull();
    expect(saveSrsRecord('k', rec())).toBe(false);
  });
});

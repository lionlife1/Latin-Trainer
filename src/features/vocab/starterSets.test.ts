import { describe, expect, it } from 'vitest';
import { CORE_VERBS } from '../../content/verbs.generated';
import { CORE_ADJECTIVES } from '../../content/adjectives.generated';
import { CORE_NOUNS } from '../../content/nouns.generated';
import { adjectiveEntry, nounEntry, principalParts } from '../../lib/morph';
import { normalize } from '../../lib/grading';
import { MAX_CARDS } from './storage';
import { starterSets } from './starterSets';

const sets = starterSets();
const find = (id: string) => sets.find(s => s.id === id)!;

describe('starterSets', () => {
  it('every set is non-empty, within the cap, and has no blank or duplicate cards', () => {
    expect(sets.length).toBeGreaterThan(0);
    for (const s of sets) {
      expect(s.cards.length, s.id).toBeGreaterThan(0);
      expect(s.cards.length, s.id).toBeLessThanOrEqual(MAX_CARDS);
      const keys = s.cards.map(c => `${normalize(c.latin)}|${normalize(c.english)}`);
      expect(new Set(keys).size, s.id).toBe(keys.length);
      for (const c of s.cards) {
        expect(c.latin.trim(), s.id).not.toBe('');
        expect(c.english.trim(), s.id).not.toBe('');
      }
    }
  });

  it('every generated verb lands in exactly one verb set', () => {
    const total = sets.filter(s => s.id.startsWith('verbs-')).reduce((n, s) => n + s.cards.length, 0);
    const distinct = new Set(CORE_VERBS.map(v => `${principalParts(v)}|${v.trans}`)).size;
    expect(total).toBe(distinct);
  });

  it('every noun and adjective lands in a set', () => {
    const size = (prefix: string) => sets.filter(s => s.id.startsWith(prefix)).reduce((n, s) => n + s.cards.length, 0);
    expect(size('nouns-')).toBe(new Set(CORE_NOUNS.map(n => `${nounEntry(n)}|${n.trans}`)).size);
    expect(size('adj-')).toBe(new Set(CORE_ADJECTIVES.map(a => `${adjectiveEntry(a)}|${a.trans}`)).size);
    expect(size('nouns-')).toBe(CORE_NOUNS.length);
    expect(size('adj-')).toBe(CORE_ADJECTIVES.length);
  });

  it('ids are unique and names match the deck', () => {
    const ids = sets.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = new Map(sets.map(s => [s.id, s.name]));
    expect(names.get('verbs-1')).toBe('Verbs: 1st conjugation');
    expect(names.get('verbs-3io')).toBe('Verbs: 3rd conjugation -iō');
    expect(names.get('verbs-dep')).toBe('Verbs: deponent');
    expect(names.get('verbs-irr')).toBe('Verbs: irregular');
    expect(names.get('nouns-1')).toBe('Nouns: 1st declension');
    expect(names.get('nouns-5')).toBe('Nouns: 5th declension');
    expect(names.get('adj-12')).toBe('Adjectives: 1st and 2nd declension');
    expect(names.get('adj-3')).toBe('Adjectives: 3rd declension');
  });

  it('builds dictionary entries with the morph helpers', () => {
    expect(find('verbs-1').cards).toContainEqual({ latin: 'amo, amare, amavi, amatus', english: 'to love' });
    expect(find('verbs-dep').cards).toContainEqual({ latin: 'admiror, admirari, admiratus sum', english: 'to admire' });
    expect(find('verbs-irr').cards).toContainEqual({ latin: 'absum, abesse, afui', english: 'to be away' });
    expect(find('nouns-1').cards.find(c => c.latin.startsWith('puella,'))?.latin).toBe('puella, puellae, f.');
    expect(find('adj-12').cards.find(c => c.latin.startsWith('bonus,'))?.latin).toBe('bonus, bona, bonum');
  });
});

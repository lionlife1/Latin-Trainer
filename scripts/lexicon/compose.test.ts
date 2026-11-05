import { clampRow, composeLexicon, lemmaKey, parseLodge } from './compose';
import type { SourceRow } from './dooge';
import type { WhitakerRow } from './whitaker';

const d = (headword: string, pos: string, definition = 'x'): SourceRow => ({
  headword, lemma: headword.split(',')[0], definition, pos,
});
const w = (headword: string, pos: string, freq: string, definition = 'x'): WhitakerRow => ({
  ...d(headword, pos, definition), freq,
});

describe('lemmaKey', () => {
  it('normalizes lemmas from different sources to one key', () => {
    expect(lemmaKey('i-GNARUs')).toBe('ignarus');
    expect(lemmaKey('circum´dō')).toBe('circumdo');
    expect(lemmaKey('jaciō')).toBe('iacio');
  });
});

describe('parseLodge', () => {
  it('maps lemma keys to ranks', () => {
    expect(parseLodge('98\tamo\n96\ta-mitto\n')).toEqual(new Map([['amo', 98], ['amitto', 96]]));
  });
  it('keeps the first rank for a duplicate lemma', () => {
    expect(parseLodge('5\tne\n9\tne\n').get('ne')).toBe(5);
  });
});

describe('clampRow', () => {
  const base = { headword: 'h', lemma: 'h', definition: 'd', pos: 'noun', frequency: null, core: false };
  it('cuts long definitions at the last separator', () => {
    const r = clampRow({ ...base, definition: 'a; '.repeat(87) });
    expect(r.definition.length).toBeLessThanOrEqual(200);
    expect(r.definition.endsWith('a')).toBe(true);
  });
  it('hard-cuts a definition without separators', () => {
    const r = clampRow({ ...base, definition: 'x'.repeat(260) });
    expect(r.definition).toBe('x'.repeat(199) + '…');
  });
  it('cuts a long headword to 120', () => {
    expect(clampRow({ ...base, headword: 'h'.repeat(130) }).headword).toHaveLength(120);
  });
});

describe('composeLexicon', () => {
  it('prefers the D\'Ooge row over a matching Whitaker row', () => {
    const { rows } = composeLexicon(
      [d('amō, amāre, amāvī, amātum', 'verb', 'love')],
      [w('amo, amare, amavi, amatus', 'verb', 'A')],
      new Map([['amo', 98]]),
    );
    expect(rows).toEqual([{ headword: 'amō, amāre, amāvī, amātum', lemma: 'amō', definition: 'love', pos: 'verb', frequency: null, core: true }]);
  });
  it('marks only the best-frequency Whitaker entry of a Lodge lemma as core', () => {
    const { rows } = composeLexicon(
      [],
      [w('bonus, bona, bonum', 'adjective', 'A'), w('bonus, boni, m.', 'noun', 'C')],
      new Map([['bonus', 7]]),
    );
    expect(rows.find(r => r.pos === 'adjective')).toMatchObject({ core: true, frequency: null });
    expect(rows.find(r => r.pos === 'noun')).toMatchObject({ core: false, frequency: null });
  });
  it('keeps the best-frequency row for a duplicate (headword, pos)', () => {
    const { rows } = composeLexicon([], [w('foo, foi', 'noun', 'B', 'second'), w('foo, foi', 'noun', 'A', 'first')], new Map());
    expect(rows).toHaveLength(1);
    expect(rows[0].definition).toBe('first');
  });
  it('keeps the first of duplicated D\'Ooge rows', () => {
    const { rows } = composeLexicon([d('dep', 'verb', 'one'), d('dep', 'verb', 'two')], [], new Map());
    expect(rows).toHaveLength(1);
    expect(rows[0].definition).toBe('one');
  });
  it('outputs unique (headword, pos)', () => {
    const { rows } = composeLexicon(
      [d('a', 'noun'), d('a', 'noun'), d('b', 'verb')],
      [w('a', 'noun', 'A'), w('c', 'noun', 'A'), w('c', 'noun', 'B'), w('b', 'adjective', 'A')],
      new Map(),
    );
    const keys = rows.map(r => `${r.headword}|${r.pos}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('never stores Lodge numbers (alphabetical, not frequency) as frequency', () => {
    const { rows } = composeLexicon([d('amō', 'verb')], [w('bonus, bona', 'adjective', 'A')], new Map([['amo', 1], ['bonus', 2]]));
    expect(rows.map(r => r.frequency)).toEqual([null, null]);
    expect(rows.every(r => r.core)).toBe(true);
  });
  it('reports Lodge lemmas found in neither source', () => {
    const { unmatchedLodge } = composeLexicon([d('amō', 'verb')], [w('bonus, bona', 'adjective', 'A')], new Map([['amo', 1], ['bonus', 2], ['zzz', 3]]));
    expect(unmatchedLodge).toEqual(['zzz']);
  });
});

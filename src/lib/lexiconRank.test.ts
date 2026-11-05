import { rankLexicon } from './lexiconRank';

let nextId = 1;
const row = (lemma: string, core: boolean, definition = 'x') => ({
  id: nextId++, owner_id: null, headword: lemma, lemma, definition, pos: 'verb', core,
});

describe('rankLexicon', () => {
  it('puts the exact core lemma first ahead of prefix and definition matches', () => {
    const rows = [
      row('absum', true, 'be away'), row('adipiscor', true, 'get, obtain; (consume)'),
      row('summa', false, 'sum, total'), row('sum', true, 'be'), row('summus', true, 'highest'),
    ];
    const ranked = rankLexicon(rows, 'sum');
    expect(ranked[0].lemma).toBe('sum');
    expect(ranked.map(r => r.lemma)).toEqual(['sum', 'summus', 'summa', 'absum', 'adipiscor']);
  });
  it('ranks et before etiam and definition matches', () => {
    const rows = [row('etiam', true), row('atque', true, 'and, et'), row('et', true, 'and'), row('etsi', false)];
    expect(rankLexicon(rows, 'et').map(r => r.lemma)).toEqual(['et', 'etiam', 'etsi', 'atque']);
  });
  it('ranks in before inter', () => {
    const rows = [row('inter', true), row('ibi', true, 'there, in that place'), row('in', true, 'in, into')];
    expect(rankLexicon(rows, 'in')[0].lemma).toBe('in');
    expect(rankLexicon(rows, 'in')[1].lemma).toBe('inter');
  });
  it('matches the lemma ignoring macrons and case, using lemma_search when present', () => {
    const rows = [row('amīcus', true), { ...row('amō', true), lemma_search: 'amo' }, row('Amor', false)];
    expect(rankLexicon(rows, 'amo').map(r => r.lemma)).toEqual(['amō', 'Amor', 'amīcus']);
  });
  it('orders within a group by core, then shorter lemma, then alphabetically', () => {
    const rows = [row('cb', true), row('cab', false), row('ca', true), row('caa', true)];
    expect(rankLexicon(rows, 'c').map(r => r.lemma)).toEqual(['ca', 'cb', 'caa', 'cab']);
  });
  it('does not mutate its input', () => {
    const rows = [row('b', false), row('a', true)];
    rankLexicon(rows, 'a');
    expect(rows.map(r => r.lemma)).toEqual(['b', 'a']);
  });
});

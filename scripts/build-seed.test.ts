import { lemmaOf, lexiconSql } from './build-seed';

describe('build-seed helpers', () => {
  it('takes the lemma from the first token of a headword', () => {
    expect(lemmaOf('capiō, capere, cēpī, captum')).toBe('capiō');
    expect(lemmaOf('ab, ā + abl.')).toBe('ab');
    expect(lemmaOf('nōn')).toBe('nōn');
    expect(lemmaOf('in + acc./abl.')).toBe('in');
    expect(lemmaOf('rēs pūblica, reī pūblicae, f.')).toBe('rēs pūblica');
    expect(lemmaOf('cum + abl.')).toBe('cum');
  });
});

describe('lexiconSql', () => {
  const row = { headword: 'am', lemma: 'am', definition: "fireman's bucket", pos: 'noun', frequency: null, core: false };
  it('escapes quotes and targets the built-in partial index', () => {
    const sql = lexiconSql([row]);
    expect(sql).toContain("'fireman''s bucket'");
    expect(sql).toContain('on conflict (headword, pos) where owner_id is null');
  });
  it('batches inserts', () => {
    const rows = Array.from({ length: 1001 }, (_, i) => ({ ...row, headword: `w${i}` }));
    expect(lexiconSql(rows, 500).match(/insert into/g)).toHaveLength(3);
  });
});

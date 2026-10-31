import { dccToLexicon, lemmaOf, parseCsv } from './build-seed';

describe('build-seed helpers', () => {
  it('parses quoted CSV fields', () => {
    expect(parseCsv('a,"b, c","d ""e"""\r\n1,2,3\n')).toEqual([['a', 'b, c', 'd "e"'], ['1', '2', '3']]);
  });
  it('takes the lemma from the first token of a headword', () => {
    expect(lemmaOf('capiō, capere, cēpī, captum')).toBe('capiō');
    expect(lemmaOf('ab, ā + abl.')).toBe('ab');
    expect(lemmaOf('nōn')).toBe('nōn');
    expect(lemmaOf('in + acc./abl.')).toBe('in');
    expect(lemmaOf('rēs pūblica, reī pūblicae, f.')).toBe('rēs pūblica');
    expect(lemmaOf('cum + abl.')).toBe('cum');
  });
  it('maps DCC columns by header name', () => {
    const csv = 'Headword,Definition,Part of Speech,Frequency Rank\n"capiō, capere, cēpī, captum","take, seize",Verb,34\n';
    expect(dccToLexicon(csv)).toEqual([
      { headword: 'capiō, capere, cēpī, captum', lemma: 'capiō', definition: 'take, seize', pos: 'verb', frequency: 34 },
    ]);
  });
});

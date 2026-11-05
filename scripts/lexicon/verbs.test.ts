import { readFileSync } from 'node:fs';
import { parseWhitakerVerbs } from './verbs';

const dictline = readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8').split('\n');
// 1-based line numbers in the pinned DICTLINE.GEN.
const fixture = (...lines: number[]) => lines.map(n => dictline[n - 1]).join('\n');
const byInf = (text: string) => {
  const out = new Map<string, ReturnType<typeof parseWhitakerVerbs>[number]['verb']>();
  for (const w of parseWhitakerVerbs(text)) out.set(w.verb.inf, w.verb);
  return out;
};

describe('parseWhitakerVerbs', () => {
  const v = byInf(fixture(
    2871, // am am amav amat 1 1
    1000, // adhib 2 1
    8010, // capi cap cep capt 3 1 (-io)
    2238, // ag ag eg act 3 1 X
    5562, // audi aud audiv audit 3 4
    22364, // hort DEP 1 1
    34874, 34875, // sequ DEP 3 1, plus a | continuation line
    205, 206, // abs ab abfu (D) / afu (A) 5 1
    33170, // rede redi rediv 6 1
    12399, 12400, 12401, 12402, // confer 3 2, collat and conlat
    5551, // aud aus SEMIDEP
    404, // accid IMPERS
    36060, // subici subic subjec subject
    7273, // cad INTRANS
  ));

  it('1st conjugation', () =>
    expect(v.get('amare')).toEqual({ inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', pp1: 'amo' }));
  it('2nd conjugation', () =>
    expect(v.get('adhibere')).toMatchObject({ conj: 2, pres: 'adhib', perf: 'adhibu', ppp: 'adhibit', pp1: 'adhibeo' }));
  it('3rd -io conjugation', () =>
    expect(v.get('capere')).toMatchObject({ conj: 3.5, pres: 'cap', perf: 'cep', ppp: 'capt', pp1: 'capio' }));
  it('3rd conjugation, unspecified kind allows the passive', () => {
    expect(v.get('agere')).toMatchObject({ conj: 3, pres: 'ag', perf: 'eg', ppp: 'act', pp1: 'ago' });
    expect(v.get('agere')?.noPassive).toBeUndefined();
  });
  it('4th conjugation', () =>
    expect(v.get('audire')).toMatchObject({ conj: 4, pres: 'aud', perf: 'audiv', ppp: 'audit', pp1: 'audio' }));
  it('1st conjugation deponent', () =>
    expect(v.get('hortari')).toEqual({ inf: 'hortari', conj: 1, pres: 'hort', perf: 'hortat', deponent: true, impfBase: 'hortare', pp1: 'hortor' }));
  it('3rd conjugation deponent', () =>
    expect(v.get('sequi')).toMatchObject({ conj: 3, pres: 'sequ', perf: 'secut', deponent: true, impfBase: 'sequere', pp1: 'sequor' }));
  it('esse compound keeps the best-frequency variant', () => {
    expect(v.get('abesse')).toEqual({ inf: 'abesse', irregular: true, base: 'esse', prefix: 'ab', perf: 'afu', noPassive: true, pp1: 'absum' });
  });
  it('ire compound', () =>
    expect(v.get('redire')).toEqual({ inf: 'redire', irregular: true, base: 'ire', prefix: 'red', perf: 'rediv', noPassive: true, pp1: 'redeo' }));
  it('ferre compound collapses variant lines into one entry', () => {
    expect(parseWhitakerVerbs(fixture(12399, 12400, 12401, 12402))).toHaveLength(1);
    expect(v.get('conferre')).toMatchObject({ irregular: true, base: 'ferre', prefix: 'con', perf: 'contul', ppp: 'collat', pp1: 'confero' });
  });
  it('skips semi-deponents and impersonals', () => {
    expect(v.get('audere')).toBeUndefined();
    expect(v.get('accidere')).toBeUndefined();
  });
  it('spells j as i', () => expect(v.get('subicere')).toMatchObject({ conj: 3.5, perf: 'subiec', ppp: 'subiect', pp1: 'subicio' }));
  it('intransitive verbs have no passive', () => expect(v.get('cadere')).toMatchObject({ conj: 3, noPassive: true }));
  it('ignores continuation lines on their own', () => expect(parseWhitakerVerbs(fixture(34875))).toEqual([]));
});

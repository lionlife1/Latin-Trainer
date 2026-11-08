import { readFileSync } from 'node:fs';
import { composeLexicon, parseLodge } from './compose';
import { parseDooge } from './dooge';
import { verbKey } from '../../src/lib/conjugator';
import { coreTrainerVerbs, parseWhitakerVerbs, shortGloss, verbsModule } from './verbs';
import { parseDictline } from './whitaker';

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
  it('parses semi-deponents and skips impersonals', () => {
    expect(v.get('audere')).toEqual({ inf: 'audere', conj: 2, pres: 'aud', perf: 'aus', semiDeponent: true, noPassive: true, pp1: 'audeo' });
    expect(v.get('accidere')).toBeUndefined();
  });
  it('spells j as i', () => expect(v.get('subicere')).toMatchObject({ conj: 3.5, perf: 'subiec', ppp: 'subiect', pp1: 'subicio' }));
  it('intransitive verbs have no passive', () => expect(v.get('cadere')).toMatchObject({ conj: 3, noPassive: true }));
  it('ignores continuation lines on their own', () => expect(parseWhitakerVerbs(fixture(34875))).toEqual([]));
});

describe('shortGloss', () => {
  it.each([
    ['hide, conceal', 'to hide'],
    ['say, declare, state; allege', 'to say'],
    ['be away/absent/distant', 'to be away/absent/distant'],
    ['to try (to)', 'to try'],
    ['bring [news] together', 'to bring together'],
  ])('%s', (def, gloss) => expect(shortGloss(def)).toBe(gloss));
  it('cuts long glosses at a space', () => {
    const g = shortGloss('overwhelm/overthrow/demolish/destroy/annihilate utterly and completely');
    expect(g.length).toBeLessThanOrEqual(40);
    expect(g).toMatch(/^to \S/);
    expect(g.endsWith(' ')).toBe(false);
  });
});

describe('coreTrainerVerbs on the vendored sources', () => {
  const { rows } = composeLexicon(
    parseDooge(readFileSync('content/sources/dooge-latin-english.txt', 'utf8')),
    parseDictline(readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8')),
    parseLodge(readFileSync('content/sources/lodge-core.tsv', 'utf8')),
  );
  const { verbs, unmatched } = coreTrainerVerbs(rows, parseWhitakerVerbs(dictline.join('\n')));
  const get = (inf: string) => verbs.find(v => v.inf === inf);

  it('generates most core verbs, each once', () => {
    expect(verbs.length).toBeGreaterThanOrEqual(600);
    expect(verbs.length).toBeLessThanOrEqual(800);
    expect(new Set(verbs.map(verbKey)).size).toBe(verbs.length);
    console.log(`unmatched core verbs (${unmatched.length}): ${unmatched.join(', ')}`);
    expect(unmatched.length).toBeLessThan(40);
  });
  it('keeps 2nd and 3rd conjugation verbs that share an unmarked infinitive', () => {
    expect(verbs.find(v => v.pp1 === 'iacio')).toMatchObject({ inf: 'iacere', conj: 3.5, perf: 'iec' });
    expect(verbs.find(v => v.pp1 === 'pario')).toMatchObject({ inf: 'parere', conj: 3.5, perf: 'peper' });
    expect(verbs.find(v => v.pp1 === 'pendeo')).toMatchObject({ inf: 'pendere', conj: 2 });
  });
  it('keeps homographs apart', () => {
    expect(get('volare')).toMatchObject({ conj: 1, perf: 'volav' });
    expect(get('dicere')).toMatchObject({ conj: 3, perf: 'dix' });
    expect(get('dicare')).toBeUndefined();
  });
  it('includes compounds, deponents and ablaut perfects', () => {
    expect(get('abesse')).toMatchObject({ base: 'esse' });
    expect(get('conferre')).toMatchObject({ base: 'ferre' });
    expect(get('redire')).toMatchObject({ base: 'ire' });
    expect(get('subigere')).toMatchObject({ perf: 'subeg' });
    expect(get('conari')).toMatchObject({ deponent: true });
  });
  it('gives intransitive verbs no passive', () => {
    for (const inf of ['stare', 'sedere', 'manere', 'discedere', 'nocere', 'servire', 'ardere', 'surgere', 'fluere'])
      expect(get(inf), inf).toMatchObject({ noPassive: true });
    for (const inf of ['agere', 'amare', 'capere', 'concedere']) expect(get(inf)?.noPassive, inf).toBeUndefined();
  });
  it('uses the lexicon\'s own perfect when it spells it out', () => {
    expect(get('adferre')).toMatchObject({ perf: 'attul' });
    expect(get('tollere')).toMatchObject({ perf: 'sustul' });
  });
  it('includes the semi-deponents', () => {
    expect(get('audere')).toMatchObject({ conj: 2, perf: 'aus', semiDeponent: true });
    expect(get('gaudere')).toMatchObject({ conj: 2, perf: 'gavis', semiDeponent: true });
    expect(get('solere')).toMatchObject({ conj: 2, perf: 'solit', semiDeponent: true });
    expect(get('fidere')).toMatchObject({ conj: 3, perf: 'fis', semiDeponent: true });
    expect(get('confidere')).toMatchObject({ conj: 3, perf: 'confis', semiDeponent: true });
  });
  it('leaves out defectives and duplicates', () => {
    for (const inf of ['odisse', 'fari', 'fruari', 'sonere']) expect(get(inf), inf).toBeUndefined();
    expect(verbs.some(v => v.pp1 === 'inquio')).toBe(false);
    expect(get('sonare')).toBeDefined();
  });
  it('matches 3rd-conjugation deponents in -i', () => {
    expect(get('frui')).toMatchObject({ conj: 3, deponent: true, perf: 'fruct', pp1: 'fruor' });
  });
  it('restricts a deponent whose 2nd part is -i to the 3rd conjugation', () => {
    const row = { headword: 'fruor, i, fructus sum', lemma: 'fruor', definition: 'enjoy', pos: 'verb', frequency: null, core: true };
    const r = coreTrainerVerbs([row, { ...row, lemma: 'sequor', headword: 'sequor, i, secutus sum' }], parseWhitakerVerbs(fixture(21089, 21090, 34874, 34875)));
    expect(r.verbs.map(v => v.inf)).toEqual(['frui', 'sequi']);
  });
  it('gives transitive ire compounds a passive', () => {
    for (const [inf, ppp] of [['transire', 'transit'], ['adire', 'adit'], ['circumire', 'circumit'], ['inire', 'init']]) {
      expect(get(inf), inf).toMatchObject({ base: 'ire', ppp });
      expect(get(inf)?.noPassive, inf).toBeUndefined();
    }
    for (const inf of ['exire', 'redire']) expect(get(inf), inf).toMatchObject({ noPassive: true });
  });
  it('overrides bad glosses', () => {
    expect(get('surgere')?.trans).toBe('to rise');
    expect(get('mutare')?.trans).toBe('to change');
    expect(get('peragere')?.trans).toBe('to complete');
    expect(get('fallere')?.trans).toBe('to deceive');
  });
  it('glosses every verb', () => {
    for (const v of verbs) expect(v.trans).toMatch(/^to \S/);
  });
});

describe('verbsModule', () => {
  it('emits the verbs as a typed JSON literal', () => {
    const verbs = [{ inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', pp1: 'amo', trans: "to love's \"x\"" }];
    const src = verbsModule(verbs);
    expect(src).toContain("import type { Verb } from '../lib/conjugator';");
    const body = src.split('export const CORE_VERBS: Verb[] = ')[1];
    expect(body.trimEnd().endsWith(';')).toBe(true);
    expect(JSON.parse(body.trimEnd().slice(0, -1))).toEqual(verbs);
  });
});

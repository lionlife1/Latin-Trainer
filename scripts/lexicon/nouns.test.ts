import { readFileSync } from 'node:fs';
import { composeLexicon, parseLodge } from './compose';
import type { LexiconRow } from '../build-seed';
import type { Noun } from '../../src/lib/morph/nouns';
import { parseDooge } from './dooge';
import { coreNouns, nounsModule, parseWhitakerNouns } from './nouns';
import { parseDictline } from './whitaker';

const dictline = readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8').split('\n');
const lines = (s1: string) => dictline.filter(l => l.slice(0, 19).trim() === s1 && l.slice(76, 82).trim() === 'N').join('\n');
const parsed = (s1: string) => parseWhitakerNouns(lines(s1));

describe('parseWhitakerNouns', () => {
  it('1st declension', () =>
    expect(parsed('puell').map(w => w.noun)).toContainEqual(expect.objectContaining({ nom: 'puella', stem: 'puell', decl: 1, gender: 'f' })));
  it('3rd declension', () =>
    expect(parsed('rex').map(w => w.noun)).toContainEqual(expect.objectContaining({ nom: 'rex', stem: 'reg', decl: 3, gender: 'm' })));
  it('i-stem and common gender', () =>
    expect(parsed('civis').map(w => w.noun)).toContainEqual(expect.objectContaining({ iStem: true, gender: 'c' })));
  it('neuter i-stem', () =>
    expect(parsed('mare').map(w => w.noun)).toContainEqual(expect.objectContaining({ decl: 3, gender: 'n', iStem: true })));
  it('-ium neuter has both genitives', () => {
    const c = parsed('consili').find(w => w.noun.nom === 'consilium');
    expect(c?.gens).toEqual(['consilii', 'consili']);
  });
  it('4th declension neuter', () =>
    expect(parsed('corn').map(w => w.noun)).toContainEqual(expect.objectContaining({ nom: 'cornu', decl: 4, gender: 'n' })));
  it('5th declension', () =>
    expect(parsed('di').map(w => w.noun)).toContainEqual(expect.objectContaining({ nom: 'dies', stem: 'di', decl: 5 })));
});

describe('coreNouns on the vendored sources', () => {
  const { rows } = composeLexicon(
    parseDooge(readFileSync('content/sources/dooge-latin-english.txt', 'utf8')),
    parseDictline(readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8')),
    parseLodge(readFileSync('content/sources/lodge-core.tsv', 'utf8')),
  );
  const { nouns, unmatched } = coreNouns(rows, parseWhitakerNouns(dictline.join('\n')));
  const get = (nom: string) => nouns.find(n => n.nom === nom);

  it('generates most core nouns, each once', () => {
    console.log(`${nouns.length} nouns; unmatched: ${unmatched.join(' | ')}`);
    expect(nouns.length).toBeGreaterThan(700);
    expect(nouns.length).toBeLessThan(800);
    expect(unmatched.length).toBeLessThan(30);
    const keys = nouns.map(n => `${n.nom}|${n.stem}|${n.decl}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('maps declensions and genders', () => {
    expect(get('puella')).toMatchObject({ decl: 1 });
    expect(get('dies')).toMatchObject({ gender: 'm' });
    expect(get('civis')).toMatchObject({ gender: 'c', iStem: true });
    expect(get('pater')).toMatchObject({ stem: 'patr', decl: 3 });
  });
  it('flags the irregular nouns', () => {
    expect(get('domus')).toMatchObject({ decl: 4, irregular: 'domus' });
    expect(get('vis')).toMatchObject({ irregular: 'vis' });
    expect(get('deus')).toMatchObject({ irregular: 'deus' });
  });
  it('treats canis as a consonant stem', () => {
    expect(get('canis')).toBeDefined();
    expect(get('canis')).not.toHaveProperty('iStem');
  });
  it('leaves out defective nouns', () => {
    for (const nom of ['nemo', 'bos', 'nihil', 'fors', 'vicis']) expect(get(nom), nom).toBeUndefined();
  });
  it('flags imber and caro as i-stems, vates as consonant stem', () => {
    expect(get('imber')).toMatchObject({ iStem: true });
    expect(get('caro')).toMatchObject({ iStem: true });
    expect(get('vates')).not.toHaveProperty('iStem');
  });
  it('sets iForms', () => {
    expect(get('sitis')).toMatchObject({ iForms: 'pure' });
    for (const nom of ['turris', 'securis', 'puppis']) expect(get(nom), nom).toMatchObject({ iForms: 'mixed' });
    for (const nom of ['navis', 'ignis', 'civis', 'avis', 'classis', 'finis', 'amnis', 'imber']) expect(get(nom), nom).toMatchObject({ iForms: 'abl' });
    expect(get('rex')).not.toHaveProperty('iForms');
  });
  it('gives every noun a short gloss', () => {
    for (const n of nouns) {
      expect(n.trans, n.nom).not.toBe('');
      expect(n.trans.length, n.nom).toBeLessThanOrEqual(40);
      expect(n.trans.startsWith('to '), n.nom).toBe(false);
    }
  });
});

describe('coreNouns plural-only', () => {
  const row = (headword: string): LexiconRow => ({ lemma: headword.split(',')[0], headword, pos: 'noun', definition: 'x thing', core: true } as unknown as LexiconRow);
  const cases: [string, Partial<Noun>][] = [
    ['arma, -ōrum, n. plur.', { nom: 'arma', stem: 'arm', decl: 2, gender: 'n' }],
    ['cibāria, -ōrum, n. plur.', { nom: 'cibaria', stem: 'cibari', decl: 2, gender: 'n' }],
    ['līberī, -ōrum, m.', { nom: 'liberi', stem: 'liber', decl: 2, gender: 'm' }],
    ['sertae, -ārum, f. plur.', { nom: 'sertae', stem: 'sert', decl: 1, gender: 'f' }],
    ['thermae, -ārum, f. plur.', { nom: 'thermae', stem: 'therm', decl: 1, gender: 'f' }],
    ['faucēs, -ium, f. plur.', { nom: 'fauces', stem: 'fauc', decl: 3, gender: 'f', iStem: true }],
    ['maiōrēs, -um, m. plur.', { nom: 'maiores', stem: 'maior', decl: 3, gender: 'm' }],
    ['moenia, -ium, n. plur.', { nom: 'moenia', stem: 'moen', decl: 3, gender: 'n', iStem: true }],
  ];
  for (const [headword, expected] of cases) {
    it(headword, () => {
      const { nouns, unmatched } = coreNouns([row(headword)], []);
      expect(unmatched).toEqual([]);
      expect(nouns).toHaveLength(1);
      expect(nouns[0]).toMatchObject({ ...expected, pluralOnly: true, trans: 'x thing' });
      if (!expected.iStem) expect(nouns[0]).not.toHaveProperty('iStem');
    });
  }
  it("corrects D'Ooge's fasces: masculine, with a real gloss", () => {
    const { nouns } = coreNouns([row('fascēs, -ium, f.')], []);
    expect(nouns[0]).toMatchObject({ nom: 'fasces', decl: 3, gender: 'm', iStem: true, trans: 'rods (fasces)', pluralOnly: true });
  });
  it('a singular row is unaffected', () => {
    const { nouns, unmatched } = coreNouns([row('castrum, -ī, n.')], []);
    expect(nouns).toEqual([]);
    expect(unmatched).toEqual(['castrum, -ī, n.']);
  });
});

describe('nounsModule', () => {
  it('writes a typed module', () => {
    const src = nounsModule([{ nom: 'puella', stem: 'puell', decl: 1, gender: 'f', trans: 'girl' }]);
    expect(src).toContain("import type { Noun } from '../lib/morph/nouns';");
    expect(src).toContain('export const CORE_NOUNS: Noun[]');
    expect(src).toContain('"puella"');
  });
});

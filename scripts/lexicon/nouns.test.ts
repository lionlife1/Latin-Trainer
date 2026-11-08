import { readFileSync } from 'node:fs';
import { composeLexicon, parseLodge } from './compose';
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
  it('leaves out plural-only and defective nouns', () => {
    for (const nom of ['arma', 'nemo', 'bos', 'nihil']) expect(get(nom), nom).toBeUndefined();
  });
  it('gives every noun a short gloss', () => {
    for (const n of nouns) {
      expect(n.trans, n.nom).not.toBe('');
      expect(n.trans.length, n.nom).toBeLessThanOrEqual(40);
      expect(n.trans.startsWith('to '), n.nom).toBe(false);
    }
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

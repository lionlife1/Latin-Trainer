import { readFileSync } from 'node:fs';
import { composeLexicon, parseLodge } from './compose';
import { adjectivesModule, coreAdjectives, parseWhitakerAdjectives } from './adjectives';
import { parseDooge } from './dooge';
import { parseDictline } from './whitaker';

const dictline = readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8').split('\n');
const lines = (s1: string) => dictline.filter(l => l.slice(0, 19).trim() === s1 && l.slice(76, 82).trim() === 'ADJ').join('\n');
const parsed = (s1: string) => parseWhitakerAdjectives(lines(s1));

describe('parseWhitakerAdjectives', () => {
  it('1st/2nd declension, compared', () =>
    expect(parsed('bon').map(w => w.adjective)).toContainEqual(
      expect.objectContaining({ nom: 'bonus', stem: 'bon', decl: '12', comp: 'meli', sup: 'opti' })));
  it('j becomes i', () =>
    expect(parsed('magn').map(w => w.adjective)).toContainEqual(expect.objectContaining({ comp: 'mai', sup: 'maxi' })));
  it('-er adjectives', () =>
    expect(parsed('pulcher').map(w => w.adjective)).toContainEqual(
      expect.objectContaining({ nom: 'pulcher', stem: 'pulchr', comp: 'pulchri', sup: 'pulcherri' })));
  it('three terminations', () =>
    expect(parsed('acer').map(w => w.adjective)).toContainEqual(
      expect.objectContaining({ nom: 'acer', stem: 'acr', decl: '3', terminations: 3 })));
  it('two terminations', () =>
    expect(parsed('fort').map(w => w.adjective)).toContainEqual(expect.objectContaining({ nom: 'fortis', terminations: 2 })));
  it('one termination', () =>
    expect(parsed('ingens').map(w => w.adjective)).toContainEqual(expect.objectContaining({ stem: 'ingent', terminations: 1 })));
  it('pronominal adjectives are not compared', () => {
    const a = parsed('null').map(w => w.adjective);
    expect(a).toContainEqual(expect.objectContaining({ pronominal: true }));
    expect(a[0]).not.toHaveProperty('comp');
  });
  it('malus has its irregular comparison', () =>
    expect(parsed('mal').map(w => w.adjective)).toContainEqual(expect.objectContaining({ sup: 'pessi' })));
});

describe('coreAdjectives on the vendored sources', () => {
  const { rows } = composeLexicon(
    parseDooge(readFileSync('content/sources/dooge-latin-english.txt', 'utf8')),
    parseDictline(readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8')),
    parseLodge(readFileSync('content/sources/lodge-core.tsv', 'utf8')),
  );
  const { adjectives, unmatched } = coreAdjectives(rows, parseWhitakerAdjectives(dictline.join('\n')));
  const get = (nom: string) => adjectives.find(a => a.nom === nom);

  it('generates most core adjectives, each once', () => {
    console.log(`${adjectives.length} adjectives; unmatched (${unmatched.length}): ${unmatched.join(' | ')}`);
    expect(adjectives.length).toBeGreaterThan(330);
    expect(adjectives.length).toBeLessThan(420);
    expect(unmatched.length).toBeLessThan(80);
    const keys = adjectives.map(a => `${a.nom}|${a.stem}|${a.decl}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('applies the special cases', () => {
    expect(get('multus')).toMatchObject({ comp: 'plur', sup: 'pluri' });
    expect(get('malus')).toMatchObject({ comp: 'pei', sup: 'pessi' });
    expect(get('vetus')).toMatchObject({ consonantStem: true });
    expect(get('meus')).toBeDefined();
    expect(get('meus')).not.toHaveProperty('comp');
    expect(get('solus')).toMatchObject({ pronominal: true });
  });
  it('gives every adjective a gloss', () => {
    for (const a of adjectives) expect(a.trans, a.nom).not.toBe('');
  });
});

describe('adjectivesModule', () => {
  it('writes a typed module', () => {
    const src = adjectivesModule([{ nom: 'bonus', stem: 'bon', decl: '12', trans: 'good' }]);
    expect(src).toContain("import type { Adjective } from '../lib/morph/adjectives';");
    expect(src).toContain('export const CORE_ADJECTIVES: Adjective[]');
    expect(src).toContain('"bonus"');
  });
});

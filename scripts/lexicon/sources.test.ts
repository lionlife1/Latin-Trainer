import { readFileSync } from 'node:fs';
const read = (p: string) => readFileSync(`content/sources/${p}`, 'utf8');

describe('vendored lexicon sources', () => {
  it('has all 2000 Lodge ranks exactly once', () => {
    const rows = read('lodge-core.tsv').trim().split('\n').map(l => l.split('\t'));
    expect(rows.map(r => Number(r[0])).sort((a, b) => a - b)).toEqual(Array.from({ length: 2000 }, (_, i) => i + 1));
    for (const [, lemma] of rows) expect(lemma).toMatch(/^[a-z][a-z-]*$/);
  });
  it('has the pinned Whitaker DICTLINE', () => {
    expect(read('whitaker/DICTLINE.GEN').split('\n').filter(Boolean)).toHaveLength(39335);
  });
  it('has only the D\'Ooge glossary, no Gutenberg boilerplate', () => {
    const t = read('dooge-latin-english.txt');
    expect(t.startsWith('LATIN-ENGLISH VOCABULARY')).toBe(true);
    expect(t).toContain('«ab-dō, -ere, -didī, -ditus», _hide, conceal_');
    expect(t).not.toMatch(/Gutenberg|ENGLISH-LATIN VOCABULARY/);
  });
});

import { readFileSync } from 'node:fs';
import { parseDooge } from './dooge';

const one = (s: string) => parseDooge(s + '\n');

describe('parseDooge', () => {
  it('parses a plain verb', () => {
    expect(one('«ab-dō, -ere, -didī, -ditus», _hide, conceal_')).toEqual([
      { headword: 'abdō, -ere, -didī, -ditus', lemma: 'abdō', definition: 'hide, conceal', pos: 'verb' },
    ]);
  });

  it('handles "x or y" headwords, prepositions and ignores sub-phrases', () => {
    expect(
      one('«ā» or «ab», prep. with abl. _from, by, off_.\n  Translated _on_ in «ā dextrō cornū», _on the right wing_;'),
    ).toEqual([{ headword: 'ā or ab', lemma: 'ā', definition: 'from, by, off', pos: 'preposition' }]);
  });

  it('appends gender to noun headwords and skips [[etymology]]', () => {
    expect(one('«aciēs, -ēī», f. [[«ācer», _sharp_]], _edge; line of battle_')).toEqual([
      { headword: 'aciēs, -ēī, f.', lemma: 'aciēs', definition: 'edge; line of battle', pos: 'noun' },
    ]);
  });

  it('skips parenthesised glosses', () => {
    expect(one('«circum-veniō, -īre, -vēnī, -ventus» (_come around_), _surround_')[0].definition).toBe('surround');
  });

  it('removes acute accents and hyphens from the headword', () => {
    expect(one('«circum´-dō, -dare, -dedī, -datus», _place around, surround, inclose_')[0].headword).toBe(
      'circumdō, -dare, -dedī, -datus',
    );
  });

  it('joins continuation lines and drops § references', () => {
    expect(
      one('«ad-ferō, ad-ferre, at-tulī, ad-lātus», _bring, convey; report,\n    announce; render, give_ (§426)')[0]
        .definition,
    ).toBe('bring, convey; report, announce; render, give');
  });

  it('stops at the first sentence end after a span', () => {
    const [r] = one(
      '«aequālis, -e», adj. _equal, like_. As a noun, «aequālis, -is», m. or f.\n    _one of the same age_',
    );
    expect(r).toMatchObject({ definition: 'equal, like', pos: 'adjective' });
  });

  it('treats dep. verb as verb and skips etymology', () => {
    const [r] = one(
      '«ad-loquor, -loquī, -locūtus sum», dep. verb [[«ad», _to_, + «loquor»,\n    _speak_]], _speak to, address_, with acc.',
    );
    expect(r).toMatchObject({ definition: 'speak to, address', pos: 'verb' });
  });

  it('skips entries with no definition span', () => {
    expect(one('«ac», conj., see «atque»')).toEqual([]);
  });

  it('skips proper nouns', () => {
    expect(one('«Aesōpus, -ī», m. _Æsop_, a writer of fables')).toEqual([]);
  });

  it('parses the whole vendored file', () => {
    const rows = parseDooge(readFileSync('content/sources/dooge-latin-english.txt', 'utf8'));
    expect(rows.length).toBeGreaterThanOrEqual(1200);
    expect(rows.length).toBeLessThanOrEqual(1350);
    const allowed = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'other']);
    for (const r of rows) {
      expect(r.definition.length, r.headword).toBeGreaterThanOrEqual(1);
      expect(r.definition.length, r.headword).toBeLessThanOrEqual(200);
      expect(allowed.has(r.pos), r.headword).toBe(true);
    }
  });
});
